import { NextResponse } from "next/server";
import { getMemoryUsage, PerformanceMonitor } from "@/lib/performance";

export async function GET() {
  try {
    const memoryUsage = getMemoryUsage();
    const performanceMonitor = PerformanceMonitor.getInstance();
    const metrics = performanceMonitor.getMetrics();

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memoryUsage,
      performance: metrics,
      version: process.env.npm_package_version || "unknown",
      nodeVersion: process.version,
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}
