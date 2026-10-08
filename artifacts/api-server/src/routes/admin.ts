import { Router } from "express";
import { db, usersTable, paymentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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

function formatAdminUser(u: typeof usersTable.$inferSelect, referrals: { id: number }[], referrerName: string | null) {
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
    joinedAt: u.createdAt.toISOString(),
  };
}

// GET /api/admin/users
router.get("/users", requireAdmin, async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const result = await Promise.all(
    users.map(async (u) => {
      const referrals = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.referrerId, u.id));
      let referrerName: string | null = null;
      if (u.referrerId) {
        const [ref] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, u.referrerId)).limit(1);
        referrerName = ref?.name ?? null;
      }
      return formatAdminUser(u, referrals, referrerName);
    }),
  );
  return res.json(result);
});

// PATCH /api/admin/users/:id — cambiar estado (p. ej. pausar o bloquear una cuenta) o rol
router.patch("/users/:id", requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { accountStatus, role } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (accountStatus) updates.accountStatus = accountStatus;
  if (role) updates.role = role;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

  const referrals = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.referrerId, updated.id));
  let referrerName: string | null = null;
  if (updated.referrerId) {
    const [ref] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, updated.referrerId)).limit(1);
    referrerName = ref?.name ?? null;
  }
  return res.json(formatAdminUser(updated, referrals, referrerName));
});

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

export default router;
