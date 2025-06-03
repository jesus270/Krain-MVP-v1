import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { ambassadorTable, userTable } from "@krain/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { message: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find user by wallet address
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.walletAddress, walletAddress),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already an ambassador
    const existingAmbassador = await db.query.ambassadorTable.findFirst({
      where: eq(ambassadorTable.userId, user.id),
    });

    if (existingAmbassador) {
      return NextResponse.json(
        { message: "User is already an ambassador" },
        { status: 400 }
      );
    }

    // Create new ambassador
    const [ambassador] = await db
      .insert(ambassadorTable)
      .values({
        userId: user.id,
        walletAddress,
        numberOfBadMonths: 0,
      })
      .returning();

    return NextResponse.json(ambassador);
  } catch (error) {
    console.error("Error adding ambassador:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ambassadors = await db.query.ambassadorTable.findMany({
      with: {
        user: true,
      },
    });

    return NextResponse.json(ambassadors);
  } catch (error) {
    console.error("Error fetching ambassadors:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 