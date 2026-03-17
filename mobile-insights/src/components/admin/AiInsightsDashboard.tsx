"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Sparkles, Loader2, CheckCircle, Cpu, Globe, Play, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Device {
  id: number;
  name: string;
  slug: string | null;
  image_url: string | null;
  company?: { name: string; slug: string | null } | null;
}

interface Insight {
  id: number;
  insight_type: string;
  reference_key: string;
  device_id: number | null;
  model_used: string | null;
  generated_at: string;
}

interface Props {
  devices2025: Device[];
  total2025: number;
  existingInsights: Insight[];
  totalInsights: number;
  deviceInsightIds: number[];
}

const QUICK_OS = ["android-15", "android-14", "ios-18", "ios-17", "hyperos", "one-ui-7"];
const QUICK_CHIPSETS = [
  "snapdragon-8-elite", "snapdragon-8-gen-3", "apple-a18-pro", "apple-a18",
  "dimensity-9400", "dimensity-9300", "exynos-2500", "google-tensor-g4",
];

export function AiInsightsDashboard({ devices2025, total2025, existingInsights, totalInsights, deviceInsightIds }: Props) {
  const router = useRouter();
  const [loadingIds, setLoadingIds] = useState<Set<number | string>>(new Set());
  const [doneIds, setDoneIds] = useState<Set<number | string>>(new Set(deviceInsightIds));
  const [errors, setErrors] = useState<Record<string | number, string>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<"devices" | "os" | "chipset">("devices");
  const [osInput, setOsInput] = useState("");
  const [chipsetInput, setChipsetInput] = useState("");

  const generateDevice = async (deviceId: number) => {
    setLoadingIds((prev) => new Set([...prev, deviceId]));
    setErrors((prev) => { const n = { ...prev }; delete n[deviceId]; return n; });

    try {
      const res = await fetch("/api/ai/generate-device-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoneIds((prev) => new Set([...prev, deviceId]));
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [deviceId]: e.message }));
    } finally {
      setLoadingIds((prev) => { const n = new Set(prev); n.delete(deviceId); return n; });
    }
  };

  const generateInsight = async (type: string, key: string) => {
    const id = `${type}-${key}`;
    setLoadingIds((prev) => new Set([...prev, id]));
    setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });

    try {
      const res = await fetch("/api/ai/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoneIds((prev) => new Set([...prev, id]));
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [id]: e.message }));
    } finally {
      setLoadingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const runBatch = async () => {
    const pending = devices2025.filter((d) => !doneIds.has(d.id));
    if (!pending.length) return;
    if (!confirm(`Generate AI reviews for ${pending.length} devices? This will use OpenAI credits.`)) return;

    setBatchRunning(true);
    setBatchProgress({ done: 0, total: pending.length });

    for (const device of pending) {
      await generateDevice(device.id);
      setBatchProgress((p) => ({ ...p, done: p.done + 1 }));
      await new Promise((r) => setTimeout(r, 500)); // rate limiting
    }

    setBatchRunning(false);
    router.refresh();
  };

  const doneCount = devices2025.filter((d) => doneIds.has(d.id)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles size={22} className="text-brand-400" /> AI Insights Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">Generate AI-powered reviews, OS insights, and chipset breakdowns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold text-white">{totalInsights}</p>
          <p className="text-slate-500 text-sm">Total Insights</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-white">{doneCount}<span className="text-slate-500 text-base font-normal">/{total2025}</span></p>
          <p className="text-slate-500 text-sm">2025 Devices Done</p>
        </div>
        <div className="card p-4">
          <div className="h-2 bg-[#334155] rounded-full mb-2 mt-1">
            <div className="h-2 bg-brand-500 rounded-full transition-all" style={{ width: `${total2025 ? (doneCount / total2025) * 100 : 0}%` }} />
          </div>
          <p className="text-slate-500 text-sm">{total2025 ? Math.round((doneCount / total2025) * 100) : 0}% complete</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#334155]">
        {[
          { key: "devices",  label: "Device Reviews",   icon: <Sparkles size={14} /> },
          { key: "os",       label: "OS Insights",      icon: <Globe size={14} /> },
          { key: "chipset",  label: "Chipset Insights", icon: <Cpu size={14} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Device Reviews Tab */}
      {activeTab === "devices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{devices2025.length} devices from 2025+</p>
            <button
              onClick={runBatch}
              disabled={batchRunning || doneCount === total2025}
              className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {batchRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {batchRunning
                ? `Generating ${batchProgress.done}/${batchProgress.total}...`
                : `Batch Generate All (${devices2025.length - doneCount} pending)`}
            </button>
          </div>

          {batchRunning && (
            <div className="card p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Batch progress</span>
                <span className="text-white">{batchProgress.done}/{batchProgress.total}</span>
              </div>
              <div className="h-2 bg-[#334155] rounded-full">
                <div className="h-2 bg-brand-500 rounded-full transition-all" style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {devices2025.map((device) => {
              const isDone = doneIds.has(device.id);
              const isLoading = loadingIds.has(device.id);
              const err = errors[device.id];
              const company = device.company as any;

              return (
                <div key={device.id} className="card p-3 flex items-center gap-3">
                  <div className="w-10 h-10 relative bg-[#0f172a] rounded-lg overflow-hidden shrink-0">
                    {device.image_url ? (
                      <Image src={device.image_url} alt={device.name} fill className="object-contain p-0.5" sizes="40px" />
                    ) : <div className="w-full h-full flex items-center justify-center text-lg">📱</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{device.name}</p>
                    <p className="text-xs text-slate-500">{company?.name}</p>
                    {err && <p className="text-xs text-red-400 mt-0.5">{err}</p>}
                  </div>
                  <div className="shrink-0">
                    {isDone ? (
                      <button onClick={() => generateDevice(device.id)} disabled={isLoading} className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-400 transition-colors">
                        <RefreshCw size={12} /> Regen
                      </button>
                    ) : (
                      <button
                        onClick={() => generateDevice(device.id)}
                        disabled={isLoading}
                        className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {isLoading ? "..." : "Generate"}
                      </button>
                    )}
                  </div>
                  {isDone && !isLoading && (
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OS Tab */}
      {activeTab === "os" && (
        <div className="space-y-5">
          <div className="card p-5">
            <label className="block text-sm font-medium text-slate-400 mb-2">Custom OS (slug format)</label>
            <div className="flex gap-2">
              <input
                value={osInput}
                onChange={(e) => setOsInput(e.target.value)}
                placeholder="e.g. android-15, ios-18, miui-14"
                className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500"
              />
              <button
                onClick={() => { if (osInput.trim()) generateInsight("os", osInput.trim()); }}
                disabled={!osInput.trim() || loadingIds.has(`os-${osInput.trim()}`)}
                className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles size={14} /> Generate
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick Generate</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_OS.map((os) => {
                const id = `os-${os}`;
                const isDone = doneIds.has(id);
                const isLoading = loadingIds.has(id);
                return (
                  <button
                    key={os}
                    onClick={() => generateInsight("os", os)}
                    disabled={isLoading}
                    className={`card p-3 text-left flex items-center justify-between hover:border-brand-500/50 transition-all ${isDone ? "border-green-500/30" : ""}`}
                  >
                    <span className="text-sm text-slate-300">{os.replace(/-/g, " ")}</span>
                    {isDone ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                      : isLoading ? <Loader2 size={14} className="animate-spin text-brand-400 shrink-0" />
                      : <Sparkles size={14} className="text-slate-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chipset Tab */}
      {activeTab === "chipset" && (
        <div className="space-y-5">
          <div className="card p-5">
            <label className="block text-sm font-medium text-slate-400 mb-2">Custom Chipset (slug format)</label>
            <div className="flex gap-2">
              <input
                value={chipsetInput}
                onChange={(e) => setChipsetInput(e.target.value)}
                placeholder="e.g. snapdragon-8-elite, apple-a18-pro"
                className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500"
              />
              <button
                onClick={() => { if (chipsetInput.trim()) generateInsight("chipset", chipsetInput.trim()); }}
                disabled={!chipsetInput.trim() || loadingIds.has(`chipset-${chipsetInput.trim()}`)}
                className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles size={14} /> Generate
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick Generate</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_CHIPSETS.map((chip) => {
                const id = `chipset-${chip}`;
                const isDone = doneIds.has(id);
                const isLoading = loadingIds.has(id);
                return (
                  <button
                    key={chip}
                    onClick={() => generateInsight("chipset", chip)}
                    disabled={isLoading}
                    className={`card p-3 text-left flex items-center justify-between hover:border-brand-500/50 transition-all ${isDone ? "border-green-500/30" : ""}`}
                  >
                    <span className="text-sm text-slate-300 line-clamp-1">{chip.replace(/-/g, " ")}</span>
                    {isDone ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                      : isLoading ? <Loader2 size={14} className="animate-spin text-brand-400 shrink-0" />
                      : <Cpu size={14} className="text-slate-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
