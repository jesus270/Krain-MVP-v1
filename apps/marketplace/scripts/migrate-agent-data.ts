import { db } from "@krain/db";
import {
  agentTable,
  agentCategoryTable,
  agentTagTable,
} from "@krain/db/schema";
import { eq } from "drizzle-orm";
import { agents } from "../src/app/agent-data";

async function migrateAgentData() {
  console.log("Starting migration of agent data to database...");

  // Step 1: Extract unique categories and insert them
  const uniqueCategories = [...new Set(agents.map((agent) => agent.category))];
  console.log(`Found ${uniqueCategories.length} unique categories`);

  for (const category of uniqueCategories) {
    // Check if category already exists
    const existingCategory = await db.query.agentCategoryTable.findFirst({
      where: (categories) => eq(categories.name, category),
    });

    if (!existingCategory) {
      await db.insert(agentCategoryTable).values({
        name: category,
        description: `Agents related to ${category}`,
      });
      console.log(`Created category: ${category}`);
    } else {
      console.log(`Category already exists: ${category}`);
    }
  }

  // Step 2: Extract unique tags and insert them
  const allTags = agents.flatMap((agent) => agent.tags);
  const uniqueTags = [...new Set(allTags)];
  console.log(`Found ${uniqueTags.length} unique tags`);

  for (const tag of uniqueTags) {
    // Check if tag already exists
    const existingTag = await db.query.agentTagTable.findFirst({
      where: (tags) => eq(tags.name, tag),
    });

    if (!existingTag) {
      await db.insert(agentTagTable).values({
        name: tag,
        description: `Agents tagged with ${tag}`,
      });
      console.log(`Created tag: ${tag}`);
    } else {
      console.log(`Tag already exists: ${tag}`);
    }
  }

  // Step 3: Insert agents
  console.log(`Migrating ${agents.length} agents...`);

  for (const agent of agents) {
    // Check if agent already exists (using name as a unique identifier)
    const existingAgent = await db.query.agentTable.findFirst({
      where: (agentRecord) => eq(agentRecord.name, agent.name),
    });

    if (!existingAgent) {
      await db.insert(agentTable).values({
        name: agent.name,
        rating: agent.rating,
        reviewsCount: agent.reviewsCount,
        category: agent.category,
        tags: agent.tags,
        description: agent.description || "",
        imageUrl: agent.imageUrl || "",
        blockchainsSupported: agent.blockchainsSupported,
        tokenSymbol: agent.tokenSymbol || "",
        tokenName: agent.tokenName || "",
        cmcTokenLink: agent.cmcTokenLink || "",
        websiteUrl: agent.websiteUrl || "",
        supportEmail: agent.supportEmail || "",
        companyName: agent.companyName || "",
        contactName: agent.contactName || "",
        contactEmail: agent.contactEmail || "",
        contactPhone: agent.contactPhone || "",
        pricing: agent.pricing,
        industryFocus: agent.industryFocus,
        socialMedia: agent.socialMedia,
      });
      console.log(`Created agent: ${agent.name}`);
    } else {
      console.log(`Agent already exists: ${agent.name}`);
    }
  }

  console.log("Migration completed successfully!");
}

// Run the migration
migrateAgentData()
  .then(() => {
    console.log("Migration script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during migration:", error);
    process.exit(1);
  });
