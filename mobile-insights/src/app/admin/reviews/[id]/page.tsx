// @ts-nocheck
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { ReviewEditor } from "@/components/admin/ReviewEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminReviewEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  if (id === "new") {
    const { data: devices } = await supabase
      .from("devices")
      .select("id, name, slug")
      .eq("is_extracted", true)
      .order("announced_year", { ascending: false })
      .limit(500);
    return <ReviewEditor review={null} devices={devices ?? []} />;
  }

  const [{ data: review }, { data: devices }] = await Promise.all([
    supabase.from("editorial_reviews").select("*").eq("id", parseInt(id)).single(),
    supabase.from("devices").select("id, name, slug").eq("is_extracted", true).order("announced_year", { ascending: false }).limit(500),
  ]);

  if (!review) notFound();

  return <ReviewEditor review={review} devices={devices ?? []} />;
}
