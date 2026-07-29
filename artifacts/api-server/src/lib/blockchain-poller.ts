/**
 * blockchain-poller.ts
 * Revisa la blockchain de BSC cada 30 segundos buscando transferencias USDT
 * a la billetera receptora.
 *
 * Estrategia: eth_getBlockByNumber (soportado por TODOS los nodos sin límites)
 * en lugar de eth_getLogs (bloqueado en nodos públicos para contratos de alto
 * volumen como USDT). Parsea el calldata de las transacciones transfer() directas.
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

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955".toLowerCase();
const RECEIVING_WALLET = (process.env.RECEIVING_WALLET ?? "").toLowerCase();

// 10 USDT en wei (18 decimales)
const REQUIRED_AMOUNT_WEI = BigInt("10000000000000000000");

// Selector de transfer(address,uint256) — primeros 4 bytes del keccak256
const TRANSFER_SELECTOR = "0xa9059cbb";

// RPCs de BSC — eth_getBlockByNumber funciona en TODOS sin restricciones
const BSC_RPC_URLS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.binance.org/",
  "https://bsc-dataseed2.binance.org/",
  "https://bsc-dataseed3.binance.org/",
  "https://bsc.publicnode.com",
  "https://rpc.ankr.com/bsc",
  process.env.BSC_RPC_URL ?? "",
].filter(Boolean);

// Lookback inicial: 300 bloques ≈ últimos 15 minutos de BSC
const INITIAL_LOOKBACK = 300;

let lastCheckedBlock = 0;

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface RawTx {
  hash: string;
  from: string;
  to: string | null;
  input: string;
}

interface ParsedTransfer {
  txHash: string;
  from: string;
  amount: bigint;
}

// ── Helper RPC ────────────────────────────────────────────────────────────────
async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  let lastErr: Error = new Error("Sin RPCs disponibles");
  for (const url of BSC_RPC_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { result?: unknown; error?: { message: string } };
      if (data.error) throw new Error(data.error.message);
      return data.result;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastErr;
}

async function getCurrentBlock(): Promise<number | null> {
  try {
    const hex = await rpcCall("eth_blockNumber", []) as string;
    return parseInt(hex, 16);
  } catch (err) {
    logger.error({ err }, "Poller: no se pudo obtener el bloque actual");
    return null;
  }
}

// ── Parsear calldata de transfer(address,uint256) ─────────────────────────────
function parseTransferCalldata(tx: RawTx): ParsedTransfer | null {
  // Solo transacciones al contrato USDT
  if (!tx.to || tx.to.toLowerCase() !== USDT_ADDRESS) return null;
  // Solo llamadas a transfer()
  if (!tx.input || !tx.input.toLowerCase().startsWith(TRANSFER_SELECTOR)) return null;

  const data = tx.input.slice(10); // quitar el selector (4 bytes = 8 hex chars + "0x")
  if (data.length < 128) return null; // address(32) + uint256(32) = 64 bytes = 128 hex chars

  // address está padded a 32 bytes — los primeros 24 hex chars son ceros
  const toAddress = ("0x" + data.slice(24, 64)).toLowerCase();
  const amountHex = data.slice(64, 128);

  return {
    txHash: tx.hash.toLowerCase(),
    from: tx.from.toLowerCase(),
    amount: BigInt("0x" + amountHex),
  };
}

// ── Escanear un bloque buscando pagos USDT a la billetera receptora ───────────
async function scanBlock(blockNumber: number): Promise<ParsedTransfer[]> {
  const block = await rpcCall("eth_getBlockByNumber", [
    "0x" + blockNumber.toString(16),
    true, // incluir transacciones completas
  ]) as { transactions?: RawTx[] } | null;

  if (!block?.transactions) return [];

  const results: ParsedTransfer[] = [];
  for (const tx of block.transactions) {
    const transfer = parseTransferCalldata(tx);
    if (transfer && transfer.from !== RECEIVING_WALLET) {
      // Solo nos interesan transferencias que lleguen A nuestra billetera
      // El "to" en calldata es el destinatario del USDT
      const toInCalldata = ("0x" + (tx.input.slice(10)).slice(24, 64)).toLowerCase();
      if (toInCalldata === RECEIVING_WALLET) {
        results.push(transfer);
      }
    }
  }
  return results;
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

  const fromBlock =
    lastCheckedBlock === 0
      ? Math.max(0, currentBlock - INITIAL_LOOKBACK)
      : lastCheckedBlock + 1;

  if (fromBlock > currentBlock) return;

  logger.info({ fromBlock, currentBlock }, "Poller: escaneando bloques BSC en busca de pagos USDT");

  const allTransfers: ParsedTransfer[] = [];
  for (let blockNum = fromBlock; blockNum <= currentBlock; blockNum++) {
    try {
      const transfers = await scanBlock(blockNum);
      allTransfers.push(...transfers);
    } catch (err) {
      logger.error({ err, blockNum }, "Poller: error escaneando bloque — saltando");
    }
  }

  // Actualizar puntero solo después de escanear todos los bloques
  lastCheckedBlock = currentBlock;

  if (allTransfers.length > 0) {
    logger.info({ count: allTransfers.length }, "Poller: pagos USDT detectados en este ciclo");
  }

  for (const transfer of allTransfers) {
    if (await isProcessed(transfer.txHash)) continue;

    if (transfer.amount < REQUIRED_AMOUNT_WEI) {
      logger.info({ txHash: transfer.txHash, from: transfer.from }, "Poller: transferencia menor a $10 — omitiendo");
      await markProcessed(transfer.txHash);
      continue;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(sql`LOWER(${usersTable.bscWallet}) = ${transfer.from}`)
      .limit(1);

    if (!user) {
      logger.warn({ txHash: transfer.txHash, from: transfer.from }, "Poller: ningún usuario registrado con esta billetera — omitiendo");
      await markProcessed(transfer.txHash);
      continue;
    }

    logger.info({ txHash: transfer.txHash, userId: user.id }, "Poller: pago detectado — procesando");

    try {
      await processPayment(user, transfer.txHash);
      await markProcessed(transfer.txHash);
      logger.info({ txHash: transfer.txHash, userId: user.id }, "Poller: pago procesado exitosamente");
    } catch (err) {
      logger.error({ err, txHash: transfer.txHash, userId: user.id }, "Poller: error al procesar pago — se reintentará en el próximo ciclo");
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
    // If the user renews while still active (days 29-30), extend from the current
    // expiry date so the new period starts seamlessly with no gap.
    const baseDate =
      user.membershipExpiresAt &&
      user.membershipExpiresAt > now &&
      user.accountStatus === "active"
        ? user.membershipExpiresAt
        : now;
    updates.membershipTimerStartedAt = baseDate;
    updates.membershipExpiresAt = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
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

  logger.info("Iniciando poller BSC via eth_getBlockByNumber (cada 30 segundos)");
  poll().catch((err) => logger.error({ err }, "Poller: error en el ciclo inicial"));
  setInterval(() => {
    poll().catch((err) => logger.error({ err }, "Poller: error en ciclo periódico"));
  }, 30_000);
}
