import { NextRequest, NextResponse } from "next/server";
import { db } from "@krain/db";
import { userTable, userProfileTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = request.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Query user and profile data
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, userId),
      with: {
        profile: true,
      },
    });

    if (!user) {
      console.error("User not found in database for ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
}
