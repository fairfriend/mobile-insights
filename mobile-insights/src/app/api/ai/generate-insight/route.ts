// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { getModel, AI_MODEL, safeParseJson } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/server";

const PROMPTS: Record<string, (key: string) => string> = {
  os: (key) => {
    const name = key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `You are a mobile OS expert. Write a comprehensive AI insight about "${name}".

Return a valid JSON object with exactly these fields:
{
  "tagline": "short catchy tagline",
  "overview": "3-4 sentence overview",
  "history": "brief history and evolution of this OS/version",
  "features": "key defining features that set it apart",
  "performance": "performance characteristics on real devices",
  "ecosystem": "app ecosystem, hardware compatibility, services",
  "security": "security model, permissions, update policy",
  "updates": "how and how often updates are delivered, years of support",
  "pros": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "cons": ["weakness 1", "weakness 2", "weakness 3"],
  "verdict": "1-2 sentence summary"
}

Return ONLY the JSON object. No markdown, no explanation.`;
  },

  chipset: (key) => {
    const name = key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `You are a mobile chipset expert. Write a comprehensive AI insight about the "${name}" mobile processor.

Return a valid JSON object with exactly these fields:
{
  "tagline": "short catchy tagline",
  "overview": "3-4 sentence overview",
  "specs": {
    "process_node": "e.g. 4nm TSMC",
    "cpu_cores": "e.g. 1+3+4 configuration",
    "gpu": "GPU model name",
    "npu": "AI/NPU specs if applicable",
    "modem": "integrated modem model"
  },
  "cpu_performance": "CPU benchmark context and real-world performance",
  "gpu_performance": "GPU performance, games it handles, benchmark context",
  "ai_capabilities": "on-device AI, NPU, ML use cases",
  "efficiency": "power efficiency, thermals, battery impact",
  "connectivity": "5G bands, WiFi gen, Bluetooth version, special features",
  "gaming": "gaming performance summary, recommended game settings",
  "pros": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "cons": ["weakness 1", "weakness 2", "weakness 3"],
  "verdict": "1-2 sentence conclusion"
}

Return ONLY the JSON object. No markdown, no explanation.`;
  },
};

export async function POST(request: NextRequest) {
  const { type, key } = await request.json();

  if (!type || !key || !PROMPTS[type]) {
    return NextResponse.json(
      { error: "type and key required. type must be 'os' or 'chipset'" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // ── Check cache ───────────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("ai_insights")
    .select("id, generated_at")
    .eq("insight_type", type)
    .eq("reference_key", key)
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

  // ── Generate ──────────────────────────────────────────────────────────────
  const prompt = PROMPTS[type](key);

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const content = safeParseJson(text);

    const { data: insight, error } = await supabase
      .from("ai_insights")
      .upsert(
        {
          insight_type: type,
          reference_key: key,
          device_id: null,
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
    console.error(`[generate-insight][${type}/${key}] Error:`, err);
    return NextResponse.json(
      { error: err.message ?? "AI generation failed" },
      { status: 500 }
    );
  }
}
