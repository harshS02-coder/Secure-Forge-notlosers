import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { scanJobs, threatFindings } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { APKScanner, createAPKInput } from "../services/scanner";
import { LLMService } from "../services/llm";
import { RiskScorer } from "../services/risk-scorer";

export const scanRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        fileName: z.string().max(500),
        fileHash: z.string().length(64),
        fileSize: z.number().max(100 * 1024 * 1024),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;

      const result = await db.insert(scanJobs).values({
        ...(userId ? { userId } : {}),
        fileName: input.fileName,
        fileHash: input.fileHash,
        fileSize: input.fileSize,
        mimeType: input.mimeType ?? "application/vnd.android.package-archive",
        status: "pending",
      });

      const jobId = Number(result[0].insertId);

      const job = await db.query.scanJobs.findFirst({
        where: eq(scanJobs.id, jobId),
      });

      if (!job) {
        throw new Error("Failed to create scan job");
      }

      // Start async analysis
      analyzeAPKAsync(job.id, input.fileName, input.fileHash, input.fileSize);

      return job;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const job = await db.query.scanJobs.findFirst({
        where: eq(scanJobs.id, input.id),
      });
      return job || null;
    }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      const conditions = ctx.user
        ? eq(scanJobs.userId, ctx.user.id)
        : undefined;

      const jobs = await db
        .select()
        .from(scanJobs)
        .where(conditions)
        .orderBy(desc(scanJobs.createdAt))
        .limit(limit)
        .offset(offset);

      return jobs;
    }),

  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(scanJobs)
        .set({ status: "failed" })
        .where(eq(scanJobs.id, input.id));
      return { success: true };
    }),

  reanalyze: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const job = await db.query.scanJobs.findFirst({
        where: eq(scanJobs.id, input.id),
      });

      if (!job) return { success: false, error: "Job not found" };

      analyzeAPKAsync(job.id, job.fileName, job.fileHash, job.fileSize);

      return { success: true };
    }),
});

// ── Async Analysis Worker ───────────────────────────────────────────

async function analyzeAPKAsync(
  jobId: number,
  fileName: string,
  fileHash: string,
  fileSize: number
) {
  const db = getDb();
  const scanner = new APKScanner();
  const riskScorer = new RiskScorer();

  try {
    // Step 1: Mark as processing
    await db
      .update(scanJobs)
      .set({ status: "processing" })
      .where(eq(scanJobs.id, jobId));

    // Step 2: Static analysis
    const scanResult = await scanner.analyze(fileName, fileSize);

    await db
      .update(scanJobs)
      .set({
        permissions: scanResult.permissions,
        apis: scanResult.apis,
        staticScore: scanResult.staticScore,
        dynamicScore: scanResult.behaviorScore,
      })
      .where(eq(scanJobs.id, jobId));

    // Step 3: AI analysis
    const apkInput = createAPKInput(scanResult, fileName, fileHash, fileSize);
    const llmConfig = LLMService.getDefaultConfig();
    const provider = LLMService.getProvider(llmConfig);
    const aiResult = await provider.analyzeAPK(apkInput);

    // Step 4: Risk scoring
    const riskScore = riskScorer.calculate({
      staticScore: scanResult.staticScore,
      behaviorScore: scanResult.behaviorScore,
      aiThreats: aiResult.threats,
      permissions: scanResult.permissions,
    });

    // Step 5: Save threat findings
    for (const threat of aiResult.threats) {
      await db.insert(threatFindings).values({
        scanJobId: jobId,
        category: (threat.category?.toLowerCase() || "suspicious") as any,
        severity: (threat.severity?.toLowerCase() || "medium") as any,
        title: threat.title || "Unknown Threat",
        description: threat.description || null,
        evidence: threat.evidence || [],
        recommendation: threat.recommendation || null,
        aiAnalysis: threat.description || null,
      });
    }

    // Step 6: Mark complete
    await db
      .update(scanJobs)
      .set({
        status: "completed",
        riskScore: riskScore.score,
        riskLevel: riskScore.level,
        aiSummary: aiResult.summary,
        aiThreats: aiResult.threats,
        behaviorScore: scanResult.behaviorScore,
        completedAt: new Date(),
      })
      .where(eq(scanJobs.id, jobId));

  } catch (error) {
    console.error("Scan analysis error:", error);
    await db
      .update(scanJobs)
      .set({
        status: "failed",
        aiSummary: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(scanJobs.id, jobId));
  }
}