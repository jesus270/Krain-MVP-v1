import { NextRequest, NextResponse } from "next/server";
import { log } from "@krain/utils";
import { getSession } from "@krain/session/server";
import { getMergedUserForClient } from "@krain/session/server/user-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Log all headers for debugging
    const headerEntries = Array.from(request.headers.entries());
    log.info("User API request headers", {
      operation: "get_user",
      entity: "API",
      app: "airdrop",
      headers: Object.fromEntries(headerEntries),
    });

    // Try both casing variants for user ID header
    const userId =
      request.headers.get("x-user-id") || request.headers.get("X-User-Id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    log.info("Getting user data for airdrop app", {
      operation: "get_user",
      entity: "API",
      app: "airdrop",
      userId,
    });

    // 1. Get the session
    const session = await getSession(userId);

    // 2. Extract user data from session (if exists)
    const userFromSession = session ? session.get("user") : null;

    // 3. Call the shared function to get merged user data
    const mergedUser = await getMergedUserForClient(userId, userFromSession);

    if (!mergedUser) {
      log.error("Failed to get merged user data for airdrop app", {
        operation: "get_user",
        entity: "API",
        app: "airdrop",
        userId,
      });
      return NextResponse.json(
        { error: "Failed to retrieve user data" },
        { status: 404 },
      );
    }

    // 4. Optionally update the session if the merged user differs significantly
    //    or if session creation was implicitly handled by getSession middleware
    // if (session && shouldUpdateSession(userFromSession, mergedUser)) {
    //   session.set("user", mergedUser);
    //   session.set("isLoggedIn", true);
    //   await session.save();
    // }

    log.info("Successfully retrieved user data for airdrop app", {
      operation: "get_user_success",
      entity: "API",
      app: "airdrop",
      userId,
    });

    return NextResponse.json({ user: mergedUser });
  } catch (error) {
    // Ensure privyId type matches expected string | undefined for logging
    const privyId: string | undefined =
      request.headers.get("x-user-id") ||
      request.headers.get("X-User-Id") ||
      undefined;
    log.error("Failed to get user data for airdrop app", {
      operation: "get_user_error",
      entity: "API",
      app: "airdrop",
      userId: privyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to retrieve user data" },
      { status: 500 },
    );
  }
}
