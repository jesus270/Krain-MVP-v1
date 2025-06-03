import { z } from "zod";

// Session configuration
export interface SessionOptions {
  name?: string;
  secret: string;
  maxAge?: number;
  cookiePath?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  httpOnly?: boolean;
}

// Default duration to keep session alive after last activity
export const SESSION_ACTIVITY_TIMEOUT = 1000 * 60 * 60 * 24 * 7; // 7 days

// Max login attempts before temporary block
export const MAX_LOGIN_ATTEMPTS = 5;

// Duration of login block after too many attempts
export const LOGIN_BLOCK_DURATION = 1000 * 60 * 15; // 15 minutes

// ---> Define and Export UserWallet and UserEmail types <---
export interface UserWallet {
  address: string;
}

export interface UserEmail {
  address: string;
}

// User data structure stored in session
export interface User {
  id: string;
  createdAt: Date;
  wallet?: UserWallet; // Use the defined type
  email?: UserEmail; // Use the defined type
  linkedAccounts?: string[];
  role?: string;
  // Optional fields used in specific apps
  twitter?: {
    subject: string;
    handle?: string | null;
    name?: string | null;
    profilePictureUrl?: string | null;
    username?: string | null;
  };
  telegramUserId?: string;
  telegramUsername?: string;
  hasJoinedTelegramCommunity?: boolean;
  hasJoinedTelegramAnnouncement?: boolean;
  telegramCommunityMessageCount?: number;
  hasJoinedCommunityChannel?: boolean;
  hasJoinedAnnouncementChannel?: boolean;
  communityMessageCount?: number;
  announcementCommentCount?: number;
}

export interface Session {
  id: string;
  user: User | null;
  isLoggedIn: boolean;
  lastActivity: number;
}

export interface Fingerprint {
  userAgent?: string;
  ipAddress?: string;
}

const fingerprintSchema = z.object({
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type SessionData = {
  isLoggedIn?: boolean;
  user?: User;
  csrfToken?: string;
  fingerprint?: Fingerprint;
  lastActivity?: number;
  loginAttempts?: number;
  loginBlockedUntil?: number | null;
  lastUpdated?: number;
  lastRotated?: number;
  role?: string;
};

export const sessionDataSchema = z.object({
  isLoggedIn: z.boolean().optional(),
  user: z
    .object({
      id: z.string(),
      createdAt: z.coerce.date(),
      wallet: z
        .object({
          address: z.string(),
        })
        .optional(),
      email: z
        .object({
          address: z.string(),
        })
        .optional(),
      role: z.string().optional(),
      linkedAccounts: z.array(z.string()).optional(),
      // Additional optional fields
      twitter: z
        .object({
          subject: z.string(),
          handle: z.string().nullable().optional(),
          name: z.string().nullable().optional(),
          profilePictureUrl: z.string().nullable().optional(),
          username: z.string().nullable().optional(),
        })
        .optional(),
      telegramUserId: z.string().optional(),
      telegramUsername: z.string().optional(),
      hasJoinedTelegramCommunity: z.boolean().optional(),
      hasJoinedTelegramAnnouncement: z.boolean().optional(),
      telegramCommunityMessageCount: z.number().optional(),
      hasJoinedCommunityChannel: z.boolean().optional(),
      hasJoinedAnnouncementChannel: z.boolean().optional(),
      communityMessageCount: z.number().optional(),
      announcementCommentCount: z.number().optional(),
    })
    .optional(),
  csrfToken: z.string().optional(),
  fingerprint: fingerprintSchema.optional(),
  lastActivity: z.number().optional(),
  loginAttempts: z.number().optional(),
  loginBlockedUntil: z.number().nullable().optional(),
  lastUpdated: z.number().optional(),
  lastRotated: z.number().optional(),
});

// Define the user structure expected by the client-side hooks
// This combines necessary fields from Privy and our database
export interface SessionUser {
  id: string; // Privy ID
  createdAt: Date;
  wallet?: {
    address: string;
  };
  email?: {
    address: string;
  };
  twitter?: {
    subject: string;
    handle?: string | null;
    name?: string | null;
    profilePictureUrl?: string | null;
    username?: string | null;
  };
  telegramUserId?: string;
  telegramUsername?: string;
  hasJoinedTelegramCommunity?: boolean;
  hasJoinedTelegramAnnouncement?: boolean;
  telegramCommunityMessageCount?: number;
  hasJoinedCommunityChannel?: boolean;
  hasJoinedAnnouncementChannel?: boolean;
  communityMessageCount?: number;
  announcementCommentCount?: number;
  linkedAccounts?: string[]; // Should be string array for client
  role?: string;
  // Add any other fields consistently needed by clients
}

// ---> ADD TYPE HERE <---
export type WhitelistSignupResult =
  | { success: true; email: string; walletAddress: string }
  | { status: "already_signed_up"; message: string }
  | { status: "error"; message: string };
