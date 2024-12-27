import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { redis } from "@/lib/redis";
import { log } from "@/lib/logger";

interface HealthStatus {
  status: "ok" | "error" | "degraded";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: "healthy" | "unhealthy" | "unknown";
    redis: "healthy" | "unhealthy" | "unknown";
  };
  details?: {
    database?: string;
    redis?: string;
  };
}

export async function GET() {
  const healthStatus: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "unknown",
      redis: "unknown",
    },
    details: {},
  };

  try {
    // Check database
    const startTime = Date.now();
    const pool = getPool();
    await pool.query("SELECT 1");
    const dbLatency = Date.now() - startTime;

    healthStatus.services.database = "healthy";
    healthStatus.details!.database = `Latency: ${dbLatency}ms`;

    log.info("Database health check passed", {
      entity: "API-health",
      operation: "health_check",
      service: "database",
      latency: dbLatency,
    });
  } catch (error) {
    healthStatus.status = "error";
    healthStatus.services.database = "unhealthy";
    healthStatus.details!.database =
      error instanceof Error ? error.message : String(error);

    log.error(error, {
      entity: "API-health",
      operation: "health_check",
      service: "database",
    });
  }

  try {
    // Check Redis
    const startTime = Date.now();
    await redis.ping();
    const redisLatency = Date.now() - startTime;

    healthStatus.services.redis = "healthy";
    healthStatus.details!.redis = `Latency: ${redisLatency}ms`;

    log.info("Redis health check passed", {
      entity: "API-health",
      operation: "health_check",
      service: "redis",
      latency: redisLatency,
    });
  } catch (error) {
    healthStatus.status = "error";
    healthStatus.services.redis = "unhealthy";
    healthStatus.details!.redis =
      error instanceof Error ? error.message : String(error);

    log.error(error, {
      entity: "API-health",
      operation: "health_check",
      service: "redis",
    });
  }

  // If some services are healthy but not all, mark as degraded
  if (
    healthStatus.status !== "error" &&
    Object.values(healthStatus.services).some(
      (status) => status === "unhealthy",
    )
  ) {
    healthStatus.status = "degraded";
  }

  const status =
    healthStatus.status === "ok"
      ? 200
      : healthStatus.status === "degraded"
        ? 207
        : 503;

  log.info(`Health check completed with status: ${healthStatus.status}`, {
    entity: "API-health",
    operation: "health_check",
    status: healthStatus.status,
    services: healthStatus.services,
  });

  return NextResponse.json(healthStatus, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
