"use server";

import { z } from "zod";
import { db, walletTable } from "@repo/database";
import { getPrivyUser } from "../lib/auth";
import { eq } from "drizzle-orm";

const walletSchema = z.object({
  address: z.string(),
  referralCode: z.string().length(6).optional(),
});

export async function createWallet(input: { address: string }) {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate input
    const parsed = walletSchema.parse(input);

    // Verify user can only create wallet for their own address
    if (parsed.address !== user.wallet.address) {
      throw new Error(
        "Unauthorized: You can only create a wallet for your own address",
      );
    }

    // Create wallet
    const wallet = await db
      .insert(walletTable)
      .values({
        address: parsed.address,
        referralCode: "TEST12", // For testing purposes
      })
      .returning();

    return wallet[0];
  } catch (error) {
    console.error("[SERVER] Error creating wallet:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Failed to create wallet: Invalid Solana address`);
    }

    throw new Error(
      `Failed to create wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getWallet(input: { address: string }) {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate input
    const parsed = walletSchema.parse(input);

    // Verify user can only access their own wallet
    if (parsed.address !== user.wallet.address) {
      throw new Error("Unauthorized: You can only access your own wallet");
    }

    // Get wallet
    const wallet = await db
      .select()
      .from(walletTable)
      .where(eq(walletTable.address, parsed.address))
      .limit(1);

    // If wallet doesn't exist, create it
    if (!wallet[0]) {
      const newWallet = await db
        .insert(walletTable)
        .values({
          address: parsed.address,
          referralCode: "TEST12", // For testing purposes
        })
        .returning();
      return newWallet[0];
    }

    return wallet[0];
  } catch (error) {
    console.error("[SERVER] Error getting wallet:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Failed to get wallet: Invalid Solana address`);
    }

    throw new Error(
      `Failed to get wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function handleSubmitWallet(input: {
  walletAddress: string;
  referredByCode?: string;
}) {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Parse input
    const parsed = walletSchema.parse({
      address: input.walletAddress,
      referralCode: input.referredByCode,
    });

    // Verify user can only submit their own wallet
    if (parsed.address !== user.wallet.address) {
      throw new Error("Unauthorized: You can only submit your own wallet");
    }

    // Get existing wallet
    const existingWallet = await db
      .select()
      .from(walletTable)
      .where(eq(walletTable.address, parsed.address))
      .limit(1);

    // If wallet exists and has a referral code, don't update it
    if (existingWallet[0]?.referralCode) {
      return existingWallet[0];
    }

    // Create or update wallet
    const wallet = await db
      .insert(walletTable)
      .values({
        address: parsed.address,
        referralCode: parsed.referralCode,
      })
      .onConflictDoUpdate({
        target: walletTable.address,
        set: {
          referralCode: parsed.referralCode,
        },
      })
      .returning();

    return wallet[0];
  } catch (error) {
    console.error("[SERVER] Error handling wallet submission:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(
        `Failed to submit wallet: ${JSON.stringify(error.errors, null, 2)}`,
      );
    }

    throw new Error(
      `Failed to submit wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
