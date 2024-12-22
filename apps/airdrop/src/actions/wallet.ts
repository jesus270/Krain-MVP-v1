"use server";

import { db as baseDb, walletTable, Wallet } from "@repo/database";
import { isValidSolanaAddress } from "@repo/utils";
import { eq } from "drizzle-orm";
import { createReferral } from "./referral";
import { db, executeWithRetry } from "../lib/db";

export async function createWallet({
  address,
}: {
  address: string;
}): Promise<Wallet> {
  if (!isValidSolanaAddress(address)) {
    console.error("[SERVER] Invalid Solana address:", address);
    throw new Error("Invalid Solana address");
  }

  try {
    console.log("[SERVER] Creating wallet for address:", address);
    const wallet = await executeWithRetry(() =>
      db
        .insert(walletTable)
        .values({
          address,
          referralCode: generateReferralCode(),
        })
        .returning(),
    );

    if (!wallet[0]) {
      console.error("[SERVER] Failed to create wallet for address:", address);
      throw new Error("Failed to create wallet");
    }

    console.log("[SERVER] Successfully created wallet:", wallet[0]);
    return wallet[0];
  } catch (error) {
    console.error("[SERVER] Error creating wallet:", {
      error,
      address,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function getWallet({
  address,
  with: { referredBy } = {},
}: {
  address: string;
  with?: {
    referredBy?: boolean;
  };
}): Promise<Wallet | undefined> {
  if (!isValidSolanaAddress(address)) {
    console.error("[SERVER] Invalid Solana address in getWallet:", address);
    throw new Error("Invalid Solana address");
  }

  try {
    console.log("[SERVER] Getting wallet for address:", address);
    const wallet = await executeWithRetry(() =>
      db.select().from(walletTable).where(eq(walletTable.address, address)),
    );

    console.log("[SERVER] Wallet lookup result:", wallet[0] || "Not found");
    return wallet[0];
  } catch (error) {
    console.error("[SERVER] Error getting wallet:", {
      error,
      address,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function handleSubmitWallet(formData: {
  address: string;
  referredByCode: string | undefined;
}): Promise<Wallet> {
  "use server";

  const { address, referredByCode } = formData;

  if (!isValidSolanaAddress(address)) {
    console.error(
      "[SERVER] Invalid Solana address in handleSubmitWallet:",
      address,
    );
    throw new Error("Invalid Solana address");
  }

  try {
    console.log("[SERVER] Handling wallet submission:", {
      address,
      referredByCode,
    });
    let wallet = await getWallet({ address });

    if (!wallet) {
      console.log("[SERVER] Wallet not found, creating new wallet");
      wallet = await createWallet({ address });
    }

    if (referredByCode && wallet.referralCode !== referredByCode) {
      console.log("[SERVER] Creating referral relationship:", {
        referredByCode,
        walletAddress: address,
      });

      await createReferral({
        referredByCode,
        referredWalletAddress: address,
      });

      console.log("[SERVER] Updating wallet with referral code");
      const updatedWallet = await executeWithRetry(() =>
        db
          .update(walletTable)
          .set({ referralCode: referredByCode })
          .where(eq(walletTable.address, address))
          .returning(),
      );

      if (!updatedWallet[0]) {
        console.error("[SERVER] Failed to update wallet with referral code:", {
          address,
          referredByCode,
        });
        throw new Error("Failed to update wallet with referral code");
      }

      wallet = updatedWallet[0];
    }

    console.log("[SERVER] Successfully handled wallet submission:", wallet);
    return wallet;
  } catch (error) {
    console.error("[SERVER] Error handling wallet submission:", {
      error,
      address,
      referredByCode,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8);
}
