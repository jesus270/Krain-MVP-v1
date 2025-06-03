import { db } from "@krain/db";
import { walletTable } from "@krain/db/schema";
import { eq, or, isNull, sql, and, isNotNull } from "drizzle-orm";
import { generateReferralCode } from "@krain/utils";

const BATCH_SIZE = 1000; // Process 1000 wallets at a time
const MAX_CODE_GENERATION_ATTEMPTS = 100;
const VALID_REFERRAL_CODE_REGEX_PATTERN = "^[2-9A-HJ-NP-Z]{6}$";
const VALID_REFERRAL_CODE_REGEX = new RegExp(VALID_REFERRAL_CODE_REGEX_PATTERN);

async function regenerateReferralCodes() {
  console.log(
    `Starting referral code regeneration process. Batch size: ${BATCH_SIZE}`,
  );

  let totalProcessedInLastLoop = 0;
  let totalWalletsFlagReset = 0;
  let totalWalletsCodeRegenerated = 0;
  let totalWalletsFailedToRegenerate = 0;
  let totalBatchesProcessed = 0;

  try {
    do {
      totalProcessedInLastLoop = 0;
      totalBatchesProcessed++;
      console.log(`
--- Processing Batch ${totalBatchesProcessed} ---`);

      // 1. Find a batch of wallets that might need processing.
      // A wallet needs processing if:
      // a) Its referralCodeRegenerated flag is true (covers NULL codes as per user info, and any other flagged codes)
      // b) Or its code is present (NOT NULL) and invalid (wrong length/characters)
      const walletsToProcess = await db
        .select({
          address: walletTable.address,
          currentReferralCode: walletTable.referralCode,
          isFlaggedForRegen: walletTable.referralCodeRegenerated,
        })
        .from(walletTable)
        .where(
          or(
            eq(walletTable.referralCodeRegenerated, true),
            and(
              isNotNull(walletTable.referralCode),
              sql`${walletTable.referralCode} !~ (${VALID_REFERRAL_CODE_REGEX_PATTERN})::text`
            )
          )
        )
        .limit(BATCH_SIZE);

      totalProcessedInLastLoop = walletsToProcess.length;

      if (totalProcessedInLastLoop === 0) {
        console.log("No more wallets match the criteria. Process finished.");
        break;
      }

      console.log(`Found ${totalProcessedInLastLoop} wallet(s) in this batch to examine.`);

      for (const wallet of walletsToProcess) {
        const codeIsActuallyValid = wallet.currentReferralCode && VALID_REFERRAL_CODE_REGEX.test(wallet.currentReferralCode);

        if (codeIsActuallyValid) {
          // Code is valid. If flag was true, it just needs to be reset.
          if (wallet.isFlaggedForRegen) {
            try {
              await db
                .update(walletTable)
                .set({ referralCodeRegenerated: false })
                .where(eq(walletTable.address, wallet.address));
              console.log(
                `Wallet ${wallet.address}: Code is valid. Reset referralCodeRegenerated flag.`,
              );
              totalWalletsFlagReset++;
            } catch (updateError) {
                console.error(`Wallet ${wallet.address}: Failed to reset flag. Error: ${updateError}`);
            }
          } else {
            // Code is valid and flag is already false. Should not happen with the updated WHERE clause logic, but safe to skip.
            console.log(
              `Wallet ${wallet.address}: Code is valid and flag already false. Skipping. (Potentially unexpected path with new query logic)`,
            );
          }
        } else {
          // Code is NULL or invalid. Needs regeneration.
          // (If NULL, isFlaggedForRegen should be true based on user's info)
          console.log(
            `Wallet ${wallet.address}: Code '${wallet.currentReferralCode}' (Flagged: ${wallet.isFlaggedForRegen}) is NULL or invalid. Regenerating...`,
          );
          let newReferralCode: string | null = null;
          let attempts = 0;

          while (attempts < MAX_CODE_GENERATION_ATTEMPTS) {
            attempts++;
            const candidateCode = generateReferralCode(6);
            try {
                const existing = await db
                .select({ address: walletTable.address })
                .from(walletTable)
                .where(eq(walletTable.referralCode, candidateCode))
                .limit(1);

                if (existing.length === 0) {
                newReferralCode = candidateCode;
                break;
                }
            } catch (dbCheckError) {
                console.error(`Wallet ${wallet.address}: DB error checking uniqueness for code ${candidateCode}. Attempt ${attempts}. Error: ${dbCheckError}`);
            }
            if (attempts > 1 && attempts % 10 === 0) {
                console.log(`Wallet ${wallet.address}: Attempt ${attempts} to generate unique code...`);
            }
          }

          if (newReferralCode) {
            try {
              await db
                .update(walletTable)
                .set({
                  referralCode: newReferralCode,
                  referralCodeRegenerated: false,
                })
                .where(eq(walletTable.address, wallet.address));
              console.log(
                `Wallet ${wallet.address}: Successfully regenerated code to ${newReferralCode}.`,
              );
              totalWalletsCodeRegenerated++;
            } catch (updateError) {
                console.error(`Wallet ${wallet.address}: Failed to update with new code ${newReferralCode}. Error: ${updateError}`);
                totalWalletsFailedToRegenerate++;
            }
          } else {
            console.error(
              `Wallet ${wallet.address}: Failed to generate a unique referral code after ${MAX_CODE_GENERATION_ATTEMPTS} attempts. Skipping.`,
            );
            totalWalletsFailedToRegenerate++;
          }
        }
      }
      console.log(`--- Batch ${totalBatchesProcessed} Summary ---`);
      // These counts are global, not per-batch in this version of logging.
      console.log(`Total wallets with flag reset so far: ${totalWalletsFlagReset}`);
      console.log(`Total wallets with code regenerated so far: ${totalWalletsCodeRegenerated}`);
      console.log(`Total wallets failed to regenerate so far: ${totalWalletsFailedToRegenerate}`);

    } while (totalProcessedInLastLoop > 0);

  } catch (error) {
    console.error("Error during referral code regeneration process:", error);
  } finally {
    console.log(`
--- Final Summary ---`);
    console.log(`Total batches processed: ${totalBatchesProcessed > 0 ? totalBatchesProcessed -1 : 0}`);
    console.log(`Total wallets where flag was reset: ${totalWalletsFlagReset}`);
    console.log(`Total wallets where code was regenerated: ${totalWalletsCodeRegenerated}`);
    console.log(`Total wallets that failed to regenerate: ${totalWalletsFailedToRegenerate}`);
    console.log("Exiting script.");
  }
}

regenerateReferralCodes()
  .then(() => {
    console.log("Script finished main execution path successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed with unhandled error:", error);
    process.exit(1);
  }); 