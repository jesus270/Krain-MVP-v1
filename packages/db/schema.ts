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
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { generateReferralCode } from "@krain/utils";
import { relations } from "drizzle-orm";

// Types for Privy user data
export type WalletChainType = "solana" | string;
export type WalletClientType = "phantom" | "solflare" | "unknown" | string;
export type ConnectorType = "solana_adapter" | string;

export interface BaseLinkedAccount {
  type: string;
  verified_at?: number;
  first_verified_at?: number;
  latest_verified_at?: number;
}

export interface WalletLinkedAccount extends BaseLinkedAccount {
  type: "wallet";
  address: string;
  chain_type: WalletChainType;
  wallet_client: string;
  wallet_client_type: WalletClientType;
  connector_type: ConnectorType;
}

export interface EmailLinkedAccount extends BaseLinkedAccount {
  type: "email";
  address: string;
}

export interface TwitterOAuthLinkedAccount extends BaseLinkedAccount {
  type: "twitter_oauth";
  subject: string;
  name: string;
  username: string;
  profile_picture_url: string;
}

export type LinkedAccount =
  | WalletLinkedAccount
  | EmailLinkedAccount
  | TwitterOAuthLinkedAccount
  | BaseLinkedAccount;

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

// Privy user wallets - separate from airdrop wallets
export const privyWalletTable = pgTable(
  "privyWallet",
  {
    address: varchar("address", { length: 255 }).notNull().primaryKey(),
    chainType: varchar("chainType", { length: 50 }),
    walletClient: varchar("walletClient", { length: 100 }),
    walletClientType: varchar("walletClientType", { length: 50 }),
    connectorType: varchar("connectorType", { length: 50 }),
    verifiedAt: timestamp("verifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (table) => [
    index("idx_privyWallet_address").on(table.address),
    index("idx_privyWallet_createdAt").on(table.createdAt),
  ],
);
export type PrivyWallet = typeof privyWalletTable.$inferSelect;

export const privyWalletRelations = relations(privyWalletTable, ({ many }) => ({
  users: many(userTable, { relationName: "userWallets" }),
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
  walletAddress: varchar("walletAddress", { length: 255 })
    .$type<string>()
    .unique(),
  email: varchar("email", { length: 255 }).unique(),
  username: varchar("username", { length: 50 }).unique(),
  privyId: varchar("privyId", { length: 255 }).notNull().unique(),
  twitterHandle: varchar("twitterHandle", { length: 255 }).unique(),
  twitterName: varchar("twitterName", { length: 255 }),
  twitterProfilePictureUrl: varchar("twitterProfilePictureUrl", {
    length: 1024,
  }),
  twitterSubject: varchar("twitterSubject", { length: 255 }),
  telegramUserId: varchar("telegramUserId", { length: 255 }).unique(),
  telegramUsername: varchar("telegramUsername", { length: 255 }),
  hasJoinedTelegramCommunity: boolean("hasJoinedTelegramCommunity").default(
    false,
  ),
  hasJoinedTelegramAnnouncement: boolean(
    "hasJoinedTelegramAnnouncement",
  ).default(false),
  telegramCommunityMessageCount: integer(
    "telegramCommunityMessageCount",
  ).default(0),
  hasJoinedCommunityChannel: boolean("hasJoinedCommunityChannel").default(
    false,
  ),
  hasJoinedAnnouncementChannel: boolean("hasJoinedAnnouncementChannel").default(
    false,
  ),
  communityMessageCount: integer("communityMessageCount").default(0),
  announcementCommentCount: integer("announcementCommentCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  privyCreatedAt: timestamp("privyCreatedAt"),
  isGuest: boolean("isGuest").default(false),
  hasAcceptedTerms: boolean("hasAcceptedTerms").default(false),
  role: varchar("role", { length: 255 }).$type<string>().default("user"),
  linkedAccounts: jsonb("linkedAccounts").$type<LinkedAccount[]>().default([]),
  // New columns from CSV
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  walletChain: varchar("walletChain", { length: 50 }),
  walletType: varchar("walletType", { length: 50 }),
  walletVerifiedAt: timestamp("walletVerifiedAt"),
  twitterVerifiedAt: timestamp("twitterVerifiedAt"),
});
export type User = typeof userTable.$inferSelect;

export const userProfileTable = pgTable(
  "userProfile",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .references(() => userTable.id)
      .notNull()
      .unique(),
    displayName: varchar("displayName", { length: 100 }),
    bio: text("bio"),
    location: varchar("location", { length: 100 }),
    profilePictureUrl: varchar("profilePictureUrl", { length: 1024 }),
    bannerPictureUrl: varchar("bannerPictureUrl", { length: 1024 }),
    websiteUrl: varchar("websiteUrl", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (table) => [index("idx_userProfile_userId").on(table.userId)],
);
export type UserProfile = typeof userProfileTable.$inferSelect;

export const userRelations = relations(userTable, ({ one, many }) => ({
  privyWallet: one(privyWalletTable, {
    fields: [userTable.walletAddress],
    references: [privyWalletTable.address],
    relationName: "userWallets",
  }),
  airdropWallet: one(walletTable, {
    fields: [userTable.walletAddress],
    references: [walletTable.address],
    relationName: "airdropWallet",
  }),
  profile: one(userProfileTable, {
    fields: [userTable.id],
    references: [userProfileTable.userId],
    relationName: "userProfile",
  }),
}));

export const userProfileRelations = relations(userProfileTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userProfileTable.userId],
    references: [userTable.id],
    relationName: "userProfile",
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

export const reviewTable = pgTable("review", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => userTable.id),
  agentId: integer("agentId").references(() => agentTable.id),
  rating: real("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Review = typeof reviewTable.$inferSelect;

export const reviewRelations = relations(reviewTable, ({ one }) => ({
  user: one(userTable, {
    fields: [reviewTable.userId],
    references: [userTable.id],
    relationName: "user",
  }),
  agent: one(agentTable, {
    fields: [reviewTable.agentId],
    references: [agentTable.id],
    relationName: "agent",
  }),
}));

export const agentCategoryTable = pgTable("agentCategory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentCategory = typeof agentCategoryTable.$inferSelect;

export const agentCategoryRelations = relations(
  agentCategoryTable,
  ({ many }) => ({
    agents: many(agentTable, {
      relationName: "agent",
    }),
  }),
);

export const agentTagTable = pgTable("agentTag", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentTag = typeof agentTagTable.$inferSelect;

export const agentTagRelations = relations(agentTagTable, ({ many }) => ({
  agents: many(agentTable, {
    relationName: "agent",
  }),
}));

export const featuredAgentTable = pgTable("featuredAgent", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId")
    .references(() => agentTable.id)
    .notNull(),
  order: integer("order").default(0), // Controls display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeaturedAgent = typeof featuredAgentTable.$inferSelect;

export const featuredAgentRelations = relations(
  featuredAgentTable,
  ({ one }) => ({
    agent: one(agentTable, {
      fields: [featuredAgentTable.agentId],
      references: [agentTable.id],
      relationName: "featured_agent",
    }),
  }),
);

export const telegramDailyMessageCountTable = pgTable(
  "telegramDailyMessageCount",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .references(() => userTable.id)
      .notNull(),
    date: date("date").notNull(),
    messageCount: integer("messageCount").notNull().default(0),
  },
  (table) => ({
    unq: uniqueIndex("unq_telegramDailyMessageCount_userId_date").on(
      table.userId,
      table.date,
    ),
  }),
);
