"use server";

import { z } from "zod";
import { db, walletTable } from "@repo/database";
import { getPrivyUser } from "../lib/auth";
import { redirect } from "next/navigation";
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
        createdAt: new Date(),
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

export async function handleSubmitWallet(formData: FormData) {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Parse form data
    const input = {
      address: formData.get("address") as string,
      referralCode: formData.get("referredByCode") as string,
    };

    // Validate input
    const parsed = walletSchema.parse(input);

    // Verify user can only submit their own wallet
    if (parsed.address !== user.wallet.address) {
      throw new Error("Unauthorized: You can only submit your own wallet");
    }

    // Create wallet
    await db
      .insert(walletTable)
      .values({
        address: parsed.address,
        referralCode: parsed.referralCode,
        createdAt: new Date(),
      })
      .returning();

    redirect("/profile");
  } catch (error) {
    console.error("[SERVER] Error handling wallet submission:", {
      error,
      formData: Object.fromEntries(formData),
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
