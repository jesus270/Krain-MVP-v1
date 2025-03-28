import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@krain/session";
import { log } from "@krain/utils";

export async function POST(request: Request) {
  try {
    const privyData = await request.json();

    if (!privyData.id) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    const user = await createOrUpdateUser(privyData);

    return NextResponse.json({ user });
  } catch (error) {
    log.error("Error in user creation/update", {
      operation: "create_update_user_api",
      entity: "USER",
      error,
    });

    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 },
    );
  }
}
