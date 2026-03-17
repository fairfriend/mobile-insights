"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  perPage: number;
  currentPage: number;
}

export function Pagination({ total, perPage, currentPage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  const go = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] disabled:opacity-40 hover:bg-[#334155] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-slate-500">…</span>
        ) : (
          <button
            key={page}
            onClick={() => go(page as number)}
            className={cn(
              "w-9 h-9 rounded-lg text-sm font-medium transition-colors border",
              page === currentPage
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-[#1e293b] border-[#334155] text-slate-300 hover:bg-[#334155]"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] disabled:opacity-40 hover:bg-[#334155] transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
