// @ts-nocheck
/**
 * Dynamic XML sitemap — /sitemap.xml
 * Includes all devices, brands, news, and reviews.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function url(loc: string, priority: string, changefreq: string): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobileinsights.vercel.app";
  const supabase = createAdminClient();

  const [devicesRes, companiesRes, newsRes, reviewsRes] = await Promise.all([
    supabase.from("devices").select("slug, updated_at").eq("is_extracted", true).limit(5000),
    supabase.from("companies").select("slug").limit(500),
    supabase.from("news_articles").select("slug, updated_at").not("published_at", "is", null).limit(1000),
    supabase.from("editorial_reviews").select("id, updated_at").not("published_at", "is", null).limit(1000),
  ]);

  const staticPages = [
    url(`${base}`, "1.0", "daily"),
    url(`${base}/brands`, "0.8", "weekly"),
    url(`${base}/news`, "0.9", "daily"),
    url(`${base}/reviews`, "0.8", "weekly"),
    url(`${base}/compare`, "0.7", "monthly"),
    url(`${base}/search`, "0.6", "monthly"),
  ];

  const deviceUrls = (devicesRes.data ?? [])
    .filter((d) => d.slug)
    .map((d) => url(`${base}/devices/${d.slug}`, "0.8", "monthly"));

  const brandUrls = (companiesRes.data ?? [])
    .filter((c) => c.slug)
    .map((c) => url(`${base}/brands/${c.slug}`, "0.7", "weekly"));

  const newsUrls = (newsRes.data ?? [])
    .filter((n) => n.slug)
    .map((n) => url(`${base}/news/${n.slug}`, "0.7", "monthly"));

  const reviewUrls = (reviewsRes.data ?? [])
    .map((r) => url(`${base}/reviews/${r.id}`, "0.6", "monthly"));

  const allUrls = [...staticPages, ...deviceUrls, ...brandUrls, ...newsUrls, ...reviewUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
