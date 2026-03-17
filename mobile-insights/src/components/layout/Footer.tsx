import Link from "next/link";
import { Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#334155] bg-[#0f172a] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Smartphone size={15} className="text-white" />
              </div>
              <span className="font-bold text-white">Mobile<span className="text-brand-400">Insights</span></span>
            </Link>
            <p className="text-sm text-slate-500">
              AI-powered mobile phone database with deep specs, reviews, and insights.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/brands"  className="hover:text-slate-300 transition-colors">All Brands</Link></li>
              <li><Link href="/news"    className="hover:text-slate-300 transition-colors">Latest News</Link></li>
              <li><Link href="/reviews" className="hover:text-slate-300 transition-colors">Reviews</Link></li>
              <li><Link href="/compare" className="hover:text-slate-300 transition-colors">Compare</Link></li>
            </ul>
          </div>

          {/* AI Insights */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">AI Insights</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/insights/os/android"            className="hover:text-slate-300 transition-colors">Android OS</Link></li>
              <li><Link href="/insights/os/ios"                className="hover:text-slate-300 transition-colors">iOS</Link></li>
              <li><Link href="/insights/chipset/snapdragon-8-gen-3" className="hover:text-slate-300 transition-colors">Snapdragon 8 Gen 3</Link></li>
              <li><Link href="/insights/chipset/apple-a18-pro" className="hover:text-slate-300 transition-colors">Apple A18 Pro</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about"   className="hover:text-slate-300 transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms"   className="hover:text-slate-300 transition-colors">Terms of Use</Link></li>
              <li><Link href="/admin"   className="hover:text-slate-300 transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#334155] mt-10 pt-6 text-sm text-slate-600 text-center">
          © {new Date().getFullYear()} MobileInsights. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
