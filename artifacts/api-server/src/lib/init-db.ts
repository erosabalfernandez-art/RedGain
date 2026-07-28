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
  } catch (err) {
    logger.error({ err }, "initDb: failed to ensure tables");
    throw err;
  } finally {
    client.release();
  }
}
