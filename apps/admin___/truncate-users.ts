import { db } from "@krain/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Starting user truncation...");

  try {
    // Delete related records first to maintain referential integrity
    await db.execute(sql`DELETE FROM "userProfile" WHERE "userId" > 37`);
    await db.execute(sql`DELETE FROM "favoriteAgent" WHERE "userId" > 37`);
    await db.execute(sql`DELETE FROM "review" WHERE "userId" > 37`);

    // Then delete the users
    await db.execute(sql`DELETE FROM "user" WHERE id > 37`);

    console.log("Successfully truncated users while preserving IDs 1-37");
  } catch (error) {
    console.error("Error during truncation:", error);
    process.exit(1);
  }
}

main();
