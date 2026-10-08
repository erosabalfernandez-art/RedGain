import { Router } from "express";
import { db, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";

const router = Router();

// Auth middleware
async function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "No autenticado" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) return res.status(401).json({ error: "No autenticado" });
  req.currentUser = user;
  next();
}

// GET /api/users/me/referrals — referidos directos (un solo nivel)
router.get("/me/referrals", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const direct = await db.select().from(usersTable).where(eq(usersTable.referrerId, user.id)).orderBy(desc(usersTable.createdAt));
  return res.json({
    level1: direct.map((u) => ({
      id: u.id,
      name: u.name,
      joinedAt: u.createdAt.toISOString(),
    })),
    totals: { count: direct.length },
  });
});

// GET /api/users/me/referral-code
router.get("/me/referral-code", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const host = req.headers["x-forwarded-host"] ?? req.get("host");
  const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
  const base = (process.env.APP_URL ?? `${proto}://${host}`).replace(/\/$/, "");
  const active = user.accountStatus === "active";
  return res.json({
    code: user.referralCode,
    link: `${base}/register?ref=${user.referralCode}`,
    active,
  });
});

// PATCH /api/users/me/bsc-wallet — permite al usuario registrar o actualizar su billetera BSC
router.patch("/me/bsc-wallet", requireAuth, async (req: any, res) => {
  const { bscWallet } = req.body;
  if (!bscWallet) {
    return res.status(400).json({ error: "La dirección BSC es requerida" });
  }
  const normalized = bscWallet.trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(normalized)) {
    return res.status(400).json({ error: "Dirección BSC inválida. Debe empezar con 0x y tener 42 caracteres." });
  }
  // Verificar que no esté en uso por otro usuario
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.bscWallet, normalized))
    .limit(1);
  if (existing && existing.id !== req.currentUser.id) {
    return res.status(400).json({ error: "Esa billetera BSC ya está registrada por otro usuario" });
  }
  const [updated] = await db
    .update(usersTable)
    .set({ bscWallet: normalized, updatedAt: new Date() })
    .where(eq(usersTable.id, req.currentUser.id))
    .returning();
  return res.json({ success: true, bscWallet: updated.bscWallet });
});

// ── Notificaciones ────────────────────────────────────────────────────────────

// GET /api/users/me/notifications — lista de notificaciones + unreadCount
router.get("/me/notifications", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const unreadCount = rows.filter((n) => !n.read).length;

  const notifications = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read,
    metadata: n.metadata ? (() => { try { return JSON.parse(n.metadata!); } catch { return {}; } })() : {},
    createdAt: n.createdAt.toISOString(),
  }));

  return res.json({ notifications, unreadCount });
});

// PATCH /api/users/me/notifications/mark-read — marcar todas como leídas
router.patch("/me/notifications/mark-read", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.read, false)));
  return res.json({ success: true });
});


export default router;
