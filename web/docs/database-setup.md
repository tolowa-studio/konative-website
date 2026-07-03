# Data layer for Konative

**Superseded 2026-07-03.** This entire document described a Payload CMS + Vercel Postgres/Neon
architecture that no longer exists in this repo. There is no `DATABASE_URI`/`POSTGRES_*` Postgres
connection to provision — following the steps below would set up infrastructure nothing reads.

## Current data layer

- **CMS / structured content:** [Sanity](https://sanity.io) — schemas under
  `web/src/sanity/schemaTypes/`. Env vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN` (write access).
- **Application data / intelligence tables** (`tbcp_awards`, `connectivity_signals`,
  `connectivity_briefs`, `interconnection_queue`, `commission_statements`, etc.):
  [Supabase Postgres](https://supabase.com). Env vars: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public/anon reads — most of these tables have public-read RLS
  policies), `SUPABASE_SERVICE_ROLE_KEY` (server-side writes/ETL scripts only, never exposed to the
  client). Migrations live in `web/scripts/migrations/`.
- **Newsletter / blog:** Ghost (shared Tolowa Studio instance, self-hosted on Railway).

Set these as Cloudflare Worker secrets/variables in production (Worker → Settings → Variables, or
`wrangler secret put`) and in `web/.env.local` for local dev — not Vercel, which this repo no longer
uses. See `CLAUDE.md` → Deploy Configuration for the full current env var list.
