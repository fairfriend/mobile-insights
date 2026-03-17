-- ============================================
-- GSMArena Mobile Database - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Companies / Brands
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    url TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    url TEXT,
    image_url TEXT,
    announced_year INTEGER,
    is_extracted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specifications (EAV)
CREATE TABLE IF NOT EXISTS specifications (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    category TEXT,
    spec_name TEXT,
    spec_value TEXT
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Reviews
CREATE TABLE IF NOT EXISTS user_reviews (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Editorial Reviews
CREATE TABLE IF NOT EXISTS editorial_reviews (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    title TEXT,
    content TEXT,
    cover_image TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    author_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    cover_image TEXT,
    tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights (device review, OS, chipset, camera, storage)
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    insight_type TEXT NOT NULL,  -- 'device', 'os', 'chipset', 'camera', 'storage'
    reference_key TEXT NOT NULL, -- e.g. 'Android 15', 'Snapdragon 8 Gen 3', device slug
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    content JSONB,               -- structured JSON with sections
    model_used TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(insight_type, reference_key)
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_devices_company ON devices(company_id);
CREATE INDEX IF NOT EXISTS idx_devices_slug ON devices(slug);
CREATE INDEX IF NOT EXISTS idx_devices_announced_year ON devices(announced_year);
CREATE INDEX IF NOT EXISTS idx_specs_device ON specifications(device_id);
CREATE INDEX IF NOT EXISTS idx_specs_name ON specifications(spec_name);
CREATE INDEX IF NOT EXISTS idx_user_reviews_device ON user_reviews(device_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type_key ON ai_insights(insight_type, reference_key);
CREATE INDEX IF NOT EXISTS idx_ai_insights_device ON ai_insights(device_id);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC);

-- ============================================
-- Enable Row Level Security (optional, for user data)
-- ============================================
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
