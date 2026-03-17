// @ts-nocheck
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeviceBySlug, getDeviceSpecs } from "@/lib/queries";
import type { SpecGroup } from "@/types/database";

interface Props {
  params: Promise<{ pair: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const [slugA, slugB] = pair.split("--vs--");
  return { title: `${slugA} vs ${slugB} — Compare` };
}

function CompareCell({ value, winner }: { value: string; winner: boolean }) {
  return (
    <td className={`px-4 py-3 text-sm text-center align-top ${winner ? "text-green-400 font-medium" : "text-slate-300"}`}>
      {value || "—"}
    </td>
  );
}

const PRIORITY_CATS = ["Network", "Launch", "Body", "Display", "Platform", "Memory", "Main Camera", "Battery", "Comms", "Features"];

export default async function ComparePairPage({ params }: Props) {
  const { pair } = await params;
  const parts = pair.split("--vs--");
  if (parts.length !== 2) notFound();

  const [slugA, slugB] = parts;

  const [{ data: deviceA }, { data: deviceB }] = await Promise.all([
    getDeviceBySlug(slugA),
    getDeviceBySlug(slugB),
  ]);

  if (!deviceA || !deviceB) notFound();

  const [specsA, specsB] = await Promise.all([
    getDeviceSpecs(deviceA.id),
    getDeviceSpecs(deviceB.id),
  ]);

  // Build unified category list
  const allCats = [...new Set([...specsA.map((g) => g.category), ...specsB.map((g) => g.category)])];
  const sortedCats = [
    ...PRIORITY_CATS.filter((c) => allCats.includes(c)),
    ...allCats.filter((c) => !PRIORITY_CATS.includes(c)),
  ];

  const specsMapA = Object.fromEntries(specsA.map((g) => [g.category, g.specs]));
  const specsMapB = Object.fromEntries(specsB.map((g) => [g.category, g.specs]));

  const companyA = (deviceA as any).company;
  const companyB = (deviceB as any).company;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/compare" className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-4">
          ← Back to Compare
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {deviceA.name} <span className="text-slate-500">vs</span> {deviceB.name}
        </h1>
      </div>

      {/* Device headers */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Spec</th>
              {[{ device: deviceA, company: companyA }, { device: deviceB, company: companyB }].map(({ device, company }) => (
                <th key={device.id} className="px-4 py-4 text-center w-[37.5%]">
                  <Link href={`/devices/${device.slug}`} className="flex flex-col items-center gap-2 group">
                    <div className="w-20 h-20 relative bg-[#0f172a] rounded-xl overflow-hidden">
                      {device.image_url ? (
                        <Image src={device.image_url} alt={device.name} fill className="object-contain p-2" sizes="80px" />
                      ) : <div className="w-full h-full flex items-center justify-center text-3xl">📱</div>}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{company?.name}</p>
                      <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{device.name}</p>
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedCats.map((category) => {
              const catSpecsA = specsMapA[category] ?? [];
              const catSpecsB = specsMapB[category] ?? [];
              const allSpecNames = [...new Set([...catSpecsA.map((s) => s.name), ...catSpecsB.map((s) => s.name)])];

              return (
                <>
                  <tr key={`cat-${category}`} className="bg-[#0f172a]/60">
                    <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                      {category}
                    </td>
                  </tr>
                  {allSpecNames.map((specName) => {
                    const valA = catSpecsA.find((s) => s.name === specName)?.value ?? "";
                    const valB = catSpecsB.find((s) => s.name === specName)?.value ?? "";
                    return (
                      <tr key={`${category}-${specName}`} className="border-t border-[#334155]/50 hover:bg-[#1e293b]/30">
                        <td className="px-4 py-3 text-sm text-slate-500">{specName}</td>
                        <CompareCell value={valA} winner={false} />
                        <CompareCell value={valB} winner={false} />
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
