import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@repo/database";

// Create a single shared connection pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduce max connections to prevent overwhelming the server
  connectionTimeoutMillis: 3000, // Reduce connection timeout
  idleTimeoutMillis: 5000, // Reduce idle timeout
  maxUses: 5000, // Close connection after this many uses
  allowExitOnIdle: true,
});

// Create a single drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for direct usage if needed
export { pool };

// Ensure connections are released on process exit
process.on("SIGTERM", () => {
  pool.end();
});

process.on("SIGINT", () => {
  pool.end();
});
