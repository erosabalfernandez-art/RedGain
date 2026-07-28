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
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const BSC_RPC_URL = process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org/";

const COMMISSIONS: Record<number, bigint> = {
  1: ethers.parseUnits("6", 18),
  2: ethers.parseUnits("2", 18),
  3: ethers.parseUnits("1", 18),
};

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

export async function distributeCommissions(
  user: typeof usersTable.$inferSelect,
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
    } else if (referrer.accountStatus !== "active") {
      logger.info(
        { level, referrerId: referrer.id, status: referrer.accountStatus },
        "Distribuidor: referidor no activo — omitiendo comisión",
      );
    } else {
      try {
        const tx = await (usdt.transfer as any)(referrer.bscWallet, commission);
        const receipt = await tx.wait(1);
        logger.info(
          {
            level,
            referrerId: referrer.id,
            wallet: referrer.bscWallet,
            amountUSDT: ethers.formatUnits(commission, 18),
            txHash: receipt?.hash ?? tx.hash,
          },
          "Distribuidor: comisión enviada exitosamente",
        );
      } catch (err) {
        // Un fallo en un nivel NO cancela los otros niveles
        logger.error(
          { err, level, referrerId: referrer.id },
          "Distribuidor: error al enviar comisión — continuando con el siguiente nivel",
        );
      }
    }

    currentReferrerId = referrer.referrerId;
    level++;
  }
}
