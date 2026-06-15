import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { scanJobs, threatFindings } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reportRouter = createRouter({
  getByScanId: publicQuery
    .input(z.object({ scanId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const scan = await db.query.scanJobs.findFirst({
        where: eq(scanJobs.id, input.scanId),
      });

      if (!scan) return null;

      const findings = await db
        .select()
        .from(threatFindings)
        .where(eq(threatFindings.scanJobId, input.scanId))
        .orderBy(threatFindings.severity);

      const criticalCount = findings.filter((f) => f.severity === "critical").length;
      const highCount = findings.filter((f) => f.severity === "high").length;
      const mediumCount = findings.filter((f) => f.severity === "medium").length;
      const lowCount = findings.filter((f) => f.severity === "low").length;

      return {
        scan,
        findings,
        summary: {
          totalThreats: findings.length,
          criticalCount,
          highCount,
          mediumCount,
          lowCount,
          aiExecutiveSummary: scan.aiSummary || "No summary available",
          recommendations: [
            "Review all detected permissions and remove unnecessary ones",
            "Monitor network traffic for suspicious outbound connections",
            "Run the application in an isolated sandbox environment",
            "Consider blocking known malicious domains at the network level",
            "Implement application whitelisting on enterprise devices",
          ],
        },
      };
    }),

  getFindings: publicQuery
    .input(z.object({ scanId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(threatFindings)
        .where(eq(threatFindings.scanJobId, input.scanId))
        .orderBy(threatFindings.severity);
    }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      const conditions = input?.severity
        ? eq(threatFindings.severity, input.severity)
        : undefined;

      return db
        .select()
        .from(threatFindings)
        .where(conditions)
        .orderBy(desc(threatFindings.createdAt))
        .limit(limit)
        .offset(offset);
    }),
});
