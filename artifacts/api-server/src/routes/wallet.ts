import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";

const router = Router();

// GET /api/offers/wall — dirección del offerwall para el usuario conectado (el id sale de la sesión, nunca del navegador)
router.get("/offers/wall", requireAuth, (req: any, res) => {
  const publicKey = process.env.OFFERWALL_PUBLIC_KEY;
  if (!publicKey) return res.status(503).json({ error: "Las ofertas aún no están disponibles." });
  const url = `https://offerwall.gg/wall/${encodeURIComponent(publicKey)}?userId=${req.currentUser.id}`;
  return res.json({ url });
});

// GET /api/wallet — saldo (USD) e historial de movimientos
router.get("/wallet", requireAuth, async (req: any, res) => {
  const id = req.currentUser.id;
  const bal = await pool.query("SELECT COALESCE(SUM(amount_usd),0) AS balance FROM wallet_ledger WHERE user_id = $1", [id]);
  const hist = await pool.query(
    "SELECT id, type, amount_usd, note, created_at FROM wallet_ledger WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 50",
    [id],
  );
  return res.json({
    balanceUsd: Number(bal.rows[0].balance),
    history: hist.rows.map((r) => ({ id: r.id, type: r.type, amountUsd: Number(r.amount_usd), note: r.note, createdAt: new Date(r.created_at).toISOString() })),
  });
});

export default router;
