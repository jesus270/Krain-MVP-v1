import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@repo/database";

// Create a single shared connection pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // Reduce max connections further
  connectionTimeoutMillis: 10000, // Increase connection timeout
  idleTimeoutMillis: 30000, // Increase idle timeout
  maxUses: 1000, // Reduce max uses to prevent connection issues
  allowExitOnIdle: true,
});

// Create a single drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for direct usage if needed
export { pool };

// Helper function to execute queries with retries
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (
        error instanceof Error &&
        error.message.includes("too many connections")
      ) {
        console.warn(
          `Database connection attempt ${i + 1} failed, retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Ensure connections are released on process exit
process.on("SIGTERM", () => {
  pool.end();
});

process.on("SIGINT", () => {
  pool.end();
});
