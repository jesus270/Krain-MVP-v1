import { NextRequest, NextResponse } from "next/server";
import { db, userTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { log } from "@krain/utils";
import { getSession, getRedisClient } from "@krain/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Log all headers for debugging
    const headerEntries = Array.from(request.headers.entries());
    log.info("User API request headers", {
      operation: "get_user",
      entity: "API",
      headers: Object.fromEntries(headerEntries),
    });

    // Try both casing variants for user ID header
    const userId =
      request.headers.get("x-user-id") || request.headers.get("X-User-Id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    log.info("Getting user session", {
      operation: "get_user",
      entity: "API",
      userId,
    });

    const session = await getSession(userId);

    // If no session exists, we should check if user exists in DB anyway
    // This helps with situations where a session might not be fully established
    const dbUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database", userId },
        { status: 404 },
      );
    }

    // If we have a DB user but no session, we'll construct a minimal user object
    if (!session) {
      log.warn("No session found but user exists in DB", {
        operation: "get_user",
        entity: "API",
        userId,
        dbUserId: dbUser.id,
      });

      // Create a new session for this user
      const redisClient = await getRedisClient();
      const sessionUser = {
        id: userId,
        createdAt: dbUser.createdAt,
        wallet: dbUser.walletAddress
          ? { address: dbUser.walletAddress }
          : undefined,
        email: dbUser.email ? { address: dbUser.email } : undefined,
        linkedAccounts: dbUser.linkedAccounts
          ? dbUser.linkedAccounts
              .map((account) => {
                // Keep existing string accounts (though schema suggests this shouldn't happen)
                if (typeof account === "string") return account;
                // Check if the account object has an address property and it's truthy
                if (account && "address" in account && account.address) {
                  return account.address;
                }
                // Return null for accounts without a usable address
                return null;
              })
              // Filter out the null values, leaving only valid string addresses
              .filter((acc): acc is string => acc !== null)
          : [],
        telegramUserId: dbUser.telegramUserId || undefined,
        telegramUsername: dbUser.telegramUsername || undefined,
        hasJoinedTelegramCommunity:
          dbUser.hasJoinedTelegramCommunity || undefined,
        hasJoinedTelegramAnnouncement:
          dbUser.hasJoinedTelegramAnnouncement || undefined,
        telegramCommunityMessageCount:
          dbUser.telegramCommunityMessageCount || undefined,
        role: "user",
      };

      try {
        // Import the Session class and config
        const { Session } = await import("@krain/session");
        const { defaultSessionConfig } = await import("@krain/session");

        // Create a new session with isLoggedIn flag set to true
        const newSession = await Session.create({
          userId,
          data: {
            user: sessionUser,
            isLoggedIn: true,
          },
          redis: redisClient,
          options: defaultSessionConfig,
        });

        await newSession.save();

        log.info("Created new session for existing user", {
          operation: "create_session",
          entity: "API",
          userId,
        });
      } catch (sessionError) {
        log.error("Failed to create session", {
          operation: "create_session",
          entity: "API",
          userId,
          error:
            sessionError instanceof Error
              ? sessionError.message
              : String(sessionError),
        });
      }

      // Return the user data immediately, even if session creation failed
      return NextResponse.json({ user: sessionUser });
    }

    const user = session.get("user");
    if (!user) {
      log.warn("Session exists but no user in session", {
        operation: "get_user",
        entity: "API",
        userId,
        sessionData: "Session has no user data",
      });

      // Again, return minimal user data from DB
      const minimalUser = {
        id: userId,
        createdAt: dbUser.createdAt,
        wallet: dbUser.walletAddress
          ? { address: dbUser.walletAddress }
          : undefined,
        email: dbUser.email ? { address: dbUser.email } : undefined,
        linkedAccounts: dbUser.linkedAccounts
          ? dbUser.linkedAccounts
              .map((account) => {
                // Keep existing string accounts (though schema suggests this shouldn't happen)
                if (typeof account === "string") return account;
                // Check if the account object has an address property and it's truthy
                if (account && "address" in account && account.address) {
                  return account.address;
                }
                // Return null for accounts without a usable address
                return null;
              })
              // Filter out the null values, leaving only valid string addresses
              .filter((acc): acc is string => acc !== null)
          : [],
        telegramUserId: dbUser.telegramUserId || undefined,
        telegramUsername: dbUser.telegramUsername || undefined,
        hasJoinedTelegramCommunity:
          dbUser.hasJoinedTelegramCommunity || undefined,
        hasJoinedTelegramAnnouncement:
          dbUser.hasJoinedTelegramAnnouncement || undefined,
        telegramCommunityMessageCount:
          dbUser.telegramCommunityMessageCount || undefined,
      };

      return NextResponse.json({ user: minimalUser });
    }

    // Merge database user data with session user data
    const updatedUser = {
      ...user,
      // Always prefer latest DB data for these fields if available
      wallet: dbUser.walletAddress
        ? { address: dbUser.walletAddress }
        : user.wallet, // Fallback to session wallet if DB has no address
      email: dbUser.email ? { address: dbUser.email } : user.email, // Fallback to session email
      // Construct twitter object from dbUser fields if available, otherwise use session's
      twitter: dbUser.twitterSubject // Use twitterSubject as indicator of linked twitter in DB
        ? {
            subject: dbUser.twitterSubject,
            handle: dbUser.twitterHandle,
            name: dbUser.twitterName,
            profilePictureUrl: dbUser.twitterProfilePictureUrl,
            // Map dbUser.twitterHandle to username for SessionUser consistency
            username: dbUser.twitterHandle,
          }
        : user.twitter,
      telegramUserId: dbUser.telegramUserId || undefined,
      telegramUsername: dbUser.telegramUsername || undefined,
      hasJoinedTelegramCommunity:
        dbUser.hasJoinedTelegramCommunity || undefined,
      hasJoinedTelegramAnnouncement:
        dbUser.hasJoinedTelegramAnnouncement || undefined,
      telegramCommunityMessageCount:
        dbUser.telegramCommunityMessageCount || undefined,
    };

    // Update session with latest user data
    session.set("user", updatedUser);
    await session.save();

    log.info("Updated user session with latest data", {
      operation: "update_user_session",
      entity: "API",
      userId: user.id,
      user: updatedUser,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    log.error("Failed to update user session", {
      operation: "update_user_session",
      entity: "API",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to update user session" },
      { status: 500 },
    );
  }
}
