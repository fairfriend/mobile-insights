// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import { getCompanies } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Browse all mobile phone brands in our database.",
};

export const revalidate = 3600;

export default async function BrandsPage() {
  const companies = await getCompanies();

  // Get device counts per brand
  const supabase = await createClient();
  const { data: counts } = await supabase
    .from("devices")
    .select("company_id")
    .eq("is_extracted", true);

  const countMap: Record<number, number> = {};
  counts?.forEach((d) => {
    if (d.company_id) countMap[d.company_id] = (countMap[d.company_id] ?? 0) + 1;
  });

  const sorted = [...companies].sort((a, b) => (countMap[b.id] ?? 0) - (countMap[a.id] ?? 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">All Brands</h1>
        <p className="text-slate-400">{companies.length} brands · {counts?.length.toLocaleString()} devices</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sorted.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="card p-5 flex flex-col items-center text-center hover:border-brand-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#0f172a] flex items-center justify-center text-2xl mb-3 font-bold text-brand-400 group-hover:text-brand-300">
              {brand.name.charAt(0)}
            </div>
            <p className="font-semibold text-white text-sm">{brand.name}</p>
            <p className="text-xs text-slate-500 mt-1">{countMap[brand.id] ?? 0} devices</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
