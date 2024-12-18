import { db, referralTable } from "database";

export async function createReferral({
  referredByCode,
  referredWalletAddress,
}: {
  referredByCode: string;
  referredWalletAddress: string;
}) {
  return await db.insert(referralTable).values({
    referredByCode,
    referredWalletAddress,
  });
}
