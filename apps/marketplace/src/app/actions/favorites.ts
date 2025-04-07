"use server";

import { db } from "@krain/db";
import { favoriteAgentTable, userTable } from "@krain/db";
import { eq, and } from "drizzle-orm";

/**
 * Helper function to get the user ID from Privy ID
 * Will create a user record if one doesn't exist
 */
async function getUserIdFromPrivyId(
  privyUserId: string,
): Promise<number | null> {
  if (!privyUserId) return null;

  try {
    // Try to find the user by privyId in our database
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, privyUserId),
      columns: {
        id: true,
      },
    });

    // If user exists, return their ID
    if (user?.id) {
      return user.id;
    }

    // If user doesn't exist, create a new user record
    console.log(`Creating new user record for Privy ID: ${privyUserId}`);

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
        .returning({ id: userTable.id });

      // Return the new user's ID
      if (result && result.length > 0 && result[0] !== undefined) {
        return result[0].id;
      }
    } catch (insertError) {
      // If there's an error during insert, try to find the user again
      // (in case of race conditions where another process created the user)
      console.error("Error inserting user:", insertError);

      const retryUser = await db.query.userTable.findFirst({
        where: eq(userTable.privyId, privyUserId),
        columns: {
          id: true,
        },
      });

      if (retryUser?.id) {
        return retryUser.id;
      }
    }

    console.error("Failed to create or find user record");
    return null;
  } catch (error) {
    console.error("Error managing user ID:", error);
    return null;
  }
}

/**
 * Toggles favorite status for an agent
 * If the agent is already a favorite, it will be removed
 * If the agent is not a favorite, it will be added
 */
export async function toggleFavoriteAgent(
  agentId: number,
  privyUserId: string,
) {
  if (!privyUserId) {
    throw new Error("You must be logged in to favorite an agent");
  }

  // Get database user ID from Privy ID
  const userId = await getUserIdFromPrivyId(privyUserId);

  if (!userId) {
    throw new Error(
      "User not found in database and could not be created. Please refresh your session.",
    );
  }

  // Check if agent is already favorited
  const existingFavorite = await db.query.favoriteAgentTable.findFirst({
    where: and(
      eq(favoriteAgentTable.userId, userId),
      eq(favoriteAgentTable.agentId, agentId),
    ),
  });

  // If already favorited, remove it
  if (existingFavorite) {
    await db
      .delete(favoriteAgentTable)
      .where(
        and(
          eq(favoriteAgentTable.userId, userId),
          eq(favoriteAgentTable.agentId, agentId),
        ),
      );
    return false; // Return false to indicate it's no longer favorited
  }

  // Otherwise, add it to favorites
  await db.insert(favoriteAgentTable).values({
    userId,
    agentId,
  });

  return true; // Return true to indicate it's now favorited
}

/**
 * Checks if an agent is favorited by the current user
 */
export async function isAgentFavorited(agentId: number, privyUserId: string) {
  if (!privyUserId) {
    return false;
  }

  // Get database user ID from Privy ID
  const userId = await getUserIdFromPrivyId(privyUserId);

  if (!userId) {
    return false;
  }

  const existingFavorite = await db.query.favoriteAgentTable.findFirst({
    where: and(
      eq(favoriteAgentTable.userId, userId),
      eq(favoriteAgentTable.agentId, agentId),
    ),
  });

  return !!existingFavorite;
}

/**
 * Gets all favorited agents for the current user
 */
export async function getFavoritedAgents(privyUserId: string) {
  if (!privyUserId) {
    return [];
  }

  // Get database user ID from Privy ID
  const userId = await getUserIdFromPrivyId(privyUserId);

  if (!userId) {
    return [];
  }

  const favorites = await db.query.favoriteAgentTable.findMany({
    where: eq(favoriteAgentTable.userId, userId),
    with: {
      agent: true,
    },
  });

  return favorites;
}
