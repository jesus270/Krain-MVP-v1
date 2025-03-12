import { NextRequest, NextResponse } from "next/server";
import { sessionConfig } from "../../../lib/session";

export async function GET(request: NextRequest) {
  // Only allow this in development for security
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Only available in development" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    sessionConfigured: true,
    // Don't return the actual password, just check if it's using fallback
    usingFallback: !process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}
