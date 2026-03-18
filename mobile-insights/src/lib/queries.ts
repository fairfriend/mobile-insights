// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import type { SpecGroup } from "@/types/database";

// Priority brand order (shown first everywhere)
export const PRIORITY_BRANDS = [
  "samsung", "apple", "xiaomi", "google", "honor",
  "oneplus", "realme", "oppo", "motorola", "vivo",
  "redmagic", "nothing", "huawei",
];

/** Returns a numeric priority score — lower = higher priority */
export function brandPriority(slug: string): number {
  const idx = PRIORITY_BRANDS.indexOf(slug?.toLowerCase());
  return idx === -1 ? PRIORITY_BRANDS.length : idx;
}

// ── Devices ────────────────────────────────────────────────────────────────

export async function getDevices(options: {
  limit?: number;
  offset?: number;
  companyId?: number;
  year?: number;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("devices")
    .select("*, company:companies(id,name,slug)", { count: "exact" })
    .eq("is_extracted", true)
    .order("announced_year", { ascending: false })
    .order("id", { ascending: false });

  if (options.companyId) query = query.eq("company_id", options.companyId);
  if (options.year)      query = query.eq("announced_year", options.year);
  if (options.search)    query = query.ilike("name", `%${options.search}%`);
  if (options.limit)     query = query.limit(options.limit);
  if (options.offset)    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);

  return query;
}

/**
 * Fetch latest devices for the home page, prioritising top brands.
 * Strategy:
 *   1. Fetch a larger pool of 2025 devices (up to 60)
 *   2. Sort client-side: priority brands first, then by id desc (newest first within each group)
 *   3. Return the top `limit`
 */
export async function getLatestDevicesWithPriority(limit = 12): Promise<any[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("devices")
    .select("*, company:companies(id,name,slug)")
    .eq("is_extracted", true)
    .eq("announced_year", 2025)
    .order("id", { ascending: false })
    .limit(60); // over-fetch so we have enough to re-sort

  if (!data?.length) return [];

  return data
    .sort((a, b) => {
      const pa = brandPriority(a.company?.slug);
      const pb = brandPriority(b.company?.slug);
      if (pa !== pb) return pa - pb;       // priority brand first
      return b.id - a.id;                   // newest first within same priority
    })
    .slice(0, limit);
}

export async function getDeviceBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*, company:companies(id,name,slug,url)")
    .eq("slug", slug)
    .single();

  return { data, error };
}

export async function getDeviceSpecs(deviceId: number): Promise<SpecGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("specifications")
    .select("*")
    .eq("device_id", deviceId)
    .order("id");

  if (!data) return [];

  const grouped: Record<string, { name: string; value: string }[]> = {};
  for (const spec of data) {
    const cat = spec.category ?? "Other";
    const name = spec.spec_name ?? "";
    const value = spec.spec_value ?? "";
    if (!grouped[cat]) grouped[cat] = [];
    if (name || value) grouped[cat].push({ name, value });
  }

  return Object.entries(grouped).map(([category, specs]) => ({ category, specs }));
}

export async function getSimilarDevices(deviceId: number, chipset: string | null, limit = 6) {
  const supabase = await createClient();
  if (!chipset) return [];

  const { data: specMatches } = await supabase
    .from("specifications")
    .select("device_id")
    .eq("spec_name", "Chipset")
    .ilike("spec_value", `%${chipset.split("(")[0].trim()}%`)
    .limit(20);

  if (!specMatches?.length) return [];

  const ids = specMatches
    .map((s) => s.device_id)
    .filter((id): id is number => id !== null && id !== deviceId);

  if (!ids.length) return [];

  const { data } = await supabase
    .from("devices")
    .select("*, company:companies(id,name,slug)")
    .in("id", ids.slice(0, limit));

  return data ?? [];
}

// ── Companies ──────────────────────────────────────────────────────────────

export async function getCompanies() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("name");
  return data ?? [];
}

/**
 * Fetch companies sorted with priority brands first, then by device count.
 */
export async function getCompaniesSorted(): Promise<{ company: any; count: number }[]> {
  const supabase = await createClient();

  const [{ data: companies }, { data: counts }] = await Promise.all([
    supabase.from("companies").select("*").order("name"),
    supabase.from("devices").select("company_id").eq("is_extracted", true),
  ]);

  const countMap: Record<number, number> = {};
  counts?.forEach((d) => {
    if (d.company_id) countMap[d.company_id] = (countMap[d.company_id] ?? 0) + 1;
  });

  const list = (companies ?? []).map((c) => ({
    company: c,
    count: countMap[c.id] ?? 0,
  }));

  return list.sort((a, b) => {
    const pa = brandPriority(a.company.slug);
    const pb = brandPriority(b.company.slug);
    if (pa !== pb) return pa - pb;                  // priority first
    return b.count - a.count;                        // then by device count
  });
}

export async function getCompanyBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();
  return { data, error };
}

// ── AI Insights ────────────────────────────────────────────────────────────

export async function getAiInsight(type: string, key: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("insight_type", type)
    .eq("reference_key", key)
    .single();
  return data;
}

export async function getDeviceAiInsight(deviceId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("insight_type", "device")
    .eq("device_id", deviceId)
    .single();
  return data;
}

// ── News ───────────────────────────────────────────────────────────────────

export async function getNewsArticles(limit = 10, offset = 0) {
  const supabase = await createClient();
  return supabase
    .from("news_articles")
    .select("*", { count: "exact" })
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
}

export async function getNewsArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .single();
  return { data, error };
}

// ── Reviews ────────────────────────────────────────────────────────────────

export async function getUserReviews(deviceId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_reviews")
    .select("*, user:users(id,full_name,avatar_url)")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getEditorialReview(deviceId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("editorial_reviews")
    .select("*")
    .eq("device_id", deviceId)
    .not("published_at", "is", null)
    .single();
  return data;
}
