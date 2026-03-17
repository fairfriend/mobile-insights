// @ts-nocheck
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/Pagination";
import { Search, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
const PER_PAGE = 30;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; year?: string }>;
}

export default async function AdminDevicesPage({ searchParams }: Props) {
  const { page: pageStr, q, year } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const supabase = createAdminClient();

  let query = supabase
    .from("devices")
    .select("*, company:companies(id,name,slug)", { count: "exact" })
    .order("announced_year", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (q) query = query.ilike("name", `%${q}%`);
  if (year) query = query.eq("announced_year", parseInt(year));

  const { data: devices, count } = await query;

  // Get AI insight counts
  const { data: aiRows } = await supabase
    .from("ai_insights")
    .select("device_id")
    .eq("insight_type", "device");
  const aiSet = new Set(aiRows?.map((r) => r.device_id) ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Devices</h1>
          <p className="text-slate-400 text-sm mt-0.5">{count?.toLocaleString()} total</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search devices..." className="bg-transparent text-sm text-slate-100 placeholder-slate-500 flex-1 outline-none" />
        </div>
        <select name="year" defaultValue={year} className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="">All years</option>
          {[2026,2025,2024,2023,2022,2021,2020].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="submit" className="btn-primary text-sm">Filter</button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f172a]/60 border-b border-[#334155]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Device</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Year</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">AI</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices?.map((device) => (
              <tr key={device.id} className="border-t border-[#334155]/40 hover:bg-[#1e293b]/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {device.image_url && (
                      <div className="w-8 h-8 relative shrink-0">
                        <Image src={device.image_url} alt={device.name} fill className="object-contain" sizes="32px" />
                      </div>
                    )}
                    <span className="text-slate-200">{device.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{(device.company as any)?.name}</td>
                <td className="px-4 py-3 text-slate-400">{device.announced_year ?? "—"}</td>
                <td className="px-4 py-3">
                  {aiSet.has(device.id)
                    ? <span className="badge bg-green-500/20 text-green-400"><Sparkles size={10} className="mr-1" />Done</span>
                    : <span className="badge bg-[#334155] text-slate-500">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/devices/${device.slug}`} className="text-xs text-brand-400 hover:text-brand-300">View</Link>
                    <Link href={`/admin/devices/${device.id}`} className="text-xs text-slate-400 hover:text-white">Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={count ?? 0} perPage={PER_PAGE} currentPage={page} />
    </div>
  );
}
