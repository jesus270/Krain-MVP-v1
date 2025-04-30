"use server";

import { log } from "@krain/utils";
import { db, userTable, userProfileTable, privyWalletTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { setUserSession } from "./server";
import { User, UserEmail, UserWallet } from "./types";
import { User as DbUser } from "@krain/db"; // Use DbUser type if needed

// More detailed PrivyUserData interface based on potential Privy data
export interface PrivyUserData {
  id: string;
  createdAt?: number | string; // Can be number (ms) or string (ISO)
  email?: {
    address: string;
    verified?: boolean;
  } | null;
  wallet?: {
    address: string;
    chainType?: string;
    walletClient?: string;
    connectorType?: string;
  } | null;
  linkedAccounts?: Array<
    | {
        type: "wallet";
        address: string;
        chainId?: string;
        chainType?: string;
        walletClientType?: string;
        connectorType?: string;
        verifiedAt?: string | number | Date;
        // ... other potential wallet fields
      }
    | {
        type: "email";
        address: string;
        verifiedAt?: string | number | Date;
      }
    | {
        type: "phone";
        number: string;
        verifiedAt?: string | number | Date;
      }
    | {
        type:
          | "google"
          | "twitter"
          | "discord"
          | "github"
          | "linkedin"
          | "apple";
        subject: string;
        // ... other potential oauth fields (name, profilePictureUrl etc.)
        [key: string]: any; // Allow other properties
      }
  >;
  isGuest?: boolean;
  hasAcceptedTerms?: boolean;
  // Add other fields received from Privy if necessary
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
      privyDataReceived: {
        // Log crucial parts of received data for debugging
        email: privyData.email,
        wallet: privyData.wallet,
        linkedAccountsCount: privyData.linkedAccounts?.length,
      },
    });

    // --- Fetch Existing DB User FIRST ---
    let existingDbUser: DbUser | null = null;
    try {
      existingDbUser =
        (await db.query.userTable.findFirst({
          where: eq(userTable.privyId, privyData.id),
          // Optionally include profile if needed for sessionUser
          // with: { profile: true },
        })) ?? null; // Ensure null if not found
    } catch (dbFetchError) {
      log.error("Failed to fetch existing user from DB", {
        operation: "handle_auth_server_db_fetch_error",
        entity: "AUTH",
        userId: privyData.id,
        error:
          dbFetchError instanceof Error
            ? dbFetchError.message
            : String(dbFetchError),
      });
      // Continue even if fetch fails, maybe it's a new user
    }

    // --- Construct sessionUser matching the 'User' type from types.ts ---

    // Helper to safely convert Privy createdAt to Date
    const getCreatedAtDate = (): Date => {
      // Prioritize DB createdAt if available
      if (existingDbUser?.createdAt) return existingDbUser.createdAt;
      // Fallback to Privy data
      if (!privyData.createdAt) return new Date();
      if (typeof privyData.createdAt === "number")
        return new Date(privyData.createdAt);
      if (typeof privyData.createdAt === "string")
        return new Date(privyData.createdAt);
      return new Date(); // Final fallback
    };

    // Extract linked account identifiers from Privy data
    const linkedAccountStrings: string[] = (privyData.linkedAccounts || [])
      .map((account) => {
        if (account.type === "wallet" || account.type === "email") {
          return account.address;
        }
        if (account.type === "phone") {
          return account.number;
        }
        if (account.subject) {
          // For OAuth types
          return `${account.type}:${account.subject}`; // Combine type and subject
        }
        return null; // Ignore unknown/unhandled types
      })
      .filter((id): id is string => id !== null);

    // Determine Email: Prioritize Privy data, fallback to DB
    let finalUserEmail: UserEmail | undefined = undefined;
    if (
      privyData.email &&
      typeof privyData.email === "object" &&
      privyData.email.address
    ) {
      finalUserEmail = { address: privyData.email.address };
    } else if (typeof privyData.email === "string") {
      finalUserEmail = { address: privyData.email };
    } else if (existingDbUser?.email) {
      // Fallback to DB email
      finalUserEmail = { address: existingDbUser.email };
    }

    // Determine Wallet: Prioritize Privy data, fallback to DB
    let finalUserWallet: UserWallet | undefined = undefined;
    if (privyData.wallet?.address) {
      finalUserWallet = { address: privyData.wallet.address };
    } else if (existingDbUser?.walletAddress) {
      // Fallback to DB wallet
      finalUserWallet = { address: existingDbUser.walletAddress };
    }

    // Construct the final sessionUser by merging
    const sessionUser: User = {
      id: privyData.id,
      createdAt: getCreatedAtDate(),
      wallet: finalUserWallet, // Use merged wallet
      email: finalUserEmail, // Use merged email
      linkedAccounts: linkedAccountStrings, // Use linked accounts from Privy
      role: existingDbUser?.role || "user", // Use DB role or default
      // Optional fields - ideally fetch from DB if needed, or leave undefined
      twitter: undefined,
      telegramUserId: undefined,
      telegramUsername: undefined,
      hasJoinedTelegramCommunity: undefined,
      hasJoinedTelegramAnnouncement: undefined,
      telegramCommunityMessageCount: undefined,
      hasJoinedCommunityChannel: undefined,
      hasJoinedAnnouncementChannel: undefined,
      communityMessageCount: undefined,
      announcementCommentCount: undefined,
    };

    log.info("Constructed sessionUser (after DB check/merge)", {
      operation: "handle_auth_server_constructed_user_merged",
      entity: "AUTH",
      userId: privyData.id,
      constructedUser: JSON.stringify(sessionUser, null, 2),
    });

    // --- Database Operations (Try/Catch) ---
    let dbUser: DbUser | null = existingDbUser; // Start with fetched user
    try {
      // Convert Privy linkedAccounts to the format expected by DB schema
      const dbLinkedAccounts = (privyData.linkedAccounts || []).map(
        (account) => ({
          type: account.type,
          address:
            (account as any).address ||
            (account as any).number ||
            (account as any).subject,
        }),
      );

      // Use the merged email/wallet for DB operations
      const emailForDb = finalUserEmail?.address;
      const walletForDb = finalUserWallet?.address;

      if (dbUser) {
        // If existing user was found earlier
        // Update existing user
        const [updatedUserResult] = await db
          .update(userTable)
          .set({
            email: emailForDb,
            walletAddress: walletForDb,
            linkedAccounts: dbLinkedAccounts,
          })
          .where(eq(userTable.privyId, privyData.id))
          .returning();
        dbUser = updatedUserResult ?? dbUser; // Keep existing if update returns nothing
        log.info("Updated user in database", {
          operation: "db_update_user",
          entity: "DB",
          userId: privyData.id,
        });
      } else {
        // Create new user (if fetch failed or user was truly new)
        const [newUserResult] = await db
          .insert(userTable)
          .values({
            privyId: privyData.id,
            email: emailForDb,
            walletAddress: walletForDb,
            linkedAccounts: dbLinkedAccounts,
            isGuest: false,
            hasAcceptedTerms: false,
            createdAt: getCreatedAtDate(),
          })
          .returning();
        dbUser = newUserResult ?? null;
        if (!dbUser) {
          log.error(
            "Failed to create user in database (insert returned no data)",
            {
              operation: "db_create_user_failed",
              entity: "DB",
              userId: privyData.id,
            },
          );
        } else {
          log.info("Created new user in database", {
            operation: "db_create_user",
            entity: "DB",
            userId: privyData.id,
            newDbId: dbUser.id,
          });
          // Create profile
          try {
            await db.insert(userProfileTable).values({ userId: dbUser.id });
            log.info("Created user profile in database", {
              operation: "db_create_profile",
              entity: "DB",
              userId: privyData.id,
              newDbId: dbUser.id,
            });
          } catch (profileError) {
            log.error("Failed to create user profile", {
              operation: "db_create_profile_failed",
              entity: "DB",
              userId: privyData.id,
              error:
                profileError instanceof Error
                  ? profileError.message
                  : String(profileError),
            });
          }
        }
      }

      // Upsert wallet record using the merged wallet address
      if (walletForDb) {
        await db
          .insert(privyWalletTable)
          .values({
            address: walletForDb,
            chainType: privyData.wallet?.chainType || "unknown",
            verifiedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [privyWalletTable.address],
            set: {
              verifiedAt: new Date(),
              chainType: privyData.wallet?.chainType || "unknown",
            },
          });
        log.info("Upserted wallet in database", {
          operation: "db_upsert_wallet",
          entity: "DB",
          userId: privyData.id,
          wallet: walletForDb,
        });
      }
    } catch (dbError) {
      // Log database error but continue with session creation
      log.error("Database operation failed in auth handler", {
        operation: "handle_auth_server_db_error",
        entity: "AUTH",
        userId: privyData.id,
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      // Don't rethrow - allow session creation to proceed
    }

    // Set the user session using the merged sessionUser
    log.info("Attempting to set user session", {
      operation: "set_user_session_attempt",
      entity: "AUTH",
      userId: privyData.id,
    });

    // Save the session
    try {
      await setUserSession(sessionUser); // Pass the simple sessionUser object
      log.info("Successfully set user session", {
        operation: "set_user_session_success",
        entity: "AUTH",
        userId: privyData.id,
      });
    } catch (sessionError) {
      log.error("Failed to set user session", {
        operation: "set_user_session_error",
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

    // Return the sessionUser structure, NOT the potentially complex dbUser
    return { user: sessionUser };
  } catch (error) {
    log.error("Error handling Privy auth on server", {
      operation: "handle_auth_server_catch_all",
      entity: "AUTH",
      userId: privyData?.id, // Use optional chaining
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Ensure a structured error is thrown if possible
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unknown error in handlePrivyAuthServer");
    }
  }
}
