/**
 * blockchain-poller.ts
 * Revisa la blockchain de BSC cada 30 segundos buscando transferencias USDT
 * a la billetera receptora. Usa eth_getLogs via RPCs fiables (Ankr, PublicNode)
 * — sin API key, sin dependencias de BSCScan/Etherscan.
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

// 10 USDT en wei (18 decimales)
const REQUIRED_AMOUNT_WEI = BigInt("10000000000000000000");

// Transfer(address,address,uint256) — keccak256 del signature
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// RPCs con soporte fiable de eth_getLogs en BSC (sin API key)
const BSC_RPC_URLS = [
  "https://rpc.ankr.com/bsc",        // Ankr — free tier, soporta eth_getLogs
  "https://bsc.publicnode.com",       // PublicNode — fiable y sin límites estrictos
  "https://bsc-dataseed1.defibit.io/",
  process.env.BSC_RPC_URL ?? "",
].filter(Boolean);

// Máximo de bloques por consulta (BSC ~3 seg/bloque → 2000 bloques ≈ 100 min)
const MAX_BLOCK_RANGE = 2_000;
// Lookback inicial: últimos 10 000 bloques (~8 horas)
const INITIAL_LOOKBACK = 10_000;

let lastCheckedBlock = 0;

// ── Helpers RPC ───────────────────────────────────────────────────────────────
async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  let lastErr: Error = new Error("No RPCs disponibles");
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
      // probar siguiente RPC
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

// ── Tipos de log ─────────────────────────────────────────────────────────────
interface EthLog {
  transactionHash: string;
  topics: string[];
  data: string;       // amount en hex (uint256)
  blockNumber: string;
}

// ── Consulta eth_getLogs en chunks seguros ───────────────────────────────────
async function fetchUsdtTransfers(fromBlock: number, toBlock: number): Promise<EthLog[]> {
  // Dirección receptora padded a 32 bytes para el topic[2]
  const toTopic = "0x000000000000000000000000" + RECEIVING_WALLET.slice(2).toLowerCase();

  const allLogs: EthLog[] = [];

  for (let start = fromBlock; start <= toBlock; start += MAX_BLOCK_RANGE) {
    const end = Math.min(start + MAX_BLOCK_RANGE - 1, toBlock);

    const logs = await rpcCall("eth_getLogs", [{
      address: USDT_ADDRESS,
      topics: [TRANSFER_TOPIC, null, toTopic],
      fromBlock: "0x" + start.toString(16),
      toBlock:   "0x" + end.toString(16),
    }]) as EthLog[];

    allLogs.push(...logs);
  }

  return allLogs;
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

  logger.info({ fromBlock, currentBlock }, "Poller: consultando transferencias USDT via eth_getLogs");

  let logs: EthLog[];
  try {
    logs = await fetchUsdtTransfers(fromBlock, currentBlock);
  } catch (err) {
    // No actualizar lastCheckedBlock — se reintentará en el próximo ciclo
    logger.error({ err, fromBlock, currentBlock }, "Poller: error al consultar eth_getLogs — reintentando en 30 s");
    return;
  }

  // Solo actualizar el puntero si la consulta fue exitosa
  lastCheckedBlock = currentBlock;

  if (logs.length > 0) {
    logger.info({ count: logs.length, fromBlock, currentBlock }, "Poller: transferencias USDT entrantes detectadas");
  }

  for (const log of logs) {
    const txHash = log.transactionHash.toLowerCase();

    // Extraer from (topic[1]) y amount (data)
    const fromTopic = log.topics[1];
    if (!fromTopic) continue;
    const from = "0x" + fromTopic.slice(26).toLowerCase();
    const value = BigInt(log.data);

    if (await isProcessed(txHash)) continue;

    if (value < REQUIRED_AMOUNT_WEI) {
      logger.info({ txHash, from, value: value.toString() }, "Poller: transferencia menor a $10 — omitiendo");
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

  logger.info("Iniciando poller de blockchain BSC via eth_getLogs (Ankr/PublicNode, cada 30 segundos)");
  poll().catch((err) => logger.error({ err }, "Poller: error en el ciclo inicial"));
  setInterval(() => {
    poll().catch((err) => logger.error({ err }, "Poller: error en ciclo periódico"));
  }, 30_000);
}
