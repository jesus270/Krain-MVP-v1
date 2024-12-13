import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});