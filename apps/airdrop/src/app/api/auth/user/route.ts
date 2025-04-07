import { NextResponse } from "next/server";
import { db } from "@krain/db";
import { userTable, userProfileTable, privyWalletTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { log } from "@krain/utils";
import type { PrivyUserData } from "@krain/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const privyData: PrivyUserData = await request.json();

    // First check if user exists
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, privyData.id),
      with: {
        profile: true,
      },
    });

    // Convert string[] to LinkedAccount[]
    const linkedAccounts = (privyData.linkedAccounts || []).map((account) => ({
      type: "wallet" as const,
      address: account,
    }));

    if (existingUser) {
      // Update existing user
      const [user] = await db
        .update(userTable)
        .set({
          email: privyData.email,
          walletAddress: privyData.wallet?.address,
          linkedAccounts,
        })
        .where(eq(userTable.privyId, privyData.id))
        .returning();

      return NextResponse.json({ user });
    }

    // Create new user
    const [user] = await db
      .insert(userTable)
      .values({
        privyId: privyData.id,
        email: privyData.email,
        walletAddress: privyData.wallet?.address,
        linkedAccounts,
        isGuest: false,
        hasAcceptedTerms: false,
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Create profile
    await db.insert(userProfileTable).values({
      userId: user.id,
    });

    // Create wallet record if exists
    if (privyData.wallet?.address) {
      await db
        .insert(privyWalletTable)
        .values({
          address: privyData.wallet.address,
          chainType: "solana",
          verifiedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [privyWalletTable.address],
          set: {
            verifiedAt: new Date(),
          },
        });
    }

    return NextResponse.json({ user });
  } catch (error) {
    log.error("Error creating/updating user", {
      operation: "create_update_user",
      entity: "API",
      error,
    });
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 },
    );
  }
}
