"use server";

import { log } from "@krain/utils";
import { db, userTable, userProfileTable, privyWalletTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { setUserSession } from "./server";
import { User } from "./types";
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

    // --- Construct sessionUser matching the 'User' type from types.ts ---

    // Helper to safely convert Privy createdAt to Date
    const getCreatedAtDate = (): Date => {
      if (!privyData.createdAt) return new Date();
      if (typeof privyData.createdAt === "number")
        return new Date(privyData.createdAt);
      if (typeof privyData.createdAt === "string")
        return new Date(privyData.createdAt);
      return new Date(); // Fallback
    };

    // Extract linked account identifiers (addresses for wallets/email, number for phone, subject for oauth)
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
      .filter((id): id is string => id !== null); // Filter out nulls

    const sessionUser: User = {
      id: privyData.id,
      createdAt: getCreatedAtDate(),
      // Ensure wallet matches { address: string } structure only if address exists
      wallet: privyData.wallet?.address
        ? { address: privyData.wallet.address }
        : undefined,
      // Ensure email matches { address: string } structure only if address exists
      email: privyData.email?.address
        ? { address: privyData.email.address }
        : undefined,
      // Use the extracted string identifiers for linkedAccounts
      linkedAccounts: linkedAccountStrings,
      role: "user", // Default role
      // Initialize optional fields as undefined
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

    log.info("Constructed sessionUser for setUserSession", {
      operation: "construct_session_user",
      entity: "AUTH",
      userId: privyData.id,
      constructedUser: sessionUser, // Log the final object being passed
    });

    // --- Database Operations (Try/Catch) ---
    let dbUser: DbUser | null = null; // Use DbUser type from @krain/db
    try {
      // First check if user exists in DB
      const existingUser = await db.query.userTable.findFirst({
        where: eq(userTable.privyId, privyData.id),
        with: {
          profile: true,
        },
      });

      // Convert Privy linkedAccounts to the format expected by DB schema
      // (Assuming DbUser linkedAccounts expects an array of objects)
      const dbLinkedAccounts = (privyData.linkedAccounts || []).map(
        (account) => ({
          type: account.type,
          address:
            (account as any).address ||
            (account as any).number ||
            (account as any).subject, // Adapt based on DB schema needs
          // Add other fields if your DB schema stores them
        }),
      );

      if (existingUser) {
        // Update existing user
        const [updatedUserResult] = await db
          .update(userTable)
          .set({
            // Update fields based on latest Privy data
            email: privyData.email?.address, // Use email address directly
            walletAddress: privyData.wallet?.address,
            linkedAccounts: dbLinkedAccounts, // Use the mapped array of objects
            // Potentially update other fields like lastLoginAt etc.
          })
          .where(eq(userTable.privyId, privyData.id))
          .returning();
        // Assign to dbUser only if a result was returned
        dbUser = updatedUserResult ?? null;
        if (dbUser) {
          log.info("Updated user in database", {
            operation: "db_update_user",
            entity: "DB",
            userId: privyData.id,
          });
        } else {
          log.warn("DB update seemed successful but returned no user data", {
            operation: "db_update_user_no_return",
            entity: "DB",
            userId: privyData.id,
          });
        }
      } else {
        // Create new user
        const [newUserResult] = await db
          .insert(userTable)
          .values({
            privyId: privyData.id,
            email: privyData.email?.address,
            walletAddress: privyData.wallet?.address,
            linkedAccounts: dbLinkedAccounts,
            isGuest: false, // Default values
            hasAcceptedTerms: false,
            createdAt: getCreatedAtDate(), // Set createdAt on insert
          })
          .returning();

        // Assign to dbUser only if a result was returned
        dbUser = newUserResult ?? null;

        if (!dbUser) {
          // Log the failure but don't throw, as session creation should proceed
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
          // Create profile only if user creation was successful
          try {
            await db.insert(userProfileTable).values({
              userId: dbUser.id,
            });
            log.info("Created user profile in database", {
              operation: "db_create_profile",
              entity: "DB",
              userId: privyData.id,
              newDbId: dbUser.id,
            });
          } catch (profileError) {
            log.error("Failed to create user profile after user insert", {
              operation: "db_create_profile_failed",
              entity: "DB",
              userId: privyData.id,
              error:
                profileError instanceof Error
                  ? profileError.message
                  : String(profileError),
            });
            // Do not rethrow, allow session creation
          }
        }
      }

      // Create/Update wallet record if exists
      if (privyData.wallet?.address) {
        await db
          .insert(privyWalletTable)
          .values({
            address: privyData.wallet.address,
            // Add chainType etc. if available from privyData.wallet
            chainType: privyData.wallet.chainType || "unknown",
            verifiedAt: new Date(), // Or use verifiedAt from Privy if available
          })
          .onConflictDoUpdate({
            target: [privyWalletTable.address],
            set: {
              verifiedAt: new Date(),
              // Update other fields if needed
              chainType: privyData.wallet.chainType || "unknown",
            },
          });
        log.info("Upserted wallet in database", {
          operation: "db_upsert_wallet",
          entity: "DB",
          userId: privyData.id,
          wallet: privyData.wallet.address,
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

    // Set the user session directly using the correctly formatted sessionUser
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
