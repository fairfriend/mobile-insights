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

  const specText =
    specs?.map((s) => `${s.category} — ${s.spec_name}: ${s.spec_value}`).join("\n") ??
    "No specs available";

  const prompt = `You are a professional mobile phone reviewer with deep technical knowledge.
Analyze the ${device.name} (${device.announced_year ?? "recent"}) based on its specs and return a structured JSON review.

DEVICE: ${device.name}
BRAND: ${device.company?.name ?? "Unknown"}
YEAR: ${device.announced_year ?? "Unknown"}

SPECIFICATIONS:
${specText}

Return a valid JSON object with EXACTLY these fields (no extras, no omissions):
{
  "summary": "2-3 sentence engaging overview of the device",

  "category_scores": {
    "performance": <integer 1-10>,
    "camera":      <integer 1-10>,
    "battery":     <integer 1-10>,
    "display":     <integer 1-10>,
    "design":      <integer 1-10>,
    "value":       <integer 1-10>
  },

  "performance": "2-3 sentence chipset and CPU performance analysis",
  "camera":      "2-3 sentence camera system analysis",
  "battery":     "2-3 sentence battery and charging analysis",
  "display":     "2-3 sentence display quality analysis",
  "design":      "2-3 sentence build and design analysis",
  "connectivity":"2-3 sentence 5G/WiFi/Bluetooth analysis",
  "software":    "2-3 sentence OS and software analysis",

  "pros": ["concise strength 1", "concise strength 2", "concise strength 3", "concise strength 4"],
  "cons": ["concise weakness 1", "concise weakness 2", "concise weakness 3"],

  "best_for": [
    { "icon": "camera",    "label": "Photography" },
    { "icon": "gaming",    "label": "Gaming" },
    { "icon": "battery",   "label": "Battery Life" },
    { "icon": "business",  "label": "Business" },
    { "icon": "everyday",  "label": "Everyday Use" },
    { "icon": "video",     "label": "Video" }
  ],

  "verdict_badge": "one of: Flagship Killer | Best Value | Premium Choice | Budget Pick | Photography Master | Gaming Beast | Battery Champion | Balanced Performer",
  "verdict": "1-2 sentence punchy conclusion",
  "who_should_buy": "one sentence describing the ideal buyer",
  "score": <number between 1.0-10.0, one decimal place>
}

For best_for: include only the icons that genuinely apply to this device (2-5 items max).
Valid icon values: camera, gaming, battery, business, everyday, video, performance, travel

Return ONLY the JSON object. No markdown fences, no explanation, no extra text.`;

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
