import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PgSession = connectPgSimple(session);

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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET ?? "redgain-secret-change-me",
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
  const causeMsg = cause instanceof Error ? (cause as Error).message : String(cause ?? "");
  const causeCode = cause instanceof Error ? (cause as Error & { code?: string }).code : undefined;
  res.status(status).json({
    error: error.message ?? "Internal Server Error",
    cause: causeMsg || undefined,
    causeCode: causeCode || undefined,
  });
});

export default app;
