import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { llmConfigs, users } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  getLLMConfigs: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(llmConfigs)
      .where(eq(llmConfigs.userId, ctx.user.id));
  }),

  addLLMConfig: authedQuery
    .input(
      z.object({
        provider: z.enum(["openai", "groq", "anthropic", "gemini", "local"]),
        apiKey: z.string().min(1),
        modelName: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // If this is the first config, make it default
      const existing = await db
        .select()
        .from(llmConfigs)
        .where(eq(llmConfigs.userId, ctx.user.id));

      await db.insert(llmConfigs).values({
        userId: ctx.user.id,
        provider: input.provider,
        apiKey: input.apiKey,
        modelName: input.modelName,
        isDefault: existing.length === 0,
      });

      // Return the newly created config
      const configs = await db
        .select()
        .from(llmConfigs)
        .where(eq(llmConfigs.userId, ctx.user.id))
        .orderBy(llmConfigs.createdAt);

      return configs[configs.length - 1];
    }),

  updateLLMConfig: authedQuery
    .input(
      z.object({
        id: z.number(),
        provider: z.enum(["openai", "groq", "anthropic", "gemini", "local"]).optional(),
        apiKey: z.string().optional(),
        modelName: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db
        .update(llmConfigs)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(llmConfigs.id, id));

      return db.query.llmConfigs.findFirst({
        where: eq(llmConfigs.id, id),
      });
    }),

  setDefaultLLM: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Unset all defaults
      await db
        .update(llmConfigs)
        .set({ isDefault: false })
        .where(eq(llmConfigs.userId, ctx.user.id));

      // Set new default
      await db
        .update(llmConfigs)
        .set({ isDefault: true })
        .where(eq(llmConfigs.id, input.id));

      return db.query.llmConfigs.findFirst({
        where: eq(llmConfigs.id, input.id),
      });
    }),

  deleteLLMConfig: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(llmConfigs).where(eq(llmConfigs.id, input.id));
      return { success: true };
    }),

  getProfile: authedQuery.query(async ({ ctx }) => {
    return ctx.user;
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      return db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });
    }),
});
