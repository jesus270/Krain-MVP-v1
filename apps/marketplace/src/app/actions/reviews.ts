"use server";

import { db } from "@krain/db";
import {
  reviewTable,
  userTable,
  agentTable,
  userProfileTable,
} from "@krain/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Helper function to get the user ID from Privy ID
 * Will create a user record if one doesn't exist
 */
async function getUserIdFromPrivyId(
  privyUserId: string,
): Promise<number | null> {
  if (!privyUserId) {
    console.error("getUserIdFromPrivyId called with empty privyUserId");
    return null;
  }

  try {
    // Try to find the user by privyId in our database
    console.log(`Looking up user with Privy ID: ${privyUserId}`);
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, privyUserId),
    });

    // If user exists, return their ID
    if (user?.id) {
      console.log(`Found existing user with ID: ${user.id}`);
      return user.id;
    }

    // If user doesn't exist, create a new user record
    console.log(
      `No user found with Privy ID: ${privyUserId}, creating new user`,
    );

    try {
      // Insert the new user
      const result = await db
        .insert(userTable)
        .values({
          privyId: privyUserId,
          createdAt: new Date(),
          privyCreatedAt: new Date(),
          isGuest: false,
          hasAcceptedTerms: true,
          // Add minimal required fields with default values
          role: "user",
        })
        .returning();

      console.log("User creation result:", result);

      // If we successfully created a user, fetch and return their ID
      if (result && result.length > 0) {
        const newUser = await db.query.userTable.findFirst({
          where: eq(userTable.privyId, privyUserId),
        });

        if (newUser?.id) {
          console.log(`Successfully created new user with ID: ${newUser.id}`);
          return newUser.id;
        }
      }

      console.error("Failed to retrieve ID from newly created user");
    } catch (insertError) {
      // If there's an error during insert, try to find the user again
      console.error("Error creating user:", insertError);

      const retryUser = await db.query.userTable.findFirst({
        where: eq(userTable.privyId, privyUserId),
      });

      if (retryUser?.id) {
        console.log(`Found user on retry with ID: ${retryUser.id}`);
        return retryUser.id;
      }
    }

    console.error("Failed to create or find user record");
    return null;
  } catch (error) {
    console.error("Error in getUserIdFromPrivyId:", error);
    return null;
  }
}

/**
 * Submit a review for an agent
 */
export async function submitReview({
  agentId,
  rating,
  review,
  privyUserId,
}: {
  agentId: number;
  rating: number;
  review?: string;
  privyUserId: string;
}) {
  try {
    console.log("Starting review submission for agent:", agentId);
    console.log("Privy user ID:", privyUserId);

    if (!privyUserId) {
      console.error("Missing Privy user ID");
      throw new Error("You must be logged in to submit a review");
    }

    // Get database user ID from Privy ID
    const userId = await getUserIdFromPrivyId(privyUserId);
    console.log("Database user ID retrieved:", userId);

    if (!userId) {
      console.error("Failed to get or create user from Privy ID:", privyUserId);
      throw new Error(
        "User not found in database and could not be created. Please refresh your session.",
      );
    }

    // Check if user has already reviewed this agent
    console.log("Checking for existing review");
    const existingReview = await db.query.reviewTable.findFirst({
      where: and(
        eq(reviewTable.userId, userId),
        eq(reviewTable.agentId, agentId),
      ),
    });

    console.log("Existing review:", existingReview ? "Yes" : "No");

    // Remove transaction and perform operations sequentially
    if (existingReview) {
      console.log("Updating existing review");
      // Update existing review
      await db
        .update(reviewTable)
        .set({
          rating,
          review,
        })
        .where(
          and(eq(reviewTable.userId, userId), eq(reviewTable.agentId, agentId)),
        );
    } else {
      console.log("Creating new review");
      // Create new review
      await db.insert(reviewTable).values({
        userId,
        agentId,
        rating,
        review,
        createdAt: new Date(),
      });
    }

    // Update agent average rating and review count
    console.log("Updating agent rating");
    const reviews = await db.query.reviewTable.findMany({
      where: eq(reviewTable.agentId, agentId),
    });

    console.log("Total reviews for agent:", reviews.length);
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    console.log("New average rating:", averageRating);
    await db
      .update(agentTable)
      .set({
        rating: averageRating,
        reviewsCount: reviews.length,
      })
      .where(eq(agentTable.id, agentId));

    console.log("Review submission completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);

    // Try to provide more helpful error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error submitting review";

    throw new Error(`Failed to submit review: ${errorMessage}`);
  }
}

/**
 * Check if a user has already reviewed an agent
 */
export async function hasUserReviewedAgent({
  agentId,
  privyUserId,
}: {
  agentId: number;
  privyUserId: string;
}) {
  if (!privyUserId) {
    return null;
  }

  // Get database user ID from Privy ID
  const userId = await getUserIdFromPrivyId(privyUserId);

  if (!userId) {
    return null;
  }

  const existingReview = await db.query.reviewTable.findFirst({
    where: and(
      eq(reviewTable.userId, userId),
      eq(reviewTable.agentId, agentId),
    ),
  });

  return existingReview;
}

/**
 * Get reviews for an agent
 */
export async function getAgentReviews({
  agentId,
  privyUserId,
}: {
  agentId: number;
  privyUserId?: string;
}) {
  // Get all reviews for this agent
  const reviews = await db.query.reviewTable.findMany({
    where: eq(reviewTable.agentId, agentId),
    with: {
      user: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: desc(reviewTable.createdAt),
  });

  return reviews;
}

/**
 * Get reviews created by a specific user
 */
export async function getUserReviews({ userId }: { userId: number }) {
  // Get all reviews written by this user
  const reviews = await db.query.reviewTable.findMany({
    where: eq(reviewTable.userId, userId),
    with: {
      agent: true,
    },
    orderBy: desc(reviewTable.createdAt),
  });

  return reviews;
}
