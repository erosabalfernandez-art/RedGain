/**
 * blockchain-poller.ts
 * Revisa la blockchain de BSC cada 30 segundos buscando transferencias USDT
 * a la billetera receptora. Cuando detecta un pago de $10 de un usuario registrado:
 *   1. Registra el pago en la DB (aprobado automáticamente)
 *   2. Activa/renueva la membresía del usuario
 *   3. Inicia el temporizador del referidor si aplica
 *   4. Distribuye comisiones a la cadena de referidos
 *   5. Notifica al usuario que su pago fue confirmado
 */
import { ethers } from "ethers";
import { db, usersTable, paymentsTable, notificationsTable, pool } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "./logger";
import { distributeCommissions } from "./distributor";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const RECEIVING_WALLET = (process.env.RECEIVING_WALLET ?? "").toLowerCase();
const REQUIRED_AMOUNT = ethers.parseUnits("10", 18); // $10 USDT — 18 decimales en BSC

// RPCs públicos de BSC con soporte de eth_getLogs, en orden de preferencia.
// El poller intenta cada uno hasta que uno funciona.
const BSC_RPC_URLS: string[] = [
  process.env.BSC_RPC_URL ?? "",
  "https://bsc-dataseed4.ninicoin.io/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed2.defibit.io/",
  "https://bsc.drpc.org",
].filter(Boolean);

// Rango máximo de bloques por consulta para no superar límites del RPC
const MAX_BLOCK_RANGE = 2_000;

const USDT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

let lastCheckedBlock = 0;

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

// ── Obtener provider funcionando (prueba RPCs en orden) ───────────────────────
// IMPORTANTE: batchMaxCount:1 deshabilita el batching de ethers v6.
// Los nodos públicos de BSC rechazan eth_getLogs cuando llega en un batch
// ("method eth_getLogs in batch triggered rate limit").
async function getWorkingProvider(): Promise<{ provider: ethers.JsonRpcProvider; currentBlock: number } | null> {
  for (const url of BSC_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(url, undefined, { batchMaxCount: 1 });
      const currentBlock = await provider.getBlockNumber();
      return { provider, currentBlock };
    } catch {
      logger.warn({ url }, "Poller: RPC no disponible, probando el siguiente");
    }
  }
  logger.error("Poller: ningún RPC de BSC disponible en este ciclo");
  return null;
}

// ── Consultar eventos en chunks para no superar límites del RPC ───────────────
async function queryEventsInChunks(
  usdt: ethers.Contract,
  fromBlock: number,
  toBlock: number,
): Promise<ethers.Log[]> {
  const allEvents: ethers.Log[] = [];
  const filter = usdt.filters.Transfer(null, RECEIVING_WALLET);

  for (let start = fromBlock; start <= toBlock; start += MAX_BLOCK_RANGE) {
    const end = Math.min(start + MAX_BLOCK_RANGE - 1, toBlock);
    try {
      const chunk = await usdt.queryFilter(filter, start, end);
      allEvents.push(...chunk);
    } catch (err) {
      logger.error({ err, start, end }, "Poller: error consultando chunk de bloques — se reintentará en el próximo ciclo");
      // Lanzar para que poll() no actualice lastCheckedBlock con este rango
      throw err;
    }
  }
  return allEvents;
}

// ── Lógica principal del polling ──────────────────────────────────────────────
async function poll(): Promise<void> {
  if (!RECEIVING_WALLET) {
    logger.warn("RECEIVING_WALLET no configurado — poller omitiendo ciclo");
    return;
  }

  const result = await getWorkingProvider();
  if (!result) return;
  const { provider, currentBlock } = result;

  // En el primer arranque, revisar los últimos ~50 000 bloques (~42 horas en BSC)
  const fromBlock =
    lastCheckedBlock === 0
      ? Math.max(0, currentBlock - 50_000)
      : lastCheckedBlock + 1;

  if (fromBlock > currentBlock) return;

  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

  let events: ethers.Log[];
  try {
    events = await queryEventsInChunks(usdt, fromBlock, currentBlock);
  } catch {
    // Error ya logueado en queryEventsInChunks.
    // NO actualizamos lastCheckedBlock para que se reintente en el próximo ciclo.
    return;
  }

  // Solo actualizamos lastCheckedBlock cuando la consulta fue exitosa
  lastCheckedBlock = currentBlock;

  if (events.length > 0) {
    logger.info(
      { count: events.length, fromBlock, currentBlock },
      "Poller blockchain: transferencias USDT entrantes detectadas",
    );
  }

  for (const event of events) {
    const log = event as ethers.EventLog;
    const txHash = log.transactionHash.toLowerCase();
    const from = (log.args[0] as string).toLowerCase();
    const value = log.args[2] as bigint;

    if (await isProcessed(txHash)) continue;

    if (value < REQUIRED_AMOUNT) {
      logger.info({ txHash, from, value: value.toString() }, "Poller: transferencia menor a $10 — omitiendo");
      await markProcessed(txHash);
      continue;
    }

    // Buscar usuario por billetera BSC (guardada en lowercase)
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
  // Determinar si es pago inicial o renovación
  const existingApproved = await db
    .select({ id: paymentsTable.id })
    .from(paymentsTable)
    .where(and(eq(paymentsTable.userId, user.id), eq(paymentsTable.status, "approved")))
    .limit(1);

  const paymentType: "initial" | "renewal" =
    existingApproved.length > 0 ? "renewal" : "initial";

  // Registrar el pago (auto-aprobado)
  await db.insert(paymentsTable).values({
    userId: user.id,
    amount: "10",
    paymentType,
    proofText: "Pago automático blockchain",
    txHash,
    status: "approved",
  });

  // Activar / renovar membresía
  const now = new Date();
  const isFirstPayment = !user.membershipStartedAt;
  const updates: Record<string, unknown> = {
    accountStatus: "active",
    updatedAt: now,
  };

  if (isFirstPayment) {
    // Primer pago: registrar inicio. El temporizador de 30 días empieza cuando llegue su primer referido
    updates.membershipStartedAt = now;
  } else {
    // Renovación: reiniciar el contador de 30 días
    updates.membershipTimerStartedAt = now;
    updates.membershipExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  await db.update(usersTable).set(updates as any).where(eq(usersTable.id, user.id));

  // Si es el primer pago del usuario y tiene referidor, iniciar el temporizador del referidor si aún no había empezado
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

  // ── Notificar al usuario que su pago fue confirmado ───────────────────────
  const paymentLabel = paymentType === "initial" ? "inicial" : "de renovación";
  await createNotification(
    user.id,
    "payment_confirmed",
    "✅ Pago confirmado — cuenta activa",
    `Tu pago ${paymentLabel} de $10 USDT fue detectado en la blockchain y tu cuenta está activa. Tx: ${txHash.slice(0, 10)}…`,
    { txHash, paymentType },
  );

  // Distribuir comisiones a N1 ($6), N2 ($2), N3 ($1)
  // Pasamos el txHash del pago original para trazabilidad
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
    // El poller sigue corriendo para activar membresías, solo no distribuye comisiones
  }

  logger.info("Iniciando poller de blockchain BSC (USDT BEP20, cada 30 segundos)");
  poll().catch((err) => logger.error({ err }, "Poller: error en el ciclo inicial"));
  setInterval(() => {
    poll().catch((err) => logger.error({ err }, "Poller: error en ciclo periódico"));
  }, 30_000);
}
