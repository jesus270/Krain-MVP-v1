"use server";

import { db as baseDb, referralTable, walletTable } from "@repo/database";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";
import { db, executeWithRetry } from "../lib/db";
import { getPrivyUser } from "../lib/auth";
import { referralSchema } from "../lib/validations";
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
    const referral = await db
      .insert(referralTable)
      .values({
        referredByCode: parsed.referredByCode,
        referredWalletAddress: parsed.referredWalletAddress,
      })
      .returning();

    // Only revalidate paths in non-test environments
    if (process.env.NODE_ENV !== "test") {
      revalidatePath("/");
      revalidatePath("/profile");
    }

    return referral[0];
  } catch (error) {
    console.error("[SERVER] Error creating referral:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(
        `Failed to create referral: ${JSON.stringify(error.errors, null, 2)}`,
      );
    }

    throw new Error(
      `Failed to create referral: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getReferralsCount = async (
  referralCode: string,
): Promise<number> => {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate referral code
    if (!referralCode || referralCode.length !== 6) {
      throw new Error("Invalid referral code");
    }

    // Get referral count with additional logging
    console.log("[SERVER] Getting referrals count for code:", referralCode);

    const result = await db
      .select({ count: count() })
      .from(referralTable)
      .where(eq(referralTable.referredByCode, referralCode));

    const referralCount = result[0]?.count ?? 0;

    return referralCount;
  } catch (error) {
    console.error("[SERVER] Error getting referrals count:", {
      error,
      referralCode,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(
      `Failed to get referrals count: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
