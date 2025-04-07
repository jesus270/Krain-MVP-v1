"use server";

import { z } from "zod";
import { db } from "@krain/db";
import { eq } from "drizzle-orm";
import { userTable, userProfileTable } from "@krain/db";
import { cookies } from "next/headers";

// Form validation schema (same as client-side)
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  displayName: z
    .string()
    .max(100, "Display name must be less than 100 characters")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .nullable(),
  websiteUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(255, "Website URL must be less than 255 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  profilePictureUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(1024)
    .optional()
    .nullable()
    .or(z.literal("")),
  bannerPictureUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(1024)
    .optional()
    .nullable()
    .or(z.literal("")),
});

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  try {
    // Get current user ID from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user data
    const currentUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, userId),
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Validate form data
    const validatedData = profileSchema.parse(formData);

    // Check if username is already taken (but not by current user)
    if (validatedData.username) {
      const existingUser = await db.query.userTable.findFirst({
        where: eq(userTable.username, validatedData.username),
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return { success: false, error: "Username is already taken" };
      }
    }

    try {
      // Update username in user table
      await db
        .update(userTable)
        .set({ username: validatedData.username })
        .where(eq(userTable.id, currentUser.id));

      // Check if profile exists
      const existingProfile = await db.query.userProfileTable.findFirst({
        where: eq(userProfileTable.userId, currentUser.id),
      });

      if (existingProfile) {
        // Update existing profile
        await db
          .update(userProfileTable)
          .set({
            displayName: validatedData.displayName ?? null,
            bio: validatedData.bio ?? null,
            location: validatedData.location ?? null,
            websiteUrl: validatedData.websiteUrl || null,
            profilePictureUrl: validatedData.profilePictureUrl || null,
            bannerPictureUrl: validatedData.bannerPictureUrl || null,
            updatedAt: new Date(),
          })
          .where(eq(userProfileTable.userId, currentUser.id));
      } else {
        // Create new profile
        await db.insert(userProfileTable).values({
          userId: currentUser.id,
          displayName: validatedData.displayName ?? null,
          bio: validatedData.bio ?? null,
          location: validatedData.location ?? null,
          websiteUrl: validatedData.websiteUrl || null,
          profilePictureUrl: validatedData.profilePictureUrl || null,
          bannerPictureUrl: validatedData.bannerPictureUrl || null,
        });
      }

      // If a username was provided, set the username cookie
      if (validatedData.username) {
        // Set username cookie for middleware to check
        cookieStore.set("username", validatedData.username, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      }

      return { success: true, error: null };
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return { success: false, error: "Failed to update profile data" };
    }
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }

    return { success: false, error: "Failed to update profile" };
  }
}
