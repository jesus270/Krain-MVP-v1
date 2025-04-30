import * as dotenv from "dotenv";
dotenv.config(); // Load .env file - needed if running directly

import { db } from "@krain/db";
import { walletTable } from "@krain/db/schema";
import { eq, desc, count, sql, gt, asc, ne } from "drizzle-orm";

// Placeholder: Replace with your actual code generation logic from @krain/utils if available
// function generateReferralCode(): string { ... }

async function nullifyDuplicateCodes() {
  console.log(
    "Starting duplicate referral code resolution (Step 1: Nullifying duplicates)...",
  );

  try {
    // 1. Find codes used by more than one wallet
    console.log("Finding duplicate referral codes...");
    const duplicateCodesQuery = db
      .select({
        referralCode: walletTable.referralCode,
      })
      .from(walletTable)
      .groupBy(walletTable.referralCode)
      .having(gt(count(walletTable.address), 1));

    const duplicateCodesResult = await duplicateCodesQuery;

    if (duplicateCodesResult.length === 0) {
      console.log("No duplicate referral codes found. Nothing to resolve.");
      return;
    }

    console.log(
      `Found ${duplicateCodesResult.length} referral codes with duplicates.`,
      `Processing in batches to identify keepers and bulk-nullify others...`,
    );

    // 2. Process each duplicate code
    let totalBulkUpdatedCount = 0;
    for (const duplicate of duplicateCodesResult) {
      if (!duplicate.referralCode) {
        console.warn(
          `Skipping null referral code found in initial duplicate list.`,
        );
        continue;
      }
      const codeToResolve = duplicate.referralCode;
      console.log(` -> Processing code: ${codeToResolve}`);

      // Find the oldest wallet (keeper) for this code
      const keeperResult = await db
        .select({ address: walletTable.address })
        .from(walletTable)
        .where(eq(walletTable.referralCode, codeToResolve))
        .orderBy(asc(walletTable.createdAt))
        .limit(1);

      if (!keeperResult || keeperResult.length === 0) {
        console.warn(
          `    Could not find any wallet for code ${codeToResolve} during keeper selection. Skipping.`,
          `    This might indicate an inconsistency. Manual check recommended.`,
        );
        continue;
      }
      const keeperWalletAddress = keeperResult[0].address;
      console.log(`    Keeper wallet address: ${keeperWalletAddress}`);

      // Bulk update all *other* wallets with this code to NULL and set the flag
      console.log(
        `    Bulk updating other wallets for code ${codeToResolve}...`,
      );
      const updateResult = await db
        .update(walletTable)
        .set({
          referralCode: null, // Set code to NULL
          referralCodeRegenerated: true,
        })
        .where(
          sql`${walletTable.referralCode} = ${codeToResolve} AND ${walletTable.address} <> ${keeperWalletAddress}`,
        );

      // Neon HTTP driver might not return affectedRows reliably, so we log completion
      console.log(
        `    Bulk update command executed for code ${codeToResolve}.`,
      );
      // We can't easily get the count from the result object with neon/http,
      // so we won't track totalBulkUpdatedCount accurately here.
    }

    console.log(
      `\nStep 1 complete. Duplicate referral codes (excluding one keeper per code) have been set to NULL and flagged.`,
      `\nRun the next script (generate-new-codes.ts or similar) to assign unique codes.`,
    );
  } catch (error) {
    console.error("\nError during duplicate nullification:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

nullifyDuplicateCodes();
