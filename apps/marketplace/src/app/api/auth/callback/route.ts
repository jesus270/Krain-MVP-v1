import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";
import { createSessionConfig } from "@krain/session";

export async function POST(request: NextRequest) {
  try {
    const sessionConfig = createSessionConfig({
      cookieName: "krain-marketplace-session",
      password: process.env.SESSION_SECRET || "marketplace-dev-secret",
    });

    const response = await handleAuthCallback(request, sessionConfig);
    return response;
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
