import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface Props {
  device: {
    id: number;
    name: string;
    slug: string | null;
    image_url: string | null;
    announced_year: number | null;
    company?: { name: string; slug: string | null } | null;
  };
  showAiBadge?: boolean;
}

export function DeviceCard({ device, showAiBadge }: Props) {
  return (
    <Link
      href={`/devices/${device.slug}`}
      className="card p-3 hover:border-brand-500/50 transition-all group flex flex-col"
    >
      <div className="aspect-square relative mb-3 bg-[#0f172a] rounded-lg overflow-hidden">
        {device.image_url ? (
          <Image
            src={device.image_url}
            alt={device.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">📱</div>
        )}
        {showAiBadge && device.announced_year && device.announced_year >= 2025 && (
          <div className="absolute top-1.5 right-1.5 bg-brand-600/80 backdrop-blur rounded-md p-1">
            <Sparkles size={10} className="text-white" />
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-0.5 truncate">{device.company?.name}</p>
      <p className="text-sm font-medium text-white leading-tight line-clamp-2 flex-1">{device.name}</p>
      {device.announced_year && (
        <p className="text-xs text-slate-600 mt-1">{device.announced_year}</p>
      )}
    </Link>
  );
}
