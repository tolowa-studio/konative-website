# Canada Datacenter Dataset

Research-backed inventory for Konative map, market pages, and `/canada` intelligence.

## Files

| Path | Purpose |
|------|---------|
| `research/facilities.csv` | Operational colo/hyperscale/telecom DCs (110 rows) |
| `research/projects.csv` | Pipeline + stalled/blocked projects (35 rows) |
| `research/sources.json` | Citation URL per `source_id` |
| `research/province-rollups.json` | QA targets per province |
| `research/geocode-cache.json` | Nominatim cache from research pass |

## Maintenance workflow

1. **Research update** — edit CSVs with new facilities/projects; add `sources.json` entry per row.
2. **Seed Sanity** — `npm run seed:canada-dc` (requires `SANITY_API_TOKEN` in `.env.local`).
3. **Queue sync** — `npm run ingest:canada-queue` promotes AESO/HQ/BCH/IESO load rows weekly (cron: Monday 07:00 UTC).
4. **Verify** — `npm run verify:canada-dataset` (local CSV QA); `npm run verify:canada-dataset:sanity` after seed.

## Automated refresh

| Job | Schedule | Route / script |
|-----|----------|----------------|
| ISO queue → Sanity | Weekly (Mon 07:00 UTC) | `GET /api/ingest-canada-queue` |
| IESO Ontario loads | Weekly (Mon 08:00 UTC) | `GET /api/ingest-ieso` |
| News extraction | Daily (existing) | `/api/extract-projects` |

Manual CSV updates should run monthly or when major operators announce new builds.

## Data quality rules

- Operational rows require address-level lat/lng (no province centroids).
- Queue-sourced rows may use region centroids at `extractionConfidence: 0.65`.
- Set `verified: true` in Sanity Studio to lock a record from automated overwrites.
- Dedupe: same operator within 500 m merges at seed time.
