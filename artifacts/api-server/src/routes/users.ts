import { Router } from "express";
import { db, usersTable, paymentsTable, notificationsTable, commissionEventsTable } from "@workspace/db";
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

function buildWhatsappUrl(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

function calcDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null;
  const diff = expiresAt.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatReferralPerson(user: typeof usersTable.$inferSelect, level: number) {
  const commissionMap: Record<number, number> = { 1: 6, 2: 2, 3: 1 };
  return {
    id: user.id,
    name: user.name,
    phone: user.phone ?? null,
    whatsappUrl: buildWhatsappUrl(user.phone ?? null),
    accountStatus: user.accountStatus,
    joinedAt: user.createdAt.toISOString(),
    level,
    commissionAmount: commissionMap[level] ?? 0,
    membershipExpiresAt: user.membershipExpiresAt?.toISOString() ?? null,
    membershipTimerStartedAt: user.membershipTimerStartedAt?.toISOString() ?? null,
  };
}

function buildGenealogyNode(
  user: typeof usersTable.$inferSelect,
  allUsers: (typeof usersTable.$inferSelect)[],
  level: number,
  maxDepth = 3,
): any {
  const children =
    level < maxDepth
      ? allUsers
          .filter((u) => u.referrerId === user.id)
          .map((child) => buildGenealogyNode(child, allUsers, level + 1, maxDepth))
      : [];

  return {
    id: user.id,
    name: user.name,
    phone: user.phone ?? null,
    whatsappUrl: buildWhatsappUrl(user.phone ?? null),
    accountStatus: user.accountStatus,
    level,
    membershipExpiresAt: user.membershipExpiresAt?.toISOString() ?? null,
    membershipTimerStartedAt: user.membershipTimerStartedAt?.toISOString() ?? null,
    children,
  };
}

// GET /api/users/me/referrals — returns referrals grouped by level 1, 2, 3
router.get("/me/referrals", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const allUsers = await db.select().from(usersTable);

  const level1 = allUsers.filter((u) => u.referrerId === user.id);
  const level1Ids = new Set(level1.map((u) => u.id));

  const level2 = allUsers.filter((u) => u.referrerId !== null && level1Ids.has(u.referrerId));
  const level2Ids = new Set(level2.map((u) => u.id));

  const level3 = allUsers.filter((u) => u.referrerId !== null && level2Ids.has(u.referrerId));

  const allActive = [...level1, ...level2, ...level3].filter((u) => u.accountStatus === "active").length;

  // Projected monthly = active L1 * $6 + active L2 * $2 + active L3 * $1
  const projectedMonthly =
    level1.filter((u) => u.accountStatus === "active").length * 6 +
    level2.filter((u) => u.accountStatus === "active").length * 2 +
    level3.filter((u) => u.accountStatus === "active").length * 1;

  return res.json({
    level1: level1.map((u) => formatReferralPerson(u, 1)),
    level2: level2.map((u) => formatReferralPerson(u, 2)),
    level3: level3.map((u) => formatReferralPerson(u, 3)),
    totals: {
      count: level1.length + level2.length + level3.length,
      active: allActive,
      projectedMonthly,
    },
  });
});

// GET /api/users/me/tree — genealogy tree rooted at current user (3 levels deep)
router.get("/me/tree", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const allUsers = await db.select().from(usersTable);

  const root = buildGenealogyNode(user, allUsers, 0, 3);

  let nodeCount = 0;
  function countNodes(node: any) {
    nodeCount++;
    (node.children ?? []).forEach(countNodes);
  }
  (root.children ?? []).forEach(countNodes);

  return res.json({ root, nodes: nodeCount });
});

// GET /api/users/me/membership — membership timer status
router.get("/me/membership", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const timerStarted = !!user.membershipTimerStartedAt;
  const expiresAt = user.membershipExpiresAt ?? null;
  const gracePeriodEndsAt = expiresAt ? new Date(expiresAt.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
  const daysRemaining = calcDaysRemaining(expiresAt);
  const inGracePeriod =
    expiresAt !== null && Date.now() > expiresAt.getTime() && gracePeriodEndsAt !== null && Date.now() < gracePeriodEndsAt.getTime();
  const graceEndsInDays = gracePeriodEndsAt ? calcDaysRemaining(gracePeriodEndsAt) : null;
  const referralCodeActive = user.accountStatus === "active";

  return res.json({
    accountStatus: user.accountStatus,
    timerStarted,
    membershipStartedAt: user.membershipStartedAt?.toISOString() ?? null,
    membershipTimerStartedAt: user.membershipTimerStartedAt?.toISOString() ?? null,
    membershipExpiresAt: expiresAt?.toISOString() ?? null,
    gracePeriodEndsAt: gracePeriodEndsAt?.toISOString() ?? null,
    daysRemaining,
    inGracePeriod,
    graceEndsInDays,
    referralCodeActive,
  });
});

// GET /api/users/me/earnings — earnings summary
router.get("/me/earnings", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const allUsers = await db.select().from(usersTable);

  const level1 = allUsers.filter((u) => u.referrerId === user.id);
  const level1Ids = new Set(level1.map((u) => u.id));
  const level2 = allUsers.filter((u) => u.referrerId !== null && level1Ids.has(u.referrerId!));
  const level2Ids = new Set(level2.map((u) => u.id));
  const level3 = allUsers.filter((u) => u.referrerId !== null && level2Ids.has(u.referrerId!));

  const activeL1 = level1.filter((u) => u.accountStatus === "active").length;
  const activeL2 = level2.filter((u) => u.accountStatus === "active").length;
  const activeL3 = level3.filter((u) => u.accountStatus === "active").length;

  const projectedDay15 = activeL1 * 6 + activeL2 * 2 + activeL3 * 1;
  const totalReferrals = level1.length + level2.length + level3.length;
  const activeReferrals = activeL1 + activeL2 + activeL3;

  // Historical total: sum all approved payments from tree members * their commission rates
  const allTreeIds = [...level1, ...level2, ...level3].map((u) => u.id);
  let totalHistorical = 0;
  if (allTreeIds.length > 0) {
    const approvedPayments = await db
      .select({ userId: paymentsTable.userId, amount: paymentsTable.amount })
      .from(paymentsTable)
      .where(and(eq(paymentsTable.status, "approved"), sql`${paymentsTable.userId} = ANY(${sql.raw(`ARRAY[${allTreeIds.join(",")}]::int[]`)})`));

    for (const p of approvedPayments) {
      const isL1 = level1.some((u) => u.id === p.userId);
      const isL2 = !isL1 && level2.some((u) => u.id === p.userId);
      const isL3 = !isL1 && !isL2 && level3.some((u) => u.id === p.userId);
      const rate = isL1 ? 6 : isL2 ? 2 : isL3 ? 1 : 0;
      totalHistorical += rate;
    }
  }

  return res.json({
    totalReferrals,
    activeReferrals,
    level1Count: level1.length,
    level2Count: level2.length,
    level3Count: level3.length,
    projectedDay15,
    totalHistorical,
  });
});

// GET /api/users/me/referral-code
router.get("/me/referral-code", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const base = process.env.APP_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN ?? "localhost"}`;
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

// ── Historial de comisiones ───────────────────────────────────────────────────

// GET /api/users/me/commission-history — historial de comisiones recibidas
router.get("/me/commission-history", requireAuth, async (req: any, res) => {
  const user = req.currentUser;

  const events = await db
    .select({
      id: commissionEventsTable.id,
      level: commissionEventsTable.level,
      amountUsdt: commissionEventsTable.amountUsdt,
      txHash: commissionEventsTable.txHash,
      sourceTxHash: commissionEventsTable.sourceTxHash,
      status: commissionEventsTable.status,
      errorMessage: commissionEventsTable.errorMessage,
      createdAt: commissionEventsTable.createdAt,
      sourceName: usersTable.name,
    })
    .from(commissionEventsTable)
    .leftJoin(usersTable, eq(commissionEventsTable.sourceUserId, usersTable.id))
    .where(eq(commissionEventsTable.recipientId, user.id))
    .orderBy(desc(commissionEventsTable.createdAt))
    .limit(100);

  const totalReceived = events
    .filter((e) => e.status === "sent")
    .reduce((sum, e) => sum + parseFloat(e.amountUsdt), 0);

  return res.json({
    events: events.map((e) => ({
      id: e.id,
      level: e.level,
      amountUsdt: parseFloat(e.amountUsdt),
      txHash: e.txHash ?? null,
      sourceTxHash: e.sourceTxHash ?? null,
      status: e.status,
      errorMessage: e.errorMessage ?? null,
      sourceName: e.sourceName ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
    totalReceived,
  });
});

export default router;
