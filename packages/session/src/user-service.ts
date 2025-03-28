import { db } from "@krain/db";
import {
  userTable,
  userProfileTable,
  privyWalletTable,
  type User,
} from "@krain/db";
import { eq } from "drizzle-orm";
import { log } from "@krain/utils";
import { PrivyUserData } from "./auth-handler";

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

    if (existingUser) {
      // Update existing user with any new information
      const [updatedUser] = await db
        .update(userTable)
        .set({
          email: privyData.email,
          walletAddress: privyData.wallet?.address,
          linkedAccounts: privyData.linkedAccounts,
          // Update other fields as needed
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
        linkedAccounts: privyData.linkedAccounts,
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
          chainType: "solana", // Update based on actual chain type
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
