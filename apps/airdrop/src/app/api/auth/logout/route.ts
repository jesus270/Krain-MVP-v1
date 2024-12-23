import { NextResponse } from "next/server";
import { clearPrivyUser } from "@/lib/auth";

export async function POST() {
  try {
    await clearPrivyUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SERVER] Error in logout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
