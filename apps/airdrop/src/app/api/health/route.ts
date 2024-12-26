import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { redis } from "@/lib/redis";

export async function GET() {
  const healthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
    },
  };

  try {
    // Check database
    const pool = getPool();
    await pool.query("SELECT 1");
    healthStatus.services.database = "healthy";
  } catch (error) {
    healthStatus.status = "error";
    healthStatus.services.database = "unhealthy";
    console.error("[HEALTH] Database check failed", {
      operation: "health_check",
      service: "database",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    // Check Redis
    await redis.ping();
    healthStatus.services.redis = "healthy";
  } catch (error) {
    healthStatus.status = "error";
    healthStatus.services.redis = "unhealthy";
    console.error("[HEALTH] Redis check failed", {
      operation: "health_check",
      service: "redis",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }

  const status = healthStatus.status === "ok" ? 200 : 503;
  return NextResponse.json(healthStatus, { status });
}
