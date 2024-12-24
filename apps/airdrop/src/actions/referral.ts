"use server";

import { referralTable } from "@repo/database";
import { eq, count } from "drizzle-orm";
import { db } from "../lib/db";
import { getPrivyUser } from "../lib/auth";
import { referralSchema, referralCodeSchema } from "../lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createReferral = async (input: {
  referredByCode: string;
  referredWalletAddress: string;
}) => {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate input
    const parsed = referralSchema.parse(input);

    // Verify user can only create referrals for their own wallet
    if (parsed.referredWalletAddress !== user.wallet.address) {
      throw new Error(
        "Unauthorized: can only create referrals for your own wallet",
      );
    }

    // Create referral
    const [referral] = await db
      .insert(referralTable)
      .values({
        referredByCode: parsed.referredByCode,
        referredWalletAddress: parsed.referredWalletAddress,
      })
      .returning();

    if (!referral) {
      throw new Error(
        "Failed to create referral: No referral returned from database",
      );
    }

    // Only revalidate paths in non-test environments
    if (process.env.NODE_ENV !== "test") {
      revalidatePath("/");
      revalidatePath("/profile");
    }

    return referral;
  } catch (error) {
    console.error("[SERVER] Error creating referral:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(
        `Failed to create referral: ${error.errors[0]?.message || JSON.stringify(error.errors)}`,
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Database connection error")
    ) {
      throw new Error("Failed to create referral: Database connection error");
    }

    throw new Error(
      `Failed to create referral: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getReferralsCount = async (input: { referralCode: string }) => {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate input
    const parsed = referralCodeSchema.parse(input);

    // Get referrals count
    const [result] = await db
      .select({ count: count() })
      .from(referralTable)
      .where(eq(referralTable.referredByCode, parsed.referralCode));

    return Number(result?.count || 0);
  } catch (error) {
    console.error("[SERVER] Error getting referrals count:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(
        `Failed to get referrals count: ${error.errors[0]?.message || JSON.stringify(error.errors)}`,
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Database connection error")
    ) {
      throw new Error(
        "Failed to get referrals count: Database connection error",
      );
    }

    throw new Error(
      `Failed to get referrals count: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
