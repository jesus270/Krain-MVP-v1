import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function POST() {
  try {
    await clearUserSession();
    log.info("User logged out successfully", {
      entity: "API-auth/logout",
      operation: "logout",
      status: "success",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error(error, {
      entity: "API-auth/logout",
      operation: "logout",
      status: "error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
