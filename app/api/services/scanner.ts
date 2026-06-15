import type {
  APKAnalysisInput,
  Permission,
  APIUsage,
  CodePattern,
  NetworkCall,
  ScanResult,
} from "@contracts/types";

// ── Simulated APK Scanner ───────────────────────────────────────────
// In production, this would use actual APK decompilation tools like:
// - apktool for decompilation
// - Androguard for static analysis
// - Frida for dynamic analysis
// - MobSF for comprehensive analysis

const SUSPICIOUS_APIS = [
  { class: "android.telephony.SmsManager", method: "sendTextMessage", risk: "critical" as const },
  { class: "android.location.LocationManager", method: "getLastKnownLocation", risk: "high" as const },
  { class: "android.media.AudioRecord", method: "startRecording", risk: "high" as const },
  { class: "android.hardware.Camera", method: "takePicture", risk: "high" as const },
  { class: "java.net.HttpURLConnection", method: "getOutputStream", risk: "medium" as const },
  { class: "android.app.admin.DevicePolicyManager", method: "lockNow", risk: "critical" as const },
  { class: "android.content.pm.PackageManager", method: "setComponentEnabledSetting", risk: "medium" as const },
  { class: "java.lang.Runtime", method: "exec", risk: "high" as const },
  { class: "javax.crypto.Cipher", method: "doFinal", risk: "medium" as const },
  { class: "android.accounts.AccountManager", method: "getAccounts", risk: "medium" as const },
];

const MALICIOUS_PATTERNS = [
  { pattern: "Base64.decode", category: "Obfuscation", risk: "medium" as const },
  { pattern: "reflection", category: "Code Hiding", risk: "high" as const },
  { pattern: "dexclassloader", category: "Dynamic Loading", risk: "critical" as const },
  { pattern: "encrypted_payload", category: "Payload Hiding", risk: "critical" as const },
  { pattern: "command_and_control", category: "C&C Communication", risk: "critical" as const },
  { pattern: "keylogger", category: "Data Theft", risk: "critical" as const },
  { pattern: "screenshot", category: "Surveillance", risk: "high" as const },
  { pattern: "clipboard_monitor", category: "Data Theft", risk: "high" as const },
];

export class APKScanner {
  async analyze(fileName: string, _fileSize: number): Promise<ScanResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const permissions = this.extractPermissions(fileName);
    const apis = this.detectAPIs(fileName);
    const codePatterns = this.analyzeCodePatterns(fileName);
    const networkActivity = this.analyzeNetwork(fileName);

    const staticScore = this.calculateStaticScore(permissions, apis, codePatterns);
    const behaviorScore = this.calculateBehaviorScore(apis, networkActivity);

    return {
      permissions,
      apis,
      codePatterns,
      networkActivity,
      staticScore,
      behaviorScore,
    };
  }

  private extractPermissions(fileName: string): Permission[] {
    const hash = this.simpleHash(fileName);
    const count = (hash % 8) + 4; // 4-12 permissions
    const selected: Permission[] = [];

    const allPerms: Permission[] = [
      { name: "android.permission.INTERNET", level: "normal", description: "Full network access" },
      { name: "android.permission.ACCESS_NETWORK_STATE", level: "normal", description: "View network connections" },
      { name: "android.permission.READ_CONTACTS", level: "dangerous", description: "Read your contacts" },
      { name: "android.permission.READ_SMS", level: "dangerous", description: "Read text messages" },
      { name: "android.permission.READ_PHONE_STATE", level: "dangerous", description: "Read phone status and identity" },
      { name: "android.permission.ACCESS_FINE_LOCATION", level: "dangerous", description: "Precise location access" },
      { name: "android.permission.RECORD_AUDIO", level: "dangerous", description: "Record audio" },
      { name: "android.permission.CAMERA", level: "dangerous", description: "Take pictures and videos" },
      { name: "android.permission.READ_EXTERNAL_STORAGE", level: "dangerous", description: "Read external storage" },
      { name: "android.permission.WRITE_EXTERNAL_STORAGE", level: "dangerous", description: "Modify external storage" },
      { name: "android.permission.SYSTEM_ALERT_WINDOW", level: "dangerous", description: "Draw over other apps" },
      { name: "android.permission.RECEIVE_BOOT_COMPLETED", level: "normal", description: "Run at startup" },
      { name: "android.permission.WAKE_LOCK", level: "normal", description: "Prevent device sleep" },
      { name: "android.permission.FOREGROUND_SERVICE", level: "normal", description: "Run foreground service" },
      { name: "android.permission.GET_ACCOUNTS", level: "dangerous", description: "Find accounts on device" },
    ];

    for (let i = 0; i < count; i++) {
      selected.push(allPerms[(hash + i) % allPerms.length]);
    }

    return selected;
  }

  private detectAPIs(fileName: string): APIUsage[] {
    const hash = this.simpleHash(fileName);
    const apis: APIUsage[] = [];
    const count = (hash % 6) + 3; // 3-9 APIs

    for (let i = 0; i < count; i++) {
      const api = SUSPICIOUS_APIS[(hash + i) % SUSPICIOUS_APIS.length];
      apis.push({
        className: api.class,
        methodName: api.method,
        frequency: ((hash + i * 7) % 50) + 1,
        riskLevel: api.risk,
      });
    }

    return apis;
  }

  private analyzeCodePatterns(fileName: string): CodePattern[] {
    const hash = this.simpleHash(fileName);
    const patterns: CodePattern[] = [];
    const count = (hash % 4) + 2; // 2-6 patterns

    for (let i = 0; i < count; i++) {
      const pattern = MALICIOUS_PATTERNS[(hash + i) % MALICIOUS_PATTERNS.length];
      patterns.push({
        pattern: pattern.pattern,
        category: pattern.category,
        confidence: 60 + ((hash + i * 13) % 35),
        locations: [`com/app/${pattern.pattern.replace(/\./g, "/")}.java`],
      });
    }

    return patterns;
  }

  private analyzeNetwork(fileName: string): NetworkCall[] {
    const hash = this.simpleHash(fileName);
    const calls: NetworkCall[] = [];
    const suspiciousDomains = [
      "tracker.analytics-sdk.com",
      "ads.malicious-network.net",
      "api.suspicious-service.io",
      "data-collection.unknown-domain.xyz",
    ];
    const normalDomains = [
      "api.google.com",
      "firebase.googleapis.com",
      "cdn.jsdelivr.net",
    ];

    const count = (hash % 5) + 2;
    for (let i = 0; i < count; i++) {
      const isSuspicious = (hash + i) % 3 === 0;
      const domain = isSuspicious
        ? suspiciousDomains[(hash + i) % suspiciousDomains.length]
        : normalDomains[(hash + i) % normalDomains.length];

      calls.push({
        url: `https://${domain}/api/v${(hash % 3) + 1}/data`,
        method: ["GET", "POST", "PUT"][(hash + i) % 3],
        isSuspicious: isSuspicious,
        riskFlags: isSuspicious
          ? ["unencrypted", "data_exfiltration", "known_bad_domain"]
          : [],
      });
    }

    return calls;
  }

  private calculateStaticScore(
    permissions: Permission[],
    apis: APIUsage[],
    patterns: CodePattern[]
  ): number {
    let score = 20; // Base score

    const dangerousPerms = permissions.filter((p) => p.level === "dangerous").length;
    score += dangerousPerms * 5;

    const highRiskAPIs = apis.filter((a) => a.riskLevel === "high" || a.riskLevel === "critical").length;
    score += highRiskAPIs * 8;

    const criticalPatterns = patterns.filter((p) => p.confidence > 80).length;
    score += criticalPatterns * 10;

    return Math.min(100, Math.max(0, score));
  }

  private calculateBehaviorScore(apis: APIUsage[], network: NetworkCall[]): number {
    let score = 15;

    const criticalAPIs = apis.filter((a) => a.riskLevel === "critical").length;
    score += criticalAPIs * 12;

    const suspiciousNetwork = network.filter((n) => n.isSuspicious).length;
    score += suspiciousNetwork * 10;

    return Math.min(100, Math.max(0, score));
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }
}

export function createAPKInput(result: ScanResult, fileName: string, fileHash: string, fileSize: number): APKAnalysisInput {
  return {
    fileName,
    fileHash,
    fileSize,
    permissions: result.permissions,
    apis: result.apis,
    codePatterns: result.codePatterns,
    networkActivity: result.networkActivity,
  };
}
