// @ts-nocheck
import Link from "next/link";
import Image from "next/image";
import { Cpu, Sparkles, ArrowRight, Newspaper, Star } from "lucide-react";
import { getDevices, getCompanies, getNewsArticles } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600; // ISR — revalidate every hour

export default async function HomePage() {
  const [{ data: latestDevices }, companies, { data: news }] = await Promise.all([
    getDevices({ limit: 12, year: 2025 }),
    getCompanies(),
    getNewsArticles(4),
  ]);

  const topBrands = companies.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

      {/* Hero */}
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

      {/* Latest 2025 Devices */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Latest Devices (2025)</h2>
          <Link href="/brands" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latestDevices?.map((device) => (
            <Link
              key={device.id}
              href={`/devices/${device.slug}`}
              className="card p-3 hover:border-brand-500/50 transition-all group"
            >
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
              <p className="text-xs text-slate-400 mb-0.5">{(device as any).company?.name}</p>
              <p className="text-sm font-medium text-white leading-tight line-clamp-2">{device.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Browse by Brand</h2>
          <Link href="/brands" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            All brands <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {topBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="card p-4 text-center hover:border-brand-500/50 transition-all text-sm font-medium text-slate-300 hover:text-white"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      {/* AI Insights promo */}
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

      {/* Latest News */}
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
