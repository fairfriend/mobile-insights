/**
 * Typed Supabase client helpers.
 * We use SupabaseClient<any> to avoid deep generic inference issues
 * with Supabase v2.99+ while still returning strongly-typed results.
 */
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// Type-safe wrappers for common queries
export type { Company, Device, Spec, UserRow, UserReview, EditorialReview, NewsArticle, AiInsight, SpecGroup } from "@/types/database";
