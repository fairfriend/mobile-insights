// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { deviceId, rating, reviewText } = await request.json();

  if (!deviceId || !rating) {
    return NextResponse.json({ error: "deviceId and rating required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_reviews")
    .insert({ device_id: deviceId, user_id: user.id, rating, review_text: reviewText })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, review: data });
}
