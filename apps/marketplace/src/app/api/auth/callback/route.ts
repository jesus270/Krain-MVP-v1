import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";
import { log } from "@krain/utils";

export async function POST(request: NextRequest) {
  try {
    log.info("Auth callback requested", {
      entity: "API",
      operation: "auth_callback",
    });

    // Simply pass the request to the handleAuthCallback function
    // It will use the default session config internally
    const response = await handleAuthCallback(request);
    return response;
  } catch (error) {
    log.error("Error in auth callback:", {
      entity: "API",
      operation: "auth_callback",
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
