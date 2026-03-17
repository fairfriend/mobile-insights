// @ts-nocheck
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDeviceSpecs, getUserReviews } from "@/lib/queries";
import { formatDate, extractSpecValue } from "@/lib/utils";
import { ChevronRight, ArrowLeft, Star } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: device } = await supabase.from("devices").select("name").eq("slug", slug).single();
  return { title: device ? `${device.name} Review` : "Review" };
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get device then its editorial review
  const { data: device } = await supabase
    .from("devices")
    .select("*, company:companies(id,name,slug)")
    .eq("slug", slug)
    .single();

  if (!device) notFound();

  const { data: review } = await supabase
    .from("editorial_reviews")
    .select("*")
    .eq("device_id", device.id)
    .not("published_at", "is", null)
    .single();

  if (!review) notFound();

  const [specGroups, userReviews] = await Promise.all([
    getDeviceSpecs(device.id),
    getUserReviews(device.id),
  ]);

  const allSpecs = specGroups.flatMap((g) => g.specs.map((s) => ({ spec_name: s.name, spec_value: s.value })));
  const company = (device as any).company;
  const avgRating = userReviews.length
    ? (userReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / userReviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300">Home</Link>
        <ChevronRight size={14} />
        <Link href="/reviews" className="hover:text-slate-300">Reviews</Link>
        <ChevronRight size={14} />
        <span className="text-slate-300">{device.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        <article className="space-y-6">
          {review.cover_image && (
            <div className="aspect-video relative rounded-2xl overflow-hidden">
              <Image src={review.cover_image} alt={review.title ?? ""} fill className="object-cover" sizes="70vw" priority />
            </div>
          )}

          <div>
            <p className="text-brand-400 text-sm font-medium mb-2">{company?.name} · {formatDate(review.published_at)}</p>
            <h1 className="text-3xl font-bold text-white mb-4">{review.title}</h1>
            {avgRating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={18} className={i <= Math.round(parseFloat(avgRating)) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                  ))}
                </div>
                <span className="text-white font-semibold">{avgRating}</span>
                <span className="text-slate-500 text-sm">({userReviews.length} user reviews)</span>
              </div>
            )}
          </div>

          <div
            className="prose prose-invert prose-slate max-w-none text-slate-300 prose-headings:text-white prose-a:text-brand-400 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: review.content ?? "" }}
          />

          <Link href="/reviews" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Reviews
          </Link>
        </article>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="aspect-square relative bg-[#0f172a] rounded-xl overflow-hidden mb-4">
              {device.image_url ? (
                <Image src={device.image_url} alt={device.name} fill className="object-contain p-4" sizes="300px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">📱</div>
              )}
            </div>
            <h3 className="font-bold text-white mb-3">{device.name}</h3>
            <div className="space-y-2">
              {[["OS", "OS"],["Chipset","Chipset"],["Display","Size"],["RAM","Internal"]].map(([label, key]) => {
                const val = extractSpecValue(allSpecs, key);
                return val ? (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-300 text-right max-w-[160px] truncate">{val}</span>
                  </div>
                ) : null;
              })}
            </div>
            <Link href={`/devices/${device.slug}`} className="btn-primary w-full text-center text-sm mt-4 block">
              Full Specs
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
