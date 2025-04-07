"use server";

import { log } from "@krain/utils";
import { db, userTable, userProfileTable, privyWalletTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { setUserSession } from "./server";
import { User } from "./types";

export interface PrivyUserData {
  id: string;
  email?: string;
  wallet?: {
    address: string;
  };
  linkedAccounts?: string[];
  createdAt?: number;
  isGuest?: boolean;
  hasAcceptedTerms?: boolean;
}

/**
 * Handle Privy authentication on the server
 * @param privyData User data from Privy
 * @returns The user object
 */
export async function handlePrivyAuthServer(privyData: PrivyUserData) {
  try {
    log.info("Handling Privy auth on server", {
      operation: "handle_auth_server",
      entity: "AUTH",
      userId: privyData.id,
    });

    let user: any = null;
    let existingUser = null;

    // Create session user data even if DB operations fail
    // This ensures authentication works even if DB is temporarily unavailable
    const sessionUser: User = {
      id: privyData.id,
      createdAt: privyData.createdAt
        ? new Date(privyData.createdAt)
        : new Date(),
      wallet: privyData.wallet,
      email: privyData.email ? { address: privyData.email } : undefined,
      linkedAccounts: privyData.linkedAccounts || [],
      role: "user",
    };

    // Try to update database, but don't let failures prevent authentication
    try {
      // First check if user exists
      existingUser = await db.query.userTable.findFirst({
        where: eq(userTable.privyId, privyData.id),
        with: {
          profile: true,
        },
      });

      // Convert string[] to LinkedAccount[]
      const linkedAccounts = (privyData.linkedAccounts || []).map(
        (account) => ({
          type: "wallet" as const,
          address: account,
        }),
      );

      if (existingUser) {
        // Update existing user
        const [updatedUser] = await db
          .update(userTable)
          .set({
            email: privyData.email,
            walletAddress: privyData.wallet?.address,
            linkedAccounts,
          })
          .where(eq(userTable.privyId, privyData.id))
          .returning();

        user = updatedUser;
      } else {
        // Create new user
        const [newUser] = await db
          .insert(userTable)
          .values({
            privyId: privyData.id,
            email: privyData.email,
            walletAddress: privyData.wallet?.address,
            linkedAccounts,
            isGuest: false,
            hasAcceptedTerms: false,
          })
          .returning();

        if (!newUser) {
          throw new Error("Failed to create user");
        }

        // Create profile
        await db.insert(userProfileTable).values({
          userId: newUser.id,
        });

        user = newUser;
      }

      // Create wallet record if exists
      if (privyData.wallet?.address) {
        await db
          .insert(privyWalletTable)
          .values({
            address: privyData.wallet.address,
            chainType: "solana",
            verifiedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [privyWalletTable.address],
            set: {
              verifiedAt: new Date(),
            },
          });
      }
    } catch (dbError) {
      // Log database error but continue with session creation
      log.error("Database operation failed in auth handler", {
        operation: "handle_auth_server_db",
        entity: "AUTH",
        userId: privyData.id,
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      // Don't rethrow - allow session creation to proceed
    }

    // Set the user session directly
    log.info("Creating user session", {
      operation: "create_user_session",
      entity: "AUTH",
      userId: privyData.id,
      user: sessionUser,
    });

    // Save the session
    try {
      await setUserSession(sessionUser);
    } catch (sessionError) {
      log.error("Failed to set user session", {
        operation: "create_user_session",
        entity: "AUTH",
        userId: privyData.id,
        error:
          sessionError instanceof Error
            ? sessionError.message
            : String(sessionError),
        stack: sessionError instanceof Error ? sessionError.stack : undefined,
      });
      // Rethrow session errors as they are critical
      throw sessionError;
    }

    return { user: sessionUser };
  } catch (error) {
    log.error("Error handling Privy auth on server", {
      operation: "handle_auth_server",
      entity: "AUTH",
      error,
    });
    throw error;
  }
}
