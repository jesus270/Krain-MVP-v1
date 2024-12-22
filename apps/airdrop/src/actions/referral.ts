"use server";

import { db, referralTable } from "@repo/database";
import { count, eq } from "drizzle-orm";

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

export const getReferralsCount = async (referralCode: string) => {
  const result = await db
    .select({ count: count() })
    .from(referralTable)
    .where(eq(referralTable.referredByCode, referralCode));

  return result[0]?.count ?? 0;
};
