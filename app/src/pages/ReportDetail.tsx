import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from "lucide-react";
import { useState } from "react";

type TabType = "overview" | "threats" | "permissions" | "ai";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const scanId = parseInt(id || "0");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const { data: report, isLoading } = trpc.report.getByScanId.useQuery({
    scanId,
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "OVERVIEW" },
    { key: "threats", label: "THREATS" },
    { key: "permissions", label: "PERMISSIONS" },
    { key: "ai", label: "AI ANALYSIS" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-[#f6f6f6] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="w-16 h-16 text-[#e6e6e6] mx-auto mb-4 animate-spin" />
          <p className="text-[#8e8e8e]">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen pt-16 bg-[#f6f6f6] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-[#d20000] mx-auto mb-4" />
          <p className="headline-3 text-[#262626] mb-2">Report not found</p>
          <Link to="/reports" className="btn-primary mt-4 inline-block">
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const { scan, findings, summary } = report;
  const riskColor =
    scan.riskLevel === "critical"
      ? "#d20000"
      : scan.riskLevel === "high"
      ? "#ffad1f"
      : scan.riskLevel === "medium"
      ? "#ffad1f"
      : "#3db014";

  const riskBg =
    scan.riskLevel === "critical"
      ? "#f7e7e9"
      : scan.riskLevel === "high"
      ? "#fff6e5"
      : scan.riskLevel === "medium"
      ? "#fff6e5"
      : "#eaf6e6";

  return (
    <div className="min-h-screen pt-16 bg-[#f6f6f6]">
      {/* Header */}
      <section className="bg-white border-b border-[#e6e6e6]">
        <div className="mx-auto px-6 lg:px-24 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/reports"
              className="flex items-center gap-2 text-[#666] hover:text-[#262626] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Reports</span>
            </Link>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-[#e6e6e6] text-[#262626] text-sm hover:border-[#262626] transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#e6e6e6] text-[#262626] text-sm hover:border-[#262626] transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* File Info */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#8e8e8e] mb-1">
                Scan #{scan.id} · {scan.createdAt.toLocaleString()}
              </p>
              <h1 className="headline-1 text-[#262626]">{scan.fileName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-24 h-24 flex flex-col items-center justify-center"
                style={{ background: riskBg }}
              >
                <span
                  className="text-3xl font-light"
                  style={{ color: riskColor }}
                >
                  {scan.riskScore || 0}
                </span>
                <span className="text-xs uppercase" style={{ color: riskColor }}>
                  {scan.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-8 border-b border-[#e6e6e6]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-medium tracking-wide transition-all ${
                  activeTab === tab.key
                    ? "text-[#1c69d4] border-b-2 border-[#1c69d4]"
                    : "text-[#666] hover:text-[#262626]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto px-6 lg:px-24 py-8">
        {activeTab === "overview" && (
          <OverviewTab scan={scan} summary={summary} />
        )}
        {activeTab === "threats" && <ThreatsTab findings={findings} />}
        {activeTab === "permissions" && <PermissionsTab scan={scan} />}
        {activeTab === "ai" && <AIAnalysisTab scan={scan} findings={findings} />}
      </section>
    </div>
  );
}

// ── Tab Components ────────────────────────────────────────────────

function OverviewTab({
  scan,
  summary,
}: {
  scan: { staticScore: number | null; dynamicScore: number | null; behaviorScore: number | null };
  summary: { aiExecutiveSummary: string; recommendations: string[]; totalThreats: number; criticalCount: number; highCount: number; mediumCount: number; lowCount: number };
}) {
  return (
    <div className="space-y-6">
      {/* Risk Breakdown */}
      <div className="bg-white border border-[#e6e6e6] p-8">
        <h3 className="headline-3 text-[#262626] mb-6">Risk Breakdown</h3>
        <div className="space-y-6">
          <ScoreBar label="Static Analysis" score={scan.staticScore || 0} />
          <ScoreBar label="Behavioral Analysis" score={scan.behaviorScore || 0} />
          <ScoreBar label="AI Threat Detection" score={scan.dynamicScore || 0} />
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white border border-[#e6e6e6] p-8">
        <p className="eyebrow text-[#666] mb-4">AI ANALYSIS</p>
        <p className="body-1 text-[#262626]">{summary.aiExecutiveSummary}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total Threats" value={summary.totalThreats} color="#1c69d4" />
        <StatBox label="Critical" value={summary.criticalCount} color="#d20000" />
        <StatBox label="High" value={summary.highCount} color="#ffad1f" />
        <StatBox label="Medium" value={summary.mediumCount} color="#ffad1f" />
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-[#e6e6e6] p-8">
        <h3 className="headline-3 text-[#262626] mb-6">Recommendations</h3>
        <div className="space-y-3">
          {summary.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#3db014] mt-0.5 flex-shrink-0" />
              <p className="body-2 text-[#262626]">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThreatsTab({
  findings,
}: {
  findings: Array<{
    id: number;
    category: string;
    severity: string;
    title: string;
    description: string | null;
    evidence: unknown;
    recommendation: string | null;
    aiAnalysis: string | null;
  }>;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (findings.length === 0) {
    return (
      <div className="bg-white border border-[#e6e6e6] p-16 text-center">
        <Shield className="w-12 h-12 text-[#3db014] mx-auto mb-4" />
        <p className="headline-3 text-[#262626]">No threats detected</p>
        <p className="body-2 text-[#8e8e8e] mt-2">
          This application appears to be safe
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => {
        const borderColor =
          finding.severity === "critical"
            ? "#d20000"
            : finding.severity === "high"
            ? "#ffad1f"
            : finding.severity === "medium"
            ? "#ffad1f"
            : "#3db014";

        const isExpanded = expandedId === finding.id;

        return (
          <div
            key={finding.id}
            className="bg-white border border-[#e6e6e6] overflow-hidden"
            style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : finding.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-[#262626]">
                      {finding.title}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 uppercase"
                      style={{
                        background:
                          finding.severity === "critical"
                            ? "#f7e7e9"
                            : finding.severity === "high"
                            ? "#fff6e5"
                            : "#eaf6e6",
                        color: borderColor,
                      }}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="body-2 text-[#666]">{finding.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#8e8e8e]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e8e8e]" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="px-6 pb-6 border-t border-[#e6e6e6] pt-4">
                {finding.evidence ? (
                  <div className="mb-4">
                    <p className="text-sm text-[#666] mb-2">Evidence:</p>
                    <pre className="bg-[#f6f6f6] p-4 text-sm text-[#262626] overflow-x-auto font-mono">
                      {JSON.stringify(finding.evidence, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {finding.recommendation && (
                  <div className="mb-4">
                    <p className="text-sm text-[#666] mb-1">Recommendation:</p>
                    <p className="body-2 text-[#262626]">
                      {finding.recommendation}
                    </p>
                  </div>
                )}
                {finding.aiAnalysis && (
                  <div>
                    <p className="text-sm text-[#666] mb-1">AI Analysis:</p>
                    <p className="body-2 text-[#262626]">{finding.aiAnalysis}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PermissionsTab({
  scan,
}: {
  scan: { permissions: unknown };
}) {
  const perms = (scan.permissions as Array<{ name: string; level: string; description: string }>) || [];

  return (
    <div className="bg-white border border-[#e6e6e6]">
      <div className="p-6 border-b border-[#e6e6e6]">
        <h3 className="headline-3 text-[#262626]">
          Permissions ({perms.length})
        </h3>
      </div>
      <div className="divide-y divide-[#e6e6e6]">
        {perms.map((perm, i) => (
          <div key={i} className="p-6 flex items-start justify-between">
            <div>
              <p className="text-[#262626] font-medium">{perm.name}</p>
              <p className="text-sm text-[#666] mt-1">{perm.description}</p>
            </div>
            <span
              className={`text-xs px-3 py-1 uppercase ${
                perm.level === "dangerous"
                  ? "bg-[#fff6e5] text-[#ffad1f]"
                  : perm.level === "signature"
                  ? "bg-[#f7e7e9] text-[#d20000]"
                  : "bg-[#eaf6e6] text-[#3db014]"
              }`}
            >
              {perm.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIAnalysisTab({
  scan,
  findings,
}: {
  scan: { aiSummary: string | null; apis: unknown };
  findings: Array<{ title: string; description: string | null; severity: string }>;
}) {
  const apis = (scan.apis as Array<{ className: string; methodName: string; riskLevel: string; frequency: number }>) || [];

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <div className="bg-white border border-[#e6e6e6] p-8">
        <p className="eyebrow text-[#666] mb-4">EXECUTIVE SUMMARY</p>
        <p className="body-1 text-[#262626]">{scan.aiSummary || "No AI summary available."}</p>
      </div>

      {/* API Analysis */}
      {apis.length > 0 && (
        <div className="bg-white border border-[#e6e6e6]">
          <div className="p-6 border-b border-[#e6e6e6]">
            <p className="eyebrow text-[#666]">DETECTED APIs</p>
          </div>
          <div className="divide-y divide-[#e6e6e6]">
            {apis.map((api, i) => (
              <div key={i} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-[#262626]">
                    {api.className}.{api.methodName}
                  </p>
                  <p className="text-sm text-[#666]">
                    Called {api.frequency} times
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 ${
                    api.riskLevel === "critical" || api.riskLevel === "high"
                      ? "bg-[#f7e7e9] text-[#d20000]"
                      : "bg-[#eaf6e6] text-[#3db014]"
                  }`}
                >
                  {api.riskLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Findings */}
      {findings.length > 0 && (
        <div className="bg-white border border-[#e6e6e6] p-8">
          <p className="eyebrow text-[#666] mb-4">TECHNICAL FINDINGS</p>
          <div className="space-y-4">
            {findings.map((f, i) => (
              <div key={i} className="bg-[#f6f6f6] p-4">
                <p className="font-medium text-[#262626] mb-1">{f.title}</p>
                <p className="text-sm text-[#666]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score > 75 ? "#d20000" : score > 50 ? "#ffad1f" : score > 25 ? "#ffad1f" : "#3db014";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#262626]">{label}</span>
        <span className="text-sm font-medium" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-[#e6e6e6]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#e6e6e6] p-6 text-center">
      <p className="text-3xl font-light" style={{ color }}>
        {value}
      </p>
      <p className="text-sm text-[#666] mt-1">{label}</p>
    </div>
  );
}
