import { z } from "zod";

export interface SessionOptions {
  password: string;
}

export interface User {
  id: string;
  createdAt: Date;
  wallet: {
    address: string;
  };
  email: {
    address: string;
  };
  role?: string;
}

export interface Session {
  id: string;
  user: User | null;
  isLoggedIn: boolean;
  lastActivity: number;
}

export const SESSION_ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export const fingerprintSchema = z.object({
  userAgent: z.string(),
  ip: z.string(),
});

export const sessionDataSchema = z.object({
  isLoggedIn: z.boolean().optional(),
  user: z
    .object({
      id: z.string(),
      createdAt: z.date(),
      wallet: z.object({
        address: z.string(),
      }),
      email: z.object({
        address: z.string(),
      }),
      role: z.string().optional(),
    })
    .optional(),
  csrfToken: z.string().optional(),
  fingerprint: fingerprintSchema.optional(),
  lastActivity: z.number().optional(),
  loginAttempts: z.number().optional(),
  lastUpdated: z.number().optional(),
  lastRotated: z.number().optional(),
});

export type SessionData = z.infer<typeof sessionDataSchema>;
