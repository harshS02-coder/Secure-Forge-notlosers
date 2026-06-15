import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import CipherHelix from "@/components/CipherHelix";
import {
  Upload,
  FileUp,
  Shield,
  Loader,
  CheckCircle,
  X,
  Lock,
  Cpu,
  Eye,
  Globe,
  Zap,
} from "lucide-react";

type ScanStep = {
  label: string;
  status: "pending" | "active" | "completed" | "error";
  icon: React.ReactNode;
};

export default function Scan() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanJobId, setScanJobId] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [steps, setSteps] = useState<ScanStep[]>([
    { label: "Uploading file", status: "pending", icon: <FileUp className="w-5 h-5" /> },
    { label: "Extracting APK contents", status: "pending", icon: <Lock className="w-5 h-5" /> },
    { label: "Analyzing permissions", status: "pending", icon: <Eye className="w-5 h-5" /> },
    { label: "Detecting API calls", status: "pending", icon: <Cpu className="w-5 h-5" /> },
    { label: "Running AI threat analysis", status: "pending", icon: <Zap className="w-5 h-5" /> },
    { label: "Generating report", status: "pending", icon: <Shield className="w-5 h-5" /> },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createScan = trpc.scan.create.useMutation();

  // Poll for scan status
  const { data: scanJob } = trpc.scan.getById.useQuery(
    { id: scanJobId! },
    { enabled: !!scanJobId, refetchInterval: 2000 }
  );

  useEffect(() => {
    if (!scanJob) return;

    const status = scanJob.status;
    const newSteps = [...steps];

    if (status === "pending") {
      newSteps[0].status = "active";
    } else if (status === "processing") {
      newSteps[0].status = "completed";
      newSteps[1].status = "completed";
      newSteps[2].status = "completed";
      newSteps[3].status = "completed";
      newSteps[4].status = "active";
      setScanProgress(65);
    } else if (status === "completed") {
      newSteps.forEach((s) => (s.status = "completed"));
      setScanProgress(100);
      // Navigate to report after brief delay
      setTimeout(() => {
        navigate(`/reports/${scanJob.id}`);
      }, 1500);
    } else if (status === "failed") {
      newSteps[4].status = "error";
    }

    setSteps(newSteps);
  }, [scanJob]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".apk")) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;

    // Compute file hash (SHA-256)
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const result = await createScan.mutateAsync({
      fileName: file.name,
      fileHash,
      fileSize: file.size,
      mimeType: file.type || "application/vnd.android.package-archive",
    });

    setScanJobId(result.id);
    setSteps((prev) => {
      const updated = [...prev];
      updated[0].status = "completed";
      updated[1].status = "active";
      return updated;
    });
    setScanProgress(15);
  };

  const isScanning = scanJobId !== null && scanJob?.status !== "completed" && scanJob?.status !== "failed";

  return (
    <div className="min-h-screen pt-16">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <CipherHelix />
        <div className="relative z-10 text-center px-6">
          <p className="eyebrow text-[#8e8e8e] mb-4">NEW SCAN</p>
          <h1 className="stage-model text-white">ANALYZE</h1>
        </div>
      </section>

      {/* ── Upload Section ──────────────────────────────────────── */}
      <section className="bg-[#f6f6f6] py-24">
        <div className="mx-auto px-6 lg:px-24 max-w-4xl">
          {!scanJobId ? (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed bg-white p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-[#1c69d4] bg-[#f0f5ff]"
                    : "border-[#e6e6e6] hover:border-[#8e8e8e]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apk"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload
                  className={`w-16 h-16 mb-6 transition-colors ${
                    isDragging ? "text-[#1c69d4]" : "text-[#8e8e8e]"
                  }`}
                />
                <p className="body-1 text-[#262626] mb-2">
                  {isDragging
                    ? "Drop your APK file here"
                    : "Drag APK file here or click to browse"}
                </p>
                <p className="text-sm text-[#8e8e8e]">
                  Supports .apk files up to 100MB
                </p>
              </div>

              {/* Selected File */}
              {file && (
                <div className="mt-8 bg-white border border-[#e6e6e6] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f6f6f6] flex items-center justify-center">
                        <FileUp className="w-6 h-6 text-[#1c69d4]" />
                      </div>
                      <div>
                        <p className="text-[#262626] font-medium">{file.name}</p>
                        <p className="text-sm text-[#8e8e8e]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-[#8e8e8e] hover:text-[#d20000] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={createScan.isPending}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                  >
                    {createScan.isPending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Start Analysis
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ── Progress Section ─────────────────────────────── */
            <div className="bg-white border border-[#e6e6e6] p-12">
              {/* Progress Ring */}
              <div className="flex justify-center mb-12">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="8"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#1c69d4"
                      strokeWidth="8"
                      strokeLinecap="butt"
                      strokeDasharray={`${scanProgress * 4.4} 440`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-light text-[#262626]">
                      {scanProgress}
                    </span>
                    <span className="text-sm text-[#8e8e8e]">%</span>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border border-[#e6e6e6]"
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center ${
                        step.status === "completed"
                          ? "bg-[#eaf6e6] text-[#3db014]"
                          : step.status === "active"
                          ? "bg-[#f0f5ff] text-[#1c69d4]"
                          : step.status === "error"
                          ? "bg-[#f7e7e9] text-[#d20000]"
                          : "bg-[#f6f6f6] text-[#8e8e8e]"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step.status === "active" ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span
                      className={`flex-1 body-2 ${
                        step.status === "active"
                          ? "text-[#262626] font-medium"
                          : step.status === "completed"
                          ? "text-[#3db014]"
                          : "text-[#8e8e8e]"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-[#3db014]" />
                    )}
                  </div>
                ))}
              </div>

              {/* Cancel */}
              {isScanning && (
                <button
                  onClick={() => {
                    if (scanJobId) {
                      trpc.scan.cancel.useMutation().mutate({ id: scanJobId });
                    }
                    setScanJobId(null);
                    setFile(null);
                  }}
                  className="w-full mt-6 text-[#d20000] text-sm hover:underline"
                >
                  Cancel Scan
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Info Section ────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto px-6 lg:px-24">
          <p className="eyebrow text-[#666] mb-4">HOW IT WORKS</p>
          <h2 className="headline-1 text-[#262626] mb-12">Analysis Pipeline</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Static Analysis",
                desc: "Decompiles the APK to examine permissions, API calls, and code patterns without executing the application.",
              },
              {
                icon: <Cpu className="w-8 h-8" />,
                title: "AI Threat Detection",
                desc: "Our LLM-agnostic engine analyzes extracted features using advanced pattern recognition to identify malicious behavior.",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Risk Scoring",
                desc: "Comprehensive risk score computed from static, behavioral, and AI analysis components with weighted aggregation.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-[#e6e6e6] p-8">
                <div className="text-[#1c69d4] mb-4">{item.icon}</div>
                <h3 className="headline-3 text-[#262626] mb-3">{item.title}</h3>
                <p className="body-2 text-[#666]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
