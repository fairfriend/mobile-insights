// @ts-nocheck
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsArticleBySlug, getNewsArticles } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getNewsArticleBySlug(slug);
  if (!data) return { title: "Article Not Found" };
  return {
    title: data.title,
    openGraph: { images: data.cover_image ? [data.cover_image] : [] },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const { data: article, error } = await getNewsArticleBySlug(slug);
  if (!article || error) notFound();

  const { data: related } = await getNewsArticles(4);
  const relatedFiltered = related?.filter((a) => a.id !== article.id).slice(0, 3) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300">Home</Link>
        <ChevronRight size={14} />
        <Link href="/news" className="hover:text-slate-300">News</Link>
        <ChevronRight size={14} />
        <span className="text-slate-300 truncate max-w-xs">{article.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        {/* Main content */}
        <article>
          {article.cover_image && (
            <div className="aspect-video relative rounded-2xl overflow-hidden mb-8">
              <Image src={article.cover_image} alt={article.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 70vw" priority />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags?.map((tag) => (
              <span key={tag} className="badge bg-brand-600/20 text-brand-400">{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
          <p className="text-slate-400 text-sm mb-8">{formatDate(article.published_at)}</p>

          <div
            className="prose prose-invert prose-slate max-w-none text-slate-300 prose-headings:text-white prose-a:text-brand-400 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content ?? "<p>No content available.</p>" }}
          />

          <Link href="/news" className="inline-flex items-center gap-2 mt-10 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to News
          </Link>
        </article>

        {/* Sidebar */}
        <aside className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">More News</h3>
          {relatedFiltered.map((a) => (
            <Link key={a.id} href={`/news/${a.slug}`} className="card p-4 flex gap-3 hover:border-brand-500/50 transition-all group">
              {a.cover_image && (
                <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                  <Image src={a.cover_image} alt={a.title} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-1">{formatDate(a.published_at)}</p>
                <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-brand-300 transition-colors">{a.title}</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
