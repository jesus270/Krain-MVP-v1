import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { referralTable } from "@/db/schema";

export async function getReferral({
  referredByCode,
  referredWalletAddress,
}: {
  referredByCode: string;
  referredWalletAddress: string;
}) {
  return await db.query.referralTable.findFirst({
    where: and(
      eq(referralTable.referredByCode, referredByCode),
      eq(referralTable.referredWalletAddress, referredWalletAddress)
    ),
  });
}

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
