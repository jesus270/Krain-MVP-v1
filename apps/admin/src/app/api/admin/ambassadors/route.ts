import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { ambassadorTable, userTable } from "@krain/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { walletAddress, userId, numberOfBadMonths } = await request.json();

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
      where: eq(ambassadorTable.walletAddress, walletAddress),
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
        userId: userId,
        walletAddress,
        numberOfBadMonths: numberOfBadMonths,
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

// DELETE /api/admin/ambassadors?id=123
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Ambassador id is required" }, { status: 400 });
  }
  try {
    const deleted = await db.delete(ambassadorTable).where(eq(ambassadorTable.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ambassador:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/ambassadors?id=123
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Ambassador id is required" }, { status: 400 });
  }
  try {
    const { numberOfBadMonths } = await request.json();
    if (typeof numberOfBadMonths !== "number" || numberOfBadMonths < 0) {
      return NextResponse.json({ message: "Invalid numberOfBadMonths" }, { status: 400 });
    }
    await db.update(ambassadorTable)
      .set({ numberOfBadMonths })
      .where(eq(ambassadorTable.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating ambassador:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 