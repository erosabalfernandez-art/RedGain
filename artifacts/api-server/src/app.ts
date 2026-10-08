import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import crypto from "node:crypto";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PgSession = connectPgSimple(session);

// Nunca usar un secreto público por defecto: si falta SESSION_SECRET se genera uno aleatorio
// (las sesiones se cierran en cada reinicio hasta que se configure la variable en Render).
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  sessionSecret = crypto.randomBytes(48).toString("hex");
  logger.error("SESSION_SECRET no está configurado: se usa un secreto temporal. Configúralo en las variables de entorno.");
}

const app: Express = express();

// Trust Render's reverse proxy so secure cookies work in production
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Seguridad: cabeceras básicas (sin CSP para no romper la web) y CORS cerrado.
// La web se sirve desde este mismo servidor, así que no necesita CORS en producción.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? (process.env.APP_URL ? [process.env.APP_URL.replace(/\/$/, "")] : false) : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({ pool }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

// Límite de intentos para frenar fuerza bruta y registros masivos
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false, message: { error: "Demasiados registros desde esta conexión. Inténtalo más tarde." } });
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", registerLimiter);

app.use("/api", router);

// In production, serve the compiled React frontend from the same Express process.
if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(process.cwd(), "artifacts/redgain/dist/public");
  app.use(express.static(staticDir));

  // Fall-through for client-side routes (React Router / wouter)
  app.get("/{*path}", (_req: Request, res: Response) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

// Global error handler — must be last. Logs full error details including .cause
// so Render logs always show the root cause.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const error = err as Error & { cause?: unknown; code?: string; status?: number };
  const cause = error.cause;
  logger.error({
    message: error.message,
    stack: error.stack,
    code: error.code,
    cause: cause instanceof Error
      ? { message: (cause as Error).message, stack: (cause as Error).stack, code: (cause as Error & { code?: string }).code }
      : cause,
  }, "Unhandled request error");

  if (res.headersSent) return;
  const status = typeof error.status === "number" ? error.status : 500;
  res.status(status).json({
    error: status >= 500 ? "Error interno del servidor" : (error.message ?? "Error"),
  });
});

export default app;
