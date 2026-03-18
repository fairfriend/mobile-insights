"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { AiReviewCard } from "./AiReviewCard";
import type { AiInsight } from "@/types/database";

interface Props {
  deviceId: number;
  deviceName: string;
  initialInsight: AiInsight | null;
}

export function AiReviewWrapper({ deviceId, deviceName, initialInsight }: Props) {
  const [insight, setInsight] = useState<AiInsight | null>(initialInsight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate if no insight exists on mount
  useEffect(() => {
    if (!insight) {
      generate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-device-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const json = await res.json();
      if (json.success && json.insight) {
        setInsight(json.insight);
      } else {
        setError(json.error ?? "Failed to generate insight");
      }
    } catch (e: any) {
      setError(e.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-[#0b1120] p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Sparkles size={28} className="text-brand-400" />
            </div>
            <Loader2
              size={20}
              className="absolute -top-1 -right-1 text-brand-400 animate-spin"
            />
          </div>
          <div>
            <p className="text-white font-semibold">Generating AI Review</p>
            <p className="text-slate-400 text-sm mt-1">
              Analysing specs for {deviceName}…
            </p>
          </div>
          {/* Animated skeleton bars */}
          <div className="w-full max-w-sm space-y-3 mt-2">
            {["Performance", "Camera", "Battery", "Display"].map((label) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 text-right">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-500/40 animate-pulse" style={{ width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">This usually takes 5–10 seconds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !insight) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <Sparkles size={24} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-300 text-sm mb-4">
          Couldn't generate AI review: {error}
        </p>
        <button
          onClick={generate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  return <AiReviewCard insight={insight} deviceName={deviceName} />;
}
