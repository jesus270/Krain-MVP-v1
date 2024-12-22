"use server";

import { db as baseDb, referralTable } from "@repo/database";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";
import { db, executeWithRetry } from "../lib/db";

export const createReferral = async ({
  referredByCode,
  referredWalletAddress,
}: {
  referredByCode: string;
  referredWalletAddress: string;
}) => {
  try {
    const referral = await executeWithRetry(() =>
      db
        .insert(referralTable)
        .values({
          referredByCode,
          referredWalletAddress,
        })
        .returning(),
    );

    return referral[0];
  } catch (error) {
    console.error("Error creating referral:", error);
    throw error;
  }
};

export const getReferralsCount = async (
  referralCode: string,
): Promise<number> => {
  console.log("[SERVER] getReferralsCount called with code:", referralCode);
  try {
    console.log("[SERVER] Building count query for code:", referralCode);
    const query = db
      .select({ value: count() })
      .from(referralTable)
      .where(eq(referralTable.referredByCode, referralCode))
      .limit(1);

    console.log("[SERVER] SQL Query:", {
      sql: query.toSQL().sql,
      params: query.toSQL().params,
    });

    console.log("[SERVER] Executing count query");
    const result = await executeWithRetry(() => query, 5, 2000);
    console.log("[SERVER] Count query result:", result);

    const finalCount = result[0]?.value ?? 0;
    console.log("[SERVER] Final count:", finalCount);

    return finalCount;
  } catch (error) {
    console.error("[SERVER] Error in getReferralsCount:", error);
    if (error instanceof Error) {
      console.error("[SERVER] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      if (error.message.includes("timeout")) {
        throw new Error("Operation timed out. Please try again.");
      }
      if (error.message.includes("connection")) {
        throw new Error(
          "Database connection issue. Please try again in a moment.",
        );
      }
    }
    throw new Error("Failed to get referrals count. Please try again.");
  }
};
