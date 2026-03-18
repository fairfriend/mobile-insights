"use client";

import { useState } from "react";
import {
  Sparkles, Zap, Camera, Battery, Cpu, Monitor, Palette,
  Wifi, Smartphone, ChevronDown, ChevronUp, Trophy,
  Briefcase, Video, MapPin, Check, X, Star,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import type { AiInsight } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryScores {
  performance: number;
  camera:      number;
  battery:     number;
  display:     number;
  design:      number;
  value:       number;
}

interface BestForItem {
  icon: string;
  label: string;
}

interface InsightContent {
  summary?:        string;
  category_scores?: CategoryScores;
  performance?:    string;
  camera?:         string;
  battery?:        string;
  display?:        string;
  design?:         string;
  connectivity?:   string;
  software?:       string;
  pros?:           string[];
  cons?:           string[];
  best_for?:       BestForItem[];
  verdict_badge?:  string;
  verdict?:        string;
  who_should_buy?: string;
  score?:          number;
}

interface Props {
  insight: AiInsight | null;
  deviceName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 8) return "#22c55e";   // green
  if (s >= 6.5) return "#f59e0b"; // amber
  return "#ef4444";               // red
}

function scoreLabel(s: number) {
  if (s >= 9)   return "Outstanding";
  if (s >= 8)   return "Excellent";
  if (s >= 7)   return "Very Good";
  if (s >= 6)   return "Good";
  if (s >= 5)   return "Average";
  return "Below Average";
}

const BADGE_COLORS: Record<string, string> = {
  "Flagship Killer":     "from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300",
  "Best Value":          "from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-300",
  "Premium Choice":      "from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300",
  "Budget Pick":         "from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300",
  "Photography Master":  "from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300",
  "Gaming Beast":        "from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300",
  "Battery Champion":    "from-teal-500/20 to-green-500/20 border-teal-500/40 text-teal-300",
  "Balanced Performer":  "from-indigo-500/20 to-blue-500/20 border-indigo-500/40 text-indigo-300",
};

const BEST_FOR_ICONS: Record<string, React.ReactNode> = {
  camera:      <Camera size={20} />,
  gaming:      <Zap size={20} />,
  battery:     <Battery size={20} />,
  business:    <Briefcase size={20} />,
  everyday:    <Smartphone size={20} />,
  video:       <Video size={20} />,
  performance: <Cpu size={20} />,
  travel:      <MapPin size={20} />,
};

const CATEGORY_META: Record<string, { icon: React.ReactNode; label: string }> = {
  performance: { icon: <Zap size={14} />,      label: "Performance" },
  camera:      { icon: <Camera size={14} />,    label: "Camera" },
  battery:     { icon: <Battery size={14} />,   label: "Battery" },
  display:     { icon: <Monitor size={14} />,   label: "Display" },
  design:      { icon: <Palette size={14} />,   label: "Design" },
  value:       { icon: <Star size={14} />,      label: "Value" },
};

const DETAIL_SECTIONS = [
  { key: "performance", icon: <Zap size={15} />,      label: "Performance" },
  { key: "camera",      icon: <Camera size={15} />,    label: "Camera" },
  { key: "battery",     icon: <Battery size={15} />,   label: "Battery" },
  { key: "display",     icon: <Monitor size={15} />,   label: "Display" },
  { key: "design",      icon: <Palette size={15} />,   label: "Design" },
  { key: "connectivity",icon: <Wifi size={15} />,      label: "Connectivity" },
  { key: "software",    icon: <Smartphone size={15} />,label: "Software" },
];

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score / 10, 1);
  const offset = circ * (1 - pct);
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
          {/* Fill */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score.toFixed(1)}</span>
          <span className="text-xs text-slate-400">/ 10</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{scoreLabel(score)}</span>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, icon, value }: { label: string; icon: React.ReactNode; value: number }) {
  const color = scoreColor(value);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-28 shrink-0 text-slate-400 text-xs">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-right text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AiReviewCard({ insight, deviceName }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!insight) {
    return (
      <div className="ai-glow rounded-xl p-6">
        <div className="flex items-center gap-2 text-brand-400 font-semibold mb-2">
          <Sparkles size={18} /> AI Review
        </div>
        <p className="text-slate-400 text-sm">
          AI review for the {deviceName} is being generated. Check back soon.
        </p>
      </div>
    );
  }

  const c = insight.content as InsightContent;
  const score = c.score ?? 0;
  const scores = c.category_scores;
  const badgeClass = BADGE_COLORS[c.verdict_badge ?? ""] ?? "from-brand-500/20 to-purple-500/20 border-brand-500/40 text-brand-300";

  // Radar data
  const radarData = scores
    ? Object.entries(scores).map(([key, val]) => ({
        subject: CATEGORY_META[key]?.label ?? key,
        value: val,
        fullMark: 10,
      }))
    : [];

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-[#0b1120]">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-brand-900/60 to-purple-900/40 px-5 py-4 flex items-center justify-between border-b border-slate-700/40">
        <div className="flex items-center gap-2 text-brand-300 font-semibold">
          <Sparkles size={18} />
          <span>AI Review</span>
        </div>
        <span className="text-xs text-slate-500">
          {insight.model_used ?? "AI"} · {new Date(insight.generated_at).toLocaleDateString()}
        </span>
      </div>

      <div className="p-5 space-y-6">

        {/* ── Hero: Score Ring + Summary + Verdict Badge ── */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {score > 0 && <ScoreRing score={score} />}
          <div className="flex-1 space-y-3">
            {c.summary && (
              <p className="text-slate-300 text-sm leading-relaxed">{c.summary}</p>
            )}
            {c.verdict_badge && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-gradient-to-r text-xs font-bold tracking-wide ${badgeClass}`}>
                <Trophy size={13} />
                {c.verdict_badge}
              </div>
            )}
          </div>
        </div>

        {/* ── Category Score Bars ── */}
        {scores && (
          <div className="bg-slate-800/40 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Category Scores
            </h3>
            {Object.entries(scores).map(([key, val]) => (
              <ScoreBar
                key={key}
                label={CATEGORY_META[key]?.label ?? key}
                icon={CATEGORY_META[key]?.icon}
                value={val}
              />
            ))}
          </div>
        )}

        {/* ── Radar Chart ── */}
        {radarData.length > 0 && (
          <div className="bg-slate-800/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Performance Radar
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#6366f1" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v}/10`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Pros & Cons ── */}
        {(c.pros?.length || c.cons?.length) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Pros */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Check size={13} /> What we love
              </h3>
              <ul className="space-y-2">
                {c.pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={9} className="text-green-400" />
                    </span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            {/* Cons */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <X size={13} /> Room to improve
              </h3>
              <ul className="space-y-2">
                {c.cons?.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X size={9} className="text-red-400" />
                    </span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Best For ── */}
        {c.best_for && c.best_for.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Best For
            </h3>
            <div className="flex flex-wrap gap-2">
              {c.best_for.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-medium"
                >
                  <span className="text-brand-400">
                    {BEST_FOR_ICONS[item.icon] ?? <Sparkles size={16} />}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Detail Sections (accordion) ── */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            In-Depth Analysis
          </h3>
          {DETAIL_SECTIONS.map(({ key, icon, label }) =>
            c[key as keyof InsightContent] ? (
              <div key={key} className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-brand-300">
                    {icon} {label}
                  </span>
                  {expandedSection === key
                    ? <ChevronUp size={15} className="text-slate-500" />
                    : <ChevronDown size={15} className="text-slate-500" />
                  }
                </button>
                {expandedSection === key && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-700/40 bg-slate-900/40">
                    {c[key as keyof InsightContent] as string}
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>

        {/* ── Verdict ── */}
        {c.verdict && (
          <div className="rounded-xl bg-gradient-to-br from-brand-900/40 to-purple-900/30 border border-brand-700/30 p-4 space-y-1">
            <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Final Verdict</p>
            <p className="text-slate-200 text-sm leading-relaxed">{c.verdict}</p>
            {c.who_should_buy && (
              <p className="text-xs text-slate-400 pt-1">
                <span className="text-slate-500">Best for:</span> {c.who_should_buy}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
