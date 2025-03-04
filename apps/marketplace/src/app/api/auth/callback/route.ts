import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";
import { createSessionConfig } from "@krain/session";

export async function POST(request: NextRequest) {
  try {
    // Create session config with just the password string
    const sessionSecret =
      process.env.SESSION_SECRET || "marketplace-dev-secret";
    const sessionConfig = createSessionConfig(sessionSecret);

    // Pass the request to the handleAuthCallback function
    const response = await handleAuthCallback(request);
    return response;
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
