import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Scan jobs table - tracks APK analysis jobs
export const scanJobs = mysqlTable("scan_jobs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileHash: varchar("fileHash", { length: 64 }).notNull(),
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  riskScore: int("riskScore"),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]),
  aiSummary: text("aiSummary"),
  aiThreats: json("aiThreats"),
  permissions: json("permissions"),
  apis: json("apis"),
  staticScore: int("staticScore"),
  dynamicScore: int("dynamicScore"),
  behaviorScore: int("behaviorScore"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ScanJob = typeof scanJobs.$inferSelect;
export type InsertScanJob = typeof scanJobs.$inferInsert;

// Threat findings table - individual threats detected
export const threatFindings = mysqlTable("threat_findings", {
  id: serial("id").primaryKey(),
  scanJobId: bigint("scanJobId", { mode: "number", unsigned: true }).references(() => scanJobs.id).notNull(),
  category: mysqlEnum("category", ["malware", "spyware", "trojan", "ransomware", "adware", "phishing", "suspicious", "info"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  evidence: json("evidence"),
  recommendation: text("recommendation"),
  aiAnalysis: text("aiAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ThreatFinding = typeof threatFindings.$inferSelect;
export type InsertThreatFinding = typeof threatFindings.$inferInsert;

// Activity logs table
export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// LLM configuration table - stores user's LLM provider settings
export const llmConfigs = mysqlTable("llm_configs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  provider: mysqlEnum("provider", ["openai", "groq", "anthropic", "gemini", "local"]).notNull(),
  apiKey: varchar("apiKey", { length: 500 }).notNull(),
  modelName: varchar("modelName", { length: 100 }).notNull(),
  isDefault: boolean("isDefault").default(false),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LLMConfig = typeof llmConfigs.$inferSelect;
export type InsertLLMConfig = typeof llmConfigs.$inferInsert;