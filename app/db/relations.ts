import { relations } from "drizzle-orm";
import { users, scanJobs, threatFindings, activityLogs, llmConfigs } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  scanJobs: many(scanJobs),
  activityLogs: many(activityLogs),
  llmConfigs: many(llmConfigs),
}));

export const scanJobsRelations = relations(scanJobs, ({ one, many }) => ({
  user: one(users, { fields: [scanJobs.userId], references: [users.id] }),
  findings: many(threatFindings),
}));

export const threatFindingsRelations = relations(threatFindings, ({ one }) => ({
  scanJob: one(scanJobs, { fields: [threatFindings.scanJobId], references: [scanJobs.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

export const llmConfigsRelations = relations(llmConfigs, ({ one }) => ({
  user: one(users, { fields: [llmConfigs.userId], references: [users.id] }),
}));
