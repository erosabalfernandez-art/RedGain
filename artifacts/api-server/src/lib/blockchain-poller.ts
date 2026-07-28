/**
 * blockchain-poller.ts
 * Revisa la blockchain de BSC cada 30 segundos buscando transferencias USDT
 * a la billetera receptora. Usa la API HTTP de BSCScan en vez de eth_getLogs
 * (los nodos RPC públicos de BSC rechazan eth_getLogs con rate limit).
 *
 * Cuando detecta un pago de $10 de un usuario registrado:
 *   1. Registra el pago en la DB (aprobado automáticamente)
 *   2. Activa/renueva la membresía del usuario
 *   3. Inicia el temporizador del referidor si aplica
 *   4. Distribuye comisiones a la cadena de referidos
 *   5. Notifica al usuario que su pago fue confirmado
 */
import { db, usersTable, paymentsTable, notificationsTable, pool } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "./logger";
import { distributeCommissions } from "./distributor";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const RECEIVING_WALLET = (process.env.RECEIVING_WALLET ?? "").toLowerCase();
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY ?? "YourApiKeyToken";

// 10 USDT en wei (18 decimales)
const REQUIRED_AMOUNT_WEI = BigInt("10000000000000000000");

// RPCs de BSC — solo se usan para eth_blockNumber (no para getLogs)
const BSC_RPC_URLS = [
  process.env.BSC_RPC_URL ?? "",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed4.ninicoin.io/",
  "https://bsc.drpc.org",
].filter(Boolean);

let lastCheckedBlock = 0;

// ── BSCScan token-transfer API ────────────────────────────────────────────────
interface BscscanTokenTx {
  hash: string;
  from: string;
  to: string;
  value: string;          // en wei, como string
  tokenDecimal: string;
  confirmations: string;
  blockNumber: string;
}

async function fetchUsdtTransfers(fromBlock: number, toBlock: number): Promise<BscscanTokenTx[]> {
  const url =
    `https://api.bscscan.com/api` +
    `?module=account&action=tokentx` +
    `&contractaddress=${USDT_ADDRESS}` +
    `&address=${RECEIVING_WALLET}` +
    `&startblock=${fromBlock}` +
    `&endblock=${toBlock}` +
    `&sort=asc` +
    `&apikey=${BSCSCAN_API_KEY}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`BSCScan HTTP ${res.status}`);

  const data = await res.json() as { status: string; message: string; result: BscscanTokenTx[] | string };

  // status "0" con message "No transactions found" es un resultado vacío válido
  if (data.status === "0" && data.message === "No transactions found") return [];

  if (data.status !== "1") {
    throw new Error(`BSCScan error: ${data.message} — ${JSON.stringify(data.result)}`);
  }

  // Filtrar solo transfers que llegaron A la billetera receptora
  return (data.result as BscscanTokenTx[]).filter(
    (tx) => tx.to.toLowerCase() === RECEIVING_WALLET,
  );
}

// ── Obtener bloque actual via JSON-RPC ────────────────────────────────────────
async function getCurrentBlock(): Promise<number | null> {
  for (const url of BSC_RPC_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        signal: AbortSignal.timeout(8_000),
      });
      const data = await res.json() as { result?: string };
      if (data.result) return parseInt(data.result, 16);
    } catch {
      // probar el siguiente RPC
    }
  }
  logger.error("Poller: no se pudo obtener el bloque actual de ningún RPC");
  return null;
}

// ── Helpers para processed_transactions ──────────────────────────────────────
async function isProcessed(txHash: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT 1 FROM processed_transactions WHERE tx_hash = $1 LIMIT 1",
      [txHash.toLowerCase()],
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

async function markProcessed(txHash: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO processed_transactions (tx_hash) VALUES ($1) ON CONFLICT DO NOTHING",
      [txHash.toLowerCase()],
    );
  } finally {
    client.release();
  }
}

async function createNotification(
  userId: number,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      body,
      read: false,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (err) {
    logger.warn({ err, userId, type }, "Poller: no se pudo crear notificación");
  }
}

// ── Lógica principal del polling ──────────────────────────────────────────────
async function poll(): Promise<void> {
  if (!RECEIVING_WALLET) {
    logger.warn("RECEIVING_WALLET no configurado — poller omitiendo ciclo");
    return;
  }

  const currentBlock = await getCurrentBlock();
  if (currentBlock === null) return;

  // En el primer arranque revisar los últimos 50 000 bloques (~42 h en BSC)
  const fromBlock =
    lastCheckedBlock === 0
      ? Math.max(0, currentBlock - 50_000)
      : lastCheckedBlock + 1;

  if (fromBlock > currentBlock) return;

  logger.info({ fromBlock, currentBlock }, "Poller: consultando BSCScan por transferencias USDT");

  let transfers: BscscanTokenTx[];
  try {
    transfers = await fetchUsdtTransfers(fromBlock, currentBlock);
  } catch (err) {
    // No actualizar lastCheckedBlock — se reintentará en el próximo ciclo
    logger.error({ err, fromBlock, currentBlock }, "Poller: error al consultar BSCScan — reintentando en 30 s");
    return;
  }

  // Solo actualizar el puntero si la consulta fue exitosa
  lastCheckedBlock = currentBlock;

  if (transfers.length > 0) {
    logger.info({ count: transfers.length, fromBlock, currentBlock }, "Poller: transferencias USDT entrantes detectadas");
  }

  for (const tx of transfers) {
    const txHash = tx.hash.toLowerCase();
    const from = tx.from.toLowerCase();
    const value = BigInt(tx.value);

    if (await isProcessed(txHash)) continue;

    if (value < REQUIRED_AMOUNT_WEI) {
      logger.info({ txHash, from, value: tx.value }, "Poller: transferencia menor a $10 — omitiendo");
      await markProcessed(txHash);
      continue;
    }

    // Buscar usuario por billetera BSC
    const [user] = await db
      .select()
      .from(usersTable)
      .where(sql`LOWER(${usersTable.bscWallet}) = ${from}`)
      .limit(1);

    if (!user) {
      logger.warn({ txHash, from }, "Poller: ningún usuario registrado con esta billetera — omitiendo");
      await markProcessed(txHash);
      continue;
    }

    logger.info({ txHash, userId: user.id, from }, "Poller: pago detectado y asociado a usuario — procesando");

    try {
      await processPayment(user, txHash);
      await markProcessed(txHash);
      logger.info({ txHash, userId: user.id }, "Poller: pago procesado exitosamente");
    } catch (err) {
      logger.error({ err, txHash, userId: user.id }, "Poller: error al procesar pago — se reintentará en el próximo ciclo");
      // No marcar como procesado para que se reintente
    }
  }
}

// ── Procesamiento de un pago individual ──────────────────────────────────────
async function processPayment(
  user: typeof usersTable.$inferSelect,
  txHash: string,
): Promise<void> {
  const existingApproved = await db
    .select({ id: paymentsTable.id })
    .from(paymentsTable)
    .where(and(eq(paymentsTable.userId, user.id), eq(paymentsTable.status, "approved")))
    .limit(1);

  const paymentType: "initial" | "renewal" =
    existingApproved.length > 0 ? "renewal" : "initial";

  await db.insert(paymentsTable).values({
    userId: user.id,
    amount: "10",
    paymentType,
    proofText: "Pago automático blockchain",
    txHash,
    status: "approved",
  });

  const now = new Date();
  const isFirstPayment = !user.membershipStartedAt;
  const updates: Record<string, unknown> = {
    accountStatus: "active",
    updatedAt: now,
  };

  if (isFirstPayment) {
    updates.membershipStartedAt = now;
  } else {
    updates.membershipTimerStartedAt = now;
    updates.membershipExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  await db.update(usersTable).set(updates as any).where(eq(usersTable.id, user.id));

  if (isFirstPayment && user.referrerId) {
    const [referrer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.referrerId))
      .limit(1);

    if (referrer && referrer.accountStatus === "active" && !referrer.membershipTimerStartedAt) {
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await db.update(usersTable).set({
        membershipTimerStartedAt: now,
        membershipExpiresAt: expiresAt,
        updatedAt: now,
      }).where(eq(usersTable.id, referrer.id));
      logger.info({ referrerId: referrer.id }, "Poller: temporizador del referidor iniciado");
    }
  }

  const paymentLabel = paymentType === "initial" ? "inicial" : "de renovación";
  await createNotification(
    user.id,
    "payment_confirmed",
    "✅ Pago confirmado — cuenta activa",
    `Tu pago ${paymentLabel} de $10 USDT fue detectado en la blockchain y tu cuenta está activa. Tx: ${txHash.slice(0, 10)}…`,
    { txHash, paymentType },
  );

  await distributeCommissions(user, txHash);
}

// ── Función pública para arrancar el poller ───────────────────────────────────
export function startBlockchainPoller(): void {
  if (!process.env.RECEIVING_WALLET) {
    logger.warn("RECEIVING_WALLET no configurado — poller de blockchain desactivado");
    return;
  }
  if (!process.env.OPERATOR_PRIVATE_KEY) {
    logger.warn("OPERATOR_PRIVATE_KEY no configurado — las comisiones NO se distribuirán automáticamente");
  }

  logger.info("Iniciando poller de blockchain BSC via BSCScan API (cada 30 segundos)");
  poll().catch((err) => logger.error({ err }, "Poller: error en el ciclo inicial"));
  setInterval(() => {
    poll().catch((err) => logger.error({ err }, "Poller: error en ciclo periódico"));
  }, 30_000);
}
