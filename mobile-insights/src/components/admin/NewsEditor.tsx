// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  slug: string | null;
  content: string | null;
  cover_image: string | null;
  tags: string[] | null;
  published_at: string | null;
}

export function NewsEditor({ article }: { article: Article | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverImage, setCoverImage] = useState(article?.cover_image ?? "");
  const [tags, setTags] = useState(article?.tags?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (publish = false) => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      title,
      slug: slugify(title),
      content,
      cover_image: coverImage || null,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      published_at: publish ? new Date().toISOString() : (article?.published_at ?? null),
      updated_at: new Date().toISOString(),
    };

    try {
      if (article?.id) {
        const { error } = await supabase.from("news_articles").update(payload).eq("id", article.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news_articles").insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      router.push("/admin/news");
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
        <Link href="/admin/news" className="text-slate-400 hover:text-white"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold text-white">{article ? "Edit Article" : "New Article"}</h1>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-brand-500 text-base"
            placeholder="Article title..."
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
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-brand-500 text-sm"
            placeholder="Samsung, Galaxy, Android..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Content (HTML or plain text)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500 text-sm font-mono resize-y"
            placeholder="<p>Write your article content here...</p>"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => save(false)} disabled={saving || !title} className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
          <Save size={15} /> Save Draft
        </button>
        <button onClick={() => save(true)} disabled={saving || !title} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
          <Globe size={15} /> {article?.published_at ? "Update" : "Publish"}
        </button>
      </div>
    </div>
  );
}
