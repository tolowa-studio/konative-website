/**
 * seed-tbcp-awards.ts
 *
 * Seeds the tbcp_awards table in Supabase from the NTIA National Broadband
 * Availability Map (NBAM) ArcGIS Feature Service — no auth required.
 *
 * NTIA TBCP dataset: af49f79f0f4b4d73b4e0de81aa5534eb
 * 275 awards, $2.2B total (Round 1 + Round 2)
 *
 * Run: npx ts-node --esm scripts/seed-tbcp-awards.ts
 * Or:  npx tsx scripts/seed-tbcp-awards.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// Load .env.local so the script works without manual env var export
config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
// Prefer service role key (bypasses RLS) for seeding; fall back to anon
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  throw new Error('Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// NTIA TBCP dataset via ArcGIS Hub GeoJSON export
// Item ID: af49f79f0f4b4d73b4e0de81aa5534eb
const ARCGIS_HUB_GEOJSON_URL = 'https://opendata.arcgis.com/datasets/af49f79f0f4b4d73b4e0de81aa5534eb_0.geojson'

async function fetchWithRedirects(url: string): Promise<GeoJSONFeature[]> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Konative/1.0)',
      'Accept': 'application/json, application/geo+json, */*',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${res.url}`)
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('html')) {
    throw new Error(`Got HTML response (likely a login page) from ${res.url}`)
  }
  const data = await res.json()
  if (data.features) return data.features
  if (data.error) throw new Error(`API error: ${JSON.stringify(data.error)}`)
  throw new Error(`No features in response (keys: ${Object.keys(data).join(', ')}) from ${res.url}`)
}

interface GeoJSONFeature {
  type: string
  geometry?: { type: string; coordinates: [number, number] }
  properties: Record<string, unknown>
}

interface TBCPAward {
  ntia_award_id: string | null
  grantee_name: string
  tribe_name: string | null
  state: string | null
  award_amount_usd: number | null
  award_date: string | null
  nofo_round: string | null
  project_type: string | null
  project_description: string | null
  lat: number | null
  lng: number | null
  households_served: number | null
  raw_properties: Record<string, unknown>
  slug: string
}

function normalizeFeature(feature: GeoJSONFeature): TBCPAward {
  const p = feature.properties || {}

  const grantee = ((p['APPLICANT_NAME'] || p['Grantee_Name'] || 'Unknown') as string).trim()

  const slug = grantee
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  const rawAmount = p['AMOUNT_FUNDED']
  const awardAmount = rawAmount != null ? parseFloat(String(rawAmount)) : null

  return {
    ntia_award_id: (p['OBJECTID'] ? String(p['OBJECTID']) : null),
    grantee_name: grantee,
    tribe_name: null,
    state: null,
    award_amount_usd: awardAmount,
    award_date: null,
    nofo_round: (p['NOFO'] || null) as string | null,
    project_type: (p['PROJECT_TYPE_DESC'] || null) as string | null,
    project_description: null,
    lat: p['LAT'] != null ? parseFloat(String(p['LAT'])) : (feature.geometry?.coordinates?.[1] ?? null),
    lng: p['LON'] != null ? parseFloat(String(p['LON'])) : (feature.geometry?.coordinates?.[0] ?? null),
    households_served: null,
    raw_properties: p,
    slug,
  }
}

async function ensureTable() {
  // Create table if it doesn't exist via the Supabase REST API
  // Note: Supabase anon key can't run DDL — table must be created in Supabase dashboard
  // This script will fail gracefully if the table doesn't exist yet
  console.log('📋 Checking tbcp_awards table...')
  const { error } = await supabase.from('tbcp_awards').select('count').limit(1)
  if (error?.code === '42P01') {
    console.error('⚠️  Table tbcp_awards does not exist. Create it in Supabase dashboard:')
    console.error(`
    create table tbcp_awards (
      id uuid primary key default gen_random_uuid(),
      ntia_award_id text,
      grantee_name text not null,
      tribe_name text,
      state text,
      award_amount_usd numeric,
      award_date text,
      nofo_round text,
      project_type text,
      project_description text,
      lat numeric,
      lng numeric,
      households_served integer,
      slug text unique not null,
      raw_properties jsonb,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index tbcp_awards_state_idx on tbcp_awards(state);
    create index tbcp_awards_slug_idx on tbcp_awards(slug);
    `)
    process.exit(1)
  }
  console.log('✓ Table exists')
}

async function main() {
  console.log('🏛️  Konative — NTIA TBCP Award Seed Script')
  console.log('============================================')
  console.log(`Target: Supabase ${SUPABASE_URL}`)
  console.log('')

  await ensureTable()

  console.log(`🔍 Fetching from ArcGIS Hub: ${ARCGIS_HUB_GEOJSON_URL}`)
  const features = await fetchWithRedirects(ARCGIS_HUB_GEOJSON_URL)
  console.log(`✓ Fetched ${features.length} features`)

  const rawAwards = features.map(normalizeFeature)
  // Deduplicate by slug (some grantees appear in both NOFO rounds with same name)
  const slugMap = new Map<string, TBCPAward>()
  for (const a of rawAwards) {
    if (slugMap.has(a.slug)) {
      // Keep the one with higher award amount
      const existing = slugMap.get(a.slug)!
      if ((a.award_amount_usd ?? 0) > (existing.award_amount_usd ?? 0)) {
        slugMap.set(a.slug, a)
      }
    } else {
      slugMap.set(a.slug, a)
    }
  }
  const awards = Array.from(slugMap.values())
  console.log(`\n📊 Normalized ${rawAwards.length} award records → ${awards.length} unique slugs`)

  // Sample a few for validation
  const sample = awards.slice(0, 3)
  console.log('\nSample records:')
  sample.forEach(a => {
    console.log(`  - ${a.grantee_name} | ${a.state} | $${(a.award_amount_usd ?? 0).toLocaleString()} | lat:${a.lat?.toFixed(2)}, lng:${a.lng?.toFixed(2)}`)
  })

  // Upsert in batches
  const BATCH_SIZE = 50
  let inserted = 0
  let errors = 0

  for (let i = 0; i < awards.length; i += BATCH_SIZE) {
    const batch = awards.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('tbcp_awards')
      .upsert(batch, { onConflict: 'slug' })

    if (error) {
      console.error(`  ✗ Batch ${i}–${i + BATCH_SIZE} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`\r  ✓ Upserted ${inserted}/${awards.length} records...`)
    }
  }

  console.log(`\n\n✅ Done: ${inserted} records upserted, ${errors} errors`)
  console.log(`\nNext step: Run \`npx tsx scripts/generate-tbcp-pages.ts\` to build the 275 SEO pages`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
