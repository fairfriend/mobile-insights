// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import { getCompaniesSorted, PRIORITY_BRANDS } from "@/lib/queries";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Browse all mobile phone brands in our database.",
};

export const revalidate = 3600;

const BRAND_EMOJI: Record<string, string> = {
  samsung: "🔵", apple: "🍎", xiaomi: "🟠", google: "🔴",
  honor: "🟣", oneplus: "🔴", realme: "🟡", oppo: "🟢",
  motorola: "🔵", vivo: "🔵", redmagic: "🔴", nothing: "⚪",
  huawei: "🔴",
};

export default async function BrandsPage() {
  const sortedBrands = await getCompaniesSorted();

  const prioritySet = new Set(PRIORITY_BRANDS);
  const priorityBrands = sortedBrands.filter((b) =>
    prioritySet.has(b.company.slug?.toLowerCase())
  );
  const otherBrands = sortedBrands.filter(
    (b) => !prioritySet.has(b.company.slug?.toLowerCase())
  );

  const totalDevices = sortedBrands.reduce((s, b) => s + b.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">All Brands</h1>
        <p className="text-slate-400">
          {sortedBrands.length} brands · {totalDevices.toLocaleString()} devices
        </p>
      </div>

      {/* ── Priority / Featured Brands ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold text-white">Featured Brands</h2>
          <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
            Top {priorityBrands.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {priorityBrands.map(({ company, count }) => {
            const slug = company.slug?.toLowerCase() ?? "";
            const emoji = BRAND_EMOJI[slug];
            return (
              <Link
                key={company.id}
                href={`/brands/${company.slug}`}
                className="card p-5 flex flex-col items-center text-center hover:border-brand-500/60 transition-all group border-brand-900/50 bg-gradient-to-b from-brand-950/40 to-transparent"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl mb-3 group-hover:border-brand-400/50 group-hover:bg-brand-500/15 transition-all">
                  {emoji ?? (
                    <span className="text-xl font-bold text-brand-400">
                      {company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <p className="font-bold text-white text-sm">{company.name}</p>
                <p className="text-xs text-slate-500 mt-1">{count.toLocaleString()} devices</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 mb-8" />

      {/* ── All Other Brands ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-5">All Other Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {otherBrands.map(({ company, count }) => (
            <Link
              key={company.id}
              href={`/brands/${company.slug}`}
              className="card p-4 flex flex-col items-center text-center hover:border-brand-500/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-base font-bold text-brand-400 group-hover:text-brand-300 mb-2 transition-colors">
                {company.name.charAt(0)}
              </div>
              <p className="font-semibold text-white text-sm">{company.name}</p>
              <p className="text-xs text-slate-500 mt-1">{count.toLocaleString()} devices</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
