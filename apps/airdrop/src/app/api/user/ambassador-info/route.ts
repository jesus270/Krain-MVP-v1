import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { ambassadorTable, userTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { getSession } from "@krain/session";
import { log } from "@krain/utils";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userPrivyId = searchParams.get("privyId");
    if (!userPrivyId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }
    console.log("----------------------------------------");
    console.log("userPrivyId", userPrivyId);
    console.log("----------------------------------------");
    // const session = await getSession(userId);
    // const user = session?.get("user");
    // if (!user?.wallet?.address) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Find user by wallet address
    const dbUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, userPrivyId),
    });

    console.log("----------------------------------------");
    console.log("dbUser", dbUser);
    console.log("----------------------------------------");

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is an ambassador
    const ambassador = await db.query.ambassadorTable.findFirst({
      where: eq(ambassadorTable.userId, dbUser.id),
    });

    console.log("ambassador info", {
      userId: dbUser.id.toString(),
      ambassador: ambassador?.walletAddress.toString(),
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