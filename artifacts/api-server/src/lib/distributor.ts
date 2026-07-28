/**
 * distributor.ts
 * Envía comisiones USDT BEP20 desde la billetera operadora (SafePal) a los referidores.
 * Estructura por pago de $10:
 *   N1 (referidor directo)  → $6
 *   N2 (referidor del N1)   → $2
 *   N3 (nivel 3)            → $1
 *   $1 queda en la SafePal  → fee de plataforma
 */
import { ethers } from "ethers";
import { db, usersTable, commissionEventsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const BSC_RPC_URL = process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org/";

const COMMISSIONS: Record<number, bigint> = {
  1: ethers.parseUnits("6", 18),
  2: ethers.parseUnits("2", 18),
  3: ethers.parseUnits("1", 18),
};

const COMMISSION_LABELS: Record<number, string> = { 1: "$6", 2: "$2", 3: "$1" };
const COMMISSION_AMOUNTS: Record<number, string> = { 1: "6", 2: "2", 3: "1" };

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

function supportMessage(): string {
  const wa = process.env.SUPPORT_WHATSAPP;
  return wa
    ? `Contáctanos por WhatsApp: ${wa}`
    : "Contáctanos por el WhatsApp de soporte que aparece en la web.";
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
    logger.warn({ err, userId, type }, "Distribuidor: no se pudo crear notificación");
  }
}

export async function distributeCommissions(
  user: typeof usersTable.$inferSelect,
  sourceTxHash?: string,
): Promise<void> {
  const operatorKey = process.env.OPERATOR_PRIVATE_KEY;
  if (!operatorKey) {
    logger.warn("OPERATOR_PRIVATE_KEY no configurado — omitiendo distribución de comisiones");
    return;
  }

  let provider: ethers.JsonRpcProvider;
  let wallet: ethers.Wallet;
  let usdt: ethers.Contract;

  try {
    provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    wallet = new ethers.Wallet(operatorKey, provider);
    usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  } catch (err) {
    logger.error({ err }, "Distribuidor: error al inicializar ethers wallet");
    return;
  }

  // Recorrer la cadena de referidos: N1 → N2 → N3
  let currentReferrerId = user.referrerId;
  let level = 1;

  while (currentReferrerId != null && level <= 3) {
    const [referrer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentReferrerId))
      .limit(1);

    if (!referrer) break;

    const commission = COMMISSIONS[level];
    if (!commission) {
      currentReferrerId = referrer.referrerId;
      level++;
      continue;
    }

    if (!referrer.bscWallet) {
      logger.warn(
        { level, referrerId: referrer.id },
        "Distribuidor: referidor sin billetera BSC — omitiendo comisión",
      );
      // Registrar evento como skipped
      await db.insert(commissionEventsTable).values({
        recipientId: referrer.id,
        sourceUserId: user.id,
        level,
        amountUsdt: COMMISSION_AMOUNTS[level] ?? "0",
        sourceTxHash: sourceTxHash ?? null,
        status: "skipped",
        errorMessage: "Sin billetera BSC registrada",
      }).catch(() => {});

    } else if (referrer.accountStatus !== "active") {
      logger.info(
        { level, referrerId: referrer.id, status: referrer.accountStatus },
        "Distribuidor: referidor no activo — omitiendo comisión",
      );
      // Registrar evento como skipped
      await db.insert(commissionEventsTable).values({
        recipientId: referrer.id,
        sourceUserId: user.id,
        level,
        amountUsdt: COMMISSION_AMOUNTS[level] ?? "0",
        sourceTxHash: sourceTxHash ?? null,
        status: "skipped",
        errorMessage: `Cuenta en estado: ${referrer.accountStatus}`,
      }).catch(() => {});

    } else {
      try {
        const tx = await (usdt.transfer as any)(referrer.bscWallet, commission);
        const receipt = await tx.wait(1);
        const txHash: string = receipt?.hash ?? tx.hash;

        logger.info(
          {
            level,
            referrerId: referrer.id,
            wallet: referrer.bscWallet,
            amountUSDT: ethers.formatUnits(commission, 18),
            txHash,
          },
          "Distribuidor: comisión enviada exitosamente",
        );

        // Registrar evento en commission_events
        await db.insert(commissionEventsTable).values({
          recipientId: referrer.id,
          sourceUserId: user.id,
          level,
          amountUsdt: COMMISSION_AMOUNTS[level] ?? "0",
          txHash,
          sourceTxHash: sourceTxHash ?? null,
          status: "sent",
        }).catch((err) => logger.warn({ err }, "Distribuidor: no se pudo guardar commission_event"));

        // Notificar al referidor que recibió su comisión
        await createNotification(
          referrer.id,
          "commission_sent",
          `✅ Recibiste ${COMMISSION_LABELS[level]} USDT`,
          `${user.name} realizó su pago y recibiste una comisión de nivel ${level} de ${COMMISSION_LABELS[level]} USDT en tu billetera.`,
          { level, amountUsdt: COMMISSION_AMOUNTS[level], txHash, sourceTxHash },
        );

      } catch (err) {
        // Un fallo en un nivel NO cancela los otros niveles
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.error(
          { err, level, referrerId: referrer.id },
          "Distribuidor: error al enviar comisión — continuando con el siguiente nivel",
        );

        // Registrar evento fallido
        await db.insert(commissionEventsTable).values({
          recipientId: referrer.id,
          sourceUserId: user.id,
          level,
          amountUsdt: COMMISSION_AMOUNTS[level] ?? "0",
          sourceTxHash: sourceTxHash ?? null,
          status: "failed",
          errorMessage: errMsg.slice(0, 500),
        }).catch(() => {});

        // Notificar al referidor del error y que contacte soporte
        await createNotification(
          referrer.id,
          "commission_failed",
          `⚠️ Problema con tu comisión de nivel ${level}`,
          `Hubo un error al enviarte la comisión de ${COMMISSION_LABELS[level]} USDT. ${supportMessage()}`,
          { level, amountUsdt: COMMISSION_AMOUNTS[level], error: errMsg.slice(0, 200) },
        );
      }
    }

    currentReferrerId = referrer.referrerId;
    level++;
  }
}
