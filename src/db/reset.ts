import { db } from "./index";
import { walletTable } from "./schema";

const resetDatabase = async () => {
  const tables = [
    {
      name: "wallet",
      table: walletTable,
    },
  ];

  try {
    for (const table of tables) {
      console.info(`Deleting all data in ${table.name} table`);
      await db.transaction(async (tx) => {
        await tx.delete(table.table).execute();
      });
      console.info(`Deleted all data in ${table.name} table`);
    }
    console.info("All deletions completed");
  } catch (error) {
    console.error("Error during database reset:", error);
  }
};

resetDatabase();
