import { NextRequest, NextResponse } from "next/server";
import { db, userTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { log } from "@krain/utils";
import { getSession } from "@krain/session";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const session = await getSession(userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const user = session.get("user");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch latest user data from database
    const dbUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Database user not found" },
        { status: 404 },
      );
    }

    // Merge database user data with session user data
    const updatedUser = {
      ...user,
      telegramUserId: dbUser.telegramUserId,
      telegramUsername: dbUser.telegramUsername,
      hasJoinedTelegramCommunity: dbUser.hasJoinedTelegramCommunity,
      hasJoinedTelegramAnnouncement: dbUser.hasJoinedTelegramAnnouncement,
      telegramCommunityMessageCount: dbUser.telegramCommunityMessageCount,
    };

    // Update session with latest user data
    session.set("user", updatedUser);
    await session.save();

    log.info("Updated user session with latest data", {
      operation: "update_user_session",
      entity: "API",
      userId: user.id,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    log.error("Failed to update user session", {
      operation: "update_user_session",
      entity: "API",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to update user session" },
      { status: 500 },
    );
  }
}
