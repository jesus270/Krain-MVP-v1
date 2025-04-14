"use server";

import { db } from "@krain/db";
import {
  userTable,
  userProfileTable,
  privyWalletTable,
  type User,
  type LinkedAccount,
} from "@krain/db";
import { eq } from "drizzle-orm";
import { log } from "@krain/utils";
import type { PrivyUserData } from "../auth-handler";
import { getSession } from "../server";
import type { SessionUser } from "../types";

export async function createOrUpdateUser(
  privyData: PrivyUserData,
): Promise<User> {
  try {
    // First check if user exists
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, privyData.id),
      with: {
        profile: true,
      },
    });

    // Convert string[] to LinkedAccount[]
    const linkedAccounts: LinkedAccount[] = (
      privyData.linkedAccounts || []
    ).map((account: string) => ({
      type: "wallet",
      address: account,
    }));

    if (existingUser) {
      // Update existing user with any new information
      const [updatedUser] = await db
        .update(userTable)
        .set({
          email: privyData.email,
          walletAddress: privyData.wallet?.address,
          linkedAccounts,
        })
        .where(eq(userTable.privyId, privyData.id))
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      log.info("Updated existing user", {
        operation: "update_user",
        entity: "USER",
        userId: updatedUser.id.toString(),
      });

      return updatedUser;
    }

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

    // Create associated user profile
    await db.insert(userProfileTable).values({
      userId: newUser.id,
    });

    // If wallet exists, create/update privyWallet record
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

    log.info("Created new user", {
      operation: "create_user",
      entity: "USER",
      userId: newUser.id.toString(),
    });

    return newUser;
  } catch (error) {
    log.error("Error creating/updating user", {
      operation: "create_update_user",
      entity: "USER",
      error,
    });
    throw error;
  }
}

/**
 * Fetches user data from database, merges it with provided session user data,
 * and returns a structure suitable for the client.
 * @param privyId The Privy user ID.
 * @param userFromSession The user object retrieved from the session.
 * @returns A promise resolving to the merged SessionUser or null if not found.
 */
export async function getMergedUserForClient(
  privyId: string,
  userFromSession: any | null, // Accept session user data as argument
): Promise<SessionUser | null> {
  if (!privyId) {
    log.warn("Attempted to get merged user without privyId", {
      operation: "get_merged_user_client",
      entity: "API",
    });
    return null;
  }

  try {
    // 1. Session data is now passed as an argument
    // const session = await getSession();
    // const userFromSession = session ? session.get("user") : null;

    // 2. Fetch user data from database (source of truth)
    const dbUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, privyId),
      // Add necessary relations if needed, e.g., profile
      // with: { profile: true },
    });

    if (!dbUser) {
      log.warn("User not found in database for session", {
        operation: "get_merged_user_client",
        entity: "API",
        privyId,
      });
      // If DB user doesn't exist, something is wrong, return null
      // Or, could potentially return minimal data from session if appropriate
      return null;
    }

    // 3. Merge and transform data into SessionUser structure
    const sessionUser: SessionUser = {
      id: privyId, // Use privyId from input
      createdAt: dbUser.createdAt,
      wallet: dbUser.walletAddress
        ? { address: dbUser.walletAddress }
        : undefined,
      email: dbUser.email ? { address: dbUser.email } : undefined,
      // Ensure linkedAccounts is an array of strings
      linkedAccounts: dbUser.linkedAccounts
        ? dbUser.linkedAccounts
            .map((account: any) => {
              if (typeof account === "string") return account;
              if (
                account &&
                typeof account === "object" &&
                "address" in account &&
                typeof account.address === "string"
              ) {
                return account.address;
              }
              return null;
            })
            .filter((acc: any): acc is string => acc !== null)
        : [],
      role: dbUser.role ?? "user", // Default role
      // Include other fields from dbUser
      twitter: {
        subject: dbUser.twitterSubject || "",
        handle: dbUser.twitterHandle,
        name: dbUser.twitterName,
        profilePictureUrl: dbUser.twitterProfilePictureUrl,
        username: dbUser.twitterHandle,
      },
      telegramUserId: dbUser.telegramUserId || userFromSession?.telegramUserId,
      telegramUsername:
        dbUser.telegramUsername || userFromSession?.telegramUsername,
      hasJoinedTelegramCommunity:
        dbUser.hasJoinedTelegramCommunity ||
        userFromSession?.hasJoinedTelegramCommunity,
      hasJoinedTelegramAnnouncement:
        dbUser.hasJoinedTelegramAnnouncement ||
        userFromSession?.hasJoinedTelegramAnnouncement,
      telegramCommunityMessageCount:
        dbUser.telegramCommunityMessageCount ||
        userFromSession?.telegramCommunityMessageCount,
      hasJoinedCommunityChannel:
        dbUser.hasJoinedCommunityChannel ||
        userFromSession?.hasJoinedCommunityChannel,
      hasJoinedAnnouncementChannel:
        dbUser.hasJoinedAnnouncementChannel ||
        userFromSession?.hasJoinedAnnouncementChannel,
      communityMessageCount:
        dbUser.communityMessageCount || userFromSession?.communityMessageCount,
      announcementCommentCount:
        dbUser.announcementCommentCount ||
        userFromSession?.announcementCommentCount,
    };

    log.info("Successfully fetched and merged user data for client", {
      operation: "get_merged_user_client",
      entity: "API",
      privyId,
      dbUserId: dbUser.id,
    });

    return sessionUser;
  } catch (error) {
    log.error("Error fetching merged user data for client", {
      operation: "get_merged_user_client",
      entity: "API",
      privyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null; // Return null on error
  }
}
