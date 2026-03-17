"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ArrowRight, X } from "lucide-react";

interface Device {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  company?: { name: string } | null;
}

export default function ComparePage() {
  const router = useRouter();
  const [query1, setQuery1] = useState("");
  const [query2, setQuery2] = useState("");
  const [results1, setResults1] = useState<Device[]>([]);
  const [results2, setResults2] = useState<Device[]>([]);
  const [selected1, setSelected1] = useState<Device | null>(null);
  const [selected2, setSelected2] = useState<Device | null>(null);

  const search = async (q: string, setResults: (r: Device[]) => void) => {
    if (q.length < 2) { setResults([]); return; }
    const res = await fetch(`/api/search-devices?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => { search(query1, setResults1); }, [query1]);
  useEffect(() => { search(query2, setResults2); }, [query2]);

  const canCompare = selected1 && selected2;

  const handleCompare = () => {
    if (!canCompare) return;
    router.push(`/compare/${selected1.slug}--vs--${selected2.slug}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Compare Phones</h1>
        <p className="text-slate-400">Select two phones to see a side-by-side spec comparison</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Phone 1", query: query1, setQuery: setQuery1, results: results1, selected: selected1, setSelected: setSelected1, clearResults: () => setResults1([]) },
          { label: "Phone 2", query: query2, setQuery: setQuery2, results: results2, selected: selected2, setSelected: setSelected2, clearResults: () => setResults2([]) },
        ].map(({ label, query, setQuery, results, selected, setSelected, clearResults }) => (
          <div key={label}>
            <p className="text-sm font-semibold text-slate-400 mb-2">{label}</p>
            {selected ? (
              <div className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 relative bg-[#0f172a] rounded-lg overflow-hidden shrink-0">
                  {selected.image_url ? (
                    <Image src={selected.image_url} alt={selected.name} fill className="object-contain p-1" sizes="56px" />
                  ) : <div className="w-full h-full flex items-center justify-center text-2xl">📱</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{selected.company?.name}</p>
                  <p className="font-semibold text-white truncate">{selected.name}</p>
                </div>
                <button onClick={() => { setSelected(null); setQuery(""); }} className="p-1.5 rounded-lg hover:bg-[#334155] text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2.5">
                  <Search size={16} className="text-slate-400 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search phone name..."
                    className="bg-transparent text-sm text-slate-100 placeholder-slate-500 flex-1 outline-none"
                  />
                </div>
                {results.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl overflow-hidden">
                    {results.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => { setSelected(device); setQuery(""); clearResults(); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#334155] transition-colors text-left"
                      >
                        <div className="w-8 h-8 relative bg-[#0f172a] rounded shrink-0">
                          {device.image_url && <Image src={device.image_url} alt={device.name} fill className="object-contain" sizes="32px" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">{device.company?.name}</p>
                          <p className="text-sm text-white truncate">{device.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className="btn-primary px-8 py-3 text-base flex items-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Compare Now <ArrowRight size={18} />
        </button>
      </div>

      {/* Popular comparisons */}
      <div className="mt-12">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Popular Comparisons</h3>
        <div className="flex flex-wrap gap-2">
          {[
            ["samsung-galaxy-s25-ultra-3", "apple-iphone-16-pro-max-25"],
            ["google-pixel-9-pro-xl-26", "samsung-galaxy-s25-3"],
          ].map(([a, b]) => (
            <Link key={`${a}--vs--${b}`} href={`/compare/${a}--vs--${b}`}
              className="text-sm bg-[#1e293b] border border-[#334155] px-3 py-1.5 rounded-lg text-slate-300 hover:border-brand-500/50 hover:text-white transition-all">
              {a.split("-").slice(0, 3).join(" ")} vs {b.split("-").slice(0, 3).join(" ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Need Link import
import Link from "next/link";
