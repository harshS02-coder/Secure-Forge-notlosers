import { Link } from "react-router";
import GlobeNetwork from "@/components/GlobeNetwork";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronRight,
  Upload,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function Home() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: recentScans } = trpc.dashboard.recentScans.useQuery({ limit: 5 });
  const { data: threatTrends } = trpc.dashboard.threatTrends.useQuery();

  return (
    <div className="min-h-screen">
      {/* ── Hero Stage ──────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <GlobeNetwork />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="eyebrow text-[#666] mb-6">ENTERPRISE CYBERSECURITY</p>
          <h1 className="stage-model text-[#262626] mb-6">SECURE</h1>
          <p className="body-1 text-[#666] max-w-2xl mx-auto mb-10">
            Intelligent threat analysis powered by generative AI. Upload, scan,
            and neutralize.
          </p>
          <Link to="/scan" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Start Deep Scan
          </Link>
        </div>
      </section>

      {/* ── Stats Band ──────────────────────────────────────────── */}
      <section className="bg-white border-t border-[#e6e6e6] py-16">
        <div className="mx-auto px-6 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Scans"
              value={stats?.totalScans || 0}
              icon={<Activity className="w-5 h-5" />}
              color="#1c69d4"
            />
            <StatCard
              label="Threats Found"
              value={stats?.totalThreats || 0}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="#ffad1f"
            />
            <StatCard
              label="Avg Risk Score"
              value={`${stats?.averageRiskScore || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="#d20000"
            />
            <StatCard
              label="Scans This Week"
              value={stats?.scansThisWeek || 0}
              icon={<Clock className="w-5 h-5" />}
              color="#3db014"
            />
          </div>
        </div>
      </section>

      {/* ── Upload & Scan Band ──────────────────────────────────── */}
      <section className="bg-[#f6f6f6] py-24">
        <div className="mx-auto px-6 lg:px-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Upload Area */}
            <div className="border-2 border-dashed border-[#e6e6e6] bg-white p-12 flex flex-col items-center justify-center text-center min-h-[320px]">
              <Upload className="w-12 h-12 text-[#8e8e8e] mb-6" />
              <p className="body-1 text-[#262626] mb-2">
                Drag APK file here
              </p>
              <p className="body-2 text-[#8e8e8e] mb-8">
                or click to browse
              </p>
              <p className="text-xs text-[#8e8e8e] mb-6">
                Supports .apk files up to 100MB
              </p>
              <Link to="/scan" className="btn-outline">
                Select File
              </Link>
            </div>

            {/* Right: Copy */}
            <div>
              <p className="eyebrow text-[#666] mb-4">ZERO-TRUST ANALYSIS</p>
              <h2 className="headline-1 text-[#262626] mb-6">
                Find your threats.
              </h2>
              <p className="body-1 text-[#666] mb-8">
                Zero-trust analysis pipeline. We decompile, inspect permissions,
                and monitor runtime behavior to detect anomalies invisible to
                standard antivirus.
              </p>
              <div className="space-y-4">
                {[
                  "Static code analysis with AI pattern recognition",
                  "Dynamic behavioral monitoring simulation",
                  "Permission and API usage risk scoring",
                  "Automated threat report generation",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#3db014] mt-0.5 flex-shrink-0" />
                    <p className="body-2 text-[#262626]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Threat Assessment Matrix ────────────────────────────── */}
      <section className="bg-[#121212] py-24">
        <div className="mx-auto px-6 lg:px-24">
          <p className="eyebrow text-[#8e8e8e] mb-4">THREAT INTELLIGENCE</p>
          <h2 className="headline-1 text-white mb-4">Recent Detections</h2>
          <p className="body-1 text-[#8e8e8e] mb-12">
            AI-powered analysis results from recent scans
          </p>

          {recentScans && recentScans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentScans.slice(0, 6).map((scan) => (
                <ThreatCard key={scan.id} scan={scan} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Shield className="w-16 h-16 text-[#333] mx-auto mb-4" />
              <p className="text-[#666] body-1">No scans yet. Start your first analysis.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Threat Trends ───────────────────────────────────────── */}
      <section className="bg-[#f6f6f6] py-24">
        <div className="mx-auto px-6 lg:px-24">
          <p className="eyebrow text-[#666] mb-4">ANALYTICS</p>
          <h2 className="headline-1 text-[#262626] mb-12">Threat Distribution</h2>

          {threatTrends && threatTrends.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {threatTrends.map((trend) => (
                <div
                  key={trend.name}
                  className="bg-white border border-[#e6e6e6] p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#262626] uppercase">
                      {trend.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 ${
                        trend.severity === "critical"
                          ? "bg-[#f7e7e9] text-[#d20000]"
                          : trend.severity === "high"
                          ? "bg-[#fff6e5] text-[#ffad1f]"
                          : "bg-[#eaf6e6] text-[#3db014]"
                      }`}
                    >
                      {trend.severity}
                    </span>
                  </div>
                  <p className="text-3xl font-light text-[#262626]">
                    {trend.count}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#e6e6e6] p-12 text-center">
              <Activity className="w-12 h-12 text-[#e6e6e6] mx-auto mb-4" />
              <p className="text-[#8e8e8e]">No threat data available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ── World Map Band ──────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto px-6 lg:px-24">
          <p className="eyebrow text-[#666] mb-4">GLOBAL COVERAGE</p>
          <h2 className="headline-1 text-[#262626] mb-8">
            Worldwide Threat Monitoring
          </h2>
          <div className="relative w-full overflow-hidden">
            <img
              src="/images/world-map.jpg"
              alt="Global threat monitoring"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ── CTA Band ────────────────────────────────────────────── */}
      <section className="bg-[#121212] py-24">
        <div className="mx-auto px-6 lg:px-24 text-center">
          <p className="eyebrow text-[#8e8e8e] mb-6">GET STARTED</p>
          <h2 className="headline-1 text-white mb-8">
            Protect Your Digital Assets
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/scan" className="btn-primary">
              <Upload className="w-5 h-5 mr-2" />
              Start Scanning
            </Link>
            <Link to="/reports" className="btn-outline border-white text-white hover:bg-white/10">
              <FileText className="w-5 h-5 mr-2" />
              View Reports
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Sub-Components ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#f6f6f6] border border-[#e6e6e6] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[#666] uppercase tracking-wide">
          {label}
        </span>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-4xl font-light text-[#262626]">{value}</p>
    </div>
  );
}

function ThreatCard({ scan }: { scan: { id: number; fileName: string; riskLevel: string | null; riskScore: number | null; status: string; createdAt: Date } }) {
  const severityColor =
    scan.riskLevel === "critical"
      ? "#d20000"
      : scan.riskLevel === "high"
      ? "#ffad1f"
      : scan.riskLevel === "medium"
      ? "#ffad1f"
      : "#3db014";

  const bgColor =
    scan.riskLevel === "critical"
      ? "#f7e7e9"
      : scan.riskLevel === "high"
      ? "#fff6e5"
      : scan.riskLevel === "medium"
      ? "#fff6e5"
      : "#eaf6e6";

  return (
    <Link to={`/reports/${scan.id}`}>
      <div className="bg-[#1a1a1a] border border-[#333] p-6 hover:border-[#666] transition-colors duration-200 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-light text-lg truncate">
              {scan.fileName}
            </p>
            <p className="text-[#666] text-sm mt-1">
              {scan.createdAt.toLocaleDateString()}
            </p>
          </div>
          <span
            className="text-xs px-2 py-1 ml-2 flex-shrink-0"
            style={{ background: bgColor, color: severityColor }}
          >
            {scan.riskLevel?.toUpperCase() || "UNKNOWN"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-light" style={{ color: severityColor }}>
              {scan.riskScore || 0}
            </span>
            <span className="text-[#666] text-sm">/100</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#666]" />
        </div>
      </div>
    </Link>
  );
}
