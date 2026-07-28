import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// type values:
//   "commission_sent"    — comisión recibida en tu billetera
//   "commission_failed"  — error al enviar comisión (contacta soporte)
//   "new_referral"       — alguien se registró con tu código
//   "payment_confirmed"  — tu pago fue detectado y tu cuenta está activa

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  metadata: text("metadata"), // JSON string con datos extra (txHash, level, amount…)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
