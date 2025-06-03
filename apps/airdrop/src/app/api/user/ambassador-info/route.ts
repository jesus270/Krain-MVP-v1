import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { ambassadorTable, userTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@krain/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.walletAddress) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user by wallet address
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.walletAddress, session.user.walletAddress),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is an ambassador
    const ambassador = await db.query.ambassadorTable.findFirst({
      where: eq(ambassadorTable.userId, user.id),
    });

    return NextResponse.json({
      isAmbassador: !!ambassador,
      createdAt: ambassador?.createdAt || null,
      numberOfBadMonths: ambassador?.numberOfBadMonths || 0,
    });
  } catch (error) {
    console.error("Error fetching ambassador info:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 