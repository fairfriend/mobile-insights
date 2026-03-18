// @ts-nocheck
/**
 * Bulk AI insight generation.
 * Targets:
 *   - All devices from 2024+
 *   - All devices from top brands (Samsung, Apple, Xiaomi, etc.) regardless of year
 *
 * Protected by a shared secret header: x-api-secret.
 * POST /api/ai/bulk-generate
 * Body: { limit?: number, brand?: string } (default 10 per run to control costs)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const API_SECRET = process.env.BULK_GENERATE_SECRET ?? "change-me";

const TOP_BRAND_SLUGS = [
  "samsung", "apple", "xiaomi", "google", "honor",
  "oneplus", "realme", "oppo", "motorola", "vivo",
  "huawei", "sony", "nokia", "asus",
];

export async function POST(request: NextRequest) {
  // Auth check
  const secret = request.headers.get("x-api-secret");
  if (secret !== API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { limit = 10, brand } = await request.json().catch(() => ({}));
  const supabase = createAdminClient();

  // ── Build device query ──────────────────────────────────────────────────

  let deviceQuery = supabase
    .from("devices")
    .select("id, name, announced_year, company:companies(slug)")
    .eq("is_extracted", true)
    .order("announced_year", { ascending: false });

  if (brand) {
    // Filter by specific brand slug
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .ilike("slug", brand)
      .single();
    if (company) deviceQuery = deviceQuery.eq("company_id", company.id);
  }

  // Over-fetch to account for ones with existing insights
  const { data: devices, error } = await deviceQuery.limit(limit * 5);

  if (error || !devices?.length) {
    return NextResponse.json({ message: "No devices found", processed: 0 });
  }

  // Filter to only eligible devices (2024+ OR top brand)
  const eligible = devices.filter((d) => {
    if (d.announced_year && d.announced_year >= 2024) return true;
    const slug = d.company?.slug?.toLowerCase() ?? "";
    return TOP_BRAND_SLUGS.includes(slug);
  });

  if (!eligible.length) {
    return NextResponse.json({ message: "No eligible devices found", processed: 0 });
  }

  // Filter out devices that already have fresh insights (< 30 days old)
  const { data: existingInsights } = await supabase
    .from("ai_insights")
    .select("device_id, generated_at")
    .eq("insight_type", "device")
    .in("device_id", eligible.map((d) => d.id));

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const existingIds = new Set(
    (existingInsights ?? [])
      .filter((i) => Date.now() - new Date(i.generated_at).getTime() < thirtyDays)
      .map((i) => i.device_id)
  );

  const toProcess = eligible.filter((d) => !existingIds.has(d.id)).slice(0, limit);

  if (!toProcess.length) {
    return NextResponse.json({
      message: "All eligible devices already have fresh insights",
      processed: 0,
    });
  }

  // ── Generate ────────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const results: { id: number; name: string; year: number | null; status: string }[] = [];

  for (const device of toProcess) {
    try {
      const res = await fetch(`${baseUrl}/api/ai/generate-device-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id }),
      });
      const json = await res.json();
      results.push({
        id: device.id,
        name: device.name,
        year: device.announced_year,
        status: json.success ? (json.cached ? "cached" : "generated") : `failed: ${json.error}`,
      });
    } catch (err: any) {
      results.push({
        id: device.id,
        name: device.name,
        year: device.announced_year,
        status: `error: ${err.message}`,
      });
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const cached    = results.filter((r) => r.status === "cached").length;
  const failed    = results.filter((r) => r.status.startsWith("failed") || r.status.startsWith("error")).length;

  return NextResponse.json({
    processed: results.length,
    generated,
    cached,
    failed,
    results,
  });
}
