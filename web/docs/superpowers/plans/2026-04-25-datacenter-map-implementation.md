# Konative Data Center Map — Implementation Plan

> **For agentic workers:** This plan is fully self-contained. No prior conversation context required. Execute task-by-task. Use checkbox `- [ ]` syntax for tracking. Recommended: superpowers:executing-plans for inline execution, or superpowers:subagent-driven-development for fresh-subagent-per-task with reviews.

**Goal:** Build a fully automated data center project map (US + Canada) as the homepage hero of konative.com. Bubble visualization showing project location, capacity (MW), and status. Updates automatically with zero human curation. Total ongoing cost: under $5/month.

**Architecture:** Three automated data sources feed a single Sanity dataset which renders as a MapLibre GL JS bubble map. (1) OpenStreetMap + Wikidata for operational facilities — pulled weekly. (2) LLM extraction from existing 230+ daily news articles for proposed/under-construction projects — pulled daily. (3) IESO interconnection queue for Ontario load applications — pulled weekly. All pipelines run via Vercel cron jobs already in place.

**Tech Stack:**
- **Map:** `maplibre-gl@^5.0.0` + `react-map-gl@^8.0.0` (`/maplibre` subpath)
- **Tiles:** OpenFreeMap dark style (`https://tiles.openfreemap.org/styles/dark`) — free, no key, commercial-safe
- **Data store:** Sanity (existing project, free tier sufficient)
- **Cron:** Vercel cron (already configured at `web/vercel.json`)
- **LLM:** Anthropic Claude Haiku via existing `@anthropic-ai/sdk` (~$0.001/article)
- **APIs:** OSM Overpass, Wikidata SPARQL, IESO XLSX (all free, no auth)

---

## Repository Context

**Repo root:** `/Users/jerameyjames/repos/konative-website` (Next.js 16 + Sanity + Builder.io app in `web/`)
**Sanity project ID:** `zwk4buq7` | **Dataset:** `production`
**Existing cron:** Daily 6am UTC at `/api/ingest-news` (see `web/vercel.json`)
**Existing schemas:** `landSubmission`, `capacitySubmission`, `investorInquiry`, `newsItem`, `newsSource`, `newsIngestionRun` (in `web/src/sanity/schemaTypes/`)
**Existing API routes:** `/api/v1/content` (newsItem from Sanity), `/api/v1/health`, `/api/ingest-news`
**Brand colors:** `#0C2046` (primary navy), `#E07B39` (rust accent), white/text gradients
**Existing homepage hero:** `web/src/app/(frontend)/_sections/HeroSection.tsx` — full-bleed dark with stats card on right

---

## File Structure

```
web/
├── src/
│   ├── sanity/schemaTypes/
│   │   └── dataCenterProject.ts          # NEW — schema for project records
│   │   └── index.ts                       # MODIFY — register new schema
│   ├── app/(frontend)/api/
│   │   ├── v1/projects/route.ts          # NEW — GeoJSON API for map
│   │   ├── ingest-osm/route.ts           # NEW — OSM Overpass weekly ingest
│   │   ├── ingest-wikidata/route.ts      # NEW — Wikidata SPARQL weekly ingest
│   │   ├── ingest-ieso/route.ts          # NEW — IESO load queue weekly ingest
│   │   └── extract-projects/route.ts     # NEW — LLM extract projects from news
│   ├── components/
│   │   └── DataCenterMap.tsx             # NEW — MapLibre map component
│   ├── app/(frontend)/_sections/
│   │   └── HeroSection.tsx               # MODIFY — replace bg image with map
│   └── lib/
│       ├── projectIngestion.ts           # NEW — shared dedup + persist helpers
│       └── projectExtraction.ts          # NEW — LLM extraction prompt + parser
├── vercel.json                            # MODIFY — add 3 new cron entries
└── package.json                           # MODIFY — add maplibre-gl, react-map-gl
```

---

## Task 1: Add map dependencies

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: Install MapLibre + react-map-gl**

```bash
cd web && npm install maplibre-gl@^5.0.0 react-map-gl@^8.0.0
```

- [ ] **Step 2: Verify install**

Run: `cd web && npm ls maplibre-gl react-map-gl`
Expected: Both listed with v5.x and v8.x respectively.

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "feat: add MapLibre GL JS for data center map"
```

---

## Task 2: Create Sanity schema for `dataCenterProject`

**Files:**
- Create: `web/src/sanity/schemaTypes/dataCenterProject.ts`
- Modify: `web/src/sanity/schemaTypes/index.ts`

- [ ] **Step 1: Write schema file**

Create `web/src/sanity/schemaTypes/dataCenterProject.ts`:

```typescript
import { defineType, defineField } from 'sanity'

export const dataCenterProject = defineType({
  name: 'dataCenterProject',
  title: 'Data Center Project',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Project Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'operator', title: 'Operator / Developer', type: 'string' }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'geopoint',
      validation: r => r.required(),
    }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'state', title: 'State / Province', type: 'string' }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      options: { list: ['US', 'CA'] },
      validation: r => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Operational', value: 'operational' },
          { title: 'Under Construction', value: 'construction' },
          { title: 'Announced / Proposed', value: 'announced' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({ name: 'capacityMw', title: 'Capacity (MW)', type: 'number' }),
    defineField({ name: 'announcedDate', title: 'Announced Date', type: 'date' }),
    defineField({ name: 'expectedOnlineDate', title: 'Expected Online', type: 'date' }),
    defineField({
      name: 'source',
      title: 'Data Source',
      type: 'string',
      options: { list: ['osm', 'wikidata', 'news_extraction', 'ieso_queue', 'manual'] },
    }),
    defineField({ name: 'sourceId', title: 'Source ID', type: 'string', description: 'OSM ID, Wikidata QID, news article ID, etc.' }),
    defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url' }),
    defineField({ name: 'extractionConfidence', title: 'Extraction Confidence', type: 'number', description: '0–1 from LLM extraction; 1.0 for OSM/Wikidata' }),
    defineField({ name: 'lastSeenAt', title: 'Last Seen At', type: 'datetime' }),
    defineField({ name: 'verified', title: 'Manually Verified', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'operator', media: 'status' },
  },
})
```

- [ ] **Step 2: Register schema**

In `web/src/sanity/schemaTypes/index.ts`, add:

```typescript
import { dataCenterProject } from './dataCenterProject'
// In the schemaTypes array:
//   ... existing,
//   dataCenterProject,
```

- [ ] **Step 3: Build to verify**

Run: `cd web && npm run build`
Expected: Clean build, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/sanity/schemaTypes/
git commit -m "feat(sanity): add dataCenterProject schema"
```

---

## Task 3: Build OSM Overpass ingestion

**Files:**
- Create: `web/src/lib/projectIngestion.ts`
- Create: `web/src/app/(frontend)/api/ingest-osm/route.ts`

- [ ] **Step 1: Write shared ingestion helpers**

Create `web/src/lib/projectIngestion.ts`:

```typescript
import { createClient, type SanityClient } from '@sanity/client'

export function getSanityWriteClient(): SanityClient {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  })
}

export interface RawProject {
  name: string
  operator?: string
  lat: number
  lng: number
  city?: string
  state?: string
  country: 'US' | 'CA'
  status: 'operational' | 'construction' | 'announced'
  capacityMw?: number
  source: 'osm' | 'wikidata' | 'news_extraction' | 'ieso_queue'
  sourceId: string
  sourceUrl?: string
  extractionConfidence: number
}

function makeDocId(p: RawProject): string {
  // Stable ID per source — overwrites prior ingest of same record
  return `dcProject.${p.source}.${p.sourceId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

/**
 * Upsert one project. Returns 'created' | 'updated' | 'skipped'.
 * Skipped if a manually verified record exists (don't overwrite human curation).
 */
export async function upsertProject(
  client: SanityClient,
  raw: RawProject
): Promise<'created' | 'updated' | 'skipped'> {
  const docId = makeDocId(raw)
  const existing = await client.getDocument(docId)
  if (existing && existing.verified) return 'skipped'

  const doc = {
    _id: docId,
    _type: 'dataCenterProject',
    name: raw.name,
    operator: raw.operator,
    location: { _type: 'geopoint', lat: raw.lat, lng: raw.lng },
    city: raw.city,
    state: raw.state,
    country: raw.country,
    status: raw.status,
    capacityMw: raw.capacityMw,
    source: raw.source,
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    extractionConfidence: raw.extractionConfidence,
    lastSeenAt: new Date().toISOString(),
  }

  await client.createOrReplace(doc)
  return existing ? 'updated' : 'created'
}
```

- [ ] **Step 2: Write OSM ingest route**

Create `web/src/app/(frontend)/api/ingest-osm/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for Vercel

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const QUERY = `[out:json][timeout:180];
(
  area["ISO3166-1"="US"][admin_level=2];
  area["ISO3166-1"="CA"][admin_level=2];
)->.searchArea;
(
  nwr["telecom"="data_center"](area.searchArea);
  nwr["building"="data_center"](area.searchArea);
  nwr["man_made"="data_center"](area.searchArea);
);
out center tags;`

interface OsmElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

export async function GET(req: NextRequest) {
  // Auth check — require CRON_SECRET bearer or Vercel cron header
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron')
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'konative-site/1.0 (deals@konative.com)',
      },
      body: 'data=' + encodeURIComponent(QUERY),
    })

    if (!res.ok) throw new Error(`Overpass returned ${res.status}`)
    const data = await res.json()
    const elements = data.elements as OsmElement[]

    const client = getSanityWriteClient()
    let created = 0, updated = 0, skipped = 0, errored = 0

    for (const el of elements) {
      try {
        const lat = el.lat ?? el.center?.lat
        const lng = el.lon ?? el.center?.lon
        if (!lat || !lng) continue

        const name = el.tags.name || el.tags['name:en'] || el.tags.operator
        if (!name) continue // Skip unnamed records

        // Country guess from coordinates (rough)
        const country: 'US' | 'CA' = lat > 49 && lng < -50 ? 'CA' : 'US'

        const raw: RawProject = {
          name,
          operator: el.tags.operator,
          lat,
          lng,
          city: el.tags['addr:city'],
          state: el.tags['addr:state'] || el.tags['addr:province'],
          country,
          status: 'operational', // OSM only contains existing facilities
          capacityMw: el.tags['power:rating'] ? parseFloat(el.tags['power:rating']) : undefined,
          source: 'osm',
          sourceId: `${el.type}/${el.id}`,
          sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
          extractionConfidence: 1.0,
        }

        const result = await upsertProject(client, raw)
        if (result === 'created') created++
        else if (result === 'updated') updated++
        else skipped++
      } catch (err) {
        errored++
        console.error('OSM upsert error:', err)
      }
    }

    return NextResponse.json({
      ok: true,
      total: elements.length,
      created, updated, skipped, errored,
    })
  } catch (err) {
    console.error('OSM ingest error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
```

- [ ] **Step 3: Test locally**

```bash
cd web && npm run dev
# In another terminal:
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3005/api/ingest-osm
```
Expected: JSON response with `ok: true`, `total` ~700-1500, `created` similar (first run).

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/projectIngestion.ts web/src/app/\(frontend\)/api/ingest-osm/
git commit -m "feat(api): OSM Overpass data center ingestion"
```

---

## Task 4: Build Wikidata SPARQL ingestion

**Files:**
- Create: `web/src/app/(frontend)/api/ingest-wikidata/route.ts`

- [ ] **Step 1: Write Wikidata ingest route**

Create `web/src/app/(frontend)/api/ingest-wikidata/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SPARQL_URL = 'https://query.wikidata.org/sparql'

const QUERY = `SELECT ?item ?itemLabel ?coord ?operatorLabel ?country WHERE {
  ?item wdt:P31/wdt:P279* wd:Q1378425 .
  ?item wdt:P17 ?country .
  VALUES ?country { wd:Q30 wd:Q16 }
  OPTIONAL { ?item wdt:P625 ?coord. }
  OPTIONAL { ?item wdt:P137 ?operator. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`

interface WdBinding {
  item: { value: string }
  itemLabel: { value: string }
  coord?: { value: string }
  operatorLabel?: { value: string }
  country: { value: string }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron')
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = `${SPARQL_URL}?format=json&query=${encodeURIComponent(QUERY)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'konative-site/1.0 (deals@konative.com)',
      },
    })

    if (!res.ok) throw new Error(`Wikidata returned ${res.status}`)
    const data = await res.json()
    const bindings = data.results.bindings as WdBinding[]

    const client = getSanityWriteClient()
    let created = 0, updated = 0, skipped = 0

    for (const b of bindings) {
      if (!b.coord?.value) continue
      const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value)
      if (!m) continue
      const lng = parseFloat(m[1])
      const lat = parseFloat(m[2])
      const qid = b.item.value.split('/').pop()!
      const country = b.country.value.includes('Q30') ? 'US' : 'CA'

      const raw: RawProject = {
        name: b.itemLabel.value,
        operator: b.operatorLabel?.value,
        lat, lng,
        country,
        status: 'operational',
        source: 'wikidata',
        sourceId: qid,
        sourceUrl: b.item.value,
        extractionConfidence: 1.0,
      }

      const result = await upsertProject(client, raw)
      if (result === 'created') created++
      else if (result === 'updated') updated++
      else skipped++
    }

    return NextResponse.json({
      ok: true, total: bindings.length, created, updated, skipped,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test locally**

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3005/api/ingest-wikidata
```
Expected: ~200-400 records created.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(frontend\)/api/ingest-wikidata/
git commit -m "feat(api): Wikidata SPARQL data center ingestion"
```

---

## Task 5: Build LLM extraction from news articles

**Files:**
- Create: `web/src/lib/projectExtraction.ts`
- Create: `web/src/app/(frontend)/api/extract-projects/route.ts`

- [ ] **Step 1: Verify Anthropic SDK installed**

Check `web/package.json` for `@anthropic-ai/sdk`. If missing:
```bash
cd web && npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Add `ANTHROPIC_API_KEY` to Vercel**

Manual step (note in deployment): Add `ANTHROPIC_API_KEY` to Vercel Production + Preview env vars. Get key from console.anthropic.com.

- [ ] **Step 3: Write extraction helper**

Create `web/src/lib/projectExtraction.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ExtractedProject {
  name: string
  operator?: string
  city?: string
  state?: string
  country: 'US' | 'CA'
  status: 'operational' | 'construction' | 'announced'
  capacityMw?: number
  confidence: number // 0-1
}

const SYSTEM_PROMPT = `You extract structured data center project information from news articles.

Return JSON: { "projects": [...] } where each project has:
- name (required, string): the project or campus name
- operator (optional, string): the developer/operator
- city, state (optional, strings): location
- country: "US" or "CA"
- status: "operational" | "construction" | "announced"
- capacityMw (optional, number): power capacity in MW
- confidence: 0-1 — how confident you are this is an actual data center project (not speculation)

Rules:
- Only extract concrete projects with at least name + country + status
- Skip speculation or general industry trends
- Skip projects outside US or Canada
- If multiple projects mentioned, return all
- If no projects, return { "projects": [] }
- Return ONLY valid JSON, no markdown fences`

export async function extractProjects(article: {
  title: string
  summary?: string
  url: string
}): Promise<ExtractedProject[]> {
  const userMsg = `Title: ${article.title}\n\nSummary: ${article.summary || '(no summary)'}\n\nURL: ${article.url}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text)
    return parsed.projects || []
  } catch (err) {
    console.error('Extraction error for', article.url, err)
    return []
  }
}
```

- [ ] **Step 4: Write extraction API route**

Create `web/src/app/(frontend)/api/extract-projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'
import { extractProjects } from '@/lib/projectExtraction'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Geocode city/state to lat/lng using Nominatim (free, OSM)
async function geocode(city?: string, state?: string, country?: string): Promise<{lat: number, lng: number} | null> {
  if (!city && !state) return null
  const q = [city, state, country === 'US' ? 'USA' : 'Canada'].filter(Boolean).join(', ')
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'konative-site/1.0 (deals@konative.com)' } }
    )
    if (!res.ok) return null
    const arr = await res.json()
    if (!arr.length) return null
    return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron')
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSanityWriteClient()

  // Get news articles from last 7 days that haven't been extraction-processed
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const articles = await client.fetch(
    `*[_type == "newsItem" && publishedAt > $since && !defined(extractedAt)] | order(publishedAt desc)[0...50]{
      _id, title, summary, url
    }`,
    { since: since.toISOString() }
  )

  let processed = 0, created = 0, lowConfidenceSkipped = 0

  for (const article of articles) {
    const extractions = await extractProjects(article)

    for (const proj of extractions) {
      if (proj.confidence < 0.6) {
        lowConfidenceSkipped++
        continue
      }

      const coords = await geocode(proj.city, proj.state, proj.country)
      if (!coords) continue

      const raw: RawProject = {
        name: proj.name,
        operator: proj.operator,
        lat: coords.lat,
        lng: coords.lng,
        city: proj.city,
        state: proj.state,
        country: proj.country,
        status: proj.status,
        capacityMw: proj.capacityMw,
        source: 'news_extraction',
        sourceId: `${article._id}.${proj.name.replace(/\s+/g, '_').slice(0, 40)}`,
        sourceUrl: article.url,
        extractionConfidence: proj.confidence,
      }

      const result = await upsertProject(client, raw)
      if (result === 'created') created++

      // Rate limit Nominatim (1 req/sec)
      await new Promise(r => setTimeout(r, 1100))
    }

    // Mark article as processed
    await client.patch(article._id).set({ extractedAt: new Date().toISOString() }).commit()
    processed++
  }

  return NextResponse.json({
    ok: true, articlesProcessed: processed, projectsCreated: created, lowConfidenceSkipped,
  })
}
```

- [ ] **Step 5: Test extraction locally** (requires `ANTHROPIC_API_KEY` in `.env.local`)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3005/api/extract-projects
```
Expected: Processes up to 50 unprocessed articles, creates project records for high-confidence extractions.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/projectExtraction.ts web/src/app/\(frontend\)/api/extract-projects/
git commit -m "feat(api): LLM extraction of projects from news articles"
```

---

## Task 6: Build IESO load queue ingestion (Canada-specific, optional)

**Note:** IESO is the only North American ISO publishing a public load queue with explicit MW. This gives us the strongest data center signal in Ontario specifically.

**Files:**
- Create: `web/src/app/(frontend)/api/ingest-ieso/route.ts`

- [ ] **Step 1: Add xlsx parser**

```bash
cd web && npm install xlsx
```

- [ ] **Step 2: Write IESO ingest route**

Create `web/src/app/(frontend)/api/ingest-ieso/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// IESO publishes Connection Application Status as XLSX. URL pattern observed:
// https://www.ieso.ca/-/media/Files/IESO/Document-Library/connection-assessments/connection-application-status.xlsx
// If this URL changes, check the SPA at https://www.ieso.ca/Sector-Participants/Connection-Process/Application-Status
const IESO_URL = 'https://www.ieso.ca/-/media/Files/IESO/Document-Library/connection-assessments/connection-application-status.xlsx'

// Approximate Ontario city centroids for fallback geocoding
const CITY_COORDS: Record<string, [number, number]> = {
  'toronto': [43.6532, -79.3832],
  'mississauga': [43.5890, -79.6441],
  'ottawa': [45.4215, -75.6972],
  'hamilton': [43.2557, -79.8711],
  'london': [42.9849, -81.2453],
  'kitchener': [43.4516, -80.4925],
  'windsor': [42.3149, -83.0364],
  // Default: Toronto (most projects cluster there)
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron')
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(IESO_URL, {
      headers: { 'User-Agent': 'konative-site/1.0 (deals@konative.com)' },
    })

    if (!res.ok) throw new Error(`IESO returned ${res.status}`)
    const buffer = await res.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any>(sheet)

    const client = getSanityWriteClient()
    let created = 0, updated = 0, skipped = 0

    for (const row of rows) {
      // Filter for load applications (data center signal)
      const projectType = String(row['Project Type'] || row['Type'] || '').toLowerCase()
      if (!projectType.includes('load')) continue

      const mw = parseFloat(row['MW'] || row['Capacity'] || '0')
      if (!mw || mw < 50) continue // Filter for >50MW (likely data center scale)

      const name = row['Project Name'] || row['Applicant'] || `Load Project ${row['CAA ID']}`
      const status = String(row['Status'] || '').toLowerCase()
      const mappedStatus =
        status.includes('final') || status.includes('approved') ? 'construction' :
        status.includes('withdrawn') ? 'announced' : 'announced'

      const region = String(row['Region'] || row['Connection Point'] || '').toLowerCase()
      const cityKey = Object.keys(CITY_COORDS).find(k => region.includes(k))
      const [lat, lng] = cityKey ? CITY_COORDS[cityKey] : CITY_COORDS['toronto']

      const raw: RawProject = {
        name,
        operator: row['Applicant'],
        lat, lng,
        state: 'Ontario',
        country: 'CA',
        status: mappedStatus,
        capacityMw: mw,
        source: 'ieso_queue',
        sourceId: String(row['CAA ID'] || row['ID'] || name).replace(/\s+/g, '_'),
        sourceUrl: 'https://www.ieso.ca/Sector-Participants/Connection-Process/Application-Status',
        extractionConfidence: 0.75, // Inferred data center, not confirmed
      }

      const result = await upsertProject(client, raw)
      if (result === 'created') created++
      else if (result === 'updated') updated++
      else skipped++
    }

    return NextResponse.json({ ok: true, totalRows: rows.length, created, updated, skipped })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json web/src/app/\(frontend\)/api/ingest-ieso/
git commit -m "feat(api): IESO load queue ingestion (Ontario data centers)"
```

---

## Task 7: Build `/api/v1/projects` GeoJSON API

**Files:**
- Create: `web/src/app/(frontend)/api/v1/projects/route.ts`

- [ ] **Step 1: Write projects API**

Create `web/src/app/(frontend)/api/v1/projects/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const dynamic = 'force-dynamic'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET() {
  try {
    const projects = await sanity.fetch(`*[_type == "dataCenterProject" && defined(location)]{
      _id, name, operator, location, city, state, country,
      status, capacityMw, source, sourceUrl, extractionConfidence
    }`)

    const features = projects.map((p: any) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.location.lng, p.location.lat] },
      properties: {
        id: p._id,
        name: p.name,
        operator: p.operator,
        city: p.city,
        state: p.state,
        country: p.country,
        status: p.status,
        mw: p.capacityMw || 0,
        source: p.source,
        sourceUrl: p.sourceUrl,
      },
    }))

    return NextResponse.json({
      type: 'FeatureCollection',
      features,
      stats: {
        total: projects.length,
        operational: projects.filter((p: any) => p.status === 'operational').length,
        construction: projects.filter((p: any) => p.status === 'construction').length,
        announced: projects.filter((p: any) => p.status === 'announced').length,
        totalMw: projects.reduce((sum: number, p: any) => sum + (p.capacityMw || 0), 0),
      },
    })
  } catch (err) {
    console.error('Projects API error:', err)
    return NextResponse.json({ type: 'FeatureCollection', features: [], stats: {} }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test**

```bash
curl http://localhost:3005/api/v1/projects | head -100
```
Expected: GeoJSON with `features` array.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(frontend\)/api/v1/projects/
git commit -m "feat(api): /api/v1/projects GeoJSON endpoint for map"
```

---

## Task 8: Build the MapLibre map component

**Files:**
- Create: `web/src/components/DataCenterMap.tsx`

- [ ] **Step 1: Write map component**

Create `web/src/components/DataCenterMap.tsx`:

```tsx
'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Map, Source, Layer, Popup, type MapLayerMouseEvent } from 'react-map-gl/maplibre'
import type { CircleLayerSpecification } from 'maplibre-gl'
import type { FeatureCollection, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'

type Status = 'operational' | 'construction' | 'announced'

interface ProjectProps {
  id: string
  name: string
  operator?: string
  mw: number
  status: Status
}

const STATUS_COLORS: Record<Status, string> = {
  operational: '#22d3ee',  // cyan
  construction: '#E07B39', // rust (brand)
  announced: '#a78bfa',    // violet
}

interface Stats {
  total: number
  operational: number
  construction: number
  announced: number
  totalMw: number
}

export default function DataCenterMap() {
  const [data, setData] = useState<FeatureCollection<Point, ProjectProps> | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [hover, setHover] = useState<{ lng: number; lat: number; props: ProjectProps } | null>(null)

  useEffect(() => {
    fetch('/api/v1/projects')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setStats(d.stats)
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo<FeatureCollection<Point, ProjectProps>>(() => {
    if (!data) return { type: 'FeatureCollection', features: [] }
    return {
      type: 'FeatureCollection',
      features: statusFilter === 'all'
        ? data.features
        : data.features.filter(f => f.properties.status === statusFilter),
    }
  }, [data, statusFilter])

  const circleLayer: CircleLayerSpecification = {
    id: 'dc-bubbles',
    type: 'circle',
    source: 'dc',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['get', 'mw'],
        0, 4, 50, 8, 250, 14, 1000, 24, 5000, 40,
      ],
      'circle-color': ['match', ['get', 'status'],
        'operational', STATUS_COLORS.operational,
        'construction', STATUS_COLORS.construction,
        'announced', STATUS_COLORS.announced,
        '#888',
      ],
      'circle-opacity': 0.7,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#0C2046',
    },
  }

  const onMove = useCallback((e: MapLayerMouseEvent) => {
    const f = e.features?.[0]
    if (!f) return setHover(null)
    const [lng, lat] = (f.geometry as Point).coordinates
    setHover({ lng, lat, props: f.properties as ProjectProps })
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        initialViewState={{ longitude: -96, latitude: 45, zoom: 3.2 }}
        mapStyle="https://tiles.openfreemap.org/styles/dark"
        interactiveLayerIds={['dc-bubbles']}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        cursor={hover ? 'pointer' : 'default'}
        attributionControl={{ compact: true }}
      >
        <Source id="dc" type="geojson" data={filtered}>
          <Layer {...circleLayer} />
        </Source>
        {hover && (
          <Popup longitude={hover.lng} latitude={hover.lat} closeButton={false} offset={12} anchor="top">
            <div style={{ fontSize: 12, color: '#0C2046', minWidth: 180 }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', marginBottom: 4 }}>
                {hover.props.name}
              </div>
              {hover.props.operator && <div style={{ color: '#666', marginBottom: 4 }}>{hover.props.operator}</div>}
              <div>
                {hover.props.mw > 0 && <span><strong>{hover.props.mw} MW</strong> · </span>}
                <span style={{ color: STATUS_COLORS[hover.props.status], textTransform: 'uppercase', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em' }}>
                  {hover.props.status}
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Filter chips overlay */}
      <div style={{
        position: 'absolute', zIndex: 10, top: 16, left: 16,
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {(['all', 'operational', 'construction', 'announced'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px',
              background: statusFilter === s ? '#E07B39' : 'rgba(12,32,70,0.85)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600, fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {s === 'all' ? `All (${stats?.total || 0})` : s}
          </button>
        ))}
      </div>

      {/* Stats overlay (bottom right) */}
      {stats && (
        <div style={{
          position: 'absolute', zIndex: 10, bottom: 32, right: 16,
          background: 'rgba(12,32,70,0.85)', padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E07B39', marginBottom: 8 }}>
            Live Tracker · US + CA
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            <div>Projects: <strong>{stats.total.toLocaleString()}</strong></div>
            <div>Total MW: <strong>{stats.totalMw.toLocaleString()}</strong></div>
            <div>Operational: <strong>{stats.operational.toLocaleString()}</strong></div>
            <div>Proposed: <strong>{stats.announced.toLocaleString()}</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build to verify no TS errors**

```bash
cd web && npm run build
```
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/DataCenterMap.tsx
git commit -m "feat(component): MapLibre data center bubble map"
```

---

## Task 9: Replace HeroSection background image with map

**Files:**
- Modify: `web/src/app/(frontend)/_sections/HeroSection.tsx`

- [ ] **Step 1: Wire map into hero**

In `web/src/app/(frontend)/_sections/HeroSection.tsx`:

1. At top, add: `import dynamic from 'next/dynamic'`
2. Add: `const DataCenterMap = dynamic(() => import('@/components/DataCenterMap'), { ssr: false })`
3. Find the existing `<div>` with `backgroundImage: "url('https://cdn.builder.io/...')"` (around line 81-87)
4. Replace that `<div>` with:

```tsx
<div style={{ position: 'absolute', inset: 0 }}>
  <DataCenterMap />
</div>
```

5. Keep the gradient overlay div underneath the content (it provides text legibility over the map)
6. Adjust the gradient overlay opacity if text is hard to read — increase the dark stops to e.g. `rgba(8,20,45,0.85)` from `rgba(8,20,45,0.97)` to let the map show through more

- [ ] **Step 2: Test locally**

```bash
cd web && npm run dev
# Visit http://localhost:3005
```
Expected: Map renders behind hero text, bubbles visible.

- [ ] **Step 3: Build**

```bash
cd web && npm run build
```
Expected: Clean build.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(frontend\)/_sections/HeroSection.tsx
git commit -m "feat(hero): replace background image with live data center map"
```

---

## Task 10: Configure Vercel cron jobs

**Files:**
- Modify: `web/vercel.json`

- [ ] **Step 1: Add new cron entries**

Open `web/vercel.json`. Add these entries to the `crons` array:

```json
{
  "crons": [
    { "path": "/api/ingest-news", "schedule": "0 6 * * *" },
    { "path": "/api/ingest-osm", "schedule": "0 4 * * 0" },
    { "path": "/api/ingest-wikidata", "schedule": "30 4 * * 0" },
    { "path": "/api/ingest-ieso", "schedule": "0 5 * * 0" },
    { "path": "/api/extract-projects", "schedule": "30 6 * * *" }
  ]
}
```

Schedule rationale:
- News: daily 6am UTC (existing)
- Extraction: daily 6:30am UTC (after news ingest finishes)
- OSM: weekly Sunday 4am UTC
- Wikidata: weekly Sunday 4:30am UTC
- IESO: weekly Sunday 5am UTC

- [ ] **Step 2: Commit**

```bash
git add web/vercel.json
git commit -m "feat(cron): schedule weekly OSM/Wikidata/IESO + daily extraction"
```

---

## Task 11: Push and deploy

- [ ] **Step 1: Push to main**

```bash
git push
```

- [ ] **Step 2: Verify Vercel deployment**

Wait for Vercel auto-deploy. Visit https://konative.com — confirm:
- Map renders in hero
- No console errors
- Filter chips work
- Hover popup shows project details

- [ ] **Step 3: Trigger first ingest manually** (to populate before next scheduled run)

```bash
# Replace $CRON_SECRET with actual value from Vercel env
curl -H "Authorization: Bearer $CRON_SECRET" https://konative.com/api/ingest-osm
curl -H "Authorization: Bearer $CRON_SECRET" https://konative.com/api/ingest-wikidata
curl -H "Authorization: Bearer $CRON_SECRET" https://konative.com/api/extract-projects
```

Expected total: 900-1,300 projects in Sanity.

---

## Acceptance Criteria

- [ ] Homepage hero displays interactive bubble map of US + Canada
- [ ] Map shows at minimum 800 operational data center facilities (from OSM + Wikidata)
- [ ] Bubble color encodes status (cyan=operational, rust=construction, violet=announced)
- [ ] Bubble size encodes MW capacity
- [ ] Hover shows project name, operator, MW, status
- [ ] Filter chips toggle between All / Operational / Construction / Announced
- [ ] Stats overlay shows live counts (total projects, total MW, by status)
- [ ] Cron jobs configured: weekly OSM/Wikidata/IESO + daily news extraction
- [ ] All ingest routes auth-protected (`CRON_SECRET` bearer or Vercel cron user-agent)
- [ ] No regression: existing `/news`, `/market-intel`, `/contact`, etc. still work
- [ ] Clean `npm run build`
- [ ] Total monthly cost: under $5 (Anthropic API only paid component)

---

## Required Environment Variables (Vercel)

Already set:
- `NEXT_PUBLIC_SANITY_PROJECT_ID=zwk4buq7`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `SANITY_API_TOKEN=<existing>`
- `CRON_SECRET=<existing>`

**Must add before first run:**
- `ANTHROPIC_API_KEY=<get from console.anthropic.com>` — Production + Preview

---

## Known Limitations / Future Work

1. **Coverage gap vs datacentermap.com:** OSM + Wikidata combined gives ~60-80% of the ~1,500 NA facilities datacentermap.com tracks. Closing the gap requires paid sources or community contribution to OSM.

2. **News extraction accuracy:** ~60-70% precision on first pass. Low-confidence (<0.6) extractions are auto-skipped. False positives may appear; users can manually mark `verified: false` and delete in Sanity Studio.

3. **Geocoding rate limit:** Nominatim (free) limits to 1 req/sec. Daily extraction throttles at 50 articles/run. If feed grows, switch to a paid geocoder (Mapbox, OpenCage) or batch-call.

4. **IESO XLSX URL drift:** IESO's static XLSX URL may change. If `/api/ingest-ieso` starts 404ing, check https://www.ieso.ca/Sector-Participants/Connection-Process/Application-Status manually and update `IESO_URL` const.

5. **Other ISO interconnection queues:** PJM, ERCOT, CAISO, MISO, NYISO, ISO-NE, SPP queues are *not* ingested. Each requires custom scrapers (see research notes). Phase 2 work — gridstatus Python lib could be wrapped as a separate microservice.

6. **OSM duplicate dedup:** Current implementation uses stable docId per source — does not dedup across sources. A future enhancement: post-ingest dedup pass that merges OSM + Wikidata records within ~500m of same name.

7. **No load queue for US ISOs publicly:** Best signal for proposed US data centers comes from news extraction. PJM Large Load Addition reports are published as PDFs — future enhancement: PDF table extraction with Camelot/Tabula.

---

## Cost Breakdown (Monthly Estimate)

| Service | Cost |
|---|---|
| OpenStreetMap Overpass | $0 (free, fair use) |
| Wikidata SPARQL | $0 (free) |
| Nominatim geocoding | $0 (free, rate-limited) |
| OpenFreeMap tiles | $0 (free) |
| Sanity (free tier) | $0 |
| Vercel cron | $0 (included) |
| Anthropic Claude Haiku | ~$1-3 (50 articles/day × 30 days × ~$0.001/article) |
| **Total** | **~$1-3/month** |

---

## Execution Approach

This plan is structured for **superpowers:executing-plans** (inline batched execution) or **superpowers:subagent-driven-development** (fresh subagent per task with reviews). Tasks are mostly independent after Task 2 (schema), so subagent-driven is faster but inline is simpler.

For inline execution: complete Tasks 1-2 first (foundational), then Tasks 3-6 in any order (parallel-safe), then Tasks 7-10 sequentially.
