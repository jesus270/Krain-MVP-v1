import {
  pgTable,
  varchar,
  timestamp,
  serial,
  index,
  unique,
  integer,
  text,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { generateReferralCode } from "@krain/utils";
import { relations } from "drizzle-orm";

// wallets that signed up for the airdrop
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

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("walletAddress", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  privyId: varchar("privyId", { length: 255 }).notNull().unique(),
  twitterHandle: varchar("twitterHandle", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type User = typeof userTable.$inferSelect;

export const userRelations = relations(userTable, ({ one }) => ({
  wallet: one(walletTable, {
    fields: [userTable.walletAddress],
    references: [walletTable.address],
    relationName: "wallet",
  }),
}));

export const agentTable = pgTable("agent", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  rating: real("rating").default(0), // Star rating (0-5)
  reviewsCount: integer("reviewsCount").default(0),
  category: varchar("category", { length: 255 }).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 255 }),

  // Blockchain & Token Info
  blockchainsSupported: jsonb("blockchainsSupported")
    .$type<string[]>()
    .default([]),
  tokenSymbol: varchar("tokenSymbol", { length: 50 }),
  tokenName: varchar("tokenName", { length: 100 }),
  cmcTokenLink: varchar("cmcTokenLink", { length: 255 }),

  // Contact & Company Info
  websiteUrl: varchar("websiteUrl", { length: 255 }),
  supportEmail: varchar("supportEmail", { length: 255 }),
  companyName: varchar("companyName", { length: 255 }),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),

  // Pricing - stored as JSON
  pricing: jsonb("pricing")
    .$type<
      {
        name: string;
        interval: string;
        amount: string;
        currency: string;
      }[]
    >()
    .default([]),

  // Industry & Social
  industryFocus: jsonb("industryFocus").$type<string[]>().default([]),
  socialMedia: jsonb("socialMedia")
    .$type<{
      x?: string;
      farcaster?: string;
      discord?: string;
      youtube?: string;
      linkedin?: string;
      instagram?: string;
    }>()
    .default({}),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Agent = typeof agentTable.$inferSelect;

export const favoriteAgentTable = pgTable("favoriteAgent", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => userTable.id),
  agentId: integer("agentId").references(() => agentTable.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FavoriteAgent = typeof favoriteAgentTable.$inferSelect;

export const favoriteAgentRelations = relations(
  favoriteAgentTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [favoriteAgentTable.userId],
      references: [userTable.id],
      relationName: "user",
    }),
    agent: one(agentTable, {
      fields: [favoriteAgentTable.agentId],
      references: [agentTable.id],
      relationName: "agent",
    }),
  }),
);
