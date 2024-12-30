import { Pool, QueryResult, DatabaseError } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@krain/db";
import { log } from "@krain/utils";

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

const CIRCUIT_BREAKER = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  failures: 0,
  lastFailure: 0,
};

function shouldBreakCircuit(): boolean {
  const now = Date.now();
  // Reset failures if enough time has passed
  if (now - CIRCUIT_BREAKER.lastFailure > CIRCUIT_BREAKER.resetTimeout) {
    CIRCUIT_BREAKER.failures = 0;
    return false;
  }
  return CIRCUIT_BREAKER.failures >= CIRCUIT_BREAKER.failureThreshold;
}

function recordFailure() {
  CIRCUIT_BREAKER.failures++;
  CIRCUIT_BREAKER.lastFailure = Date.now();
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
      log.error(err, {
        operation: "pool_error",
        entity: "DB",
        code: err.code,
        severity: err.severity,
      });
      // Reset pool on critical errors
      pool = null;
    });

    pool.on("connect", () => {
      const totalCount = pool?.totalCount ?? 0;
      const idleCount = pool?.idleCount ?? 0;
      if (process.env.NODE_ENV === "development") {
        log.info("Pool connection established", {
          operation: "pool_connect",
          entity: "DB",
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
      log.warn("Slow query detected", {
        operation: "query",
        entity: "DB",
        durationMs: duration,
      });
    }
    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Enhanced error handling with specific error types
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("timed out")) {
        log.error(error, {
          operation: "timeout",
          entity: "DB",
        });
        throw new Error("Database operation timed out. Please try again.");
      }

      if (errorMessage.includes("server login has been failing")) {
        log.error(error, {
          operation: "auth_error",
          entity: "DB",
        });
        pool = null;
        throw new Error("Database authentication failed. Please try again.");
      }

      if (errorMessage.includes("too many connections")) {
        log.error(error, {
          operation: "connection_limit",
          entity: "DB",
        });
        pool = null;
        throw new Error("Database is under high load. Please try again.");
      }

      if (errorMessage.includes("connection terminated")) {
        log.error(error, {
          operation: "connection_terminated",
          entity: "DB",
        });
        pool = null;
        throw new Error("Database connection lost. Please try again.");
      }

      if (errorMessage.includes("deadlock detected")) {
        log.error(error, {
          operation: "deadlock",
          entity: "DB",
        });
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
  if (shouldBreakCircuit()) {
    throw new Error(
      "Database circuit breaker active - too many recent failures",
    );
  }

  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await executeWithTimeout(operation());
      // Reset circuit breaker on success
      CIRCUIT_BREAKER.failures = 0;
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Record failure for circuit breaker
      recordFailure();

      // Don't retry certain errors
      if (
        lastError.message.includes("authentication failed") ||
        lastError.message.includes("permission denied")
      ) {
        throw lastError;
      }

      if (attempt <= retries && !shouldBreakCircuit()) {
        currentDelay =
          Math.min(delay * Math.pow(2, attempt - 1), 5000) *
          (0.75 + Math.random() * 0.5);

        log.warn("Operation retry scheduled", {
          operation: "retry",
          entity: "DB",
          attempt,
          maxRetries: retries,
          nextAttemptMs: Math.round(currentDelay),
        });

        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  log.error(lastError || new Error("Unknown error"), {
    operation: "retry_failed",
    entity: "DB",
    code: (lastError as DbError)?.code,
    severity: (lastError as DbError)?.severity,
  });
  throw lastError;
}

// Graceful shutdown handling
async function shutdownPool() {
  log.info("Initiating pool shutdown", {
    operation: "shutdown",
    entity: "DB",
  });
  if (pool) {
    try {
      await pool.end();
    } catch (error) {
      log.error(error, {
        operation: "shutdown_error",
        entity: "DB",
        code: (error as DbError)?.code,
        severity: (error as DbError)?.severity,
      });
    }
  }
}

// Ensure connections are released on process exit
process.on("SIGTERM", () => shutdownPool());
process.on("SIGINT", () => shutdownPool());
