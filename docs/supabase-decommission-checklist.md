# Supabase decommission checklist — Konative

**Target:** Turn off Supabase project `tcbworxmlmxoyzcvdjhh` after D1 migration verified in production.

## Pre-flight

- [ ] `npm run d1:provision` — creates D1 + KV, patches `wrangler.jsonc`, applies schema
- [ ] `npm run d1:migrate-from-supabase` — copies all tables to D1
- [ ] Deploy Worker with D1/KV/AE bindings (`deploy.yml`)
- [ ] Verify `/tribal/index` loads from D1 (check Worker logs — no Supabase fallback)
- [ ] Verify `/api/v1/map-data`, `/projects`, sponsors work on D1
- [ ] Wire Analytics Engine for `/api/v1/analytics/*` (replace `analytics_events` table)
- [ ] Update ingest scripts to write D1 instead of Supabase
- [ ] D1 backup workflow → R2 (`motion-backups/konative-intel/`)

## Remove from Cloudflare Worker secrets

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

## Code cleanup (after 1 week stable)

- [ ] Remove `@supabase/supabase-js` from `package.json`
- [ ] Delete `web/src/lib/supabase.ts`
- [ ] Remove Supabase fallbacks from read paths
- [ ] Archive `web/supabase/` and `web/scripts/migrations/` (Postgres era)

## Supabase dashboard

- [ ] Export final backup from Supabase dashboard
- [ ] Pause or delete project `tcbworxmlmxoyzcvdjhh`
- [ ] Cancel Supabase billing

## Cost impact

Supabase Pro ~$25–45/mo → Cloudflare marginal ~$0 (within Workers Paid $5/mo plan).
