import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { scanJobs, threatFindings } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import type { DashboardStats, ScanTimelineItem } from "@contracts/types";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async ({ ctx }) => {
    const db = getDb();

    const conditions = ctx.user
      ? eq(scanJobs.userId, ctx.user.id)
      : undefined;

    const allScans = await db
      .select()
      .from(scanJobs)
      .where(conditions);

    const allFindings = await db
      .select()
      .from(threatFindings);

    const completedScans = allScans.filter((s) => s.status === "completed");
    const criticalCount = allFindings.filter((f) => f.severity === "critical").length;
    const highCount = allFindings.filter((f) => f.severity === "high").length;
    const mediumCount = allFindings.filter((f) => f.severity === "medium").length;
    const lowCount = allFindings.filter((f) => f.severity === "low").length;

    const avgRisk = completedScans.length > 0
      ? Math.round(
          completedScans.reduce((sum, s) => sum + (s.riskScore || 0), 0) /
            completedScans.length
        )
      : 0;

    const stats: DashboardStats = {
      totalScans: allScans.length,
      totalThreats: allFindings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      scansThisWeek: allScans.filter((s) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return s.createdAt >= weekAgo;
      }).length,
      averageRiskScore: avgRisk,
    };

    return stats;
  }),

  threatTrends: publicQuery.query(async () => {
    const db = getDb();
    const findings = await db.select().from(threatFindings);

    const categories: Record<string, { count: number; severity: string }> = {};
    for (const f of findings) {
      if (!categories[f.category]) {
        categories[f.category] = { count: 0, severity: f.severity };
      }
      categories[f.category].count++;
    }

    return Object.entries(categories).map(([name, data]) => ({
      name,
      count: data.count,
      severity: data.severity,
    }));
  }),

  timeline: publicQuery.query(async () => {
    const db = getDb();
    const scans = await db
      .select()
      .from(scanJobs)
      .orderBy(desc(scanJobs.createdAt))
      .limit(30);

    const timeline: ScanTimelineItem[] = scans.map((s) => ({
      date: s.createdAt.toISOString().split("T")[0],
      count: 1,
      riskLevel: s.riskLevel || "low",
    }));

    return timeline;
  }),

  recentScans: publicQuery
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const limit = input?.limit || 10;

      const conditions = ctx.user
        ? eq(scanJobs.userId, ctx.user.id)
        : undefined;

      return db
        .select()
        .from(scanJobs)
        .where(conditions)
        .orderBy(desc(scanJobs.createdAt))
        .limit(limit);
    }),
});
