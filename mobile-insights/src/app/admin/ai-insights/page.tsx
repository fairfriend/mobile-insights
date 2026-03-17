// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import { AiInsightsDashboard } from "@/components/admin/AiInsightsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAiInsightsPage() {
  const supabase = createAdminClient();

  const [
    { data: existingInsights, count: totalInsights },
    { data: devices2025, count: total2025 },
  ] = await Promise.all([
    supabase.from("ai_insights").select("*", { count: "exact" }).order("generated_at", { ascending: false }),
    supabase
      .from("devices")
      .select("id, name, slug, image_url, company:companies(name,slug)", { count: "exact" })
      .eq("is_extracted", true)
      .gte("announced_year", 2025)
      .order("announced_year", { ascending: false }),
  ]);

  // Get device IDs that already have AI insights
  const deviceInsightIds = new Set(
    existingInsights?.filter((i) => i.insight_type === "device" && i.device_id).map((i) => i.device_id) ?? []
  );

  return (
    <AiInsightsDashboard
      devices2025={devices2025 ?? []}
      total2025={total2025 ?? 0}
      existingInsights={existingInsights ?? []}
      totalInsights={totalInsights ?? 0}
      deviceInsightIds={[...deviceInsightIds] as number[]}
    />
  );
}
