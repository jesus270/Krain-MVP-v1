import { createReadStream } from "fs";
import { rename, readdir } from "fs/promises";
import { parse } from "csv-parse";
import path from "path";
import { db } from "@krain/db";
import { userTable } from "@krain/db";
import { sql } from "drizzle-orm";

const BATCH_SIZE = 100;
const CONCURRENT_BATCHES = 5;
const RATE_LIMIT_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processCSVFile(filePath: string) {
  const batches: any[][] = [[]];
  let currentBatch = 0;
  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;
  const fileName = path.basename(filePath);

  const parser = createReadStream(filePath, { encoding: "utf-8" }).pipe(
    parse({
      columns: [
        "id",
        "createdAt",
        "isGuest",
        "email",
        "emailVerifiedAt",
        "walletAddress",
        "walletChain",
        "walletType",
        "walletVerifiedAt",
        "twitterUsername",
        "twitterName",
        "twitterProfilePic",
        "twitterVerifiedAt",
        "twitterSubject",
      ],
      skip_empty_lines: true,
      encoding: "utf-8",
      quote: '"',
      escape: '"',
      relax_quotes: true,
      relax_column_count: true,
      from_line: 1, // Start from first line since we're providing headers
    }),
  );

  for await (const record of parser) {
    try {
      // Validate required fields
      if (!record.id) throw new Error("Missing required field: id");
      if (!record.createdAt)
        throw new Error("Missing required field: createdAt");

      const user = {
        privyId: record.id,
        email: record.email || null,
        walletAddress: record.walletAddress || null,
        walletChain: record.walletChain || null,
        walletType: record.walletType || null,
        twitterHandle: record.twitterUsername || null,
        twitterName: record.twitterName || null,
        twitterProfilePictureUrl: record.twitterProfilePic || null,
        isGuest: record.isGuest === "true",
        createdAt: new Date(parseInt(record.createdAt) * 1000),
        privyCreatedAt: new Date(parseInt(record.createdAt) * 1000),
        linkedAccounts: [],
        emailVerifiedAt: null,
        walletVerifiedAt: null,
        twitterVerifiedAt: null,
        // Set default values for required fields that aren't in CSV
        hasAcceptedTerms: false,
        role: "user",
        hasJoinedTelegramCommunity: false,
        hasJoinedTelegramAnnouncement: false,
        telegramCommunityMessageCount: 0,
        hasJoinedCommunityChannel: false,
        hasJoinedAnnouncementChannel: false,
        communityMessageCount: 0,
        announcementCommentCount: 0,
      };

      if (batches[currentBatch]!.length >= BATCH_SIZE) {
        currentBatch++;
        batches[currentBatch] = [];
      }
      batches[currentBatch]!.push(user);
      processedCount++;

      if (processedCount % 10000 === 0) {
        console.log(`Read ${processedCount} records from ${fileName}`);
      }
    } catch (error) {
      console.error(`Error processing record #${processedCount + 1}:`, error);
      console.error("Problematic record:", record);
      throw new Error(
        `Failed to process record #${processedCount + 1}. Please fix the data and try again.`,
      );
    }
  }

  console.log(`\nProcessing ${batches.length} batches from ${fileName}`);

  for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
    const batchPromises = batches
      .slice(i, i + CONCURRENT_BATCHES)
      .map(async (batch, idx) => {
        try {
          await db
            .insert(userTable)
            .values(batch)
            .onConflictDoUpdate({
              target: [userTable.privyId],
              set: {
                email: sql`EXCLUDED.email`,
                walletAddress: sql`EXCLUDED."walletAddress"`,
                walletChain: sql`EXCLUDED."walletChain"`,
                walletType: sql`EXCLUDED."walletType"`,
                twitterHandle: sql`EXCLUDED."twitterHandle"`,
                twitterName: sql`EXCLUDED."twitterName"`,
                twitterProfilePictureUrl: sql`EXCLUDED."twitterProfilePictureUrl"`,
                isGuest: sql`EXCLUDED."isGuest"`,
                privyCreatedAt: sql`EXCLUDED."privyCreatedAt"`,
                linkedAccounts: sql`EXCLUDED."linkedAccounts"`,
                emailVerifiedAt: sql`EXCLUDED."emailVerifiedAt"`,
                walletVerifiedAt: sql`EXCLUDED."walletVerifiedAt"`,
                twitterVerifiedAt: sql`EXCLUDED."twitterVerifiedAt"`,
              },
            });
          console.log(
            `Batch ${i + idx} completed (${batch.length} users) from ${fileName}`,
          );
          return { success: batch.length, failed: 0 };
        } catch (error) {
          console.error(`Batch ${i + idx} failed:`, error);
          return { success: 0, failed: batch.length };
        }
      });

    const results = await Promise.all(batchPromises);

    for (const result of results) {
      successCount += result.success;
      failedCount += result.failed;
    }

    if (i + CONCURRENT_BATCHES < batches.length) {
      await sleep(RATE_LIMIT_MS);
    }

    console.log(
      `Progress: ${successCount + failedCount}/${processedCount} (${failedCount} failed) from ${fileName}`,
    );
  }

  return {
    processed: processedCount,
    success: successCount,
    failed: failedCount,
  };
}

async function archiveFile(filePath: string) {
  const fileName = path.basename(filePath);
  const archivedPath = path.join(__dirname, "archived-data", fileName);
  await rename(filePath, archivedPath);
  console.log(`Archived ${fileName} to archived-data/`);
}

async function main() {
  const dataDir = path.join(__dirname, "data");
  const files = (await readdir(dataDir)).filter((file) =>
    file.endsWith(".csv"),
  );

  if (files.length === 0) {
    console.log("No CSV files found in data directory");
    return;
  }

  console.log("Starting user import process...");
  console.log(`Found ${files.length} CSV files to process`);

  const results: Array<{
    file: string;
    processed: number;
    success: number;
    failed: number;
  }> = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    console.log(`\nProcessing file: ${file}`);
    const result = await processCSVFile(filePath);
    results.push({ file, ...result });
    await archiveFile(filePath);
  }

  console.log("\nImport process summary:");
  results.forEach(({ file, processed, success, failed }) => {
    console.log(
      `${file}: ${processed} total, ${success} succeeded, ${failed} failed`,
    );
  });
}

main().catch((error) => {
  console.error("Error during import:", error);
  process.exit(1);
});
