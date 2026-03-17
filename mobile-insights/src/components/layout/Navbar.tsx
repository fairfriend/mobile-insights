"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Cpu, Smartphone } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Smartphone size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Mobile<span className="text-brand-400">Insights</span>
            </span>
          </Link>

          {/* Search bar */}
          <form
            action="/search"
            className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2"
          >
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              name="q"
              type="text"
              placeholder="Search phones, brands, chipsets..."
              className="bg-transparent text-sm text-slate-100 placeholder-slate-500 flex-1 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium shrink-0">
            <Link href="/brands"   className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">Brands</Link>
            <Link href="/news"     className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">News</Link>
            <Link href="/reviews"  className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">Reviews</Link>
            <Link href="/compare"  className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">Compare</Link>
            <Link href="/insights/os/android" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors flex items-center gap-1">
              <Cpu size={14} />AI Insights
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-[#1e293b]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#334155] bg-[#0f172a] px-4 pb-4">
          <form action="/search" className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 mt-3 mb-2">
            <Search size={16} className="text-slate-400" />
            <input name="q" placeholder="Search phones..." className="bg-transparent text-sm flex-1 outline-none text-slate-100 placeholder-slate-500" />
          </form>
          {[
            { href: "/brands",   label: "Brands" },
            { href: "/news",     label: "News" },
            { href: "/reviews",  label: "Reviews" },
            { href: "/compare",  label: "Compare" },
            { href: "/insights/os/android", label: "AI Insights" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 text-slate-300 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
