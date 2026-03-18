// @ts-nocheck
import Link from "next/link";
import Image from "next/image";
import { Cpu, Sparkles, ArrowRight, Newspaper } from "lucide-react";
import {
  getLatestDevicesWithPriority,
  getCompaniesSorted,
  getNewsArticles,
  PRIORITY_BRANDS,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

// Brand logos/emojis fallback map for visual flair
const BRAND_EMOJI: Record<string, string> = {
  samsung: "🔵", apple: "🍎", xiaomi: "🟠", google: "🔴",
  honor: "🟣", oneplus: "🔴", realme: "🟡", oppo: "🟢",
  motorola: "🔵", vivo: "🔵", redmagic: "🔴", nothing: "⚪",
  huawei: "🔴",
};

export default async function HomePage() {
  const [latestDevices, sortedBrands, { data: news }] = await Promise.all([
    getLatestDevicesWithPriority(12),
    getCompaniesSorted(),
    getNewsArticles(4),
  ]);

  // Split brands: priority first (shown in hero section), then rest
  const priorityBrandSet = new Set(PRIORITY_BRANDS);
  const herosBrands = sortedBrands.filter((b) =>
    priorityBrandSet.has(b.company.slug?.toLowerCase())
  ).slice(0, 13);
  const allBrandsPreview = sortedBrands.slice(0, 18);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

      {/* ── Hero ── */}
      <section className="text-center space-y-5 py-10">
        <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 text-brand-400 text-sm px-4 py-1.5 rounded-full">
          <Sparkles size={14} />
          AI-Powered Phone Intelligence
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Every Phone.<br />
          <span className="text-brand-400">Every Insight.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Deep specs, AI-generated reviews, OS histories, chipset breakdowns and real user ratings — all in one place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/brands" className="btn-primary flex items-center gap-2">
            Browse All Phones <ArrowRight size={16} />
          </Link>
          <Link href="/compare" className="btn-secondary">
            Compare Devices
          </Link>
        </div>
      </section>

      {/* ── Latest Devices (2025) — priority brands first ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">Latest Devices (2025)</h2>
            <p className="text-slate-500 text-sm mt-0.5">Top brands · newest first</p>
          </div>
          <Link href="/brands" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latestDevices.map((device) => {
            const brandSlug = device.company?.slug?.toLowerCase() ?? "";
            const isPriority = priorityBrandSet.has(brandSlug);
            return (
              <Link
                key={device.id}
                href={`/devices/${device.slug}`}
                className={`card p-3 hover:border-brand-500/50 transition-all group relative ${
                  isPriority ? "border-slate-700/80" : "border-slate-800/60"
                }`}
              >
                {isPriority && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-400" />
                )}
                <div className="aspect-square relative mb-3 bg-[#0f172a] rounded-lg overflow-hidden">
                  {device.image_url ? (
                    <Image
                      src={device.image_url}
                      alt={device.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">📱</div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-0.5">{device.company?.name}</p>
                <p className="text-sm font-medium text-white leading-tight line-clamp-2">{device.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Browse by Brand — priority brands highlighted ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">Browse by Brand</h2>
            <p className="text-slate-500 text-sm mt-0.5">Top brands shown first</p>
          </div>
          <Link href="/brands" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            All brands <ArrowRight size={14} />
          </Link>
        </div>

        {/* Priority brands row — larger, highlighted */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-3">
          {herosBrands.map(({ company, count }) => {
            const slug = company.slug?.toLowerCase() ?? "";
            const emoji = BRAND_EMOJI[slug];
            return (
              <Link
                key={company.id}
                href={`/brands/${company.slug}`}
                className="card p-3 flex flex-col items-center text-center hover:border-brand-500/60 transition-all group border-brand-900/60 bg-gradient-to-b from-brand-950/30 to-transparent"
              >
                <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-lg mb-2 group-hover:border-brand-400/40 transition-colors">
                  {emoji ?? <span className="text-sm font-bold text-brand-400">{company.name.charAt(0)}</span>}
                </div>
                <p className="font-semibold text-white text-xs">{company.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{count.toLocaleString()}</p>
              </Link>
            );
          })}
        </div>

        {/* Remaining brands — smaller, secondary style */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {allBrandsPreview
            .filter((b) => !priorityBrandSet.has(b.company.slug?.toLowerCase()))
            .slice(0, 12)
            .map(({ company, count }) => (
              <Link
                key={company.id}
                href={`/brands/${company.slug}`}
                className="card p-3 text-center hover:border-brand-500/40 transition-all text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                <span className="block font-semibold text-slate-300">{company.name}</span>
                <span className="text-slate-600">{count.toLocaleString()} devices</span>
              </Link>
            ))}
        </div>
      </section>

      {/* ── AI Insights promo ── */}
      <section className="ai-glow rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-brand-400 font-semibold">
              <Sparkles size={18} /> AI Insights
            </div>
            <h2 className="text-2xl font-bold text-white">
              More than specs — understand your phone
            </h2>
            <p className="text-slate-400">
              Click any spec — OS, chipset, camera — to get AI-powered context. What games can it run? How does the OS compare? What does 120Hz actually feel like?
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link href="/insights/os/android" className="btn-primary flex items-center gap-2">
              <Cpu size={16} /> OS Insights
            </Link>
            <Link href="/insights/chipset/snapdragon-8-gen-3" className="btn-secondary flex items-center gap-2">
              <Cpu size={16} /> Chipset Insights
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      {news && news.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Newspaper size={20} /> Latest News
            </h2>
            <Link href="/news" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              All news <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {news.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="card overflow-hidden hover:border-brand-500/50 transition-all group"
              >
                {article.cover_image && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image src={article.cover_image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="25vw" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-slate-500 mb-1.5">{formatDate(article.published_at)}</p>
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{article.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
