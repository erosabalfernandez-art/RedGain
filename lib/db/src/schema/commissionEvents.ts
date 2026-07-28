import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const commissionEventStatusEnum = pgEnum("commission_event_status", ["sent", "failed", "skipped"]);

export const commissionEventsTable = pgTable("commission_events", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  sourceUserId: integer("source_user_id").references(() => usersTable.id, { onDelete: "set null" }), // usuario cuyo pago disparó esta comisión
  level: integer("level").notNull(), // 1, 2 o 3
  amountUsdt: text("amount_usdt").notNull(), // e.g. "6", "2", "1"
  txHash: text("tx_hash"),             // hash de la tx de la comisión enviada
  sourceTxHash: text("source_tx_hash"), // hash de la tx de pago original que disparó todo
  status: commissionEventStatusEnum("status").notNull().default("sent"),
  errorMessage: text("error_message"), // si status = "failed"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CommissionEvent = typeof commissionEventsTable.$inferSelect;
