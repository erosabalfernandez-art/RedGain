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
const BSC_RPC_URL = process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org/";
const REQUIRED_AMOUNT = ethers.parseUnits("10", 18); // $10 USDT — 18 decimales en BSC

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

// ── Lógica principal del polling ──────────────────────────────────────────────
async function poll(): Promise<void> {
  if (!RECEIVING_WALLET) {
    logger.warn("RECEIVING_WALLET no configurado — poller omitiendo ciclo");
    return;
  }

  let provider: ethers.JsonRpcProvider;
  try {
    provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
  } catch (err) {
    logger.error({ err }, "Poller blockchain: error al crear provider");
    return;
  }

  let currentBlock: number;
  try {
    currentBlock = await provider.getBlockNumber();
  } catch (err) {
    logger.error({ err }, "Poller blockchain: error al obtener número de bloque");
    return;
  }

  // En el primer arranque, revisar los últimos ~50 000 bloques (~42 horas en BSC)
  // Esto asegura que los pagos realizados mientras el servidor estaba caído se detecten al reiniciar.
  const fromBlock =
    lastCheckedBlock === 0
      ? Math.max(0, currentBlock - 50_000)
      : lastCheckedBlock + 1;

  if (fromBlock > currentBlock) return;
  lastCheckedBlock = currentBlock;

  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

  let events: ethers.Log[];
  try {
    const filter = usdt.filters.Transfer(null, RECEIVING_WALLET);
    events = await usdt.queryFilter(filter, fromBlock, currentBlock);
  } catch (err) {
    logger.error({ err, fromBlock, currentBlock }, "Poller blockchain: error al consultar eventos Transfer");
    return;
  }

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
