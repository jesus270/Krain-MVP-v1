"use server";

import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { db, referralTable } from "@krain/db";
import { withAuth, withServerActionProtection } from "@krain/session";
import { referralSchema, referralCodeSchema } from "../lib/validations";
import { revalidatePath } from "next/cache";
import { log } from "@krain/utils";
import { headers } from "next/headers";

export const createReferral = async (input: {
  referredByCode: string;
  referredWalletAddress: string;
  userId: string;
}) => {
  // Validate origin and apply rate limiting
  const protectionResponse = await withServerActionProtection(
    { headers: headers() } as any,
    "default",
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  return withAuth(input.userId, async (session) => {
    const start = Date.now();
    try {
      log.info("Creating referral", {
        operation: "create",
        entity: "REFERRAL",
        referredByCode: input.referredByCode,
      });

      const user = session.get("user");
      if (!user) throw new Error("No user in session");

      // Validate input
      const parsed = referralSchema.parse(input);

      // Check if referral already exists
      const existingReferral = await db.query.referralTable.findFirst({
        where: eq(
          referralTable.referredWalletAddress,
          parsed.referredWalletAddress,
        ),
      });

      if (existingReferral) {
        throw new Error("Referral already exists");
      }

      // Create referral
      const referral = await db
        .insert(referralTable)
        .values({
          referredByCode: parsed.referredByCode,
          referredWalletAddress: parsed.referredWalletAddress,
        })
        .returning();

      if (!referral || referral.length === 0) {
        throw new Error("Failed to create referral");
      }

      // Revalidate cache
      revalidatePath("/dashboard");

      log.info("Referral created successfully", {
        operation: "create",
        entity: "REFERRAL",
        duration: Date.now() - start,
        referral: referral[0],
      });

      return referral[0];
    } catch (error) {
      log.error(error, {
        operation: "create",
        entity: "REFERRAL",
        duration: Date.now() - start,
        input,
      });

      throw error;
    }
  });
};

export const getReferralCount = async (input: {
  referralCode: string;
  userId: string;
}) => {
  try {
    // Get headers safely
    const headersList = headers();

    log.info("Getting referral count", {
      entity: "REFERRAL",
      operation: "get_referral_count_start",
      referralCode: input.referralCode,
      userId: input.userId,
    });

    // Validate origin and apply rate limiting
    const protectionResponse = await withServerActionProtection(
      { headers: headersList },
      "default",
    );

    if (protectionResponse) {
      log.error("Protection check failed", {
        entity: "REFERRAL",
        operation: "get_referral_count",
        error: protectionResponse.statusText,
        status: protectionResponse.status,
      });
      throw new Error(protectionResponse.statusText);
    }

    return withAuth(input.userId, async (session) => {
      try {
        const user = session.get("user");
        if (!user) {
          log.error("No user in session", {
            entity: "REFERRAL",
            operation: "get_referral_count",
            userId: input.userId,
          });
          throw new Error("No user in session");
        }

        const parsed = referralCodeSchema.parse(input);

        log.info("Querying referral count", {
          entity: "REFERRAL",
          operation: "get_referral_count_query",
          referralCode: parsed.referralCode,
        });

        const result = await db
          .select({ value: count() })
          .from(referralTable)
          .where(eq(referralTable.referredByCode, parsed.referralCode));

        const referralCount = result[0]?.value || 0;

        log.info("Referral count retrieved", {
          entity: "REFERRAL",
          operation: "get_referral_count_success",
          referralCode: parsed.referralCode,
          count: referralCount,
        });

        return referralCount;
      } catch (error) {
        log.error("Failed in auth context", {
          entity: "REFERRAL",
          operation: "get_referral_count",
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          input,
        });

        if (error instanceof z.ZodError) {
          throw new Error("String must contain exactly 6 character(s)");
        }

        throw new Error(
          `Failed to get referrals count: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  } catch (error) {
    log.error("Top level error in getReferralCount", {
      entity: "REFERRAL",
      operation: "get_referral_count",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      input,
    });
    throw error;
  }
};
