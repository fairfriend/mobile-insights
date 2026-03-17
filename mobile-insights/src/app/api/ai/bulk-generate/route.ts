// @ts-nocheck
/**
 * Bulk AI insight generation for devices from 2025+.
 * Protected by a shared secret header: x-api-secret.
 * Triggered manually from admin panel or via cron.
 *
 * POST /api/ai/bulk-generate
 * Body: { limit?: number } (default 10 per run to control costs)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const API_SECRET = process.env.BULK_GENERATE_SECRET ?? "change-me";

export async function POST(request: NextRequest) {
  // Auth check
  const secret = request.headers.get("x-api-secret");
  if (secret !== API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { limit = 10 } = await request.json().catch(() => ({}));
  const supabase = createAdminClient();

  // Find 2025+ devices that don't have an AI insight yet
  const { data: devices, error } = await supabase
    .from("devices")
    .select("id, name, announced_year")
    .gte("announced_year", 2025)
    .eq("is_extracted", true)
    .limit(limit * 3); // over-fetch to account for ones that already have insights

  if (error || !devices?.length) {
    return NextResponse.json({ message: "No eligible devices found", processed: 0 });
  }

  // Filter out devices that already have fresh insights
  const { data: existingInsights } = await supabase
    .from("ai_insights")
    .select("device_id, generated_at")
    .eq("insight_type", "device")
    .in("device_id", devices.map((d) => d.id));

  const existingIds = new Set(
    (existingInsights ?? [])
      .filter((i) => {
        const age = Date.now() - new Date(i.generated_at).getTime();
        return age < 30 * 24 * 60 * 60 * 1000; // 30 days
      })
      .map((i) => i.device_id)
  );

  const toProcess = devices.filter((d) => !existingIds.has(d.id)).slice(0, limit);

  if (!toProcess.length) {
    return NextResponse.json({ message: "All eligible devices already have insights", processed: 0 });
  }

  // Trigger individual generation for each (non-blocking, fire-and-forget style)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const results: { id: number; name: string; status: string }[] = [];

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
        status: json.success ? "generated" : `failed: ${json.error}`,
      });
    } catch (err: any) {
      results.push({ id: device.id, name: device.name, status: `error: ${err.message}` });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
