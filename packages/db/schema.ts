import {
  pgTable,
  varchar,
  timestamp,
  serial,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { generateReferralCode } from "@krain/utils";
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
  (table) => [
    index("idx_wallet_referralCode").on(table.referralCode),
    index("idx_wallet_createdAt").on(table.createdAt),
    index("idx_wallet_code_created").on(table.referralCode, table.createdAt),
  ],
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
  (table) => [
    index("idx_referral_referredByCode").on(table.referredByCode),
    index("idx_referral_createdAt").on(table.createdAt),
    index("idx_referral_code_created").on(
      table.referredByCode,
      table.createdAt,
    ),
  ],
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

export const earlyAccessSignupTable = pgTable(
  "earlyAccessSignup",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_earlyAccessSignup_email").on(table.email),
    index("idx_earlyAccessSignup_createdAt").on(table.createdAt),
  ],
);

export type EarlyAccessSignup = typeof earlyAccessSignupTable.$inferSelect;

export const tokenSignupTable = pgTable(
  "tokenSignup",
  {
    id: serial("id").primaryKey(),
    walletAddress: varchar("walletAddress", { length: 255 }).notNull().unique(),
    paymentTxHash: varchar("paymentTxHash", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tokenSignup_walletAddress").on(table.walletAddress),
    index("idx_tokenSignup_createdAt").on(table.createdAt),
  ],
);

export type TokenSignup = typeof tokenSignupTable.$inferSelect;
