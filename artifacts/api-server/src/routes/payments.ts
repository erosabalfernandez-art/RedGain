import { Router } from "express";
import multer from "multer";
import { db, usersTable, paymentsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "No autenticado" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) return res.status(401).json({ error: "No autenticado" });
  req.currentUser = user;
  next();
}

function formatPayment(p: typeof paymentsTable.$inferSelect) {
  // Normalise: new multi-image field takes priority; fall back to legacy single URL
  const urls: string[] =
    p.proofImageUrls && p.proofImageUrls.length > 0
      ? p.proofImageUrls
      : p.proofImageUrl
      ? [p.proofImageUrl]
      : [];

  return {
    id: p.id,
    userId: p.userId,
    amount: parseFloat(p.amount),
    status: p.status,
    proofText: p.proofText,
    proofImageUrl: urls[0] ?? null,   // kept for backward compat
    proofImageUrls: urls,
    txHash: p.txHash ?? null,
    paymentType: p.paymentType,
    createdAt: p.createdAt.toISOString(),
    reviewedAt: p.reviewedAt?.toISOString() ?? null,
  };
}

async function uploadFileToSupabase(
  file: Express.Multer.File,
  userId: number,
  supabaseUrl: string,
  supabaseServiceKey: string,
): Promise<string> {
  const ext = file.originalname.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${userId}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bucket = "payment-proofs";

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filename}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": file.mimetype,
    },
    body: file.buffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Error al subir imagen: ${err}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
}

/* FLUJO MANUAL COMENTADO — reactivar si hace falta
// POST /api/payments/upload-proof  — sube una o varias imágenes a Supabase Storage
router.post("/upload-proof", requireAuth, upload.array("images", 10), async (req: any, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) return res.status(400).json({ error: "No se recibieron imágenes" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: "Almacenamiento no configurado en el servidor" });
  }

  try {
    const urls = await Promise.all(
      files.map((file) => uploadFileToSupabase(file, req.currentUser.id, supabaseUrl, supabaseServiceKey)),
    );
    return res.json({ urls });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments
router.post("/", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const { proofText, amount, proofImageUrls, proofImageUrl } = req.body;

  if (!proofText) return res.status(400).json({ error: "Descripción del comprobante requerida" });
  if (!amount || amount <= 0) return res.status(400).json({ error: "Monto inválido" });

  // Accept both new (array) and legacy (single) image fields
  const imageUrls: string[] =
    Array.isArray(proofImageUrls) && proofImageUrls.length > 0
      ? proofImageUrls
      : proofImageUrl
      ? [proofImageUrl]
      : [];

  // Detect whether this is an initial membership or a renewal
  const existingApproved = await db
    .select({ id: paymentsTable.id })
    .from(paymentsTable)
    .where(and(eq(paymentsTable.userId, user.id), eq(paymentsTable.status, "approved")))
    .limit(1);
  const paymentType: "initial" | "renewal" = existingApproved.length > 0 ? "renewal" : "initial";

  const [payment] = await db.insert(paymentsTable).values({
    userId: user.id,
    amount: String(amount),
    paymentType,
    proofText,
    proofImageUrl: imageUrls[0] ?? null,
    proofImageUrls: imageUrls.length > 0 ? imageUrls : null,
    status: "pending",
  }).returning();

  return res.status(201).json(formatPayment(payment));
});
FIN FLUJO MANUAL COMENTADO */

// GET /api/payments/my
router.get("/my", requireAuth, async (req: any, res) => {
  const user = req.currentUser;
  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.userId, user.id))
    .orderBy(desc(paymentsTable.createdAt));
  return res.json(payments.map(formatPayment));
});

export default router;
