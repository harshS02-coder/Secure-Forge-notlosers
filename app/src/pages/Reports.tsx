import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  FileText,
  ChevronRight,
  Shield,
  Filter,
} from "lucide-react";

export default function Reports() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const { data: scans, isLoading } = trpc.scan.list.useQuery({
    page: 1,
    limit: 50,
  });

  const filteredScans = scans?.filter((scan) => {
    if (severityFilter === "all") return true;
    return scan.riskLevel === severityFilter;
  });

  const filters = [
    { label: "All", value: "all" },
    { label: "Critical", value: "critical" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];

  return (
    <div className="min-h-screen pt-16 bg-[#f6f6f6]">
      {/* Header */}
      <section className="bg-white border-b border-[#e6e6e6] py-16">
        <div className="mx-auto px-6 lg:px-24">
          <p className="eyebrow text-[#666] mb-4">THREAT REPORTS</p>
          <h1 className="headline-1 text-[#262626]">All Reports</h1>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto px-6 lg:px-24 py-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-[#666]" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setSeverityFilter(f.value)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                severityFilter === f.value
                  ? "bg-[#262626] text-white"
                  : "bg-white text-[#262626] border border-[#e6e6e6] hover:border-[#262626]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Report List */}
      <section className="mx-auto px-6 lg:px-24 pb-24">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#e6e6e6] p-6 animate-pulse"
              >
                <div className="h-6 bg-[#e6e6e6] w-1/3 mb-3" />
                <div className="h-4 bg-[#f6f6f6] w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredScans && filteredScans.length > 0 ? (
          <div className="space-y-4">
            {filteredScans.map((scan) => (
              <ReportCard key={scan.id} scan={scan} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#e6e6e6] p-16 text-center">
            <Shield className="w-16 h-16 text-[#e6e6e6] mx-auto mb-4" />
            <p className="headline-3 text-[#262626] mb-2">No reports yet</p>
            <p className="body-2 text-[#8e8e8e] mb-6">
              Scan your first APK to get started
            </p>
            <Link to="/scan" className="btn-primary">
              Start Scanning
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function ReportCard({
  scan,
}: {
  scan: {
    id: number;
    fileName: string;
    riskLevel: string | null;
    riskScore: number | null;
    status: string;
    createdAt: Date;
  };
}) {
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
      <div className="bg-white border border-[#e6e6e6] p-6 hover:border-[#8e8e8e] transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{ background: bgColor }}
            >
              <FileText className="w-6 h-6" style={{ color: severityColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-light text-[#262626] truncate">
                {scan.fileName}
              </p>
              <p className="text-sm text-[#8e8e8e]">
                {scan.createdAt.toLocaleDateString()} at{" "}
                {scan.createdAt.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0 ml-4">
            <div className="text-right">
              <span
                className="text-2xl font-light"
                style={{ color: severityColor }}
              >
                {scan.riskScore || 0}
              </span>
              <span className="text-sm text-[#8e8e8e]">/100</span>
            </div>
            <span
              className="text-xs px-3 py-1 font-medium uppercase"
              style={{ background: bgColor, color: severityColor }}
            >
              {scan.riskLevel || "Unknown"}
            </span>
            <ChevronRight className="w-5 h-5 text-[#8e8e8e]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
