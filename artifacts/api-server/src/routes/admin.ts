import { Router } from "express";
import { db, usersTable, paymentsTable/*, commissionDistributionsTable*/, pool } from "@workspace/db";
import { eq, desc, /*and, gte, lte,*/ sql } from "drizzle-orm";
import { distributeCommissions } from "../lib/distributor";
import { logger } from "../lib/logger";


// ── Auto-expire: run on every admin users fetch to keep statuses current ────
async function batchExpireMemberships(): Promise<void> {
  const now = new Date();

  // 1) Active → Paused when membership_expires_at has passed
  await db.execute(
    sql`UPDATE users SET account_status = 'paused', updated_at = NOW()
        WHERE account_status = 'active'
          AND membership_expires_at IS NOT NULL
          AND membership_expires_at < NOW()`
  );

  // 2) Paused → Lost after 14-day grace period
  await db.execute(
    sql`UPDATE users SET account_status = 'lost', updated_at = NOW()
        WHERE account_status = 'paused'
          AND membership_expires_at IS NOT NULL
          AND membership_expires_at < NOW() - INTERVAL '14 days'`
  );
}

const router = Router();

async function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "No autenticado" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Acceso denegado" });
  req.currentUser = user;
  next();
}

function buildWhatsappUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

function calcDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatAdminPayment(payment: typeof paymentsTable.$inferSelect, userName: string, userEmail: string, userPhone?: string | null) {
  const urls: string[] =
    payment.proofImageUrls && payment.proofImageUrls.length > 0
      ? payment.proofImageUrls
      : payment.proofImageUrl
        ? [payment.proofImageUrl]
        : [];
  return {
    id: payment.id,
    userId: payment.userId,
    userName,
    userEmail,
    userPhone: userPhone ?? null,
    amount: parseFloat(payment.amount),
    paymentType: payment.paymentType,
    status: payment.status,
    proofText: payment.proofText,
    proofImageUrl: urls[0] ?? null,
    proofImageUrls: urls,
    createdAt: payment.createdAt.toISOString(),
    reviewedAt: payment.reviewedAt?.toISOString() ?? null,
  };
}

function formatAdminUser(u: typeof usersTable.$inferSelect, referrals: any[], referrerName: string | null) {
  const activeReferrals = referrals.filter((r) => r.status === "active").length;
  const expiresAt = u.membershipExpiresAt ?? null;
  const gracePeriodEndsAt = expiresAt ? new Date(expiresAt.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
  const daysRemaining = calcDaysRemaining(expiresAt);
  const inGracePeriod =
    expiresAt !== null &&
    Date.now() > expiresAt.getTime() &&
    gracePeriodEndsAt !== null &&
    Date.now() < gracePeriodEndsAt.getTime();
  const timerStarted = !!u.membershipTimerStartedAt;

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? null,
    whatsappUrl: buildWhatsappUrl(u.phone),
    role: u.role,
    accountStatus: u.accountStatus,
    referralCode: u.referralCode,
    referrerName,
    referrerId: u.referrerId ?? null,
    totalReferrals: referrals.length,
    activeReferrals,
    membershipStartedAt: u.membershipStartedAt?.toISOString() ?? null,
    membershipTimerStartedAt: u.membershipTimerStartedAt?.toISOString() ?? null,
    membershipExpiresAt: expiresAt?.toISOString() ?? null,
    gracePeriodEndsAt: gracePeriodEndsAt?.toISOString() ?? null,
    daysRemaining,
    inGracePeriod,
    timerStarted,
    joinedAt: u.createdAt.toISOString(),
  };
}

// GET /api/admin/users
router.get("/users", requireAdmin, async (_req, res) => {
  // Auto-expire stale memberships before returning the list
  await batchExpireMemberships();
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const result = await Promise.all(
    users.map(async (u) => {
      const referrals = await db
        .select({ id: usersTable.id, status: usersTable.accountStatus })
        .from(usersTable)
        .where(eq(usersTable.referrerId, u.id));
      let referrerName: string | null = null;
      if (u.referrerId) {
        const [ref] = await db
          .select({ name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, u.referrerId))
          .limit(1);
        referrerName = ref?.name ?? null;
      }
      return formatAdminUser(u, referrals, referrerName);
    }),
  );
  return res.json(result);
});

// PATCH /api/admin/users/:id
router.patch("/users/:id", requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { accountStatus, role } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };

  if (accountStatus) updates.accountStatus = accountStatus;
  if (role) updates.role = role;

  // When activating for the first time, set membershipStartedAt
  if (accountStatus === "active") {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (existing && !existing.membershipStartedAt) {
      updates.membershipStartedAt = new Date();
    }
    // If renewing (was paused/lost and now re-activating), reset timer
    if (existing && (existing.accountStatus === "paused" || existing.accountStatus === "lost")) {
      // Renewal: restart timer for 30 days
      const now = new Date();
      updates.membershipTimerStartedAt = now;
      updates.membershipExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

  // If we just activated this user, check if their referrer's timer needs to start
  if (accountStatus === "active" && updated.referrerId) {
    const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, updated.referrerId)).limit(1);
    if (referrer && referrer.accountStatus === "active" && !referrer.membershipTimerStartedAt) {
      // This is the referrer's first active referral → start their timer
      const now = new Date();
      await db
        .update(usersTable)
        .set({
          membershipTimerStartedAt: now,
          membershipExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: now,
        })
        .where(eq(usersTable.id, referrer.id));
    }
  }

  const referrals = await db
    .select({ id: usersTable.id, status: usersTable.accountStatus })
    .from(usersTable)
    .where(eq(usersTable.referrerId, updated.id));
  let referrerName: string | null = null;
  if (updated.referrerId) {
    const [ref] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, updated.referrerId)).limit(1);
    referrerName = ref?.name ?? null;
  }
  return res.json(formatAdminUser(updated, referrals, referrerName));
});

/* FLUJO MANUAL DE PAGOS COMENTADO — reactivar si hace falta
// GET /api/admin/payments
router.get("/payments", requireAdmin, async (_req, res) => {
  const payments = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));
  const result = await Promise.all(
    payments.map(async (p) => {
      const [user] = await db
        .select({ name: usersTable.name, email: usersTable.email, phone: usersTable.phone })
        .from(usersTable)
        .where(eq(usersTable.id, p.userId))
        .limit(1);
      return formatAdminPayment(p, user?.name ?? "Desconocido", user?.email ?? "", user?.phone);
    }),
  );
  return res.json(result);
});

// PATCH /api/admin/payments/:id
router.patch("/payments/:id", requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { status, note } = req.body;
  if (!status) return res.status(400).json({ error: "Estado requerido" });

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id)).limit(1);
  if (!payment) return res.status(404).json({ error: "Pago no encontrado" });

  const [updated] = await db
    .update(paymentsTable)
    .set({
      status,
      reviewNote: note ?? null,
      reviewedBy: req.currentUser.id,
      reviewedAt: new Date(),
    })
    .where(eq(paymentsTable.id, id))
    .returning();

  // If approving a payment, activate the user and trigger timer logic
  if (status === "approved") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payment.userId)).limit(1);
    if (user) {
      const isFirstPayment = !user.membershipStartedAt;
      const updates: Record<string, any> = {
        accountStatus: "active",
        updatedAt: new Date(),
      };
      if (isFirstPayment) {
        updates.membershipStartedAt = new Date();
      } else {
        // Renewal: restart the 30-day timer
        const now = new Date();
        updates.membershipTimerStartedAt = now;
        updates.membershipExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id));

      // Check if referrer's timer needs to start (first referral activation)
      if (isFirstPayment && user.referrerId) {
        const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, user.referrerId)).limit(1);
        if (referrer && referrer.accountStatus === "active" && !referrer.membershipTimerStartedAt) {
          const now = new Date();
          await db
            .update(usersTable)
            .set({
              membershipTimerStartedAt: now,
              membershipExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            })
            .where(eq(usersTable.id, referrer.id));
        }
      }
    }
  }

  const [user] = await db
    .select({ name: usersTable.name, email: usersTable.email, phone: usersTable.phone })
    .from(usersTable)
    .where(eq(usersTable.id, updated.userId))
    .limit(1);
  return res.json(formatAdminPayment(updated, user?.name ?? "Desconocido", user?.email ?? "", user?.phone));
});
FIN FLUJO MANUAL DE PAGOS COMENTADO */

// DELETE /api/admin/users/:id
router.delete("/users/:id", requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  if (req.currentUser.id === id) return res.status(400).json({ error: "No puedes eliminar tu propia cuenta de administrador" });

  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!target) return res.status(404).json({ error: "Usuario no encontrado" });
  if (target.role === "admin") return res.status(400).json({ error: "No se puede eliminar una cuenta de administrador" });

  // Delete payments first to avoid FK constraint (cascade-safe)
  await db.delete(paymentsTable).where(eq(paymentsTable.userId, id));
  // Unlink referred users so they lose their referrer but are not deleted
  await db.update(usersTable).set({ referrerId: null, updatedAt: new Date() }).where(eq(usersTable.referrerId, id));
  await db.delete(usersTable).where(eq(usersTable.id, id));

  return res.json({ success: true });
});

// GET /api/admin/tree — global genealogy tree (all root users)
router.get("/tree", requireAdmin, async (_req, res) => {
  const allUsers = await db.select().from(usersTable);

  function buildNode(u: typeof usersTable.$inferSelect, depth: number): any {
    if (depth > 10) return null; // safety limit
    const children = allUsers
      .filter((child) => child.referrerId === u.id)
      .map((child) => buildNode(child, depth + 1))
      .filter(Boolean);
    const expiresAt = u.membershipExpiresAt;
    const gracePeriodEndsAt = expiresAt ? new Date(expiresAt.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
    return {
      id: u.id,
      name: u.name,
      phone: u.phone ?? null,
      whatsappUrl: buildWhatsappUrl(u.phone),
      accountStatus: u.accountStatus,
      level: depth,
      membershipExpiresAt: expiresAt?.toISOString() ?? null,
      membershipTimerStartedAt: u.membershipTimerStartedAt?.toISOString() ?? null,
      gracePeriodEndsAt: gracePeriodEndsAt?.toISOString() ?? null,
      daysRemaining: calcDaysRemaining(expiresAt ?? null),
      children,
    };
  }

  // Root nodes: users with no referrer
  const roots = allUsers.filter((u) => !u.referrerId).map((u) => buildNode(u, 0));
  return res.json(roots);
});

/* COMISIONES MANUALES COMENTADAS — reactivar si hace falta
// GET /api/admin/commissions — commission payout calculator
router.get("/commissions", requireAdmin, async (_req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Cycle: approved renewals between day 1 and day 10 of current month
  const cycleStart = new Date(year, month, 1);
  const cutoffDate = new Date(year, month, 10, 23, 59, 59);
  const distributionDate = new Date(year, month, 15);

  const renewals = await db
    .select()
    .from(paymentsTable)
    .where(and(eq(paymentsTable.status, "approved"), gte(paymentsTable.createdAt, cycleStart), lte(paymentsTable.createdAt, cutoffDate)));

  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  // For each renewal, walk up the referral chain and credit commissions
  const commissionsMap = new Map<
    number,
    { fromLevel1: number; fromLevel2: number; fromLevel3: number; level1Renewals: number; level2Renewals: number; level3Renewals: number }
  >();

  for (const payment of renewals) {
    const payer = userMap.get(payment.userId);
    if (!payer) continue;

    // Level 1 referrer
    if (payer.referrerId) {
      const l1 = userMap.get(payer.referrerId);
      if (l1 && l1.accountStatus === "active") {
        if (!commissionsMap.has(l1.id)) {
          commissionsMap.set(l1.id, { fromLevel1: 0, fromLevel2: 0, fromLevel3: 0, level1Renewals: 0, level2Renewals: 0, level3Renewals: 0 });
        }
        const entry = commissionsMap.get(l1.id)!;
        entry.fromLevel1 += 6;
        entry.level1Renewals++;

        // Level 2 referrer
        if (l1.referrerId) {
          const l2 = userMap.get(l1.referrerId);
          if (l2 && l2.accountStatus === "active") {
            if (!commissionsMap.has(l2.id)) {
              commissionsMap.set(l2.id, { fromLevel1: 0, fromLevel2: 0, fromLevel3: 0, level1Renewals: 0, level2Renewals: 0, level3Renewals: 0 });
            }
            const e2 = commissionsMap.get(l2.id)!;
            e2.fromLevel2 += 2;
            e2.level2Renewals++;

            // Level 3 referrer
            if (l2.referrerId) {
              const l3 = userMap.get(l2.referrerId);
              if (l3 && l3.accountStatus === "active") {
                if (!commissionsMap.has(l3.id)) {
                  commissionsMap.set(l3.id, { fromLevel1: 0, fromLevel2: 0, fromLevel3: 0, level1Renewals: 0, level2Renewals: 0, level3Renewals: 0 });
                }
                const e3 = commissionsMap.get(l3.id)!;
                e3.fromLevel3 += 1;
                e3.level3Renewals++;
              }
            }
          }
        }
      }
    }
  }

  const recipients = Array.from(commissionsMap.entries()).map(([userId, breakdown]) => {
    const user = userMap.get(userId)!;
    return {
      userId,
      name: user.name,
      phone: user.phone ?? null,
      whatsappUrl: buildWhatsappUrl(user.phone),
      totalAmount: breakdown.fromLevel1 + breakdown.fromLevel2 + breakdown.fromLevel3,
      breakdown,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  const totalToDistribute = recipients.reduce((s, r) => s + r.totalAmount, 0);
  const platformFee = renewals.length * 1; // $1 per renewal stays with platform

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return res.json({
    cycleMonth: `${monthNames[month]} ${year}`,
    cutoffDate: cutoffDate.toISOString(),
    distributionDate: distributionDate.toISOString(),
    totalToDistribute,
    platformFee,
    totalRenewals: renewals.length,
    recipients,
  });
});


// GET /api/admin/commissions/distribution-status
// Returns whether the current cycle has already been marked as distributed
router.get("/commissions/distribution-status", requireAdmin, async (_req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const cycleKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const rows = await db
    .select()
    .from(commissionDistributionsTable)
    .where(eq(commissionDistributionsTable.cycleMonth, cycleKey))
    .limit(1);

  if (rows.length === 0) {
    return res.json({ cycleMonth: cycleKey, distributed: false, distribution: null });
  }

  const d = rows[0];
  let distributorName: string | null = null;
  if (d.distributedBy) {
    const [admin] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, d.distributedBy))
      .limit(1);
    distributorName = admin?.name ?? null;
  }

  return res.json({
    cycleMonth: cycleKey,
    distributed: true,
    distribution: {
      id: d.id,
      distributedAt: d.distributedAt.toISOString(),
      distributedBy: distributorName,
      totalAmount: parseFloat(d.totalAmount ?? "0"),
      recipientCount: d.recipientCount,
      notes: d.notes ?? null,
    },
  });
});

// POST /api/admin/commissions/mark-distributed
// Marks the current cycle as distributed (idempotent — updates if already marked)
router.post("/commissions/mark-distributed", requireAdmin, async (req: any, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const cycleKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const { totalAmount, recipientCount, notes } = req.body;

  // Upsert using raw SQL for simplicity
  await db.execute(
    sql`INSERT INTO commission_distributions (cycle_month, distributed_at, distributed_by, total_amount, recipient_count, notes)
        VALUES (${cycleKey}, NOW(), ${req.currentUser.id}, ${String(totalAmount ?? 0)}, ${recipientCount ?? 0}, ${notes ?? null})
        ON CONFLICT (cycle_month) DO UPDATE
          SET distributed_at = NOW(),
              distributed_by = ${req.currentUser.id},
              total_amount    = ${String(totalAmount ?? 0)},
              recipient_count = ${recipientCount ?? 0},
              notes           = ${notes ?? null}`
  );

  return res.json({ success: true, cycleMonth: cycleKey });
});

// GET /api/admin/commissions/history
// Returns all past distribution records (most recent first)
router.get("/commissions/history", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(commissionDistributionsTable)
    .orderBy(desc(commissionDistributionsTable.distributedAt));

  const result = await Promise.all(
    rows.map(async (d) => {
      let distributorName: string | null = null;
      if (d.distributedBy) {
        const [admin] = await db
          .select({ name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, d.distributedBy))
          .limit(1);
        distributorName = admin?.name ?? null;
      }
      return {
        id: d.id,
        cycleMonth: d.cycleMonth,
        distributedAt: d.distributedAt.toISOString(),
        distributedBy: distributorName,
        totalAmount: parseFloat(d.totalAmount ?? "0"),
        recipientCount: d.recipientCount,
        notes: d.notes ?? null,
      };
    }),
  );

  return res.json(result);
});
FIN COMISIONES MANUALES COMENTADAS */

// GET /api/admin/stats
router.get("/stats", requireAdmin, async (_req, res) => {
  const users = await db.select().from(usersTable);
  const payments = await db.select().from(paymentsTable);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const totalUsers = users.filter((u) => u.role !== "admin").length;
  const activeUsers = users.filter((u) => u.accountStatus === "active").length;
  const pendingUsers = users.filter((u) => u.accountStatus === "pending").length;
  const pausedUsers = users.filter((u) => u.accountStatus === "paused").length;
  const lostUsers = users.filter((u) => u.accountStatus === "lost").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  const approvedPayments = payments.filter((p) => p.status === "approved");
  const totalRevenue = approvedPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const monthlyRevenue = approvedPayments
    .filter((p) => p.createdAt >= monthStart)
    .reduce((s, p) => s + parseFloat(p.amount), 0);

  const expiringThisWeek = users.filter(
    (u) => u.membershipExpiresAt && u.membershipExpiresAt > now && u.membershipExpiresAt <= nextWeek,
  ).length;

  return res.json({ totalUsers, activeUsers, pendingUsers, pausedUsers, lostUsers, pendingPayments, totalRevenue, monthlyRevenue, expiringThisWeek });
});

// POST /api/admin/process-tx
// Fuerza el procesamiento manual de una transacción BSC ya confirmada.
// Body: { txHash: string, fromWallet: string }
//   txHash    — hash de la tx en BSC
//   fromWallet — dirección que envió los 10 USDT (para asociar al usuario)
router.post("/process-tx", requireAdmin, async (req, res) => {
  const { txHash, fromWallet } = req.body as { txHash?: string; fromWallet?: string };

  if (!txHash || !fromWallet) {
    return res.status(400).json({ error: "Se requieren txHash y fromWallet" });
  }

  const txHashLower = txHash.toLowerCase().trim();
  const fromLower = fromWallet.toLowerCase().trim();

  // Verificar si ya fue procesada
  const client = await pool.connect();
  try {
    const dup = await client.query("SELECT 1 FROM processed_transactions WHERE tx_hash = $1 LIMIT 1", [txHashLower]);
    if ((dup.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: "Esta transacción ya fue procesada" });
    }
  } finally {
    client.release();
  }

  // Buscar usuario por billetera
  const [user] = await db
    .select()
    .from(usersTable)
    .where(sql`LOWER(${usersTable.bscWallet}) = ${fromLower}`)
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: `Ningún usuario registrado con la billetera ${fromWallet}` });
  }

  try {
    // Determinar tipo de pago
    const existingApproved = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(sql`${paymentsTable.userId} = ${user.id} AND ${paymentsTable.status} = 'approved'`)
      .limit(1);

    const paymentType: "initial" | "renewal" = existingApproved.length > 0 ? "renewal" : "initial";

    // Registrar pago
    await db.insert(paymentsTable).values({
      userId: user.id,
      amount: "10",
      paymentType,
      proofText: "Procesado manualmente por admin",
      txHash: txHashLower,
      status: "approved",
    });

    // Activar membresía
    const now = new Date();
    const isFirstPayment = !user.membershipStartedAt;
    const updates: Record<string, unknown> = { accountStatus: "active", updatedAt: now };
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

    // Iniciar temporizador del referidor si aplica
    if (isFirstPayment && user.referrerId) {
      const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, user.referrerId)).limit(1);
      if (referrer && referrer.accountStatus === "active" && !referrer.membershipTimerStartedAt) {
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await db.update(usersTable).set({
          membershipTimerStartedAt: now,
          membershipExpiresAt: expiresAt,
          updatedAt: now,
        }).where(eq(usersTable.id, referrer.id));
      }
    }

    // Marcar como procesada
    const c2 = await pool.connect();
    try {
      await c2.query("INSERT INTO processed_transactions (tx_hash) VALUES ($1) ON CONFLICT DO NOTHING", [txHashLower]);
    } finally {
      c2.release();
    }

    // Distribuir comisiones
    const updatedUser = { ...user, accountStatus: "active" as const };
    distributeCommissions(updatedUser, txHashLower).catch((err) =>
      logger.error({ err }, "process-tx: error en distributeCommissions"),
    );

    logger.info({ txHash: txHashLower, userId: user.id }, "Admin: tx procesada manualmente");
    return res.json({ ok: true, userId: user.id, userName: user.name, paymentType });
  } catch (err) {
    logger.error({ err }, "Admin: error al procesar tx manualmente");
    return res.status(500).json({ error: "Error interno al procesar la transacción" });
  }
});

export default router;
