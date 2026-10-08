import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

// Reparto de cada conversión (configurable en Render). Se calcula SOLO con campos firmados.
const COINS_PER_USD = Number(process.env.OFFERWALL_COINS_PER_USD ?? "1");
const USER_SHARE = Number(process.env.OFFERWALL_USER_SHARE ?? "0.6");
const REFERRAL_SHARE = Number(process.env.OFFERWALL_REFERRAL_SHARE ?? "0.1");
const r6 = (n: number) => Math.round(n * 1e6) / 1e6;

function validSignature(user: string, tx: string, amount: string, sig: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(`${user}:${tx}:${amount}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(sig).toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// GET /api/postback/offerwall — lo llama Offerwall.GG cuando se completa o se revierte una oferta
router.get("/offerwall", async (req, res) => {
  const secret = process.env.OFFERWALL_SECRET_KEY;
  if (!secret) {
    logger.error("OFFERWALL_SECRET_KEY no está configurada: postback rechazado");
    return res.status(503).send("not configured");
  }
  const q = req.query as Record<string, string | undefined>;
  const { user, tx, amount, sig } = q;
  if (!user || !tx || !amount || !sig) return res.status(400).send("missing params");
  if (!validSignature(user, tx, amount, sig, secret)) return res.status(403).send("invalid signature");

  if (q.test === "1") return res.send("ok"); // postback de prueba: nunca se acredita
  const status = q.status;
  if (status !== "credited" && status !== "reversed") return res.status(400).send("bad status");

  const coins = Number(amount);
  const userId = Number(user);
  if (!Number.isFinite(coins) || !Number.isInteger(userId) || userId <= 0) {
    logger.warn({ user, tx, amount }, "postback con datos inválidos (ignorado)");
    return res.send("ok");
  }

  // El signo lo decide el estado: acreditar suma, revertir resta.
  const usdAbs = Math.abs(coins) / COINS_PER_USD;
  const usd = status === "reversed" ? -usdAbs : usdAbs;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ins = await client.query(
      `INSERT INTO offerwall_conversions (tx_id, status, user_id, offer_id, offer_name, goal_id, currency_amount, payout_usd)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (tx_id, status) DO NOTHING RETURNING id`,
      [tx, status, userId, q.offerId ?? null, q.offer ?? null, q.goal ?? null, coins, usd],
    );
    if (ins.rowCount === 0) { await client.query("ROLLBACK"); return res.send("ok"); } // repetido

    const u = await client.query("SELECT id, referrer_id FROM users WHERE id = $1", [userId]);
    if (u.rowCount === 0) {
      await client.query("COMMIT");
      logger.warn({ userId, tx }, "postback de un usuario que no existe (registrado sin acreditar)");
      return res.send("ok");
    }

    const userCredit = r6(usd * USER_SHARE);
    const type = status === "reversed" ? "offer_reversal" : "offer_reward";
    const note = q.offer ? String(q.offer).slice(0, 120) : null;
    await client.query(
      `INSERT INTO wallet_ledger (user_id, type, amount_usd, ref_tx, note) VALUES ($1,$2,$3,$4,$5)`,
      [userId, type, userCredit, tx, note],
    );

    let referrerCredit = 0;
    const referrerId: number | null = u.rows[0].referrer_id;
    if (referrerId) {
      const r = await client.query("SELECT id FROM users WHERE id = $1 AND account_status = 'active'", [referrerId]);
      if ((r.rowCount ?? 0) > 0) {
        referrerCredit = r6(usd * REFERRAL_SHARE);
        await client.query(
          `INSERT INTO wallet_ledger (user_id, type, amount_usd, ref_tx, note) VALUES ($1,$2,$3,$4,$5)`,
          [referrerId, status === "reversed" ? "referral_reversal" : "referral_bonus", referrerCredit, tx, note],
        );
      }
    }
    await client.query(`UPDATE offerwall_conversions SET user_credit_usd=$1, referrer_credit_usd=$2 WHERE tx_id=$3 AND status=$4`, [userCredit, referrerCredit, tx, status]);

    if (status === "credited" && userCredit > 0) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'offer_credited','Recompensa acreditada',$2)`,
        [userId, `Recibiste $${userCredit.toFixed(2)} por completar una oferta.`],
      );
    }
    await client.query("COMMIT");
    return res.send("ok");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    logger.error({ err, tx }, "error procesando postback");
    return res.status(500).send("error"); // Offerwall.GG reintenta
  } finally {
    client.release();
  }
});

export default router;
