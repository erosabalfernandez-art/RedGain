import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "../lib/email";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}


// Auto-expire: check if a user's membership has expired and update their status
async function checkAndExpireUser(user: typeof usersTable.$inferSelect): Promise<typeof usersTable.$inferSelect> {
  if (!user.membershipExpiresAt || user.role === "admin") return user;
  const now = new Date();

  // Active but expired → paused
  if (user.accountStatus === "active" && user.membershipExpiresAt < now) {
    const [updated] = await db
      .update(usersTable)
      .set({ accountStatus: "paused", updatedAt: now })
      .where(eq(usersTable.id, user.id))
      .returning();
    return updated ?? user;
  }

  // Paused and grace period (14 days) ended → lost
  const gracePeriodEnd = new Date(user.membershipExpiresAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  if (user.accountStatus === "paused" && gracePeriodEnd < now) {
    const [updated] = await db
      .update(usersTable)
      .set({ accountStatus: "lost", updatedAt: now })
      .where(eq(usersTable.id, user.id))
      .returning();
    return updated ?? user;
  }

  return user;
}

const router = Router();

function generateReferralCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

function userToResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    referralCode: user.referralCode,
    bscWallet: user.bscWallet ?? null,
    membershipStartedAt: user.membershipStartedAt?.toISOString() ?? null,
    membershipTimerStartedAt: user.membershipTimerStartedAt?.toISOString() ?? null,
    membershipExpiresAt: user.membershipExpiresAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, phone, referralCode, bscWallet } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nombre, correo y contraseña son requeridos" });
  }
  if (!phone) {
    return res.status(400).json({ error: "El número de teléfono es requerido" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const normalizedWallet = bscWallet ? bscWallet.trim().toLowerCase() : null;
  if (normalizedWallet && !/^0x[0-9a-f]{40}$/.test(normalizedWallet)) {
    return res.status(400).json({ error: "Dirección BSC inválida" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "Ya existe una cuenta con ese correo" });
  }

  if (normalizedWallet) {
    const walletInUse = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.bscWallet, normalizedWallet)).limit(1);
    if (walletInUse.length > 0) {
      return res.status(400).json({ error: "Esa billetera BSC ya está registrada" });
    }
  }

  let referrerId: number | undefined;
  if (referralCode) {
    const referrer = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.referralCode, referralCode.toUpperCase()))
      .limit(1);
    if (referrer.length > 0) {
      const ref = referrer[0];
      if (ref.accountStatus !== "active") {
        return res
          .status(400)
          .json({ error: "El código de referido no está activo. La cuenta del referidor está pausada o inactiva." });
      }
      referrerId = ref.id;
    } else {
      return res.status(400).json({ error: "Código de referido no válido" });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let code = generateReferralCode();
  let codeExists = true;
  while (codeExists) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.referralCode, code))
      .limit(1);
    if (existing.length === 0) codeExists = false;
    else code = generateReferralCode();
  }

  // Generate email verification token (24h expiry)
  const verificationToken = randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      phone,
      passwordHash,
      referrerId,
      referralCode: code,
      accountStatus: "pending",
      role: "user",
      bscWallet: normalizedWallet ?? undefined,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationExpires,
    })
    .returning();

  // Notify referrer
  if (referrerId) {
    await db.insert(notificationsTable).values({
      userId: referrerId,
      type: "new_referral",
      title: "🎉 Nuevo referido",
      body: `${name} se registró usando tu código de referido. ¡Cuando realice su pago recibirás $6 USDT!`,
      read: false,
      metadata: JSON.stringify({ newUserId: user.id, newUserName: name }),
    }).catch(() => {});
  }

  // Send verification email — don't block registration if it fails
  sendVerificationEmail(email, name, verificationToken).catch((err) => {
    console.error("Registration: failed to send verification email", err);
  });

  // Set session so user is "logged in" (but dashboard will prompt to verify)
  req.session.userId = user.id;
  return res.status(201).json({ user: userToResponse(user) });
});

// GET /api/auth/verify-email?token=...
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token inválido" });
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.emailVerificationToken, token))
    .limit(1);

  if (!user) {
    return res.status(400).json({ error: "Enlace inválido o ya utilizado" });
  }

  if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
    return res.status(400).json({ error: "El enlace ha expirado. Solicita uno nuevo desde tu panel." });
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  req.session.userId = updated!.id;
  return res.json({ user: userToResponse(updated!) });
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  // Silently succeed if user not found or already verified (security: don't reveal existence)
  if (!user || user.emailVerified) {
    return res.json({ success: true });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(usersTable)
    .set({ emailVerificationToken: token, emailVerificationTokenExpires: expires, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id));

  sendVerificationEmail(email, user.name, token).catch(() => {});

  return res.json({ success: true });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }

  req.session.userId = user.id;
  return res.json({ user: userToResponse(user) });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  return res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const [rawUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!rawUser) {
    return res.status(401).json({ error: "No autenticado" });
  }
  // Auto-expire: update status if membership has lapsed
  const user = await checkAndExpireUser(rawUser);
  return res.json(userToResponse(user));
});

export default router;
