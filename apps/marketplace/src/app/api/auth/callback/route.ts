import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";
import { sessionConfig } from "../../../../lib/session";

export async function POST(request: NextRequest) {
  try {
    // Pass the request to the handleAuthCallback function
    // The handleAuthCallback function will use the defaultSessionConfig if no config is passed
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
