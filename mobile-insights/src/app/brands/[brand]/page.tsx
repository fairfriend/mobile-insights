// @ts-nocheck
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyBySlug, getDevices } from "@/lib/queries";
import { DeviceCard } from "@/components/ui/DeviceCard";
import { Pagination } from "@/components/ui/Pagination";

const PER_PAGE = 24;

interface Props {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const { data } = await getCompanyBySlug(brand);
  if (!data) return { title: "Brand Not Found" };
  return {
    title: `${data.name} Phones`,
    description: `Browse all ${data.name} phones with full specs and AI reviews.`,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { brand } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const { data: company, error } = await getCompanyBySlug(brand);
  if (!company || error) notFound();

  const { data: devices, count } = await getDevices({
    companyId: company.id,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-2xl font-bold text-brand-400">
            {company.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            <p className="text-slate-400 text-sm">{count?.toLocaleString()} devices</p>
          </div>
        </div>
      </div>

      {devices && devices.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device as any} showAiBadge />
            ))}
          </div>
          <Pagination total={count ?? 0} perPage={PER_PAGE} currentPage={page} />
        </>
      ) : (
        <p className="text-slate-500 text-center py-16">No devices found for this brand.</p>
      )}
    </div>
  );
}
