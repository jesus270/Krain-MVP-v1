import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session";
import { sessionConfig } from "../../layout";

export async function POST(request: NextRequest) {
  try {
    // Use the shared session config from layout
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
