// @ts-nocheck
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isGeminiConfigured } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, boolean | string> = {
    status: "ok",
    gemini: isGeminiConfigured(),
    supabase: false,
  };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("companies").select("id").limit(1);
    checks.supabase = !error;
    if (error) checks.supabase_error = error.message;
  } catch (err: any) {
    checks.supabase = false;
    checks.supabase_error = err.message;
  }

  const allHealthy = checks.gemini === true && checks.supabase === true;
  return NextResponse.json(checks, { status: allHealthy ? 200 : 503 });
}
