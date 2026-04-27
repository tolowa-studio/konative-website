# Multi-Agent Task Flow — Konative Map Intelligence

Source of truth for parallel work across Claude Code Desktop + Cursor. Plan: [Notion — Map Intelligence — Canada Infra GIS Plan & Multi-Agent Build](https://www.notion.so/34f32e0a54748175b336c5a9953d1295).

## Streams (locked)

| Stream | App / Model | Worktree | Branch | Owns | Forbidden |
|---|---|---|---|---|---|
| **A · ETL pipelines** | Cursor (Sonnet) | `~/repos/konative-wt-etl` | `feat/etl-canada-p0` | `web/scripts/etl/**` (new dir), `tiles/v1/manifest.json` | `web/src/components/**`, `web/src/app/**` |
| **B · Map layers + tiles UI** | Claude Code Desktop (Opus) | `~/repos/konative-wt-map` | `feat/map-layers-canada` | `web/src/components/DataCenterMap.tsx`, `web/src/app/(frontend)/map/**`, `web/src/app/(frontend)/api/v1/map-data/**` | `web/scripts/**` |
| **C · Queue ingest + API** | Cursor (Sonnet) | `~/repos/konative-wt-queue` | `feat/queue-ingest` | `web/scripts/queue/**`, `web/src/app/(frontend)/api/v1/queue/**`, Supabase migrations under `web/supabase/migrations/**` | `web/src/components/DataCenterMap.tsx` |
| **D · `/licenses` + attribution UI** | Claude Code Desktop (Haiku) | `~/repos/konative-wt-ui` | `feat/map-ui-licenses` | `web/src/app/(frontend)/licenses/**`, `web/src/components/LayerCredits.tsx`, footer link | `web/scripts/**`, queue API |

## Contracts (do not edit outside listed owner)

- **`web/src/types/map-layers.ts`** — owned by Stream B. Streams A and D read it.
- **`web/src/types/queue.ts`** — owned by Stream C. Stream B reads it.
- **`tiles/v1/manifest.json`** — owned by Stream A. Streams B and D read it. Bumping `v{N}` is the migration mechanism.

## Coordination protocol

1. **One source of truth:** this file + the Notion plan. Each stream's agent reads both before starting work.
2. **Schema migrations are serialized:** Stream C writes Supabase migrations one at a time, each merged to `main` before the next is started.
3. **Daily integration:** end of working day, human merges branches into `main` in order **A → B → C → D**. Conflicts mean an ownership boundary was crossed; investigate before re-running.
4. **Tile assets are immutable per `v{N}`:** ETL writes to `tiles/v{N}/{layer}.pmtiles`. Bumping `N` triggers a new map deploy. Never overwrite a published `N`.
5. **Secrets:** all four streams read from `web/.env.local`. Never commit secrets. Rotate on merge.
6. **Worktree creation:** `git worktree add ../konative-wt-<stream> -b feat/<branch-name> main`.
7. **Drop a worktree:** `git worktree remove ../konative-wt-<stream>` (after the branch has been merged + deleted).

## Per-stream kickoff prompts

### Stream A — Cursor (Sonnet)

> You're working in worktree `~/repos/konative-wt-etl` on branch `feat/etl-canada-p0`. Build the Canada Phase-1 ETL pipelines under `web/scripts/etl/canada/`. Each pipeline pulls from source, transforms with `ogr2ogr`, generates PMTiles via `tippecanoe`, and uploads to R2 under `tiles/v1/{layer}.pmtiles`. Datasets (P0): NRCan transmission lines, NRCan substations, NRCan power plants, CER pipelines. Output a `tiles/v1/manifest.json` with layer metadata + license + attribution string per the schema in `web/src/types/map-layers.ts`. Read `MULTIAGENT.md` and the linked Notion plan. Do not touch `web/src/components` or `web/src/app`.

### Stream B — Claude Code Desktop (Opus)

> You're working in worktree `~/repos/konative-wt-map` on branch `feat/map-layers-canada`. Extend `web/src/components/DataCenterMap.tsx` to consume PMTiles from R2 and add an `Infrastructure (CA · beta)` layer group with 6 subtoggles: Power / Gas / Fiber / Water / Land / Climate. Read layer metadata from `tiles/v1/manifest.json`. Update `/api/v1/map-data` only if needed. Read `MULTIAGENT.md`, the Notion plan, and `web/src/types/map-layers.ts`. Do not touch `web/scripts`.

### Stream C — Cursor (Sonnet)

> You're working in worktree `~/repos/konative-wt-queue` on branch `feat/queue-ingest`. Build the `interconnection_queue` Supabase migration + nightly cron + `GET /api/v1/queue?lat=..&lng=..&radius_km=..` endpoint with parcel-radius query. Sources: IESO (already seeded — extend), AESO, Hydro-Québec, BC Hydro. US ISO queues deferred to Phase 2.5. Conform to `web/src/types/queue.ts`. Read `MULTIAGENT.md` and the Notion plan. Do not touch the map component.

### Stream D — Claude Code Desktop (Haiku)

> You're working in worktree `~/repos/konative-wt-ui` on branch `feat/map-ui-licenses`. Build `/licenses` page (list every data source from `tiles/v1/manifest.json` + license + attribution), `<LayerCredits />` popover for the map, and footer link. Read `MULTIAGENT.md`, the Notion plan, and `web/src/types/map-layers.ts`. Do not touch ETL or queue code.

## Status

- 2026-04-27 — contracts committed; worktrees created.
- 2026-04-27 — Stream B merged to main (`71fdb1f` → `5314d16`). Map renders Infrastructure (CA · beta) panel + PMTiles + LayerCredits popover, all manifest-driven.
- 2026-04-27 — Stream D merged to main (`5faf8a6`). `/licenses` page + footer link + popover component live.
- 2026-04-27 — Stream A merged to main. ETL pipelines + tiles/v1/manifest.json + tile-serving route live. Run `npm run etl:canada:p0 -- --skip-upload` (requires tippecanoe + gdal) to generate PMTiles.
- 2026-04-27 — Stream C merged to main. Supabase migration + IESO/AESO/HQ/BCH ingest + `GET /api/v1/queue` radius endpoint + Vercel daily cron live.
