import { NextRequest, NextResponse } from "next/server";
import {
  getRedisClient,
  withRateLimit,
  clearUserSession,
} from "@krain/session/server";
import { log } from "@krain/utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request.headers, "auth");
    if (rateLimitResponse) return rateLimitResponse as any;

    log.info("Processing logout request", {
      entity: "API-auth/logout",
      operation: "logout",
    });

    const data = await request.json();
    if (!data.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    await clearUserSession(data.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error(error, {
      entity: "API-auth/logout",
      operation: "logout",
    });

    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
