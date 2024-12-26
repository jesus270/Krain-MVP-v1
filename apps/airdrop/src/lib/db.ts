import { Pool, QueryResult, DatabaseError } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@repo/database";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Performance tuning constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const DB_TIMEOUT = 10000; // 10 seconds
const POOL_TIMEOUT = 30000; // 30 seconds
const MIN_POOL_SIZE = 5;
const MAX_POOL_SIZE = 20;
const MAX_USES_PER_CONNECTION = 10000;
const IDLE_TIMEOUT = 30000; // 30 seconds

// Create a singleton pool instance with optimized settings
let pool: Pool | null = null;

interface DbError extends Error {
  code?: string;
  severity?: string;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: MAX_POOL_SIZE,
      min: MIN_POOL_SIZE,
      connectionTimeoutMillis: POOL_TIMEOUT,
      idleTimeoutMillis: IDLE_TIMEOUT,
      maxUses: MAX_USES_PER_CONNECTION,
      allowExitOnIdle: true,
      statement_timeout: DB_TIMEOUT,
      query_timeout: DB_TIMEOUT,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: true }
          : false,
    });

    // Add event listeners for better monitoring
    pool.on("error", (err: DbError) => {
      console.error("[DB] Pool error:", {
        code: err.code,
        message: err.message,
        severity: err.severity,
      });
      // Reset pool on critical errors
      pool = null;
    });

    pool.on("connect", () => {
      const totalCount = pool?.totalCount ?? 0;
      const idleCount = pool?.idleCount ?? 0;
      if (process.env.NODE_ENV === "development") {
        console.debug("[DB] Pool status:", {
          total: totalCount,
          active: totalCount - idleCount,
        });
      }
    });

    // Handle pool removal
    process.on("SIGTERM", async () => {
      await pool?.end();
      pool = null;
    });
  }

  return pool;
}

// Wrapper for safe query execution with retries
export async function executeQuery<T extends QueryResult>(
  query: string,
  params: any[] = [],
  retries = MAX_RETRIES,
): Promise<T> {
  try {
    const client = await getPool().connect();
    try {
      return (await client.query(query, params)) as T;
    } finally {
      client.release();
    }
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return executeQuery(query, params, retries - 1);
    }
    throw error;
  }
}

function isRetryableError(error: any): boolean {
  const retryableCodes = ["40001", "40P01"]; // Serialization failure, deadlock detected
  return retryableCodes.includes(error.code);
}

// Create a drizzle instance with schema
export const db = drizzle(getPool(), { schema });

// Helper function to execute queries with timeouts
export async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DB_TIMEOUT,
): Promise<T> {
  const start = Date.now();
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn("[DB] Slow query detected:", {
        durationMs: duration,
        operation: "query",
      });
    }
    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Enhanced error handling with specific error types
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("timed out")) {
        console.error("[DB] Operation timed out:", {
          error,
          stack: error.stack,
        });
        throw new Error("Database operation timed out. Please try again.");
      }

      if (errorMessage.includes("server login has been failing")) {
        console.error("[DB] Authentication error:", {
          error,
          stack: error.stack,
        });
        pool = null;
        throw new Error("Database authentication failed. Please try again.");
      }

      if (errorMessage.includes("too many connections")) {
        console.error("[DB] Connection limit reached:", {
          error,
          stack: error.stack,
        });
        pool = null;
        throw new Error("Database is under high load. Please try again.");
      }

      if (errorMessage.includes("connection terminated")) {
        console.error("[DB] Connection terminated:", {
          error,
          stack: error.stack,
        });
        pool = null;
        throw new Error("Database connection lost. Please try again.");
      }

      if (errorMessage.includes("deadlock detected")) {
        console.error("[DB] Deadlock detected:", { error, stack: error.stack });
        throw new Error("Database conflict detected. Please try again.");
      }
    }
    throw error;
  }
}

// Helper function to execute queries with retries and exponential backoff
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

      // Don't retry certain errors
      if (
        lastError.message.includes("authentication failed") ||
        lastError.message.includes("permission denied")
      ) {
        throw lastError;
      }

      if (attempt <= retries) {
        // Exponential backoff with jitter
        currentDelay =
          Math.min(delay * Math.pow(2, attempt - 1), 5000) *
          (0.75 + Math.random() * 0.5);

        console.warn(
          `[DB] Retrying operation. Attempt ${attempt}/${retries}. Waiting ${Math.round(currentDelay)}ms...`,
          { error: lastError.message },
        );

        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  console.error("[DB] All retry attempts failed:", {
    code: (lastError as DbError)?.code,
    message: lastError?.message,
    operation: "retryable_query",
    severity: (lastError as DbError)?.severity,
  });
  throw lastError;
}

// Graceful shutdown handling
async function shutdownPool() {
  console.log("[DB] Initiating pool shutdown");
  if (pool) {
    try {
      await pool.end();
    } catch (error) {
      console.error("[DB] Pool shutdown error:", {
        code: (error as DbError)?.code,
        message: (error as Error)?.message,
        severity: (error as DbError)?.severity,
      });
    }
  }
}

// Ensure connections are released on process exit
process.on("SIGTERM", () => shutdownPool());
process.on("SIGINT", () => shutdownPool());
