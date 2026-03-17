// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("editorial_reviews")
    .select("*, device:devices(id,name,slug)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Editorial Reviews</h1>
        <Link href="/admin/reviews/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={15} /> New Review
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f172a]/60 border-b border-[#334155]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Title</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Device</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Published</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews && reviews.length > 0 ? reviews.map((r) => {
              const device = r.device as any;
              return (
                <tr key={r.id} className="border-t border-[#334155]/40 hover:bg-[#1e293b]/30">
                  <td className="px-5 py-3 text-slate-200 max-w-xs truncate">{r.title}</td>
                  <td className="px-5 py-3 text-slate-400">{device?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    {r.published_at
                      ? <span className="badge bg-green-500/20 text-green-400">Published</span>
                      : <span className="badge bg-yellow-500/20 text-yellow-400">Draft</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(r.published_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/reviews/${r.id}`} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 justify-end">
                      <Pencil size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No reviews yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
