# Data layer for Konative

**Updated 2026-07-09.** Cloudflare-native intelligence data plane — Supabase is deprecated.

## Current data layer

| Layer | Store | What |
|-------|-------|------|
| **CMS / curated content** | [Sanity](https://sanity.io) | tribalProject, newsItem, pages, forms |
| **Tabular intelligence** | **Cloudflare D1** (`konative-intel`) | TBCP, queue, PeeringDB, sponsors, signals |
| **Geo / large files** | **Cloudflare R2** (`konative-tiles`, `konative-data`) | PMTiles, dataset snapshots |
| **Hot cache** | **Cloudflare KV** | Layer manifests, sponsor-of-day |
| **Metrics** | **Cloudflare Analytics Engine** | Page/sponsor/API events |
| **Newsletter / blog** | Ghost (Railway) | Tribal Infrastructure Brief |

## Setup

```bash
cd web
npm run d1:provision              # create D1 + KV, apply schema
npm run d1:migrate-from-supabase  # one-time data copy (requires .env.local)
```

Schema: `web/d1/migrations/0001_konative_intel.sql`  
Bindings: `web/wrangler.jsonc`

## Legacy (deprecated — remove after migration)

- **Supabase** project `tcbworxmlmxoyzcvdjhh` — read paths fall back until D1 populated
- See `docs/supabase-decommission-checklist.md`

## Env vars (production — Cloudflare Worker secrets)

**Sanity:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`

**Supabase (transitional):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Other:** See `CLAUDE.md` → Deploy Configuration

Local dev: copy from `web/.env.local.example`

## Architecture reference

`.context/konative-api-platform-architecture.md` (rev 3)
