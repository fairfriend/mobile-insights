// @ts-nocheck
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { getDeviceSpecs } from "@/lib/queries";
import { GenerateAiButton } from "@/components/admin/GenerateAiButton";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminDeviceEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: device } = await supabase
    .from("devices")
    .select("*, company:companies(id,name,slug)")
    .eq("id", parseInt(id))
    .single();

  if (!device) notFound();

  const [specGroups, { data: existing }] = await Promise.all([
    getDeviceSpecs(device.id),
    supabase.from("ai_insights").select("*").eq("device_id", device.id).eq("insight_type", "device").single(),
  ]);

  const company = (device as any).company;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/devices" className="text-slate-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white">{device.name}</h1>
      </div>

      {/* Device info */}
      <div className="card p-5 flex gap-5">
        {device.image_url && (
          <div className="w-20 h-20 relative bg-[#0f172a] rounded-xl overflow-hidden shrink-0">
            <Image src={device.image_url} alt={device.name} fill className="object-contain p-2" sizes="80px" />
          </div>
        )}
        <div className="space-y-1 text-sm">
          <p><span className="text-slate-500">Brand:</span> <span className="text-slate-200">{company?.name}</span></p>
          <p><span className="text-slate-500">Year:</span> <span className="text-slate-200">{device.announced_year ?? "Unknown"}</span></p>
          <p><span className="text-slate-500">Slug:</span> <span className="text-slate-400 font-mono text-xs">{device.slug}</span></p>
          <p><span className="text-slate-500">Specs:</span> <span className="text-slate-200">{specGroups.reduce((acc, g) => acc + g.specs.length, 0)} fields</span></p>
        </div>
      </div>

      {/* AI Insight section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-brand-400" /> AI Review
          </h2>
          <GenerateAiButton deviceId={device.id} deviceName={device.name} hasExisting={!!existing} />
        </div>

        {existing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge bg-green-500/20 text-green-400">Generated</span>
              <span className="text-xs text-slate-500">{new Date(existing.generated_at).toLocaleDateString()}</span>
            </div>
            {(existing.content as any)?.summary && (
              <p className="text-sm text-slate-400 italic">"{(existing.content as any).summary}"</p>
            )}
            <Link href={`/devices/${device.slug}`} className="text-xs text-brand-400 hover:text-brand-300">
              View on device page →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No AI review generated yet. Click the button above to generate one.</p>
        )}
      </div>

      {/* Spec preview */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-white mb-4">Specifications ({specGroups.reduce((a, g) => a + g.specs.length, 0)})</h2>
        <div className="space-y-3">
          {specGroups.slice(0, 5).map((group) => (
            <div key={group.category}>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">{group.category}</p>
              <div className="space-y-1">
                {group.specs.slice(0, 3).map((spec, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-slate-500">{spec.name}</span>
                    <span className="text-slate-300 truncate max-w-xs text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
