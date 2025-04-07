import { eq, sql, and } from "drizzle-orm";
import { db } from "./client";
import { userTable, telegramDailyMessageCountTable, type User } from "./schema";

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

export async function findUserByPrivyId(
  privyId: string,
): Promise<User | undefined> {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.privyId, privyId));
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

export async function getDailyMessageCount(
  userId: number,
  date: Date,
): Promise<number> {
  console.log(
    `🔍 Checking daily message count for user ${userId} on ${date.toISOString().split("T")[0]}`,
  );
  const result = await db
    .select({ messageCount: telegramDailyMessageCountTable.messageCount })
    .from(telegramDailyMessageCountTable)
    .where(
      and(
        eq(telegramDailyMessageCountTable.userId, userId),
        eq(telegramDailyMessageCountTable.date, sql`${date}::date`),
      ),
    );

  const count = result[0]?.messageCount ?? 0;
  console.log(`📊 User ${userId} has sent ${count} messages today`);
  return count;
}

export async function incrementDailyMessageCount(
  userId: number,
  date: Date,
): Promise<void> {
  console.log(
    `📝 Incrementing daily message count for user ${userId} on ${date.toISOString().split("T")[0]}`,
  );

  // Try to update existing record
  const result = await db
    .update(telegramDailyMessageCountTable)
    .set({
      messageCount: sql`${telegramDailyMessageCountTable.messageCount} + 1`,
    })
    .where(
      and(
        eq(telegramDailyMessageCountTable.userId, userId),
        eq(telegramDailyMessageCountTable.date, sql`${date}::date`),
      ),
    )
    .returning({ updatedCount: telegramDailyMessageCountTable.messageCount });

  // If no record exists, create one
  if (result.length === 0) {
    console.log(`✨ Creating new daily message record for user ${userId}`);
    await db.insert(telegramDailyMessageCountTable).values({
      userId,
      date: sql`${date}::date`,
      messageCount: 1,
    });
  } else {
    const newCount = result[0]?.updatedCount ?? 0;
    console.log(
      `✅ Updated daily message count for user ${userId} to ${newCount}`,
    );
  }
}

export async function getTotalMessagePoints(userId: number): Promise<number> {
  console.log(`🔍 Getting total message points for user ${userId}`);
  const result = await db
    .select({
      messageCount: sql`sum(${telegramDailyMessageCountTable.messageCount})::integer`,
    })
    .from(telegramDailyMessageCountTable)
    .where(eq(telegramDailyMessageCountTable.userId, userId));

  const totalMessages = Number(result[0]?.messageCount ?? 0);
  const points = totalMessages * 250;
  console.log(
    `📊 User ${userId} has sent ${totalMessages} messages total (${points} points)`,
  );
  return points;
}
