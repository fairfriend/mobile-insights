import Link from "next/link";
import { LayoutDashboard, Smartphone, Building2, Newspaper, Star, Sparkles, Settings, ChevronRight } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/devices",     label: "Devices",      icon: Smartphone },
  { href: "/admin/brands",      label: "Brands",       icon: Building2 },
  { href: "/admin/news",        label: "News",         icon: Newspaper },
  { href: "/admin/reviews",     label: "Reviews",      icon: Star },
  { href: "/admin/ai-insights", label: "AI Insights",  icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0c1523] border-r border-[#334155] flex flex-col">
        <div className="p-5 border-b border-[#334155]">
          <Link href="/admin/dashboard" className="text-sm font-bold text-white flex items-center gap-2">
            <Settings size={16} className="text-brand-400" /> Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#334155]">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
