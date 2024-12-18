import { db } from "@/db";
import { referralTable } from "@/db/schema";

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
