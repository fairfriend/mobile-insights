import { Sparkles, Zap, Camera, Battery, Cpu } from "lucide-react";
import type { AiInsight } from "@/types/database";

interface Props {
  insight: AiInsight | null;
  deviceName: string;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  performance: <Zap size={16} />,
  camera:      <Camera size={16} />,
  battery:     <Battery size={16} />,
  chipset:     <Cpu size={16} />,
};

export function AiReviewCard({ insight, deviceName }: Props) {
  if (!insight) {
    return (
      <div className="ai-glow rounded-xl p-5">
        <div className="flex items-center gap-2 text-brand-400 font-semibold mb-2">
          <Sparkles size={18} /> AI Review
        </div>
        <p className="text-slate-400 text-sm">
          AI review for the {deviceName} is being generated. Check back soon.
        </p>
      </div>
    );
  }

  const content = insight.content as Record<string, any>;

  return (
    <div className="ai-glow rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-400 font-semibold">
          <Sparkles size={18} /> AI Review
        </div>
        <span className="text-xs text-slate-500">
          Powered by {insight.model_used ?? "AI"}
        </span>
      </div>

      {content?.summary && (
        <p className="text-slate-300 text-sm leading-relaxed">{content.summary}</p>
      )}

      {/* Sections */}
      <div className="grid sm:grid-cols-2 gap-3">
        {["performance", "camera", "battery", "chipset"].map((key) =>
          content?.[key] ? (
            <div key={key} className="bg-[#0f172a]/60 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {SECTION_ICONS[key]} {key}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{content[key]}</p>
            </div>
          ) : null
        )}
      </div>

      {content?.verdict && (
        <div className="border-t border-[#334155]/50 pt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verdict</p>
          <p className="text-slate-200 text-sm">{content.verdict}</p>
        </div>
      )}
    </div>
  );
}
