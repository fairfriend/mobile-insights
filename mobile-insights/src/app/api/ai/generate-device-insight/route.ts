// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { getModel, AI_MODEL, safeParseJson } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { deviceId } = await request.json();
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── Check cache (30 days) ─────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("ai_insights")
    .select("id, generated_at")
    .eq("insight_type", "device")
    .eq("reference_key", `device-${deviceId}`)
    .maybeSingle();

  if (existing) {
    const age = Date.now() - new Date(existing.generated_at).getTime();
    if (age < 30 * 24 * 60 * 60 * 1000) {
      const { data: cached } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("id", existing.id)
        .single();
      return NextResponse.json({ success: true, insight: cached, cached: true });
    }
  }

  // ── Fetch device + specs ─────────────────────────────────────────────────
  const { data: device } = await supabase
    .from("devices")
    .select("*, company:companies(name)")
    .eq("id", deviceId)
    .single();

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const { data: specs } = await supabase
    .from("specifications")
    .select("spec_name, spec_value, category")
    .eq("device_id", deviceId)
    .order("category");

  const specText = specs
    ?.map((s) => `${s.category} — ${s.spec_name}: ${s.spec_value}`)
    .join("\n") ?? "No specs available";

  const prompt = `You are a professional mobile phone reviewer with deep technical knowledge. Based on the following specs for the ${device.name} (${device.announced_year ?? "recent"}), write a structured AI review.

DEVICE: ${device.name}
BRAND: ${device.company?.name ?? "Unknown"}
YEAR: ${device.announced_year ?? "Unknown"}

SPECIFICATIONS:
${specText}

Return a valid JSON object with exactly these fields:
{
  "summary": "2-3 sentence overview of the device",
  "performance": "chipset and CPU performance analysis",
  "camera": "camera system analysis covering sensors, aperture, video capabilities",
  "battery": "battery capacity, real-world life, and charging speed analysis",
  "chipset": "deeper chipset context, process node, gaming capability, AI features",
  "display": "display size, resolution, refresh rate, and quality analysis",
  "design": "build materials, dimensions, weight, and premium feel",
  "connectivity": "5G, WiFi, Bluetooth, NFC and other connectivity",
  "software": "OS version, UI skin, bloatware, update policy",
  "pros": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "cons": ["weakness 1", "weakness 2", "weakness 3"],
  "verdict": "1-2 sentence conclusion",
  "who_should_buy": "description of the ideal buyer/use case",
  "score": 8.5
}

Return ONLY the JSON object. No markdown, no explanation, no extra text.`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const content = safeParseJson(text);

    const { data: insight, error } = await supabase
      .from("ai_insights")
      .upsert(
        {
          insight_type: "device",
          reference_key: `device-${deviceId}`,
          device_id: deviceId,
          content,
          model_used: AI_MODEL,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "insight_type,reference_key" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, insight, cached: false });
  } catch (err: any) {
    console.error("[generate-device-insight] Error:", err);
    return NextResponse.json(
      { error: err.message ?? "AI generation failed" },
      { status: 500 }
    );
  }
}
