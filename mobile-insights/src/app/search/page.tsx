import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DeviceCard } from "@/components/ui/DeviceCard";
import { Pagination } from "@/components/ui/Pagination";
import { Search } from "lucide-react";

const PER_PAGE = 24;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const query = q?.trim() ?? "";

  let devices: any[] = [];
  let count = 0;

  if (query) {
    const supabase = await createClient();
    const { data, count: total } = await supabase
      .from("devices")
      .select("*, company:companies(id,name,slug)", { count: "exact" })
      .ilike("name", `%${query}%`)
      .eq("is_extracted", true)
      .order("announced_year", { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    devices = data ?? [];
    count = total ?? 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search bar */}
      <form className="mb-8">
        <div className="flex items-center gap-3 bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 max-w-2xl">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search phones, brands..."
            autoFocus
            className="bg-transparent text-slate-100 placeholder-slate-500 flex-1 outline-none text-base"
          />
          <button type="submit" className="btn-primary text-sm shrink-0">Search</button>
        </div>
      </form>

      {query ? (
        <>
          <p className="text-slate-400 text-sm mb-6">
            {count > 0 ? (
              <><span className="text-white font-semibold">{count.toLocaleString()}</span> results for "<span className="text-brand-400">{query}</span>"</>
            ) : (
              <>No results for "<span className="text-brand-400">{query}</span>"</>
            )}
          </p>

          {devices.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {devices.map((device) => (
                  <DeviceCard key={device.id} device={device} showAiBadge />
                ))}
              </div>
              <Pagination total={count} perPage={PER_PAGE} currentPage={page} />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-400">Try a different search term — e.g. "Samsung S25" or "iPhone 16"</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-4">🔍</div>
          <p>Type a phone name or brand to search</p>
        </div>
      )}
    </div>
  );
}
