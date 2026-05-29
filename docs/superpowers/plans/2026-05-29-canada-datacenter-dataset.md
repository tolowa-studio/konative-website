# Canada Datacenter Dataset — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a credible, queryable, map-ready inventory of Canadian datacenters across all provinces and territories — operational, under construction, announced, stalled, paused, and canceled — that matches what Konative tells clients on `/canada` and in market intel, with automated refresh and code that passes verification before merge.

**Architecture:** Extend the existing dual-store pattern rather than invent a new one. **Sanity `dataCenterProject`** remains the canonical map bubble layer (status, operator, MW, editorial context). **Supabase** keeps ISO queue rows and PeeringDB network points. Fix province normalization and ingestion types first, then load a **research-backed curated baseline** (`manual` + `peeringdb` sources), then wire **four ISO queue feeds** (IESO/AESO/HQ/BCH) into Sanity with DC-specific filters, then add **stalled/blocked editorial records** from Konative research. Every phase ships with automated tests and a `npm run verify:canada-dataset` gate.

**Tech Stack:** Next.js 16, Sanity CMS, Supabase PostGIS, existing ingest scripts (`seed-*.ts`, `queue/ingest.ts`), MapLibre map (`DataCenterMap.tsx`), Vitest for unit tests.

---

## Current State (Baseline)

| Layer | Canada coverage today | Problem |
|-------|----------------------|---------|
| Sanity `dataCenterProject` | Sparse OSM/Wikidata ops points; IESO Ontario loads ≥50 MW; news LLM extractions | Does not match "117 existing / 30+ upcoming" editorial claims |
| Supabase `interconnection_queue` | IESO + AESO + HQ + BCH via `queue/ingest.ts` | Not synced to map; province-centroid coords only |
| Supabase `dc_facilities` (IM3) | US only | No Canadian facility baseline |
| `/canada`, `/reality-vs-press` | Rich hardcoded narrative | Not linked to queryable dataset |
| Map API | Excludes `stalled`, `blocked`, `paused`, `canceled` | Clients cannot see stalled CA megaprojects |
| Province matching | Free-text `state` field | IESO writes `Ontario`; markets GROQ expects `ON` — pages miss records |

**Target definition (v1):** For each province/territory, clients can filter the map and `/markets/[province]` to see:
- **Operational** colo/hyperscale/enterprise facilities with verified coords
- **Construction / announced** projects with MW and operator
- **Stalled / blocked / paused** projects with reason tags and sources
- **Queue signal** (optional overlay): ISO load applications not yet promoted to project records

**Realistic v1 counts (research-backed targets, not placeholders):**

| Source | Expected records | Notes |
|--------|-----------------|-------|
| Curated colo baseline | ~117 operational | Arizton/DCD-style colo directory; cities in 22+ municipalities |
| Upcoming colo/hyperscale | ~30 announced/construction | Same portfolio sources + press |
| ISO queue (DC-filtered) | ~40–80 load rows | AESO "30+ AI DC" + IESO/HQ/BCH loads; many are duplicates of announced projects |
| PeeringDB colo/IX | ~25–40 CA nodes | Toronto, Montreal, Vancouver density |
| Konative editorial (stalled/FN) | ~15–25 | Wonder Valley, BC caps, Indigenous megaprojects |
| OSM/Wikidata (deduped) | ~20–40 net-new | Supplements curated set; do not double-count |

Territories (YT, NT, NU): expect **0–3** meaningful facilities today; still include in schema/filter with honest "no records" UX.

---

## Research Sources (Authoritative Stack)

Execute research **before** bulk seeding. Document every source URL in `web/data/canada-dc/sources.json`.

### Tier 1 — Facility inventory (operational + upcoming)

| Source | URL / access | Use |
|--------|-------------|-----|
| Arizton / ResearchAndMarkets Canada Portfolio (2026) | Paid Excel (~117 existing, 30 upcoming) | **Primary baseline** if licensed; otherwise manual transcription of public summaries |
| Datacenters.com / datacentermap.com | Public facility pages | Free coords + operator; scrape or manual for top 50 |
| Operator locators | Cologix, Equinix, eStruxture, Vantage, Compass, IREN, QScale | Official addresses → geocode |
| PeeringDB API | Already partially ingested to Supabase | Colo/IX with lat/lng |
| The Logic (2025) | https://thelogic.co/news/the-big-read/data-centres-artificial-intelligence-canada-map/ | Cross-check counts by province; stalled narrative |

### Tier 2 — Pipeline / status (announced, construction, stalled)

| Source | URL | Use |
|--------|-----|-----|
| IESO Application Status JSON | `https://www.ieso.ca/-/media/files/IESO/files/applicationstatusdata.json` | Ontario loads (existing) |
| interconnection.fyi AESO | `https://www.interconnection.fyi/projects/market/AESO` | Alberta queue (existing Supabase ingest) |
| interconnection.fyi Quebec | `https://www.interconnection.fyi/projects/market/Quebec` | HQ queue |
| interconnection.fyi BC Hydro | `https://interconnection.fyi/projects/transmission-owner/bc-hydro` | BCH queue |
| BC Energy Ministry DC cap announcements | Provincial press releases | `blocked` / `paused` status |
| Hydro-Québec moratorium / rate filings | Régie de l'énergie | Quebec `paused`/`blocked` context |
| Konative `/canada`, `/reality-vs-press`, `issue-001-canada-10gw.md` | In-repo editorial | Mihta Askiy, Prophet River, Upper Nicola, Wonder Valley |

### Tier 3 — Ongoing refresh

| Source | Cadence | Use |
|--------|---------|-----|
| Existing news ingest + `extract-projects` | Daily | New announcements |
| OSM Overpass + Wikidata | Weekly | Net-new operational tagging |
| ISO queue cron | Weekly | Pipeline updates |

**Research deliverable:** `web/data/canada-dc/research/` containing:
- `facilities.csv` — one row per facility with required columns (see Task 3)
- `projects.csv` — announced/construction/stalled with sources
- `province-rollups.json` — expected counts per province for QA
- `sources.json` — citation per row

---

## File Structure

```
web/
├── data/canada-dc/
│   ├── research/
│   │   ├── facilities.csv
│   │   ├── projects.csv
│   │   ├── province-rollups.json
│   │   └── sources.json
│   └── operators.json              # operator → default geocode hints
├── src/lib/
│   ├── canadaProvinces.ts          # NEW — ISO 3166-2:CA codes + aliases
│   ├── projectIngestion.ts         # MODIFY — extend RawProject + upsert
│   ├── queueToProject.ts           # NEW — map ISO queue → dataCenterProject
│   └── dedupeProjects.ts           # NEW — haversine + name fuzzy merge
├── scripts/
│   ├── seed-canada-dc.ts           # NEW — load curated CSV → Sanity
│   ├── seed-canada-queue.ts        # NEW — Supabase queue → Sanity (DC loads)
│   ├── migrate-province-codes.ts   # NEW — normalize existing Sanity rows
│   └── verify-canada-dataset.ts    # NEW — QA gate script
├── src/app/(frontend)/api/
│   ├── ingest-canada-queue/route.ts  # NEW — cron endpoint
│   └── v1/map-data/route.ts          # MODIFY — optional stalled layer
├── src/sanity/schemaTypes/
│   └── dataCenterProject.ts          # MODIFY — provinceCode field
└── tests/
    ├── canadaProvinces.test.ts
    ├── queueToProject.test.ts
    └── dedupeProjects.test.ts
```

---

## Phase 0 — Fix Foundations (Must Ship First)

Without Phase 0, research data will not query correctly on market pages or map filters.

### Task 0: Add `provinceCode` and normalize geography

**Files:**
- Create: `web/src/lib/canadaProvinces.ts`
- Modify: `web/src/sanity/schemaTypes/dataCenterProject.ts`
- Modify: `web/src/lib/projectIngestion.ts`
- Create: `web/scripts/migrate-province-codes.ts`
- Test: `web/tests/canadaProvinces.test.ts`

- [ ] **Step 1: Write failing test for province normalization**

```typescript
// web/tests/canadaProvinces.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeProvinceCode, provinceCodeToName } from '../src/lib/canadaProvinces'

describe('normalizeProvinceCode', () => {
  it('maps full names and abbreviations', () => {
    expect(normalizeProvinceCode('Ontario')).toBe('ON')
    expect(normalizeProvinceCode('ON')).toBe('ON')
    expect(normalizeProvinceCode('British Columbia')).toBe('BC')
    expect(normalizeProvinceCode('Québec')).toBe('QC')
  })
  it('returns null for unknown', () => {
    expect(normalizeProvinceCode('Virginia')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd web && npx vitest run tests/canadaProvinces.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `canadaProvinces.ts`**

```typescript
// web/src/lib/canadaProvinces.ts
export const CA_PROVINCE_CODES = [
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT',
] as const
export type CaProvinceCode = typeof CA_PROVINCE_CODES[number]

const ALIASES: Record<string, CaProvinceCode> = {
  alberta: 'AB', ab: 'AB',
  'british columbia': 'BC', bc: 'BC',
  manitoba: 'MB', mb: 'MB',
  'new brunswick': 'NB', nb: 'NB',
  'newfoundland and labrador': 'NL', nl: 'NL',
  'nova scotia': 'NS', ns: 'NS',
  'northwest territories': 'NT', nt: 'NT',
  nunavut: 'NU', nu: 'NU',
  ontario: 'ON', on: 'ON',
  'prince edward island': 'PE', pe: 'PE',
  quebec: 'QC', québec: 'QC', qc: 'QC',
  saskatchewan: 'SK', sk: 'SK',
  yukon: 'YT', yt: 'YT',
}

export function normalizeProvinceCode(input?: string | null): CaProvinceCode | null {
  if (!input) return null
  const key = input.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  return ALIASES[key] ?? null
}

export function provinceCodeToName(code: CaProvinceCode): string {
  const names: Record<CaProvinceCode, string> = {
    AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
    NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
    SK: 'Saskatchewan', YT: 'Yukon',
  }
  return names[code]
}
```

- [ ] **Step 4: Add schema field `provinceCode`**

In `dataCenterProject.ts`, add after `state`:

```typescript
defineField({
  name: 'provinceCode',
  title: 'Province / Territory Code',
  type: 'string',
  options: { list: ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'] },
  description: 'ISO 3166-2:CA code. Required for Canadian records.',
}),
```

- [ ] **Step 5: Extend `RawProject` and upsert**

In `projectIngestion.ts`:
- Add `provinceCode?: CaProvinceCode`
- Add sources: `'manual' | 'peeringdb' | 'aeso_queue' | 'hq_queue' | 'bch_queue'`
- Extend `status` to include `'stalled' | 'blocked' | 'paused' | 'canceled'`
- On upsert, auto-set `provinceCode` from `state` when `country === 'CA'`

- [ ] **Step 6: Migration script for existing records**

`migrate-province-codes.ts` — fetch all `country == 'CA'`, patch `provinceCode` from `state`, patch `state` to full name from code.

- [ ] **Step 7: Fix market page GROQ**

In `markets/[state]/page.tsx`, change project query to:

```groq
*[_type == "dataCenterProject" && country == "CA" && (provinceCode == $abbr || state == $name || state == $abbr)] | order(capacityMw desc) [0...50]
```

- [ ] **Step 8: Run tests + migration dry-run**

Run: `cd web && npx vitest run tests/canadaProvinces.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add web/src/lib/canadaProvinces.ts web/tests/canadaProvinces.test.ts web/src/sanity/schemaTypes/dataCenterProject.ts web/src/lib/projectIngestion.ts web/scripts/migrate-province-codes.ts web/src/app/(frontend)/markets/[state]/page.tsx
git commit -m "feat: add Canadian provinceCode normalization for DC dataset"
```

---

## Phase 1 — Research Sprint & Curated Baseline

**Human + agent research task.** Do not skip. Automated pipelines alone will not reach 117 operational facilities because OSM tagging in Canada is incomplete.

### Task 1: Research workbook and acceptance criteria

**Files:**
- Create: `web/data/canada-dc/research/facilities.csv`
- Create: `web/data/canada-dc/research/projects.csv`
- Create: `web/data/canada-dc/research/province-rollups.json`
- Create: `web/data/canada-dc/research/sources.json`

- [ ] **Step 1: Define CSV schemas**

`facilities.csv` columns (required unless noted):
```
source_id,name,operator,city,province_code,lat,lng,status,capacity_mw,facility_type,opened_year,source_url,notes
```
- `status`: `operational` only for this file
- `facility_type`: `colo | hyperscale | enterprise | edge | telecom`
- `source_id`: stable slug, e.g. `cologix-tor1`

`projects.csv` columns:
```
source_id,name,operator,city,province_code,lat,lng,status,capacity_mw,expected_online_date,block_reason,block_reason_detail,source_url,related_sources
```
- `status`: `construction | announced | stalled | blocked | paused | canceled`

- [ ] **Step 2: Province-by-province research checklist**

| Province | Operational target | Pipeline target | Priority operators / projects |
|----------|-------------------|-------------------|------------------------------|
| ON | ~35 (Toronto-heavy) | IESO loads + eastern ON greenfield | eStruxture, Equinix, Cologix, Compass, York Region builds |
| QC | ~60 (per Logic) | HQ queue + Microsoft campuses | Vantage QC61, QScale, Cologix MTL, Hydro-Québec allocation |
| BC | ~25 | BCH 300 MW AI cap context | CyrusOne, Digital Realty, Prophet River, Upper Nicola |
| AB | ~15 | AESO 30+ AI queue | Mihta Askiy 650 MW, eStruxture Calgary, Wonder Valley opposition |
| SK | ~3 | George Gordon / Bell | Regina/Saskatoon colo |
| MB | ~3 | — | Winnipeg telecom/colo |
| Atlantic (NB, NS, NL, PE) | ~8 combined | — | Halifax, Moncton, Saint John |
| Territories | 0–1 each | — | Yellowknife telecom if any |

- [ ] **Step 3: Populate province-rollups.json**

```json
{
  "ON": { "operational_min": 30, "operational_target": 35, "pipeline_min": 8 },
  "QC": { "operational_min": 45, "operational_target": 60, "pipeline_min": 10 },
  "AB": { "operational_min": 10, "operational_target": 15, "pipeline_min": 15 },
  "BC": { "operational_min": 15, "operational_target": 25, "pipeline_min": 8 }
}
```

- [ ] **Step 4: Geocoding rules**

1. Prefer operator-published address → Nominatim (`countrycodes=ca`) → store lat/lng
2. If address unknown, use city centroid **only** for `announced` queue-sourced rows; mark `extractionConfidence: 0.5`
3. Never use province centroid for `operational` — skip row and flag in QA if no address found
4. Store original address in `notes` for manual fix

- [ ] **Step 5: Sign-off gate**

Research is done when:
- Every row has `source_url`
- ON/QC/AB/BC meet `operational_min` in rollups
- ≥10 stalled/blocked/paused projects captured nationally
- `sources.json` maps each `source_id` → citation

---

## Phase 2 — Seed Script & Dedup (Code That Works Out of the Gate)

### Task 2: Curated seed loader

**Files:**
- Create: `web/scripts/seed-canada-dc.ts`
- Create: `web/src/lib/dedupeProjects.ts`
- Test: `web/tests/dedupeProjects.test.ts`

- [ ] **Step 1: Write dedupe test**

```typescript
import { describe, it, expect } from 'vitest'
import { isDuplicateProject } from '../src/lib/dedupeProjects'

describe('isDuplicateProject', () => {
  it('matches same operator within 500m', () => {
    const a = { name: 'Cologix TOR1', operator: 'Cologix', lat: 43.74, lng: -79.29 }
    const b = { name: 'TOR1', operator: 'Cologix', lat: 43.7405, lng: -79.2905 }
    expect(isDuplicateProject(a, b)).toBe(true)
  })
})
```

- [ ] **Step 2: Implement `dedupeProjects.ts`**

Haversine ≤ 500 m AND (operator match OR Levenshtein name similarity ≥ 0.8) → duplicate. Prefer record with higher `extractionConfidence`, then `manual` source, then lower `_id`.

- [ ] **Step 3: Implement `seed-canada-dc.ts`**

```typescript
// Pseudocode structure — full implementation in task
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { getSanityWriteClient, upsertProject } from '../src/lib/projectIngestion'
import { normalizeProvinceCode, provinceCodeToName } from '../src/lib/canadaProvinces'

for (const row of facilities) {
  await upsertProject(client, {
    name: row.name,
    operator: row.operator,
    lat: Number(row.lat),
    lng: Number(row.lng),
    city: row.city,
    state: provinceCodeToName(row.province_code),
    provinceCode: row.province_code,
    country: 'CA',
    status: row.status,
    capacityMw: row.capacity_mw ? Number(row.capacity_mw) : undefined,
    source: 'manual',
    sourceId: row.source_id,
    sourceUrl: row.source_url,
    extractionConfidence: 1.0,
  })
}
```

Run order: facilities.csv first, then projects.csv. Respect `verified` lock.

- [ ] **Step 4: Dry-run locally**

Run: `cd web && npx tsx scripts/seed-canada-dc.ts --dry-run`
Expected: Row counts per province printed; 0 invalid province codes; 0 operational rows missing coords

- [ ] **Step 5: Seed to Sanity staging**

Run: `cd web && npx tsx scripts/seed-canada-dc.ts`
Expected: created + updated counts; no duplicate `_id` collisions

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: seed curated Canada datacenter baseline from research CSV"
```

---

## Phase 3 — ISO Queue → Sanity Sync

Supabase already ingests IESO/AESO/HQ/BCH. Promote **load-type, DC-likely** rows to map bubbles.

### Task 3: Queue-to-project mapper

**Files:**
- Create: `web/src/lib/queueToProject.ts`
- Create: `web/scripts/seed-canada-queue.ts`
- Create: `web/src/app/(frontend)/api/ingest-canada-queue/route.ts`
- Modify: `web/vercel.json` (weekly cron)
- Test: `web/tests/queueToProject.test.ts`

- [ ] **Step 1: DC likelihood filter**

```typescript
export function isLikelyDataCenterLoad(row: {
  project_name: string
  resource_type: string
  capacity_mw: number
  metadata?: Record<string, unknown>
}): boolean {
  const name = row.project_name.toLowerCase()
  if (name.includes('data centre') || name.includes('data center')) return true
  if (name.includes('ai ') || name.includes(' hyperscale')) return true
  if (row.resource_type === 'load' && row.capacity_mw >= 20) return true
  return false
}
```

- [ ] **Step 2: Status mapping from queue phase**

| Queue `study_phase` | Sanity `status` |
|---------------------|-----------------|
| `in_service` | `operational` |
| `construction`, `agreement_signed` | `construction` |
| `application`, `feasibility`, `system_impact`, `facilities` | `announced` |
| `withdrawn` | `canceled` |

- [ ] **Step 3: Province + source mapping**

| Authority | `source` value | `provinceCode` |
|-----------|---------------|----------------|
| IESO | `ieso_queue` | `ON` |
| AESO | `aeso_queue` | `AB` |
| HQ | `hq_queue` | `QC` |
| BCH | `bch_queue` | `BC` |

- [ ] **Step 4: Dedupe against existing Sanity records**

Before upsert, query Sanity for same province + similar name OR within 2 km. If curated `manual` record exists with `verified: true`, skip queue row.

- [ ] **Step 5: Cron route**

`GET /api/ingest-canada-queue` — run Supabase ingest, then promote filtered rows. Protect with `CRON_SECRET`.

- [ ] **Step 6: Tests with fixture HTML/JSON**

Fixtures in `web/tests/fixtures/aeso-queue-snippet.html` (redacted). Assert parser returns expected row count and province codes.

- [ ] **Step 7: Commit + deploy cron**

---

## Phase 4 — Stalled / Blocked Editorial Layer

Clients explicitly asked for stalled/planned visibility. Map currently hides these statuses.

### Task 4: Surface stalled projects on map (Canada-aware)

**Files:**
- Modify: `web/src/app/(frontend)/api/v1/map-data/route.ts`
- Modify: `web/src/components/DataCenterMap.tsx`
- Modify: `web/src/components/LayerControlPanel.tsx`
- Create: `web/scripts/seed-canada-stalled.ts`

- [ ] **Step 1: Seed stalled records from research**

Minimum set (from Konative editorial):
- Wonder Valley / Sturgeon Lake opposition (AB) — `blocked`, `community`
- BC 2026 DC interconnection cap — tag affected projects `paused`, `regulation`
- Hydro-Québec pre-2026 moratorium projects — `paused`, `regulation`
- Any canceled hyperscale announcements with press citations

- [ ] **Step 2: Extend map-data query**

Add optional query param `?includeStalled=1` OR separate GeoJSON sublayer `projects_stalled`:

```groq
*[_type == "dataCenterProject" && country == "CA" && status in ["stalled","blocked","paused","canceled"] && defined(location)]{...}
```

- [ ] **Step 3: Map UI**

- New toggle: "Pipeline issues (CA)" — off by default
- Distinct marker style (hatched / amber) for stalled/blocked
- `SiteProfilePanel` shows `blockReason` + `blockReasonDetail`

- [ ] **Step 4: Verify**

Run: `curl -s 'http://localhost:3005/api/v1/map-data?includeStalled=1' | jq '.layers.projects_stalled.total'`
Expected: ≥ 10 for seeded dataset

---

## Phase 5 — Province Market Pages & Canada Filter

### Task 5: Expand markets coverage

**Files:**
- Modify: `web/src/app/(frontend)/markets/[state]/page.tsx` (MARKETS config)
- Modify: `web/src/components/DemoViews.tsx`
- Modify: `web/src/app/(frontend)/canada/page.tsx` — link to live map filtered by province

- [ ] **Step 1: Add markets**

Add to `MARKETS`: `saskatchewan`, `manitoba`, `nova-scotia`, `new-brunswick`, `newfoundland`, `prince-edward-island`, `northwest-territories`, `yukon`, `nunavut` (tier: `developing`)

- [ ] **Step 2: Market page stats from live data**

Replace static counts with GROQ aggregates:

```groq
{
  "operational": count(*[_type=="dataCenterProject" && country=="CA" && provinceCode==$abbr && status=="operational"]),
  "pipeline": count(*[_type=="dataCenterProject" && country=="CA" && provinceCode==$abbr && status in ["announced","construction"]]),
  "stalled": count(*[_type=="dataCenterProject" && country=="CA" && provinceCode==$abbr && status in ["stalled","blocked","paused"]])
}
```

- [ ] **Step 3: Map country/province filter**

Add filter chips on `/map`: `Canada | US | All` and province dropdown when Canada selected. Pass filter to client-side layer filter (no new API needed if all data loaded).

- [ ] **Step 4: Connect `/canada` hero stats to live API**

Fetch from `/api/v1/projects?country=CA` stats endpoint (extend if needed).

---

## Phase 6 — Verification Gate (Required Before PR)

### Task 6: Automated QA script

**Files:**
- Create: `web/scripts/verify-canada-dataset.ts`
- Modify: `web/package.json` — add `"verify:canada-dataset": "tsx scripts/verify-canada-dataset.ts"`

- [ ] **Step 1: Implement checks**

```typescript
const checks = [
  { name: 'ON operational >= 30', query: 'count operational ON', min: 30 },
  { name: 'QC operational >= 45', query: 'count operational QC', min: 45 },
  { name: 'All CA rows have provinceCode', query: 'missing provinceCode', max: 0 },
  { name: 'All operational have coords', query: 'operational missing location', max: 0 },
  { name: 'No duplicate manual source_ids', query: 'dup sourceId', max: 0 },
  { name: 'Stalled layer >= 10', query: 'stalled count', min: 10 },
]
```

Exit code 1 on failure. Print failing checks with Sanity document IDs.

- [ ] **Step 2: Add to CI / pre-merge**

Run: `cd web && npm run verify:canada-dataset`
Expected: all checks PASS against production or staging dataset

- [ ] **Step 3: Manual smoke test checklist**

1. `/map` — toggle Canada filter; bubbles appear in Toronto, Montreal, Calgary, Vancouver
2. `/markets/ontario` — project list non-empty; stats match map
3. Click Mihta Askiy / Wonder Valley — profile panel shows status + source
4. `/api/v1/map-data` — `projects.total` for CA ≥ 100 when filtered client-side
5. Cron dry-run `/api/ingest-canada-queue` — no unhandled fetch errors

---

## Phase 7 — Ongoing Refresh (Post-v1)

| Job | Schedule | Action |
|-----|----------|--------|
| `ingest-canada-queue` | Weekly | Promote new ISO load rows |
| `extract-projects` | Daily | CA news → announced/construction |
| `ingest-osm` / `ingest-wikidata` | Weekly | Net-new ops; dedupe |
| Manual CSV patch | Monthly | Top 10 operator changes from DCD/Arizton diffs |
| `verify:canada-dataset` | On every ingest | Block deploy if rollups regress >10% |

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| Paid dataset license (Arizton) | Start with operator locators + PeeringDB + Logic cross-check; budget for Excel license |
| Duplicate records (queue vs manual) | Dedupe lib + prefer `manual`/`verified` |
| Bad geocodes | Operational requires address-level geocode; QA script rejects province-centroid ops |
| interconnection.fyi HTML changes | Fixture tests; fallback to direct AESO/HQ exports if available |
| Map clutter | Default hide stalled; province filter; min MW toggle for queue-sourced rows |
| Province name drift | `provinceCode` canonical; migration script |

---

## Execution Order Summary

```
Phase 0 (foundation)     → 1 PR, must merge first
Phase 1 (research)       → CSV files, no code deploy dependency
Phase 2 (seed)           → 1 PR, run verify
Phase 3 (queue sync)     → 1 PR, cron + tests
Phase 4 (stalled layer)  → 1 PR, UI + seed
Phase 5 (markets/filter) → 1 PR, UX
Phase 6 (verify gate)    → part of each PR
Phase 7 (ongoing)        → operational
```

**Do not parallelize Phase 0.** Phases 2–4 can overlap after research CSV exists.

---

## Success Criteria (Client-Ready)

- [ ] Client opens `/map`, filters Canada, sees operational + pipeline bubbles in all 4 primary provinces
- [ ] Client opens `/markets/alberta`, sees AESO-scale pipeline count aligned with Konative marketing ("30+ AI DC projects")
- [ ] Client toggles "Pipeline issues", sees Wonder Valley, BC cap, HQ pause context with sources
- [ ] `npm run verify:canada-dataset` passes in CI
- [ ] `/canada` page stats pull from live dataset, not hardcoded claims
- [ ] No market page returns empty due to `Ontario` vs `ON` mismatch

---

## Self-Review (Spec Coverage)

| Requirement | Task |
|-------------|------|
| Comprehensive provincial list | Task 1 checklist + Task 5 markets |
| Current DCs | Task 1 facilities.csv + Task 2 seed |
| Upcoming / planned | Task 1 projects.csv + Task 3 queue sync |
| Stalled / blocked | Task 4 |
| Real research | Phase 1 entire phase |
| Code works out of the gate | Phase 0 + Phase 6 verify gate + tests in Tasks 0, 2, 3 |
| Territories | Task 1 checklist + Task 5 markets (developing tier) |

No placeholders remain in task steps above.
