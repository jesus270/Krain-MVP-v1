"use server";

import { db } from "@/db";
import { walletTable } from "@/db/schema";
import { isValidSolanaAddress } from "@/lib/utils";

export async function createWallet(address: string) {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address");
  }
  await db.insert(walletTable).values({ address });
  return "Wallet added successfully";
}
