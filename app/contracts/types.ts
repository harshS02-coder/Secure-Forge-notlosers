// Shared types between frontend and backend

export interface APKAnalysisInput {
  fileName: string;
  fileHash: string;
  fileSize: number;
  permissions: Permission[];
  apis: APIUsage[];
  codePatterns: CodePattern[];
  networkActivity: NetworkCall[];
}

export interface Permission {
  name: string;
  level: "normal" | "dangerous" | "signature";
  description: string;
}

export interface APIUsage {
  className: string;
  methodName: string;
  frequency: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface CodePattern {
  pattern: string;
  category: string;
  confidence: number;
  locations: string[];
}

export interface NetworkCall {
  url: string;
  method: string;
  isSuspicious: boolean;
  riskFlags: string[];
}

export interface LLMAnalysisOutput {
  summary: string;
  threats: AIThreat[];
  behavioralAnalysis: string;
  recommendations: string[];
  overallRisk: "low" | "medium" | "high" | "critical";
  confidenceScore: number;
}

export interface AIThreat {
  category: "malware" | "spyware" | "trojan" | "ransomware" | "adware" | "phishing" | "suspicious" | "info";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
}

export interface RiskScore {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  breakdown: {
    static: number;
    behavior: number;
    ai: number;
  };
}

export interface ScanResult {
  permissions: Permission[];
  apis: APIUsage[];
  codePatterns: CodePattern[];
  networkActivity: NetworkCall[];
  staticScore: number;
  behaviorScore: number;
}

export interface DashboardStats {
  totalScans: number;
  totalThreats: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scansThisWeek: number;
  averageRiskScore: number;
}

export interface ThreatCategory {
  name: string;
  count: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface ScanTimelineItem {
  date: string;
  count: number;
  riskLevel: string;
}

export interface LLMProviderConfig {
  provider: "openai" | "groq" | "anthropic" | "gemini" | "local";
  modelName: string;
  apiKey: string;
}
