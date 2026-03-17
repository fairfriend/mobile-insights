# Deployment Guide — MobileInsights

## Prerequisites
- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- Supabase project with migrations applied
- OpenAI API key

---

## 1. Supabase Setup

Run the migration in Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_ai_insights_index.sql
```

Get your keys from **Supabase → Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY` ← keep this secret, server-only

---

## 2. OpenAI Setup

1. Go to https://platform.openai.com/api-keys
2. Create a new key with **GPT-4o mini** access
3. Copy the key — it starts with `sk-`

**Cost estimate:** ~$0.0001 per device insight (gpt-4o-mini is very cheap)

---

## 3. Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
cd mobile-insights
vercel login
vercel
```

When prompted, set these environment variables:
```
NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
SUPABASE_SERVICE_ROLE_KEY      = eyJ...  (mark as secret)
OPENAI_API_KEY                 = sk-...  (mark as secret)
NEXT_PUBLIC_SITE_URL           = https://your-app.vercel.app
NEXT_PUBLIC_SITE_NAME          = MobileInsights
BULK_GENERATE_SECRET           = <random string you choose>
```

### Option B — GitHub + Vercel Dashboard
1. Push repo to GitHub
2. Go to https://vercel.com/new → Import repo
3. Add environment variables in Project Settings → Environment Variables
4. Deploy

---

## 4. Post-Deployment

### Verify health
```
GET https://your-app.vercel.app/api/health
```
Should return `{"status":"ok","openai":true,"supabase":true}`

### Generate AI insights for 2025+ devices
```bash
curl -X POST https://your-app.vercel.app/api/ai/bulk-generate \
  -H "Content-Type: application/json" \
  -H "x-api-secret: YOUR_BULK_GENERATE_SECRET" \
  -d '{"limit": 20}'
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (secret) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Full URL of your deployed site |
| `NEXT_PUBLIC_SITE_NAME` | ✅ | Site display name |
| `BULK_GENERATE_SECRET` | ✅ | Secret for bulk AI generation endpoint |
