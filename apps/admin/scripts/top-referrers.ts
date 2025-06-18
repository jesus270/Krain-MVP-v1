import { db } from "@krain/db";
import { walletTable, referralTable, userTable } from "@krain/db";
import { eq, desc, count, sql, ne, inArray, asc } from "drizzle-orm";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";

const BATCH_SIZE = 50;

// Renamed function to reflect the goal
async function findTopReferrersFilteredWithUser() {
  console.log(
    `Finding top 200 referrers (oldest wallet only, filtered, with user data, batched)...`,
  );

  try {
    // === Query 1: Get top 400 referral codes and counts ===
    console.log("Fetching top 400 referral counts...");
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
    console.log(
      `Found ${topReferralCounts.length} potential top referral codes.`,
    );
    const topCodes = topReferralCounts
      .map((r) => r.referralCode)
      .filter((code): code is string => code !== null);

    if (topCodes.length === 0) {
      console.log("No valid top codes found.");
      return;
    }

    // === Query 2: Fetch minimal oldest wallet data for top codes (Batched) ===
    console.log(
      `Fetching oldest wallet address per code in batches of ${BATCH_SIZE}...`,
    );
    const oldestWalletMap = new Map<string, string>(); // Map<referralCode, walletAddress>

    for (let i = 0; i < topCodes.length; i += BATCH_SIZE) {
      const batchCodes = topCodes.slice(i, i + BATCH_SIZE);
      if (batchCodes.length === 0) continue;

      console.log(` -> Fetching wallet batch ${i / BATCH_SIZE + 1}...`);

      const walletBatch = await db
        .select({
          address: walletTable.address,
          referralCode: walletTable.referralCode,
          createdAt: walletTable.createdAt,
        })
        .from(walletTable)
        .where(inArray(walletTable.referralCode, batchCodes))
        .orderBy(asc(walletTable.createdAt));

      for (const wallet of walletBatch) {
        if (wallet.referralCode && !oldestWalletMap.has(wallet.referralCode)) {
          oldestWalletMap.set(wallet.referralCode, wallet.address);
        }
      }
    }

    console.log(
      `Identified ${oldestWalletMap.size} unique oldest wallet addresses for top codes.`,
    );

    // === Combine Initial Results and Filter ===
    console.log("Combining counts with oldest wallet and filtering...");
    const combinedResults = topReferralCounts
      .map((refCount) => {
        if (!refCount.referralCode) return null;
        const walletAddress = oldestWalletMap.get(refCount.referralCode);
        if (walletAddress) {
          return {
            walletAddress: walletAddress,
            referralCount: refCount.numReferrals,
          };
        } else {
          return null;
        }
      })
      .filter((result) => result !== null) as {
        walletAddress: string;
        referralCount: number;
      }[];

    combinedResults.sort((a, b) => b.referralCount - a.referralCount);
    const top200Intermediate = combinedResults.slice(0, 200);
    console.log(`Selected initial top ${top200Intermediate.length} referrers.`);

    const top200Addresses = top200Intermediate.map((r) => r.walletAddress);

    // === Query 3: Fetch User Data for the Top 200 Wallets ===
    let userDataMap = new Map<string, any>();
    if (top200Addresses.length > 0) {
      console.log(
        `Fetching user data for ${top200Addresses.length} wallets...`,
      );
      const usersData = await db
        .select({
          walletAddress: userTable.walletAddress,
          privyId: userTable.privyId,
          twitterHandle: userTable.twitterHandle,
          telegramUserId: userTable.telegramUserId,
          telegramUsername: userTable.telegramUsername,
          hasJoinedTelegramCommunity: userTable.hasJoinedTelegramCommunity,
          hasJoinedTelegramAnnouncement:
            userTable.hasJoinedTelegramAnnouncement,
        })
        .from(userTable)
        .where(inArray(userTable.walletAddress, top200Addresses));

      // Filter out null addresses before creating the map
      userDataMap = new Map(
        usersData
          .filter(
            (u): u is typeof u & { walletAddress: string } =>
              u.walletAddress !== null,
          )
          .map((u) => [u.walletAddress, u]),
      );
      console.log(`Fetched user data for ${userDataMap.size} wallets.`);
    } else {
      console.log("No wallets selected for final user data fetch.");
    }

    // === Combine Final Results ===
    console.log("Combining all data...");
    type FinalResult = {
      walletAddress: string;
      referralCount: number;
      privyId: string | null;
      twitterHandle: string | null;
      telegramUserId: string | null;
      telegramUsername: string | null;
      hasJoinedTelegramCommunity: boolean | null;
      hasJoinedTelegramAnnouncement: boolean | null;
    };

    const finalResults: FinalResult[] = top200Intermediate.map(
      (intermediateResult) => {
        const userInfo = userDataMap.get(intermediateResult.walletAddress);
        return {
          ...intermediateResult,
          privyId: userInfo?.privyId ?? null,
          twitterHandle: userInfo?.twitterHandle ?? null,
          telegramUserId: userInfo?.telegramUserId ?? null,
          telegramUsername: userInfo?.telegramUsername ?? null,
          hasJoinedTelegramCommunity:
            userInfo?.hasJoinedTelegramCommunity ?? null,
          hasJoinedTelegramAnnouncement:
            userInfo?.hasJoinedTelegramAnnouncement ?? null,
        };
      },
    );

    // === Write to CSV ===
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // Restore original filename
    const csvPath = path.join(dataDir, "top-200-referrers-final.csv");
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: "walletAddress", title: "Wallet Address" },
        { id: "referralCount", title: "Referral Count" },
        { id: "privyId", title: "Privy ID" },
        { id: "twitterHandle", title: "Twitter Handle" },
        { id: "telegramUserId", title: "Telegram User ID" },
        { id: "telegramUsername", title: "Telegram Username" },
        {
          id: "hasJoinedTelegramCommunity",
          title: "Joined Telegram Community",
        },
        {
          id: "hasJoinedTelegramAnnouncement",
          title: "Joined Telegram Announcement",
        },
      ],
    });

    await csvWriter.writeRecords(finalResults);
    console.log(
      `Successfully wrote ${finalResults.length} top referrers (with user data) to ${csvPath}`,
    );
  } catch (error) {
    console.error("Error finding top referrers:", error);
    process.exit(1);
  }
}

// Call the updated function
findTopReferrersFilteredWithUser();

// Remove other function calls/definitions if present
