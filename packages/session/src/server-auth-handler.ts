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
        email: privyData.email,
        wallet: privyData.wallet,
        linkedAccountsCount: privyData.linkedAccounts?.length,
      },
    });

    // --- Step 1: Construct initial sessionUser FROM PRIVY DATA ---

    // Helper to safely convert Privy createdAt to Date
    const getPrivyCreatedAtDate = (): Date => {
      if (!privyData.createdAt) return new Date(); // Use current time if Privy has no timestamp
      if (typeof privyData.createdAt === "number")
        return new Date(privyData.createdAt);
      if (typeof privyData.createdAt === "string")
        return new Date(privyData.createdAt);
      return new Date(); // Fallback
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
          return `${account.type}:${account.subject}`;
        }
        return null;
      })
      .filter((id): id is string => id !== null);

    // Extract email and wallet directly from Privy data
    let privyUserEmail: UserEmail | undefined = undefined;
    if (
      privyData.email &&
      typeof privyData.email === "object" &&
      privyData.email.address
    ) {
      privyUserEmail = { address: privyData.email.address };
    } else if (typeof privyData.email === "string") {
      privyUserEmail = { address: privyData.email };
    }

    let privyUserWallet: UserWallet | undefined = undefined;
    if (privyData.wallet?.address) {
      privyUserWallet = { address: privyData.wallet.address };
    }

    // Initial sessionUser based purely on Privy data
    // Role is initially defaulted or undefined, will be updated from DB later if needed.
    let sessionUser: User = {
      id: privyData.id,
      createdAt: getPrivyCreatedAtDate(), // Use Privy's createdAt initially
      wallet: privyUserWallet,
      email: privyUserEmail,
      linkedAccounts: linkedAccountStrings,
      role: "user", // Start with default role
      // Optional fields remain undefined for now
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

    log.info("Constructed initial sessionUser from Privy data", {
      operation: "handle_auth_server_constructed_user_privy",
      entity: "AUTH",
      userId: privyData.id,
      initialUser: JSON.stringify(sessionUser, null, 2),
    });

    // --- Step 2: Database Operations (Fetch, Upsert, Profile) ---
    let dbUser: DbUser | null = null;
    try {
      // Fetch existing user to know if we need to update or insert
      const existingDbUser = await db.query.userTable.findFirst({
        where: eq(userTable.privyId, privyData.id),
        // Include role if needed later for the session
        columns: { role: true, createdAt: true, id: true },
      });

      const emailForDb = privyUserEmail?.address; // Use email derived from Privy
      const walletForDb = privyUserWallet?.address; // Use wallet derived from Privy

      // Convert Privy linkedAccounts for DB schema
      const dbLinkedAccounts = (privyData.linkedAccounts || []).map(
        (account) => ({
          type: account.type,
          address:
            (account as any).address ||
            (account as any).number ||
            (account as any).subject,
        }),
      );

      if (existingDbUser) {
        // Update existing user
        const [updatedUserResult] = await db
          .update(userTable)
          .set({
            email: emailForDb,
            walletAddress: walletForDb,
            linkedAccounts: dbLinkedAccounts,
            // DO NOT update createdAt here, keep the original DB creation time
          })
          .where(eq(userTable.privyId, privyData.id))
          .returning({
            id: userTable.id,
            role: userTable.role,
            createdAt: userTable.createdAt,
          }); // Return needed fields

        // Use returned data, fallback to existing (but existingDbUser only has partial columns now)
        // Fetch the full user record after update to ensure consistency
        dbUser =
          (await db.query.userTable.findFirst({
            where: eq(userTable.privyId, privyData.id),
          })) ?? null;

        log.info("Updated user in database", {
          operation: "db_update_user",
          entity: "DB",
          userId: privyData.id,
          dbUserId: dbUser?.id, // Use optional chaining
        });
      } else {
        // Create new user
        const [newUserResult] = await db
          .insert(userTable)
          .values({
            privyId: privyData.id,
            email: emailForDb,
            walletAddress: walletForDb,
            linkedAccounts: dbLinkedAccounts,
            isGuest: false,
            hasAcceptedTerms: false,
            // Use the *initial* creation date from Privy (or fallback) for new records
            createdAt: sessionUser.createdAt,
            role: sessionUser.role, // Use the default role set earlier
          })
          .returning(); // Return the new user

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
          // Continue without dbUser if insert fails, session might still work partially
        } else {
          log.info("Created new user in database", {
            operation: "db_create_user",
            entity: "DB",
            userId: privyData.id,
            newDbId: dbUser.id,
          });
          // Create profile for the new user
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

      // Upsert wallet record using the address from Privy
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
      log.error("Database operation failed in auth handler", {
        operation: "handle_auth_server_db_error",
        entity: "AUTH",
        userId: privyData.id,
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      // Allow session creation to proceed even if DB ops fail
    }

    // --- Step 3: Refine sessionUser with critical DB data (if needed) ---
    // Example: Update role and createdAt from the definitive DB record
    if (dbUser) {
      sessionUser = {
        ...sessionUser,
        role: dbUser.role ?? sessionUser.role, // Use DB role if available, else keep default
        // Use the definitive DB createdAt time once the record exists/is updated
        createdAt: dbUser.createdAt ?? sessionUser.createdAt,
      };
      log.info("Refined sessionUser with DB data (role, createdAt)", {
        operation: "handle_auth_server_refine_user",
        entity: "AUTH",
        userId: privyData.id,
        finalUser: JSON.stringify(sessionUser, null, 2),
      });
    } else {
      log.warn(
        "Could not refine sessionUser with DB data (dbUser not found/created)",
        {
          operation: "handle_auth_server_refine_user_skipped",
          entity: "AUTH",
          userId: privyData.id,
        },
      );
    }

    // --- Step 4: Set the final user session ---
    log.info("Attempting to set final user session", {
      operation: "set_user_session_attempt",
      entity: "AUTH",
      userId: privyData.id,
    });

    // Save the session
    try {
      await setUserSession(sessionUser);
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
