import { db } from "@krain/db";
import { walletTable, referralTable } from "@krain/db/schema";
import { eq, desc, count, sql, ne, inArray, asc } from "drizzle-orm";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";

const BATCH_SIZE = 50; // Keep batching for safety

async function findTopReferrersMinimalBatched() {
  console.log(
    `Finding top 400 referrers (oldest wallet only, minimal data, batched)...`,
  );

  try {
    // === Query 1: Get top 400 referral codes and counts ===
    console.log("Fetching top referral counts...");
    const topReferralCounts = await db
      .select({
        referralCode: referralTable.referredByCode,
        numReferrals: count(referralTable.id).as("num_referrals"),
      })
      .from(referralTable)
      .groupBy(referralTable.referredByCode)
      .orderBy(desc(count(referralTable.id)))
      .limit(400);

    if (topReferralCounts.length === 0) {
      console.log("No referrals found.");
      return;
    }
    console.log(`Found ${topReferralCounts.length} top referral codes.`);
    const topCodes = topReferralCounts
      .map((r) => r.referralCode)
      .filter((code): code is string => code !== null);

    if (topCodes.length === 0) {
      console.log("No valid top codes found.");
      return;
    }
    const countsMap = new Map(
      topReferralCounts.map((rc) => [rc.referralCode, rc.numReferrals]),
    );

    // === Query 2: Fetch minimal wallet data for top codes (Batched) ===
    console.log(`Fetching minimal wallet data in batches of ${BATCH_SIZE}...`);
    const oldestWalletMap = new Map<string, string>(); // Map<referralCode, walletAddress>

    for (let i = 0; i < topCodes.length; i += BATCH_SIZE) {
      const batchCodes = topCodes.slice(i, i + BATCH_SIZE);
      if (batchCodes.length === 0) continue;

      console.log(` -> Fetching wallet batch ${i / BATCH_SIZE + 1}...`);

      // Fetch wallets, ordered by created date to get oldest first if duplicates exist within batch
      const walletBatch = await db
        .select({
          address: walletTable.address,
          referralCode: walletTable.referralCode,
          createdAt: walletTable.createdAt, // Needed for finding oldest
        })
        .from(walletTable)
        .where(inArray(walletTable.referralCode, batchCodes))
        .orderBy(asc(walletTable.createdAt));

      // Process the batch - only keep the first address encountered for each code
      for (const wallet of walletBatch) {
        if (wallet.referralCode && !oldestWalletMap.has(wallet.referralCode)) {
          oldestWalletMap.set(wallet.referralCode, wallet.address);
        }
      }
    }

    console.log(
      `Identified ${oldestWalletMap.size} unique wallet addresses for top codes.`,
    );

    // === Combine Results (minimal) ===
    console.log("Combining results...");
    const finalResults = topReferralCounts
      .map((refCount) => {
        if (!refCount.referralCode) return null;
        const walletAddress = oldestWalletMap.get(refCount.referralCode);
        return {
          walletAddress:
            walletAddress ??
            `N/A (Wallet for ${refCount.referralCode} not found)`,
          referralCount: refCount.numReferrals,
        };
      })
      .filter(
        (result) =>
          result !== null && result.walletAddress.startsWith("N/A") === false,
      ) as {
      walletAddress: string;
      referralCount: number;
    }[];

    // Sort one last time
    finalResults.sort((a, b) => b.referralCount - a.referralCount);

    // === Write to CSV (minimal) ===
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const csvPath = path.join(dataDir, "top-400-referrers-minimal.csv");
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: "walletAddress", title: "Wallet Address" },
        { id: "referralCount", title: "Referral Count" },
      ],
    });

    await csvWriter.writeRecords(finalResults);
    console.log(
      `Successfully wrote ${finalResults.length} top referrers (wallet/count only) to ${csvPath}`,
    );
  } catch (error) {
    console.error("Error finding top referrers:", error);
    process.exit(1);
  }
}

findTopReferrersMinimalBatched();

// Remove other function calls/definitions if present
