import { pgTable, serial, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected"]);
export const paymentTypeEnum = pgEnum("payment_type", ["initial", "renewal"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull().default("initial"), // initial join or monthly renewal
  status: paymentStatusEnum("status").notNull().default("pending"),
  proofText: text("proof_text").notNull().default(""),
  txHash: text("tx_hash"),                                // hash de la transacción blockchain
  proofImageUrl: text("proof_image_url"),
  proofImageUrls: text("proof_image_urls").array(),
  reviewedBy: integer("reviewed_by").references(() => usersTable.id),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: true,
  reviewNote: true,
  status: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
