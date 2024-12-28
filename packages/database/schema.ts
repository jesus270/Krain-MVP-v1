import {
  pgTable,
  varchar,
  timestamp,
  serial,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { generateReferralCode } from "@repo/utils";
import { relations } from "drizzle-orm";

export const walletTable = pgTable(
  "wallet",
  {
    address: varchar("address", { length: 255 }).notNull().primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    referralCode: varchar("referralCode", { length: 255 }).$default(() =>
      generateReferralCode(),
    ),
  },
  (table) => ({
    referralCodeIdx: index("idx_wallet_referralCode").on(table.referralCode),
    createdAtIdx: index("idx_wallet_createdAt").on(table.createdAt),
    codeCreatedIdx: index("idx_wallet_code_created").on(
      table.referralCode,
      table.createdAt,
    ),
  }),
);

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

export const referralTable = pgTable(
  "referral",
  {
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
  },
  (table) => ({
    referredByCodeIdx: index("idx_referral_referredByCode").on(
      table.referredByCode,
    ),
    createdAtIdx: index("idx_referral_createdAt").on(table.createdAt),
    codeCreatedIdx: index("idx_referral_code_created").on(
      table.referredByCode,
      table.createdAt,
    ),
  }),
);

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
