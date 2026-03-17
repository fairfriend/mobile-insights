import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function extractSpecValue(
  specs: { spec_name: string | null; spec_value: string | null }[],
  name: string
): string | null {
  return specs.find((s) => s.spec_name === name)?.spec_value ?? null;
}

export function starRatingText(rating: number): string {
  const map: Record<number, string> = {
    5: "Excellent",
    4: "Good",
    3: "Average",
    2: "Below Average",
    1: "Poor",
  };
  return map[rating] ?? "";
}
