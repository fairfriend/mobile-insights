// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getNewsArticles } from "@/lib/queries";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Mobile News",
  description: "Latest mobile phone news, launches, and announcements.",
};

const PER_PAGE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const { data: articles, count } = await getNewsArticles(PER_PAGE, (page - 1) * PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Newspaper size={28} className="text-brand-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Mobile News</h1>
          <p className="text-slate-400 text-sm mt-0.5">Latest launches, reviews & industry updates</p>
        </div>
      </div>

      {articles && articles.length > 0 ? (
        <>
          {/* Featured */}
          {page === 1 && articles[0] && (
            <Link href={`/news/${articles[0].slug}`} className="card overflow-hidden flex flex-col md:flex-row hover:border-brand-500/50 transition-all group mb-6">
              {articles[0].cover_image && (
                <div className="md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden">
                  <Image src={articles[0].cover_image} alt={articles[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="40vw" />
                </div>
              )}
              <div className="p-6 flex flex-col justify-center md:w-3/5">
                <span className="badge bg-brand-600/20 text-brand-400 mb-3">Featured</span>
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors">{articles[0].title}</h2>
                <p className="text-slate-400 text-sm">{formatDate(articles[0].published_at)}</p>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(page === 1 ? articles.slice(1) : articles).map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="card overflow-hidden hover:border-brand-500/50 transition-all group"
              >
                {article.cover_image && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image src={article.cover_image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-slate-500 mb-2">{formatDate(article.published_at)}</p>
                  <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-brand-300 transition-colors">{article.title}</h3>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge bg-[#334155] text-slate-400">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Pagination total={count ?? 0} perPage={PER_PAGE} currentPage={page} />
        </>
      ) : (
        <div className="text-center py-24">
          <Newspaper size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No articles published yet.</p>
          <p className="text-slate-600 text-sm mt-2">Check back soon — or head to the admin panel to add content.</p>
        </div>
      )}
    </div>
  );
}
