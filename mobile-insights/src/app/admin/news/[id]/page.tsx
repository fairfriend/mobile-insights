// @ts-nocheck
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { NewsEditor } from "@/components/admin/NewsEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminNewsEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  if (id === "new") {
    return <NewsEditor article={null} />;
  }

  const { data: article } = await supabase
    .from("news_articles")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (!article) notFound();

  return <NewsEditor article={article} />;
}
