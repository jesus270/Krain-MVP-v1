import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { userTable, type User } from "./schema";

export type TelegramChannelType = "community" | "announcement";

export async function findUserByWallet(
  walletAddress: string,
): Promise<User | undefined> {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.walletAddress, walletAddress));
  return users[0];
}

export async function findUserByTelegramId(
  telegramUserId: string,
): Promise<User | undefined> {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.telegramUserId, telegramUserId));
  return users[0];
}

export async function updateUserTelegramInfo(
  userId: number,
  telegramUserId: string,
  telegramUsername: string,
): Promise<void> {
  await db
    .update(userTable)
    .set({
      telegramUserId,
      telegramUsername,
    })
    .where(eq(userTable.id, userId));
}

export async function recordTelegramChannelJoin(
  userId: number,
  channelType: TelegramChannelType,
): Promise<void> {
  await db
    .update(userTable)
    .set(
      channelType === "community"
        ? { hasJoinedTelegramCommunity: true }
        : { hasJoinedTelegramAnnouncement: true },
    )
    .where(eq(userTable.id, userId));
}

export async function incrementTelegramCommunityMessageCount(
  userId: number,
): Promise<void> {
  await db
    .update(userTable)
    .set({
      telegramCommunityMessageCount: sql`${userTable.telegramCommunityMessageCount} + 1`,
    })
    .where(eq(userTable.id, userId));
}

export async function getTelegramChannelMemberships(
  userId: number,
): Promise<TelegramChannelType[]> {
  const user = await db
    .select({
      hasJoinedTelegramCommunity: userTable.hasJoinedTelegramCommunity,
      hasJoinedTelegramAnnouncement: userTable.hasJoinedTelegramAnnouncement,
    })
    .from(userTable)
    .where(eq(userTable.id, userId));

  if (!user[0]) return [];

  const memberships: TelegramChannelType[] = [];
  if (user[0].hasJoinedTelegramCommunity) memberships.push("community");
  if (user[0].hasJoinedTelegramAnnouncement) memberships.push("announcement");
  return memberships;
}
