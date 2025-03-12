import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";

export async function POST(request: NextRequest) {
  try {
    // Simply pass the request to the handleAuthCallback function
    // It will use the default session config internally
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
