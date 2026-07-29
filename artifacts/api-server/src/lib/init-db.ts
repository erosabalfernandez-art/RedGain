import { pool } from "@workspace/db";
import { logger } from "./logger";

/**
 * Runs idempotent SQL to create any tables that Drizzle migrations may not
 * have created yet (e.g. tables added after the initial push).
 * Safe to run on every startup — all statements use IF NOT EXISTS.
 */
export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS commission_distributions (
        id               SERIAL PRIMARY KEY,
        cycle_month      TEXT NOT NULL UNIQUE,
        distributed_at   TIMESTAMP NOT NULL DEFAULT NOW(),
        distributed_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
        recipient_count  INTEGER NOT NULL DEFAULT 0,
        notes            TEXT
      );
    `);
    logger.info("initDb: commission_distributions table ready");

    // Tabla para evitar procesar la misma transacción blockchain dos veces
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_transactions (
        tx_hash    TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    // Columna para la billetera BSC del usuario
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS bsc_wallet TEXT;
    `);
    // Índice único solo en valores no-nulos (varios usuarios pueden tener NULL)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_bsc_wallet_unique
        ON users (bsc_wallet)
        WHERE bsc_wallet IS NOT NULL;
    `);
    // Hash de transacción blockchain en pagos
    await client.query(`
      ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS tx_hash TEXT;
    `);
    // Hacer que proof_text tenga default vacío (los pagos cripto no tienen texto manual)
    await client.query(`
      ALTER TABLE payments
        ALTER COLUMN proof_text SET DEFAULT '';
    `);
    logger.info("initDb: blockchain tables and columns ready");

    // ── Historial de comisiones individuales ─────────────────────────────────
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_event_status') THEN
          CREATE TYPE commission_event_status AS ENUM ('sent', 'failed', 'skipped');
        END IF;
      END$$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS commission_events (
        id              SERIAL PRIMARY KEY,
        recipient_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source_user_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
        level           INTEGER NOT NULL,
        amount_usdt     TEXT NOT NULL,
        tx_hash         TEXT,
        source_tx_hash  TEXT,
        status          commission_event_status NOT NULL DEFAULT 'sent',
        error_message   TEXT,
        created_at      TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    logger.info("initDb: commission_events table ready");

    // ── Notificaciones in-app ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type        TEXT NOT NULL,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        read        BOOLEAN NOT NULL DEFAULT FALSE,
        metadata    TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id);
    `);
    logger.info("initDb: notifications table ready");

    // ── Email verification columns ───────────────────────────────────────────
    // DEFAULT true so existing users are not locked out on deploy
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT true;
    `);
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
    `);
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS email_verification_token_expires TIMESTAMP;
    `);
    logger.info("initDb: email verification columns ready");
  } catch (err) {
    logger.error({ err }, "initDb: failed to ensure tables");
    throw err;
  } finally {
    client.release();
  }
}
