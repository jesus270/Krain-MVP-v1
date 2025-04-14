"use server";

import {
  db,
  userTable,
  privyWalletTable,
  LinkedAccount,
  WalletLinkedAccount,
  EmailLinkedAccount,
  TwitterOAuthLinkedAccount,
} from "@krain/db";
import { headers } from "next/headers";
import { withAuth, withServerActionProtection } from "@krain/session/server";
import { eq } from "drizzle-orm";
import { fetchPrivyUserById, fetchAllPrivyUsers } from "./privy-api";

// Define the Privy user interface
export interface PrivyUser {
  id: string;
  created_at: number;
  is_guest: boolean;
  linked_accounts: LinkedAccount[];
  mfa_methods: any[];
  has_accepted_terms: boolean;
}

/**
 * Import Privy users into our database
 * This function will:
 * 1. Process an array of Privy users
 * 2. Create or update user records
 * 3. Create or update wallet records
 * 4. Link users to their wallets
 */
export async function importPrivyUsers(input: {
  userId: string; // Admin user ID making the request
  privyUsers: PrivyUser[];
}) {
  // Apply rate limiting and protection
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default", // Use default rate limit
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  // Verify the user is an admin
  return withAuth(input.userId, async (session) => {
    const user = session.get("user");
    if (!user) throw new Error("No user in session");

    // Check if user is admin (you may need to adjust this based on your role system)
    if (user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const results = {
      total: input.privyUsers.length,
      created: 0,
      updated: 0,
      errors: [] as { userId: string; error: string }[],
    };

    // Process each Privy user
    for (const privyUser of input.privyUsers) {
      try {
        await db.transaction(async (tx) => {
          // Extract data from the Privy user
          const walletAccount = privyUser.linked_accounts.find(
            (account): account is WalletLinkedAccount =>
              account.type === "wallet",
          );

          const emailAccount = privyUser.linked_accounts.find(
            (account): account is EmailLinkedAccount =>
              account.type === "email",
          );

          const twitterAccount = privyUser.linked_accounts.find(
            (account): account is TwitterOAuthLinkedAccount =>
              account.type === "twitter_oauth",
          );

          // Check if user already exists
          const existingUser = await tx
            .select()
            .from(userTable)
            .where(eq(userTable.privyId, privyUser.id))
            .limit(1);

          if (existingUser.length > 0) {
            // Update existing user
            await tx
              .update(userTable)
              .set({
                email: emailAccount?.address,
                walletAddress: walletAccount?.address,
                twitterHandle: twitterAccount?.username,
                twitterName: twitterAccount?.name,
                twitterProfilePictureUrl: twitterAccount?.profile_picture_url,
                twitterSubject: twitterAccount?.subject,
                privyCreatedAt: new Date(privyUser.created_at),
                isGuest: privyUser.is_guest,
                hasAcceptedTerms: privyUser.has_accepted_terms,
                linkedAccounts: privyUser.linked_accounts,
              })
              .where(eq(userTable.privyId, privyUser.id));

            results.updated++;
          } else {
            // Create new user
            await tx.insert(userTable).values({
              privyId: privyUser.id,
              email: emailAccount?.address,
              walletAddress: walletAccount?.address,
              twitterHandle: twitterAccount?.username,
              twitterName: twitterAccount?.name,
              twitterProfilePictureUrl: twitterAccount?.profile_picture_url,
              twitterSubject: twitterAccount?.subject,
              privyCreatedAt: new Date(privyUser.created_at),
              isGuest: privyUser.is_guest,
              hasAcceptedTerms: privyUser.has_accepted_terms,
              linkedAccounts: privyUser.linked_accounts,
            });

            results.created++;
          }

          // If there's a wallet, create or update the privyWallet record
          if (walletAccount) {
            const existingWallet = await tx
              .select()
              .from(privyWalletTable)
              .where(eq(privyWalletTable.address, walletAccount.address))
              .limit(1);

            if (existingWallet.length === 0) {
              // Create new wallet
              await tx.insert(privyWalletTable).values({
                address: walletAccount.address,
                chainType: walletAccount.chain_type,
                walletClient: walletAccount.wallet_client,
                walletClientType: walletAccount.wallet_client_type,
                connectorType: walletAccount.connector_type,
                verifiedAt: walletAccount.verified_at
                  ? new Date(walletAccount.verified_at)
                  : undefined,
                updatedAt: new Date(),
              });
            } else {
              // Update existing wallet
              await tx
                .update(privyWalletTable)
                .set({
                  chainType: walletAccount.chain_type,
                  walletClient: walletAccount.wallet_client,
                  walletClientType: walletAccount.wallet_client_type,
                  connectorType: walletAccount.connector_type,
                  verifiedAt: walletAccount.verified_at
                    ? new Date(walletAccount.verified_at)
                    : undefined,
                  updatedAt: new Date(),
                })
                .where(eq(privyWalletTable.address, walletAccount.address));
            }
          }
        });
      } catch (error) {
        // Log the error and continue with the next user
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.errors.push({ userId: privyUser.id, error: errorMessage });
      }
    }

    return results;
  });
}

/**
 * Fetch a single Privy user by ID and import them
 */
export async function importPrivyUserById(input: {
  userId: string; // Admin user ID making the request
  privyUserId: string;
}) {
  // Apply rate limiting and protection
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default", // Use default rate limit
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  // Verify the user is an admin
  return withAuth(input.userId, async (session) => {
    const user = session.get("user");
    if (!user) throw new Error("No user in session");

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      // Fetch the user from Privy API
      const privyUser = await fetchPrivyUserById(input.privyUserId);

      // Import the user
      const result = await importPrivyUsers({
        userId: input.userId,
        privyUsers: [privyUser],
      });

      return {
        ...result,
        privyUser,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import Privy user: ${errorMessage}`);
    }
  });
}

/**
 * Import all users from Privy API
 */
export async function importAllPrivyUsers(input: {
  userId: string; // Admin user ID making the request
  createdAfter?: number; // Optional timestamp to filter users
  batchSize?: number; // Optional batch size for processing
}) {
  // Apply rate limiting and protection
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default", // Use default rate limit
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  // Verify the user is an admin
  return withAuth(input.userId, async (session) => {
    const user = session.get("user");
    if (!user) throw new Error("No user in session");

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      // Fetch all users from Privy API
      console.log("Starting Privy user import...");
      const startTime = Date.now();

      const privyUsers = await fetchAllPrivyUsers({
        created_after: input.createdAfter,
      });

      console.log(
        `Fetched ${privyUsers.length} users from Privy API in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`,
      );

      // Process users in batches to avoid overwhelming the database
      const batchSize = input.batchSize || 100;
      const totalBatches = Math.ceil(privyUsers.length / batchSize);

      let totalCreated = 0;
      let totalUpdated = 0;
      let totalErrors = 0;

      console.log(
        `Processing ${privyUsers.length} users in ${totalBatches} batches of ${batchSize}...`,
      );

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, privyUsers.length);
        const batch = privyUsers.slice(start, end);

        console.log(
          `Processing batch ${i + 1}/${totalBatches} (${batch.length} users)...`,
        );

        // Import the batch
        const result = await importPrivyUsers({
          userId: input.userId,
          privyUsers: batch,
        });

        totalCreated += result.created;
        totalUpdated += result.updated;
        totalErrors += result.errors.length;

        console.log(
          `Batch ${i + 1} complete: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
        );
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

      return {
        totalFetched: privyUsers.length,
        totalCreated,
        totalUpdated,
        totalErrors,
        processingTimeSeconds: parseFloat(totalTime),
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import Privy users: ${errorMessage}`);
    }
  });
}
