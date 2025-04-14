import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@krain/session/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Apply rate limiting with higher limits for health checks
  const rateLimitResponse = await withRateLimit(request.headers, "api");
  if (rateLimitResponse) return rateLimitResponse;

  return NextResponse.json({ status: "ok" });
}
