import { NextRequest, NextResponse } from "next/server";
import { db } from "@krain/db";
import { userTable, userProfileTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";
import { log } from "@krain/utils";
import { getSession, User } from "@krain/session";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie or header
    const userId =
      request.cookies.get("user_id")?.value || request.headers.get("x-user-id");

    if (!userId) {
      log.warn("User API called without user ID", {
        entity: "API",
        operation: "get_user",
        headers: Object.fromEntries(request.headers),
        cookies: request.cookies.getAll().map((c) => c.name),
      });
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    log.info("Fetching user data", {
      entity: "API",
      operation: "get_user",
      userId,
    });

    // Verify session is valid
    const session = await getSession(userId);
    if (!session?.get("isLoggedIn")) {
      log.warn("User session invalid or not logged in", {
        entity: "API",
        operation: "get_user",
        userId,
      });
      return NextResponse.json({ error: "Session invalid" }, { status: 401 });
    }

    // Get sessionUser from session as fallback
    const sessionUser = session.get("user") as User | undefined;
    let dbUser = null;

    // Try to get the user from the database, but don't fail if DB is unavailable
    try {
      // Query user and profile data
      dbUser = await db.query.userTable.findFirst({
        where: eq(userTable.privyId, userId),
        with: {
          profile: true,
        },
      });
    } catch (dbError) {
      log.error("Failed to fetch user from database", {
        entity: "API",
        operation: "get_user_db",
        userId,
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      // Don't return an error - continue with session data
    }

    if (!dbUser && !sessionUser) {
      log.error("User not found in database or session", {
        entity: "API",
        operation: "get_user",
        userId,
      });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create user object based on available data
    const user: User = {
      id: userId,
      createdAt: dbUser?.createdAt || sessionUser?.createdAt || new Date(),
      wallet: dbUser?.walletAddress
        ? { address: dbUser.walletAddress }
        : sessionUser?.wallet,
      email: dbUser?.email ? { address: dbUser.email } : sessionUser?.email,
      linkedAccounts: dbUser?.linkedAccounts
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
        : (sessionUser?.linkedAccounts ?? []), // Fallback to session user accounts or empty array
      role: dbUser?.role || sessionUser?.role || "user",
    };

    log.info("User data fetched successfully", {
      entity: "API",
      operation: "get_user",
      userId,
      source: dbUser ? "database" : "session",
    });

    // Return the user data
    return NextResponse.json({ user });
  } catch (error) {
    log.error("Error fetching user data", {
      entity: "API",
      operation: "get_user",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
}
