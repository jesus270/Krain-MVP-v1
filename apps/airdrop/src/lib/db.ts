import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@repo/database";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds
const DB_TIMEOUT = 30000; // 30 seconds
const POOL_TIMEOUT = 45000; // 45 seconds

// Create a singleton pool instance
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Increased max connections
      connectionTimeoutMillis: POOL_TIMEOUT,
      idleTimeoutMillis: 20000, // 20 seconds idle timeout
      maxUses: 10000, // Increased max uses per connection
      allowExitOnIdle: true,
      statement_timeout: DB_TIMEOUT, // Add statement timeout
      query_timeout: DB_TIMEOUT, // Add query timeout
    });
  }
  return pool;
}

// Create a drizzle instance with schema
export const db = drizzle(getPool(), { schema });

// Helper function to execute queries with timeouts
export async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DB_TIMEOUT,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        console.error("[DB] Operation timed out:", error);
        throw new Error("Database operation timed out. Please try again.");
      }
      if (error.message.includes("server login has been failing")) {
        console.error("[DB] Server login failing:", error);
        // Reset pool on login failures
        pool = null;
        throw new Error(
          "Database connection issue. Please try again in a moment.",
        );
      }
      if (error.message.includes("too many connections")) {
        console.error("[DB] Too many connections:", error);
        // Reset pool on connection limit errors
        pool = null;
        throw new Error("Database is busy. Please try again in a moment.");
      }
      if (error.message.includes("Connection terminated")) {
        console.error("[DB] Connection terminated:", error);
        // Reset pool on terminated connections
        pool = null;
        throw new Error("Database connection lost. Please try again.");
      }
    }
    throw error;
  }
}

// Helper function to execute queries with retries
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY,
): Promise<T> {
  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await executeWithTimeout(operation());
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt <= retries) {
        // Exponential backoff with jitter
        currentDelay =
          Math.min(delay * Math.pow(2, attempt - 1), 10000) *
          (0.75 + Math.random() * 0.5);
        console.log(
          `[DB] Retrying operation. Attempt ${attempt} of ${retries}. Waiting ${Math.round(currentDelay)}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  console.error("[DB] All retry attempts failed:", lastError);
  throw lastError;
}

// Ensure connections are released on process exit
process.on("SIGTERM", async () => {
  console.log("[DB] Shutting down pool on SIGTERM");
  if (pool) {
    await pool.end();
    pool = null;
  }
});

process.on("SIGINT", async () => {
  console.log("[DB] Shutting down pool on SIGINT");
  if (pool) {
    await pool.end();
    pool = null;
  }
});
