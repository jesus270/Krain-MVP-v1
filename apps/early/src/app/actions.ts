"use server";

import { db, earlyAccessSignupTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  getRedisClient,
  withAuth,
  withServerActionProtection,
} from "@krain/session";
import { defaultSessionConfig as sessionOptions } from "@krain/session";

export async function signupForEarlyAccess(input: { userId: string }) {
  // Validate origin and apply rate limiting
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default",
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  return withAuth(input.userId, async (session) => {
    const user = session.get("user");

    if (!user) throw new Error("No user in session");
    if (!user.email)
      throw new Error("Email is required for early access signup");

    // Check if user already signed up
    const existingSignup = await db
      .select()
      .from(earlyAccessSignupTable)
      .where(eq(earlyAccessSignupTable.email, user.email.address))
      .limit(1);

    if (existingSignup.length > 0) {
      throw new Error("Already signed up for early access");
    }

    // Create new signup
    await db.insert(earlyAccessSignupTable).values({
      email: user.email.address,
    });

    return {
      status: "success",
      message: "Successfully signed up for early access",
    };
  });
}

export async function checkEarlyAccessSignup(input: { userId: string }) {
  // Validate origin and apply rate limiting
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default",
  );
  if (protectionResponse) throw new Error(protectionResponse.statusText);

  return withAuth(input.userId, async (session) => {
    const user = session.get("user");
    if (!user) throw new Error("No user in session");
    if (!user.email) return { isSignedUp: false };

    // Check if user already signed up
    const existingSignup = await db
      .select()
      .from(earlyAccessSignupTable)
      .where(eq(earlyAccessSignupTable.email, user.email.address))
      .limit(1);

    return { isSignedUp: existingSignup.length > 0 };
  });
}
