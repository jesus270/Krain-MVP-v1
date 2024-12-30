import { NextResponse } from "next/server";
import {
  getRedisClient,
  withRateLimit,
  getRateLimitHeaders,
  getCurrentUser,
} from "@krain/session";
import { sessionOptions } from "@/lib/session-config";
import { log } from "@krain/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request as any, "auth");
    if (rateLimitResponse) return rateLimitResponse;

    // Only log at debug level for session verification attempts
    if (process.env.NODE_ENV === "development") {
      log.info("Processing session verification", {
        entity: "API-auth/verify",
        operation: "verify_session",
      });
    }

    const user = await getCurrentUser(await getRedisClient(), sessionOptions);

    // If no user found, return 401 but don't log a warning since this is expected
    if (!user) {
      return NextResponse.json(
        { error: "No active session", isLoggedIn: false, user: null },
        { status: 401 },
      );
    }

    // Only log successful verifications in development
    if (process.env.NODE_ENV === "development") {
      log.info("Session verified successfully", {
        entity: "API-auth/verify",
        operation: "verify_session",
        userId: user.id,
        walletAddress: user.walletAddress,
      });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user,
    });
  } catch (error) {
    // Only log actual errors
    log.error(error, {
      entity: "API-auth/verify",
      operation: "verify_session",
    });

    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 },
    );
  }
}
