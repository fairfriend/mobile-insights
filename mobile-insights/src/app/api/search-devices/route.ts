import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("devices")
    .select("id, name, slug, image_url, company:companies(id,name,slug)")
    .ilike("name", `%${q}%`)
    .eq("is_extracted", true)
    .order("announced_year", { ascending: false })
    .limit(8);

  return NextResponse.json(data ?? []);
}
