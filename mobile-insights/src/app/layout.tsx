import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "MobileInsights — AI-Powered Mobile Phone Database",
    template: "%s | MobileInsights",
  },
  description:
    "Explore detailed specs, AI-powered reviews, and deep insights for every mobile phone. Compare devices, track chipsets, and discover OS histories.",
  keywords: ["mobile phones", "smartphone specs", "phone comparison", "AI phone review"],
  openGraph: {
    type: "website",
    siteName: "MobileInsights",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
