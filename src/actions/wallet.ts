"use server";

import { db } from "@/db";
import { walletTable } from "@/db/schema";
import { isValidSolanaAddress } from "@/lib/utils";

export async function createWallet(address: string) {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address");
  }
  try {
    await db.insert(walletTable).values({ address });
    return { message: "Wallet added successfully" };
  } catch (e) {
    const error = e as Error;
    if (
      error.message ===
      'duplicate key value violates unique constraint "wallet_address_unique"'
    ) {
      throw new Error("Wallet already exists");
    }
    throw new Error("Failed to add wallet");
  }
}
