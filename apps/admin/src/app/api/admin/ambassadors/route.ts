import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { ambassadorTable, userTable } from "@krain/db";
import { eq, and, ilike, sql } from "drizzle-orm";

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
        userId: user.id,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Build where clause for search
    let whereClause = undefined;
    if (search) {
      whereClause = ilike(ambassadorTable.walletAddress, `%${search}%`);
    }

    // Get total count for pagination
    let total = 0;
    if (whereClause) {
      const countResult = await db
        .select({ count: sql`count(*)::int` })
        .from(ambassadorTable)
        .where(whereClause);
      total = Number(countResult[0]?.count) || 0;
    } else {
      const countResult = await db
        .select({ count: sql`count(*)::int` })
        .from(ambassadorTable);
      total = Number(countResult[0]?.count) || 0;
    }

    // Fetch paginated ambassadors with user
    const ambassadors = await db.query.ambassadorTable.findMany({
      where: whereClause,
      with: { user: true },
      limit,
      offset,
      orderBy: (ambassadorTable.createdAt ? [ambassadorTable.createdAt] : undefined),
    });

    return NextResponse.json({ data: ambassadors, total });
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