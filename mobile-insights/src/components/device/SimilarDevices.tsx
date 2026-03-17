import Link from "next/link";
import Image from "next/image";

interface Device {
  id: number;
  name: string;
  slug: string | null;
  image_url: string | null;
  company?: { name: string; slug: string | null } | null;
}

export function SimilarDevices({ devices }: { devices: Device[] }) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-white mb-4">Similar Devices</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {devices.map((device) => (
          <Link
            key={device.id}
            href={`/devices/${device.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a] hover:bg-brand-600/10 transition-colors group"
          >
            <div className="w-12 h-12 relative shrink-0 bg-[#1e293b] rounded-lg overflow-hidden">
              {device.image_url ? (
                <Image src={device.image_url} alt={device.name} fill className="object-contain p-1" sizes="48px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">📱</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{device.company?.name}</p>
              <p className="text-sm font-medium text-white truncate group-hover:text-brand-300">{device.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
