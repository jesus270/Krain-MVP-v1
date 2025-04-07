"use server";

import { getTotalMessagePoints, findUserByPrivyId } from "@krain/db/telegram";
import { log } from "@krain/utils";

export async function getTelegramMessagePoints({
  userId,
}: {
  userId: string;
}): Promise<number> {
  try {
    log.info("Getting telegram message points", {
      entity: "SERVER",
      operation: "get_telegram_message_points",
      userId,
      timestamp: new Date().toISOString(),
    });

    // Find the database user using the privy ID
    const user = await findUserByPrivyId(userId);

    if (!user) {
      log.warn("User not found for telegram message points", {
        entity: "SERVER",
        operation: "get_telegram_message_points",
        userId,
        timestamp: new Date().toISOString(),
      });
      return 0;
    }

    // Use the numeric user.id from the database
    const points = await getTotalMessagePoints(user.id);

    log.info("Successfully got telegram message points", {
      entity: "SERVER",
      operation: "get_telegram_message_points",
      userId,
      dbUserId: user.id,
      points,
      timestamp: new Date().toISOString(),
    });

    return points;
  } catch (error) {
    log.error("Failed to get telegram message points", {
      entity: "SERVER",
      operation: "get_telegram_message_points",
      userId,
      error,
      timestamp: new Date().toISOString(),
    });
    return 0;
  }
}
