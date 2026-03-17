"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { SpecGroup } from "@/types/database";

const CLICKABLE_SPECS = ["OS", "Chipset", "CPU", "GPU", "Type", "Resolution"];
const AI_INSIGHT_MAP: Record<string, (value: string) => string> = {
  OS:      (v) => `/insights/os/${v.toLowerCase().replace(/\s+/g, "-")}`,
  Chipset: (v) => `/insights/chipset/${v.split("(")[0].trim().toLowerCase().replace(/\s+/g, "-")}`,
  CPU:     (v) => `/insights/chipset/${v.split("(")[0].trim().toLowerCase().replace(/\s+/g, "-")}`,
};

interface Props {
  specGroups: SpecGroup[];
}

export function SpecTable({ specGroups }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-[#334155]">
        <h2 className="text-lg font-bold text-white">Full Specifications</h2>
      </div>

      {specGroups.map(({ category, specs }) => (
        <div key={category} className="border-b border-[#334155] last:border-0">
          {/* Category header */}
          <button
            onClick={() => toggle(category)}
            className="w-full flex items-center justify-between px-5 py-3 bg-[#0f172a]/50 hover:bg-[#0f172a]/80 transition-colors"
          >
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
              {category}
            </span>
            {collapsed[category] ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronUp size={14} className="text-slate-500" />}
          </button>

          {/* Spec rows */}
          {!collapsed[category] && (
            <div className="px-5">
              {specs.map(({ name, value }, i) => {
                const isClickable = CLICKABLE_SPECS.includes(name);
                const insightHref = AI_INSIGHT_MAP[name]?.(value);

                return (
                  <div key={i} className="spec-row">
                    <span className="spec-name">{name || "—"}</span>
                    <div className="flex items-center justify-end gap-2 flex-1">
                      <span className="spec-value">{value}</span>
                      {isClickable && insightHref && (
                        <Link
                          href={insightHref}
                          className="shrink-0 p-1 rounded-md hover:bg-brand-600/20 transition-colors"
                          title={`AI insight for ${name}`}
                        >
                          <Sparkles size={13} className="text-brand-400" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
