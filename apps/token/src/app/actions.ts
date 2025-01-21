"use server";

import { db, tokenSignupTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { withAuth, withServerActionProtection } from "@krain/session";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

// Initialize Solana connection based on environment
const network =
  process.env.NODE_ENV === "production"
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
);

// The receiving wallet address for token sale payments
const RECEIVING_WALLET = process.env.NEXT_PUBLIC_RECEIVING_WALLET;
const REQUIRED_SOL = 2;

// Helper function to wait for transaction confirmation with retries
async function waitForTransaction(signature: string, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (tx) return tx;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Transaction confirmation timeout");
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
        console.log(`Retrying operation, attempt ${i + 2}/${maxRetries}`);
      }
    }
  }

  throw lastError!;
}

export async function signupForToken(input: {
  userId: string;
  txHash: string;
}) {
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default",
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  return withAuth(input.userId, async (session) => {
    const user = session.get("user");

    if (!user) throw new Error("No user in session");
    if (!user.wallet.address)
      throw new Error("wallet address is required for token signup");

    // // Check if user already signed up
    const existingSignup = await db
      .select()
      .from(tokenSignupTable)
      .where(eq(tokenSignupTable.walletAddress, user.wallet.address))
      .limit(1);

    if (existingSignup.length > 0) {
      throw new Error("Already signed up for token");
    }

    // Verify the transaction
    try {
      console.log("Waiting for transaction confirmation...");
      const tx = await waitForTransaction(input.txHash);

      // Check if transaction was successful
      if (tx.meta?.err) {
        throw new Error("Transaction failed");
      }

      // Get all accounts involved in the transaction
      const accounts = tx.transaction.message.staticAccountKeys;
      if (!accounts || accounts.length < 2) {
        throw new Error("Could not get transaction accounts");
      }

      // Verify the sender address matches the user's wallet
      const sender = accounts[0];
      if (
        !(sender instanceof PublicKey) ||
        sender.toBase58() !== user.wallet.address
      ) {
        throw new Error("Transaction sender does not match user wallet");
      }

      // Verify the receiver address
      const receiver = accounts[1];
      if (
        !(receiver instanceof PublicKey) ||
        receiver.toBase58() !== RECEIVING_WALLET
      ) {
        throw new Error("Invalid receiving wallet address");
      }

      // Verify the amount (2 SOL)
      const preBalance = tx.meta?.preBalances?.[1];
      const postBalance = tx.meta?.postBalances?.[1];

      if (
        typeof preBalance === "undefined" ||
        typeof postBalance === "undefined"
      ) {
        throw new Error("Could not verify transaction amount");
      }

      const amount = postBalance - preBalance;
      if (amount < REQUIRED_SOL * 1e9) {
        throw new Error("Invalid payment amount");
      }

      // Check transaction age
      const currentSlot = await connection.getSlot();
      const txSlot = tx.slot;
      if (currentSlot - txSlot > 1000) {
        // About ~8 minutes worth of slots
        throw new Error("Transaction too old");
      }

      // Create new signup with retry logic
      await retryOperation(async () => {
        await db.insert(tokenSignupTable).values({
          walletAddress: user.wallet.address,
          paymentTxHash: input.txHash,
        });
      });

      return {
        status: "success" as const,
        message: "Successfully signed up for token sale",
      };
    } catch (error) {
      console.error("Transaction verification failed:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Transaction verification failed",
      );
    }
  });
}

export async function checkTokenSignup(input: { userId: string }) {
  // Validate origin and apply rate limiting
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default",
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  return withAuth(input.userId, async (session) => {
    const user = session.get("user");
    if (!user) throw new Error("No user in session");
    if (!user.wallet.address) return { isSignedUp: false };

    // Check if user already signed up
    const existingSignup = await db
      .select()
      .from(tokenSignupTable)
      .where(eq(tokenSignupTable.walletAddress, user.wallet.address))
      .limit(1);

    return existingSignup.length > 0;
  });
}
