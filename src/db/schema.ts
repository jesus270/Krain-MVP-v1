import { pgTable, varchar, timestamp, serial } from "drizzle-orm/pg-core";
import { generateReferralCode } from "@/lib/utils";
import { relations } from "drizzle-orm";

export const walletTable = pgTable("wallet", {
  address: varchar("address", { length: 255 }).notNull().unique().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  referralCode: varchar("referralCode", { length: 255 })
    .notNull()
    .$default(() => generateReferralCode()),
});

export type Wallet = typeof walletTable.$inferSelect;

export const walletRelations = relations(walletTable, ({ one, many }) => ({
  referredBy: one(referralTable, {
    fields: [walletTable.address],
    references: [referralTable.referredWalletAddress],
    relationName: "walletReferredBy",
  }),
  referrals: many(referralTable, {
    relationName: "walletReferrals",
  }),
}));

export const referralTable = pgTable("referral", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
  referredByCode: varchar("referredByCode", {
    length: 255,
  }).notNull(),
  referredWalletAddress: varchar("referredWalletAddress", {
    length: 255,
  })
    .notNull()
    .unique(),
});

export type Referral = typeof referralTable.$inferSelect;

export const referralRelations = relations(referralTable, ({ one }) => ({
  referredByWallet: one(walletTable, {
    fields: [referralTable.referredByCode],
    references: [walletTable.referralCode],
    relationName: "walletReferrals",
  }),
  referralWallet: one(walletTable, {
    fields: [referralTable.referredWalletAddress],
    references: [walletTable.address],
    relationName: "walletReferredBy",
  }),
}));
