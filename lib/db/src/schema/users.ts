import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const accountStatusEnum = pgEnum("account_status", ["pending", "active", "paused", "lost"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),                               // phone with country code e.g. +5588992543996
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("user"),
  accountStatus: accountStatusEnum("account_status").notNull().default("pending"),
  referrerId: integer("referrer_id"),                 // self-ref to usersTable.id
  referralCode: text("referral_code").notNull().unique(),
  bscWallet: text("bsc_wallet"),                          // BSC wallet address para detección automática de pagos (guardada en lowercase)
  membershipStartedAt: timestamp("membership_started_at"),      // when admin first activated their payment
  membershipTimerStartedAt: timestamp("membership_timer_started_at"), // when timer actually starts (first referral activates)
  membershipExpiresAt: timestamp("membership_expires_at"),      // membershipTimerStartedAt + 30 days
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
