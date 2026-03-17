// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import { Smartphone, Building2, Newspaper, Star, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCount(table: string) {
  const supabase = createAdminClient();
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const [devices, companies, news, userReviews, editorialReviews, aiInsights] = await Promise.all([
    getCount("devices"),
    getCount("companies"),
    getCount("news_articles"),
    getCount("user_reviews"),
    getCount("editorial_reviews"),
    getCount("ai_insights"),
  ]);

  // Recent devices
  const supabase = createAdminClient();
  const { data: recentDevices } = await supabase
    .from("devices")
    .select("id, name, slug, announced_year, company:companies(name)")
    .order("id", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Total Devices",    value: devices.toLocaleString(),   icon: Smartphone,   href: "/admin/devices",     color: "text-blue-400" },
    { label: "Brands",           value: companies.toLocaleString(),  icon: Building2,    href: "/admin/brands",      color: "text-purple-400" },
    { label: "News Articles",    value: news.toLocaleString(),       icon: Newspaper,    href: "/admin/news",        color: "text-green-400" },
    { label: "Editorial Reviews",value: editorialReviews.toLocaleString(), icon: BookOpen, href: "/admin/reviews",   color: "text-orange-400" },
    { label: "User Reviews",     value: userReviews.toLocaleString(),icon: Star,         href: "/admin/reviews",     color: "text-yellow-400" },
    { label: "AI Insights",      value: aiInsights.toLocaleString(), icon: Sparkles,     href: "/admin/ai-insights", color: "text-brand-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Overview of MobileInsights content</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card p-5 hover:border-brand-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/news/new"        className="btn-primary text-sm">+ New Article</Link>
          <Link href="/admin/reviews/new"     className="btn-secondary text-sm">+ New Review</Link>
          <Link href="/admin/ai-insights"     className="btn-secondary text-sm flex items-center gap-1.5"><Sparkles size={13} />Generate AI Insights</Link>
        </div>
      </div>

      {/* Recent devices */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#334155] flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Devices</h2>
          <Link href="/admin/devices" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#0f172a]/60">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Device</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Brand</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Year</th>
              <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentDevices?.map((d) => (
              <tr key={d.id} className="border-t border-[#334155]/50 hover:bg-[#1e293b]/30">
                <td className="px-5 py-3 text-slate-200">{d.name}</td>
                <td className="px-5 py-3 text-slate-400">{(d.company as any)?.name}</td>
                <td className="px-5 py-3 text-slate-400">{d.announced_year ?? "—"}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/devices/${d.slug}`} className="text-xs text-brand-400 hover:text-brand-300">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
