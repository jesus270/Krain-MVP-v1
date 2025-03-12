import { db } from "@krain/db";
import { agentTable, featuredAgentTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";
import featuredAgentIds from "../src/app/featured-agents.json";

async function migrateFeaturedAgents() {
  console.log("Starting migration of featured agents to database...");

  // Clear existing featured agents
  await db.delete(featuredAgentTable);
  console.log("Cleared existing featured agents");

  // Get the agent names from the original featured agent IDs
  // This is a workaround since the original IDs don't match the database IDs
  const agentNames = [
    "KEKE Terminal", // agent_035
    "Victorai", // agent_043
    "LiveArt AI Agent", // agent_031
    "Klaus AI Agent", // agent_032
    "Hey Anon", // agent_030
  ];

  // For each agent name, find the corresponding agent in the database and mark it as featured
  for (let i = 0; i < agentNames.length; i++) {
    const name = agentNames[i];
    const agent = await db.query.agentTable.findFirst({
      where: (agents) => eq(agents.name, name as string),
    });

    if (agent) {
      await db.insert(featuredAgentTable).values({
        agentId: agent.id,
        order: i, // Use the index as the order
      });
      console.log(
        `Added ${name} (ID: ${agent.id}) as featured agent with order ${i}`,
      );
    } else {
      console.log(`Could not find agent with name: ${name}`);
    }
  }

  console.log("Migration of featured agents completed!");
}

// Run the migration
migrateFeaturedAgents()
  .then(() => {
    console.log("Featured agents migration script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during featured agents migration:", error);
    process.exit(1);
  });
