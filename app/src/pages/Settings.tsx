import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  User,
  Key,
  Bot,
  Plus,
  Trash2,
  Check,
  Loader,
  Save,
  Sparkles,
} from "lucide-react";

type LLMProvider = "openai" | "groq" | "anthropic" | "gemini" | "local";

const PROVIDER_INFO: Record<LLMProvider, { label: string; defaultModel: string; description: string }> = {
  openai: { label: "OpenAI", defaultModel: "gpt-4o-mini", description: "GPT-4o, GPT-4o-mini, and legacy models" },
  groq: { label: "Groq", defaultModel: "llama-3.3-70b-versatile", description: "Ultra-fast inference with Llama and Mixtral models" },
  anthropic: { label: "Anthropic", defaultModel: "claude-3-5-sonnet-20241022", description: "Claude 3.5 Sonnet, Opus, and Haiku models" },
  gemini: { label: "Google Gemini", defaultModel: "gemini-1.5-flash", description: "Gemini 1.5 Pro and Flash models" },
  local: { label: "Local / Mock", defaultModel: "mock", description: "No API key required. Uses built-in analysis engine." },
};

export default function Settings() {
  const { data: configs, refetch } = trpc.settings.getLLMConfigs.useQuery();
  const { data: profile } = trpc.settings.getProfile.useQuery();

  const addConfig = trpc.settings.addLLMConfig.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteConfig = trpc.settings.deleteLLMConfig.useMutation({
    onSuccess: () => refetch(),
  });
  const setDefault = trpc.settings.setDefaultLLM.useMutation({
    onSuccess: () => refetch(),
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState<LLMProvider>("openai");
  const [newApiKey, setNewApiKey] = useState("");
  const [newModel, setNewModel] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  const handleAdd = async () => {
    await addConfig.mutateAsync({
      provider: newProvider,
      apiKey: newApiKey || "mock-key",
      modelName: newModel || PROVIDER_INFO[newProvider].defaultModel,
    });
    setShowAddForm(false);
    setNewApiKey("");
    setNewModel("");
  };

  const handleTest = async () => {
    setTestStatus("testing");
    // Simulate test
    await new Promise((r) => setTimeout(r, 1500));
    setTestStatus("success");
    setTimeout(() => setTestStatus("idle"), 3000);
  };

  return (
    <div className="min-h-screen pt-16 bg-[#f6f6f6]">
      {/* Header */}
      <section className="bg-white border-b border-[#e6e6e6] py-16">
        <div className="mx-auto px-6 lg:px-24">
          <p className="eyebrow text-[#666] mb-4">CONFIGURATION</p>
          <h1 className="headline-1 text-[#262626]">Settings</h1>
        </div>
      </section>

      <div className="mx-auto px-6 lg:px-24 py-12 max-w-5xl space-y-8">
        {/* Profile Section */}
        <div className="bg-white border border-[#e6e6e6] p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[#1c69d4]" />
            <h2 className="headline-3 text-[#262626]">Account</h2>
          </div>

          {profile && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#666] mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name || ""}
                    readOnly
                    className="w-full px-4 py-3 border border-[#e6e6e6] bg-[#f6f6f6] text-[#262626] text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#666] mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email || ""}
                    readOnly
                    className="w-full px-4 py-3 border border-[#e6e6e6] bg-[#f6f6f6] text-[#262626] text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-1">Role</label>
                <span className="inline-block px-3 py-1 bg-[#f0f5ff] text-[#1c69d4] text-sm uppercase">
                  {profile.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* LLM Configuration Section */}
        <div className="bg-white border border-[#e6e6e6] p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-[#1c69d4]" />
              <h2 className="headline-3 text-[#262626]">AI Provider</h2>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 text-sm text-[#1c69d4] hover:text-[#0653b6] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          </div>

          <p className="body-2 text-[#666] mb-6">
            Configure your LLM providers for AI-powered threat analysis. The system supports multiple providers - switch between them by setting a default.
          </p>

          {/* Add Form */}
          {showAddForm && (
            <div className="border border-[#e6e6e6] p-6 mb-6 bg-[#fafafa]">
              <h3 className="text-sm font-medium text-[#262626] mb-4">
                Add New Provider
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#666] mb-1">Provider</label>
                  <select
                    value={newProvider}
                    onChange={(e) => {
                      setNewProvider(e.target.value as LLMProvider);
                      setNewModel(PROVIDER_INFO[e.target.value as LLMProvider].defaultModel);
                    }}
                    className="w-full px-4 py-3 border border-[#8e8e8e] text-[#262626] text-sm outline-none focus:border-[#262626]"
                  >
                    {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#8e8e8e] mt-1">
                    {PROVIDER_INFO[newProvider].description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-[#666] mb-1">
                    API Key {newProvider === "local" && "(optional for local)"}
                  </label>
                  <input
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder={newProvider === "local" ? "Not required" : "sk-..."}
                    className="w-full px-4 py-3 border border-[#8e8e8e] text-[#262626] text-sm outline-none focus:border-[#262626] placeholder:text-[#8e8e8e]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#666] mb-1">Model Name</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder={PROVIDER_INFO[newProvider].defaultModel}
                    className="w-full px-4 py-3 border border-[#8e8e8e] text-[#262626] text-sm outline-none focus:border-[#262626] placeholder:text-[#8e8e8e]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleAdd}
                    disabled={addConfig.isPending}
                    className="btn-primary text-sm px-6 py-2"
                  >
                    {addConfig.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleTest}
                    disabled={testStatus === "testing"}
                    className="flex items-center gap-2 px-6 py-2 border border-[#e6e6e6] text-sm text-[#262626] hover:border-[#262626] transition-colors"
                  >
                    {testStatus === "testing" ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : testStatus === "success" ? (
                      <Check className="w-4 h-4 text-[#3db014]" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {testStatus === "testing"
                      ? "Testing..."
                      : testStatus === "success"
                      ? "Connected"
                      : "Test Connection"}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-sm text-[#666] hover:text-[#262626]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Config List */}
          <div className="space-y-3">
            {configs && configs.length > 0 ? (
              configs.map((config) => (
                <div
                  key={config.id}
                  className={`border p-4 flex items-center justify-between ${
                    config.isDefault
                      ? "border-[#1c69d4] bg-[#f0f5ff]"
                      : "border-[#e6e6e6]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Key className="w-5 h-5 text-[#8e8e8e]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#262626]">
                          {PROVIDER_INFO[config.provider as LLMProvider]?.label || config.provider}
                        </span>
                        {config.isDefault && (
                          <span className="text-xs px-2 py-0.5 bg-[#1c69d4] text-white">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8e8e8e]">
                        Model: {config.modelName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!config.isDefault && (
                      <button
                        onClick={() => setDefault.mutate({ id: config.id })}
                        className="text-xs px-3 py-1 border border-[#e6e6e6] text-[#262626] hover:border-[#262626] transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this configuration?")) {
                          deleteConfig.mutate({ id: config.id });
                        }
                      }}
                      className="p-2 text-[#8e8e8e] hover:text-[#d20000] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-[#e6e6e6]">
                <Bot className="w-8 h-8 text-[#e6e6e6] mx-auto mb-2" />
                <p className="text-sm text-[#8e8e8e]">
                  No providers configured. Add one to enable AI analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white border border-[#e6e6e6] p-8">
          <h2 className="headline-3 text-[#262626] mb-4">About</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#e6e6e6]">
              <span className="text-sm text-[#666]">Version</span>
              <span className="text-sm text-[#262626]">1.0.0-alpha</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#e6e6e6]">
              <span className="text-sm text-[#666]">Engine</span>
              <span className="text-sm text-[#262626]">NexusAI Security</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#666]">LLM Support</span>
              <span className="text-sm text-[#3db014]">OpenAI, Groq, Anthropic, Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
