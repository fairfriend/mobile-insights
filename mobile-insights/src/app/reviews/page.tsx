// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Star, BookOpen } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Editorial Reviews",
  description: "In-depth editorial reviews of the latest mobile phones.",
};

const PER_PAGE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ReviewsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const supabase = await createClient();
  const { data: reviews, count } = await supabase
    .from("editorial_reviews")
    .select("*, device:devices(id,name,slug,image_url,company:companies(name,slug))", { count: "exact" })
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center gap-3">
        <BookOpen size={28} className="text-brand-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Editorial Reviews</h1>
          <p className="text-slate-400 text-sm mt-0.5">Expert in-depth analysis of the latest phones</p>
        </div>
      </div>

      {reviews && reviews.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review) => {
              const device = review.device as any;
              return (
                <Link
                  key={review.id}
                  href={`/reviews/${device?.slug ?? review.id}`}
                  className="card overflow-hidden hover:border-brand-500/50 transition-all group"
                >
                  <div className="aspect-video relative bg-[#0f172a] overflow-hidden">
                    {review.cover_image ? (
                      <Image src={review.cover_image} alt={review.title ?? ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                    ) : device?.image_url ? (
                      <Image src={device.image_url} alt={device.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📱</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-500 mb-2">{formatDate(review.published_at)}</p>
                    <p className="text-xs text-brand-400 font-medium mb-1">{device?.company?.name} {device?.name}</p>
                    <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-brand-300 transition-colors">
                      {review.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
          <Pagination total={count ?? 0} perPage={PER_PAGE} currentPage={page} />
        </>
      ) : (
        <div className="text-center py-24">
          <BookOpen size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No reviews published yet.</p>
          <p className="text-slate-600 text-sm mt-2">Head to the admin panel to write your first review.</p>
        </div>
      )}
    </div>
  );
}
