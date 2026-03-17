"use client";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

interface Props {
  deviceId: number;
  deviceName: string;
  hasExisting: boolean;
}

export function GenerateAiButton({ deviceId, deviceName, hasExisting }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!confirm(`Generate AI review for ${deviceName}? This will use OpenAI credits.`)) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-device-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-green-400 text-sm">
        <CheckCircle size={16} /> Generated!
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-red-400">{error}</span>}
      <button
        onClick={generate}
        disabled={loading}
        className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {hasExisting ? "Regenerate" : "Generate AI Review"}
      </button>
    </div>
  );
}
