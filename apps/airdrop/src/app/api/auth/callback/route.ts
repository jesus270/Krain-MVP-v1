"use server";

import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session/server";
import { log } from "@krain/utils";

export async function POST(request: NextRequest) {
  try {
    log.info("Handling auth callback request", {
      operation: "handle_callback_start",
      entity: "AUTH",
    });

    const result = await handleAuthCallback(request as any);

    // Create an explicit response to ensure proper JSON response
    const response = NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );

    log.info("Auth callback completed successfully", {
      operation: "handle_callback_success",
      entity: "AUTH",
      result,
    });

    return response;
  } catch (error) {
    log.error("Error handling auth callback", {
      operation: "handle_callback_error",
      entity: "AUTH",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to handle auth callback", success: false },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
