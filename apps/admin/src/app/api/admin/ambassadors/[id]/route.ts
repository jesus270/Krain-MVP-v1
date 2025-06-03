import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { ambassadorTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { numberOfBadMonths } = await request.json();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid ambassador ID" },
        { status: 400 }
      );
    }

    if (typeof numberOfBadMonths !== "number" || numberOfBadMonths < 0) {
      return NextResponse.json(
        { message: "Invalid number of bad months" },
        { status: 400 }
      );
    }

    const [updatedAmbassador] = await db
      .update(ambassadorTable)
      .set({
        numberOfBadMonths,
        updatedAt: new Date(),
      })
      .where(eq(ambassadorTable.id, id))
      .returning();

    if (!updatedAmbassador) {
      return NextResponse.json(
        { message: "Ambassador not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAmbassador);
  } catch (error) {
    console.error("Error updating ambassador:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid ambassador ID" },
        { status: 400 }
      );
    }

    const [deletedAmbassador] = await db
      .delete(ambassadorTable)
      .where(eq(ambassadorTable.id, id))
      .returning();

    if (!deletedAmbassador) {
      return NextResponse.json(
        { message: "Ambassador not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedAmbassador);
  } catch (error) {
    console.error("Error deleting ambassador:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 