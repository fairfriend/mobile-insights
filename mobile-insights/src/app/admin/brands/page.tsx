// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const supabase = createAdminClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  // Device counts
  const { data: counts } = await supabase.from("devices").select("company_id").eq("is_extracted", true);
  const countMap: Record<number, number> = {};
  counts?.forEach((d) => { if (d.company_id) countMap[d.company_id] = (countMap[d.company_id] ?? 0) + 1; });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Brands</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f172a]/60 border-b border-[#334155]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Brand</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Slug</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Devices</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies?.map((c) => (
              <tr key={c.id} className="border-t border-[#334155]/40 hover:bg-[#1e293b]/30">
                <td className="px-5 py-3 text-slate-200 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-3 text-slate-400">{countMap[c.id] ?? 0}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/brands/${c.slug}`} className="text-xs text-brand-400 hover:text-brand-300">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
