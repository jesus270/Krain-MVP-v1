"use server";

import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";
import { log } from "@krain/utils";

export async function POST(request: NextRequest) {
  try {
    return await handleAuthCallback(request);
  } catch (error) {
    log.error(error, {
      entity: "API-auth/callback",
      operation: "handle_callback",
      error,
    });
    return NextResponse.json(
      { error: "Failed to handle auth callback" },
      { status: 500 },
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
