import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const walletTable = pgTable("wallet", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
