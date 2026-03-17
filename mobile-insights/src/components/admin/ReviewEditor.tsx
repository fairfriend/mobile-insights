// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: number;
  device_id: number | null;
  title: string | null;
  content: string | null;
  cover_image: string | null;
  published_at: string | null;
}

interface Device { id: number; name: string; slug: string | null; }

export function ReviewEditor({ review, devices }: { review: Review | null; devices: Device[] }) {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(review?.device_id ?? 0);
  const [title, setTitle] = useState(review?.title ?? "");
  const [content, setContent] = useState(review?.content ?? "");
  const [coverImage, setCoverImage] = useState(review?.cover_image ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (publish = false) => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      device_id: deviceId || null,
      title,
      content,
      cover_image: coverImage || null,
      published_at: publish ? new Date().toISOString() : (review?.published_at ?? null),
    };

    try {
      if (review?.id) {
        const { error } = await supabase.from("editorial_reviews").update(payload).eq("id", review.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("editorial_reviews").insert(payload);
        if (error) throw error;
      }
      router.push("/admin/reviews");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/reviews" className="text-slate-400 hover:text-white"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold text-white">{review ? "Edit Review" : "New Review"}</h1>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Device *</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(parseInt(e.target.value))}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand-500 text-sm"
          >
            <option value={0}>Select a device...</option>
            {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Review Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-brand-500"
            placeholder="e.g. Samsung Galaxy S25 Ultra Review: The Best Just Got Better"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Cover Image URL</label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-brand-500 text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Content (HTML)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500 text-sm font-mono resize-y"
            placeholder="<p>Write your review here...</p>"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => save(false)} disabled={saving || !title || !deviceId} className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
          <Save size={15} /> Save Draft
        </button>
        <button onClick={() => save(true)} disabled={saving || !title || !deviceId} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
          <Globe size={15} /> {review?.published_at ? "Update" : "Publish"}
        </button>
      </div>
    </div>
  );
}
