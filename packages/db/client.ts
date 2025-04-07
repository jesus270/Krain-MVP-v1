import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (typeof window !== "undefined") {
  throw new Error("Database client cannot be used on the client side");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure connection with retry logic and increased timeout
const sql = neon(process.env.DATABASE_URL, {
  fetchOptions: {
    // Increase timeout to 30 seconds
    timeout: 30000,
    // Add retry logic
    retryOptions: {
      retries: 3,
      retryDelay: 1000,
      retryBackoff: true,
    },
  },
});

export const db = drizzle(sql, { schema });
