import type {
  APKAnalysisInput,
  LLMAnalysisOutput,
  AIThreat,
  LLMProviderConfig,
} from "@contracts/types";

// ── LLM Provider Interface ──────────────────────────────────────────

interface LLMProvider {
  analyzeAPK(data: APKAnalysisInput): Promise<LLMAnalysisOutput>;
  generateReport(findings: AIThreat[]): Promise<string>;
  explainThreat(threat: AIThreat): Promise<string>;
}

// ── System Prompts ──────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are an expert cybersecurity analyst specializing in Android malware detection. 
Analyze the provided APK static analysis data and identify potential threats, malicious patterns, and security risks.

Provide your analysis in a structured format covering:
1. Executive summary of findings
2. List of detected threats with severity ratings
3. Behavioral analysis of the application
4. Specific recommendations for mitigation
5. Overall risk assessment

Be thorough, precise, and actionable. Rate confidence on a scale of 0-100.`;

const REPORT_SYSTEM_PROMPT = `You are a senior cybersecurity report writer. Generate a comprehensive, professional security assessment report based on the provided threat findings. 

Format the report with:
- Executive Summary
- Threat Overview
- Detailed Findings (each threat with technical details)
- Risk Assessment
- Recommendations
- Conclusion

Use professional security terminology and provide actionable guidance.`;

// ── OpenAI Provider ─────────────────────────────────────────────────

class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.modelName || "gpt-4o-mini";
  }

  private async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || "";
  }

  async analyzeAPK(data: APKAnalysisInput): Promise<LLMAnalysisOutput> {
    const prompt = this.buildAnalysisPrompt(data);
    const response = await this.callAPI(ANALYSIS_SYSTEM_PROMPT, prompt);
    return this.parseAnalysisResponse(response);
  }

  async generateReport(findings: AIThreat[]): Promise<string> {
    const prompt = `Generate a comprehensive security report based on these threat findings:\n\n${JSON.stringify(findings, null, 2)}`;
    return this.callAPI(REPORT_SYSTEM_PROMPT, prompt);
  }

  async explainThreat(threat: AIThreat): Promise<string> {
    const prompt = `Explain this security threat in detail:\n\n${JSON.stringify(threat, null, 2)}`;
    return this.callAPI(ANALYSIS_SYSTEM_PROMPT, prompt);
  }

  private buildAnalysisPrompt(data: APKAnalysisInput): string {
    return `Analyze this Android APK:\n
File: ${data.fileName} (${data.fileSize} bytes)
Hash: ${data.fileHash}

PERMISSIONS (${data.permissions.length}):
${data.permissions.map((p) => `- ${p.name} [${p.level}]: ${p.description}`).join("\n")}

API USAGE (${data.apis.length}):
${data.apis.map((a) => `- ${a.className}.${a.methodName} (${a.frequency}x) [${a.riskLevel}]`).join("\n")}

CODE PATTERNS (${data.codePatterns.length}):
${data.codePatterns.map((c) => `- ${c.pattern} (${c.category}) confidence: ${c.confidence}%`).join("\n")}

NETWORK ACTIVITY (${data.networkActivity.length}):
${data.networkActivity.map((n) => `- ${n.method} ${n.url} suspicious: ${n.isSuspicious} flags: ${n.riskFlags.join(", ")}`).join("\n")}`;
  }

  private parseAnalysisResponse(response: string): LLMAnalysisOutput {
    try {
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) return JSON.parse(jsonMatch[1]) as LLMAnalysisOutput;
      const jsonBlock = response.match(/\{[\s\S]*\}/);
      if (jsonBlock) return JSON.parse(jsonBlock[0]) as LLMAnalysisOutput;
    } catch { /* ignore */ }

    const severityMatch = response.match(/(?:overall risk|risk level|risk assessment):\s*(critical|high|medium|low)/i);
    const overallRisk = (severityMatch?.[1]?.toLowerCase() || "medium") as "low" | "medium" | "high" | "critical";

    return {
      summary: response.substring(0, 500),
      threats: [],
      behavioralAnalysis: response,
      recommendations: ["Review all permissions manually", "Monitor network activity", "Run dynamic analysis in sandbox"],
      overallRisk,
      confidenceScore: 75,
    };
  }
}

// ── Groq Provider ───────────────────────────────────────────────────

class GroqProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.modelName || "llama-3.3-70b-versatile";
  }

  private async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || "";
  }

  async analyzeAPK(data: APKAnalysisInput): Promise<LLMAnalysisOutput> {
    const prompt = `Analyze this Android APK for security threats:\n\n${JSON.stringify(data, null, 2)}\n\nReturn a JSON response with: summary, threats array, behavioralAnalysis, recommendations array, overallRisk (low/medium/high/critical), confidenceScore (0-100).`;
    const response = await this.callAPI(ANALYSIS_SYSTEM_PROMPT, prompt);
    return this.parseResponse(response);
  }

  async generateReport(findings: AIThreat[]): Promise<string> {
    const prompt = `Generate a comprehensive security report:\n\n${JSON.stringify(findings, null, 2)}`;
    return this.callAPI(REPORT_SYSTEM_PROMPT, prompt);
  }

  async explainThreat(threat: AIThreat): Promise<string> {
    const prompt = `Explain this threat:\n\n${JSON.stringify(threat, null, 2)}`;
    return this.callAPI(ANALYSIS_SYSTEM_PROMPT, prompt);
  }

  private parseResponse(response: string): LLMAnalysisOutput {
    try {
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) return JSON.parse(jsonMatch[1]) as LLMAnalysisOutput;
      const jsonBlock = response.match(/\{[\s\S]*\}/);
      if (jsonBlock) return JSON.parse(jsonBlock[0]) as LLMAnalysisOutput;
    } catch { /* ignore */ }

    return {
      summary: response.substring(0, 500),
      threats: [],
      behavioralAnalysis: response,
      recommendations: ["Manual review recommended"],
      overallRisk: "medium",
      confidenceScore: 70,
    };
  }
}

// ── Anthropic Provider ──────────────────────────────────────────────

class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.modelName || "claude-sonnet-4-6";
  }

  private async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.content?.[0]?.text || "";
  }

  async analyzeAPK(data: APKAnalysisInput): Promise<LLMAnalysisOutput> {
    const prompt = `Analyze this Android APK:\n\n${JSON.stringify(data, null, 2)}\n\nReturn JSON with: summary, threats, behavioralAnalysis, recommendations, overallRisk, confidenceScore.`;
    const response = await this.callAPI(ANALYSIS_SYSTEM_PROMPT, prompt);
    return this.parseResponse(response);
  }

  async generateReport(findings: AIThreat[]): Promise<string> {
    return this.callAPI(REPORT_SYSTEM_PROMPT, `Generate report:\n${JSON.stringify(findings, null, 2)}`);
  }

  async explainThreat(threat: AIThreat): Promise<string> {
    return this.callAPI(ANALYSIS_SYSTEM_PROMPT, `Explain:\n${JSON.stringify(threat, null, 2)}`);
  }

  private parseResponse(response: string): LLMAnalysisOutput {
    try {
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) return JSON.parse(jsonMatch[1]) as LLMAnalysisOutput;
      const jsonBlock = response.match(/\{[\s\S]*\}/);
      if (jsonBlock) return JSON.parse(jsonBlock[0]) as LLMAnalysisOutput;
    } catch { /* ignore */ }

    return {
      summary: response.substring(0, 500),
      threats: [],
      behavioralAnalysis: response,
      recommendations: ["Manual review recommended"],
      overallRisk: "medium",
      confidenceScore: 70,
    };
  }
}

// ── Gemini Provider ─────────────────────────────────────────────────

class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.modelName || "gemini-1.5-flash";
  }

  private async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4000 },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  async analyzeAPK(data: APKAnalysisInput): Promise<LLMAnalysisOutput> {
    const prompt = `Analyze this Android APK for security threats and return ONLY a valid JSON object (no markdown, no backticks) with these exact fields:
{
  "summary": "string",
  "threats": [{ "category": "malware|spyware|trojan|ransomware|adware|phishing|suspicious|info", "severity": "critical|high|medium|low|info", "title": "string", "description": "string", "evidence": ["string"], "recommendation": "string" }],
  "behavioralAnalysis": "string",
  "recommendations": ["string"],
  "overallRisk": "low|medium|high|critical",
  "confidenceScore": 0-100
}

APK Data:
${JSON.stringify(data, null, 2)}`;
    const response = await this.callAPI(ANALYSIS_SYSTEM_PROMPT, prompt);
    return this.parseResponse(response);
  }

  async generateReport(findings: AIThreat[]): Promise<string> {
    return this.callAPI(REPORT_SYSTEM_PROMPT, `Generate report:\n${JSON.stringify(findings, null, 2)}`);
  }

  async explainThreat(threat: AIThreat): Promise<string> {
    return this.callAPI(ANALYSIS_SYSTEM_PROMPT, `Explain:\n${JSON.stringify(threat, null, 2)}`);
  }

  private parseResponse(response: string): LLMAnalysisOutput {
    try {
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) return JSON.parse(jsonMatch[1]) as LLMAnalysisOutput;
      const jsonBlock = response.match(/\{[\s\S]*\}/s);
      if (jsonBlock) return JSON.parse(jsonBlock[0]) as LLMAnalysisOutput;
    } catch { /* ignore */ }

    return {
      summary: response.substring(0, 500),
      threats: [],
      behavioralAnalysis: response,
      recommendations: ["Manual review recommended"],
      overallRisk: "medium",
      confidenceScore: 70,
    };
  }
}

// ── Mock Provider (for testing without API keys) ────────────────────

class MockProvider implements LLMProvider {
  async analyzeAPK(data: APKAnalysisInput): Promise<LLMAnalysisOutput> {
    const permCount = data.permissions.length;
    const dangerousPerms = data.permissions.filter((p) => p.level === "dangerous").length;
    const suspiciousAPIs = data.apis.filter((a) => a.riskLevel === "high" || a.riskLevel === "critical").length;

    const threats: AIThreat[] = [];

    if (dangerousPerms > 3) {
      threats.push({
        category: "suspicious",
        severity: "high",
        title: "Excessive Permission Requests",
        description: `App requests ${dangerousPerms} dangerous permissions which is above the typical threshold for its category.`,
        evidence: data.permissions.filter((p) => p.level === "dangerous").map((p) => p.name),
        recommendation: "Review if all permissions are necessary for the app's stated functionality.",
      });
    }

    if (suspiciousAPIs > 0) {
      threats.push({
        category: "spyware",
        severity: suspiciousAPIs > 2 ? "critical" : "high",
        title: "Suspicious API Usage Patterns",
        description: `Detected ${suspiciousAPIs} high-risk API calls commonly associated with data exfiltration.`,
        evidence: data.apis.filter((a) => a.riskLevel === "high").map((a) => `${a.className}.${a.methodName}`),
        recommendation: "Monitor network traffic and data access patterns in a sandboxed environment.",
      });
    }

    if (data.networkActivity.some((n) => n.isSuspicious)) {
      threats.push({
        category: "phishing",
        severity: "high",
        title: "Suspicious Network Communications",
        description: "App communicates with known suspicious domains or uses unencrypted channels.",
        evidence: data.networkActivity.filter((n) => n.isSuspicious).map((n) => n.url),
        recommendation: "Block network access and analyze payload data being transmitted.",
      });
    }

    const overallRisk = threats.some((t) => t.severity === "critical")
      ? "critical"
      : threats.some((t) => t.severity === "high")
        ? "high"
        : threats.length > 0
          ? "medium"
          : "low";

    return {
      summary: `Analysis of ${data.fileName} reveals ${threats.length} potential security concerns. ${dangerousPerms} dangerous permissions and ${suspiciousAPIs} suspicious API calls were detected.`,
      threats,
      behavioralAnalysis: `The application exhibits ${suspiciousAPIs > 0 ? "concerning" : "typical"} behavior patterns with ${permCount} total permissions requested.`,
      recommendations: [
        "Review all requested permissions against app functionality",
        "Monitor network traffic for data exfiltration",
        "Run dynamic analysis in isolated sandbox",
        "Check for obfuscated code segments",
      ],
      overallRisk,
      confidenceScore: 85,
    };
  }

  async generateReport(findings: AIThreat[]): Promise<string> {
    return `# Security Assessment Report\n\n## Threat Summary\n${findings.map((f) => `- **${f.title}** (${f.severity}): ${f.description}`).join("\n")}\n\n## Recommendations\n1. Immediate isolation of the application\n2. Network traffic monitoring\n3. Dynamic behavioral analysis\n4. Code decompilation review`;
  }

  async explainThreat(threat: AIThreat): Promise<string> {
    return `**${threat.title}** (${threat.severity})\n\n${threat.description}\n\nEvidence: ${threat.evidence.join(", ")}\n\nRecommendation: ${threat.recommendation}`;
  }
}

// ── LLM Service Factory ─────────────────────────────────────────────

export class LLMService {
  static getProvider(config: LLMProviderConfig): LLMProvider {
    switch (config.provider) {
      case "openai":
        return new OpenAIProvider(config);
      case "groq":
        return new GroqProvider(config);
      case "anthropic":
        return new AnthropicProvider(config);
      case "gemini":
        return new GeminiProvider(config);
      case "local":
      default:
        return new MockProvider();
    }
  }

  static getDefaultConfig(): LLMProviderConfig {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      provider: "groq",
      modelName: "llama-3.3-70b-versatile",
      apiKey: groqKey,
    };
  }
  console.warn("[llm] No GROQ_API_KEY set, using mock provider.");
  return {
    provider: "local",
    modelName: "mock",
    apiKey: "",
  };
}
}

export type { LLMProvider };