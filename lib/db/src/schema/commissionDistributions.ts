import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const commissionDistributionsTable = pgTable("commission_distributions", {
  id: serial("id").primaryKey(),
  cycleMonth: text("cycle_month").notNull().unique(), // e.g. "2026-07"
  distributedAt: timestamp("distributed_at").notNull().defaultNow(),
  distributedBy: integer("distributed_by").references(() => usersTable.id, { onDelete: "set null" }),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  recipientCount: integer("recipient_count").notNull().default(0),
  notes: text("notes"),
});

export type CommissionDistribution = typeof commissionDistributionsTable.$inferSelect;
