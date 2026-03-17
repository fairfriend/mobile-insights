// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from("news_articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">News Articles</h1>
        <Link href="/admin/news/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={15} /> New Article
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f172a]/60 border-b border-[#334155]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Title</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Published</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles && articles.length > 0 ? articles.map((a) => (
              <tr key={a.id} className="border-t border-[#334155]/40 hover:bg-[#1e293b]/30">
                <td className="px-5 py-3 text-slate-200 max-w-xs truncate">{a.title}</td>
                <td className="px-5 py-3">
                  {a.published_at
                    ? <span className="badge bg-green-500/20 text-green-400">Published</span>
                    : <span className="badge bg-yellow-500/20 text-yellow-400">Draft</span>}
                </td>
                <td className="px-5 py-3 text-slate-400">{formatDate(a.published_at)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {a.published_at && a.slug && (
                      <Link href={`/news/${a.slug}`} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        <Eye size={12} /> View
                      </Link>
                    )}
                    <Link href={`/admin/news/${a.id}`} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                      <Pencil size={12} /> Edit
                    </Link>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">No articles yet. Create one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
