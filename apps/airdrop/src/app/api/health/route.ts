import { NextResponse } from "next/server";
import { getPool, executeQuery } from "@/lib/db";
import { QueryResult } from "@neondatabase/serverless";

interface HealthMetrics {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  database: {
    status: boolean;
    connectionCount?: number;
    latency?: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    heapUsedPercentage: number;
  };
  uptime: number;
  lastError?: string;
}

interface HealthCheckResult extends QueryResult {
  rows: [{ "?column?": 1 }];
}

async function checkDbConnection() {
  const startTime = Date.now();
  const pool = getPool();
  try {
    const result = await executeQuery<HealthCheckResult>("SELECT 1");
    console.log("health check result", result);
    const latency = Date.now() - startTime;

    return {
      status: true,
      connectionCount: pool.totalCount,
      latency,
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      status: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET(request: Request) {
  const dbStatus = await checkDbConnection();
  const memUsage = process.memoryUsage();

  const metrics: HealthMetrics = {
    status: dbStatus.status ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      connectionCount: dbStatus.connectionCount,
      latency: dbStatus.latency,
    },
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsedPercentage: Math.round(
        (memUsage.heapUsed / memUsage.heapTotal) * 100,
      ),
    },
    uptime: Math.round(process.uptime()),
  };

  // Set degraded status if memory usage is high
  if (metrics.memory.heapUsedPercentage > 85) {
    metrics.status = "degraded";
  }

  // Add CORS headers for monitoring services
  const headers = new Headers({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  if (process.env.MONITORING_ORIGINS) {
    const allowedOrigins = process.env.MONITORING_ORIGINS.split(",").map(
      (origin) => origin.trim(),
    );
    const requestOrigin = request.headers.get("origin");

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      headers.set("Access-Control-Allow-Origin", requestOrigin);
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      headers.set("Access-Control-Max-Age", "86400");
      headers.set("Access-Control-Allow-Headers", "Content-Type");

      // If this is a preflight request, return immediately
      if (request.method === "OPTIONS") {
        return new NextResponse(null, { headers, status: 204 });
      }
    }
  }

  return NextResponse.json(metrics, {
    status:
      metrics.status === "healthy"
        ? 200
        : metrics.status === "degraded"
          ? 429
          : 503,
    headers,
  });
}
