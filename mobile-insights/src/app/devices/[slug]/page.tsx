// @ts-nocheck
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, Star, ChevronRight } from "lucide-react";
import {
  getDeviceBySlug,
  getDeviceSpecs,
  getDeviceAiInsight,
  getUserReviews,
  getEditorialReview,
  getSimilarDevices,
} from "@/lib/queries";
import { extractSpecValue } from "@/lib/utils";
import { SpecTable } from "@/components/device/SpecTable";
import { AiReviewCard } from "@/components/device/AiReviewCard";
import { UserReviewSection } from "@/components/device/UserReviewSection";
import { SimilarDevices } from "@/components/device/SimilarDevices";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: device } = await getDeviceBySlug(slug);
  if (!device) return { title: "Device Not Found" };

  return {
    title: `${device.name} Full Specs & AI Review`,
    description: `Full specifications, AI-generated review, and deep insights for the ${device.name}.`,
    openGraph: {
      images: device.image_url ? [device.image_url] : [],
    },
  };
}

export default async function DevicePage({ params }: Props) {
  const { slug } = await params;
  const { data: device, error } = await getDeviceBySlug(slug);

  if (!device || error) notFound();

  const [specGroups, aiInsight, userReviews, editorialReview] = await Promise.all([
    getDeviceSpecs(device.id),
    getDeviceAiInsight(device.id),
    getUserReviews(device.id),
    getEditorialReview(device.id),
  ]);

  // Get flat specs for similar devices lookup
  const allSpecs = specGroups.flatMap((g) => g.specs.map((s) => ({ spec_name: s.name, spec_value: s.value })));
  const chipset = extractSpecValue(allSpecs, "Chipset");
  const os = extractSpecValue(allSpecs, "OS");
  const similarDevices = await getSimilarDevices(device.id, chipset);

  const avgRating = userReviews.length
    ? (userReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / userReviews.length).toFixed(1)
    : null;

  const company = (device as any).company;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300">Home</Link>
        <ChevronRight size={14} />
        <Link href="/brands" className="hover:text-slate-300">Brands</Link>
        {company && (
          <>
            <ChevronRight size={14} />
            <Link href={`/brands/${company.slug}`} className="hover:text-slate-300">{company.name}</Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-slate-300">{device.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Left: Image + quick info */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="aspect-square relative bg-[#0f172a] rounded-xl overflow-hidden mb-4">
              {device.image_url ? (
                <Image src={device.image_url} alt={device.name} fill className="object-contain p-4" sizes="300px" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">📱</div>
              )}
            </div>

            <h1 className="text-xl font-bold text-white mb-1">{device.name}</h1>
            {company && (
              <Link href={`/brands/${company.slug}`} className="text-sm text-brand-400 hover:text-brand-300">
                {company.name}
              </Link>
            )}

            {avgRating && (
              <div className="flex items-center gap-1.5 mt-3">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-white">{avgRating}</span>
                <span className="text-sm text-slate-500">({userReviews.length} reviews)</span>
              </div>
            )}

            {/* Quick specs */}
            <div className="mt-4 space-y-2">
              {[
                { label: "OS",      value: os },
                { label: "Chipset", value: chipset },
                { label: "RAM",     value: extractSpecValue(allSpecs, "Internal") },
                { label: "Display", value: extractSpecValue(allSpecs, "Size") },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 text-right max-w-[180px] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight links */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Insights</p>
            {os && (
              <Link
                href={`/insights/os/${os.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f172a] hover:bg-brand-600/10 transition-colors group"
              >
                <div className="flex items-center gap-2 text-sm text-slate-300 group-hover:text-white">
                  <Sparkles size={14} className="text-brand-400" />
                  {os} Insight
                </div>
                <ChevronRight size={14} className="text-slate-500" />
              </Link>
            )}
            {chipset && (
              <Link
                href={`/insights/chipset/${chipset.split("(")[0].trim().toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f172a] hover:bg-brand-600/10 transition-colors group"
              >
                <div className="flex items-center gap-2 text-sm text-slate-300 group-hover:text-white">
                  <Sparkles size={14} className="text-brand-400" />
                  Chipset Insight
                </div>
                <ChevronRight size={14} className="text-slate-500" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: Specs + Reviews + AI */}
        <div className="space-y-6">
          {/* AI Review */}
          {device.announced_year && device.announced_year >= 2025 && (
            <AiReviewCard insight={aiInsight} deviceName={device.name} />
          )}

          {/* Full Specs */}
          <SpecTable specGroups={specGroups} />

          {/* Editorial Review */}
          {editorialReview && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Editorial Review</h2>
              <h3 className="text-base font-semibold text-brand-400 mb-3">{editorialReview.title}</h3>
              <div
                className="prose prose-invert prose-sm max-w-none text-slate-300"
                dangerouslySetInnerHTML={{ __html: editorialReview.content ?? "" }}
              />
            </div>
          )}

          {/* User Reviews */}
          <UserReviewSection reviews={userReviews} deviceId={device.id} />

          {/* Similar Devices */}
          {similarDevices.length > 0 && <SimilarDevices devices={similarDevices} />}
        </div>
      </div>
    </div>
  );
}
