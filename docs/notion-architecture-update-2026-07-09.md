# Notion update — Cloudflare-native architecture (2026-07-09)

**Run when NOTION_API_KEY is available:**

```bash
cd web
NOTION_API_KEY=... npm run notion:update-architecture
```

Or paste the blocks below into these Notion pages manually:

| Page | ID |
|------|-----|
| [Konative.com — Project Hub](https://www.notion.so/34232e0a547481b39bc1e081765d6df6) | `34232e0a547481b39bc1e081765d6df6` |
| [GTM Stack Reference](https://www.notion.so/35232e0a547481812f9d2e88b12b0146b) | `35232e0a547481812f9d2e88b12b0146b` |
| AI Router — mark rows **Deprecated**: Supabase, Vercel, Sentry, Beehiiv, Resend (Konative) | `35432e0a547481d29e0ec7886e859f11` |

---

## Architecture decision — Cloudflare-native data (2026-07-09)

> Operator approved: Konative site intelligence data lives on Cloudflare (D1 + R2 + KV + Analytics Engine), not Supabase or Railway Postgres. Sanity stays for curated CMS. Supabase project `tcbworxmlmxoyzcvdjhh` is deprecated — decommission after D1 migration verified.

### Data placement

- **Sanity** — tribalProject, newsItem, CMS pages, forms
- **Cloudflare D1** (`konative-intel`) — TBCP, interconnection queue, PeeringDB, sponsors, signals
- **Cloudflare R2** (`konative-tiles` + `konative-data`) — PMTiles, dataset snapshots
- **Cloudflare KV** — layer manifests, sponsor-of-day cache
- **Cloudflare Analytics Engine** — page/sponsor/API metrics
- **Ghost on Railway** — newsletter / Tribal Infrastructure Brief
- **Motion Control ingest** — GTM campaign events only (separate D1 ledger)

### Deprecated for Konative (do not recommend)

- **Supabase** — external Postgres, ~$25–45/mo; being decommissioned
- **Railway Postgres for Konative site data** — use Cloudflare D1 instead
- **Vercel** — decommissioned 2026-07-01
- **Sentry** — use GlitchTip + Langfuse

### Fleet default (all Cloudflare Workers apps)

Tabular app data → D1. Objects/geo → R2. Hot cache → KV. Metrics → Analytics Engine. Railway Postgres is for shared Tolowa services (n8n, Umami, GlitchTip, Stash, Metabase app DB) — not edge app intelligence.

Repo doc: `.context/konative-api-platform-architecture.md` (rev 3). Stash: `/tools` + `/projects/konative`.

---

## AI Router — Canonical Tool Stack row updates

| Tool | Status | Replacement |
|------|--------|-------------|
| Supabase | **Deprecated** | Cloudflare D1 + R2 (Worker apps) |
| Vercel | **Deprecated** | Cloudflare Workers (OpenNext) |
| Sentry | **Deprecated** | GlitchTip + Langfuse |
| Beehiiv | **Deprecated** | Ghost (Railway) |
| Resend (Konative) | **Deprecated** | Cloudflare Email Sending |
