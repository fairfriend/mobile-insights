-- Run these in your Supabase SQL Editor

-- 1. Unique constraint for AI insights upsert
CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_type_key_idx
ON public.ai_insights (insight_type, reference_key);

-- 2. Enable Row Level Security (optional, for user auth)
-- ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read on all main tables
CREATE POLICY "Public read" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.specifications FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.news_articles FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Public read" ON public.editorial_reviews FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Public read" ON public.ai_insights FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.user_reviews FOR SELECT USING (true);
