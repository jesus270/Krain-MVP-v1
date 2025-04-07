import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@krain/db";
import { eq } from "drizzle-orm";
import { userTable } from "@krain/db";

export async function GET() {
  try {
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user data
    const userData = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, userId),
      with: {
        profile: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create response
    const response = NextResponse.json({
      id: userData.id,
      privyId: userData.privyId,
      email: userData.email,
      username: userData.username,
      profile: userData.profile,
    });

    // Set username cookie to be used by middleware for username checks
    // This avoids DB queries in middleware which isn't supported in Edge Runtime
    if (userData.username) {
      response.cookies.set("username", userData.username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    } else {
      // Clear the cookie if username is not set
      response.cookies.delete("username");
    }

    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
