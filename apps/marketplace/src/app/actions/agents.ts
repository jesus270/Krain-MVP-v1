"use server";

import { db } from "@krain/db";
import {
  agentTable,
  agentCategoryTable,
  agentTagTable,
  featuredAgentTable,
  Agent,
} from "@krain/db";
import { eq, or, asc } from "drizzle-orm";

/**
 * Get all agents from the database
 */
export async function getAllAgents(): Promise<Agent[]> {
  return db.query.agentTable.findMany();
}

/**
 * Get an agent by ID
 */
export async function getAgentById(id: string): Promise<Agent | null> {
  // Convert string ID to number for database lookup
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return null;
  }

  const agent = await db.query.agentTable.findFirst({
    where: (agents) => eq(agents.id, numericId),
  });

  return agent || null;
}

/**
 * Get featured agents from the database
 */
export async function getFeaturedAgents(): Promise<Agent[]> {
  const featuredAgents = await db.query.featuredAgentTable.findMany({
    with: {
      agent: true,
    },
    orderBy: asc(featuredAgentTable.order),
  });

  return featuredAgents.map((fa) => fa.agent);
}

/**
 * Get all agent categories
 */
export async function getAllCategories(): Promise<string[]> {
  const categories = await db.query.agentCategoryTable.findMany();
  return categories.map((category) => category.name);
}

/**
 * Get all agent tags
 */
export async function getAllTags(): Promise<string[]> {
  const tags = await db.query.agentTagTable.findMany();
  return tags.map((tag) => tag.name);
}

/**
 * Get agents filtered by category
 */
export async function getAgentsByCategory(category: string): Promise<Agent[]> {
  return db.query.agentTable.findMany({
    where: (agents) => eq(agents.category, category),
  });
}
