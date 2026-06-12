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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYndvcnhtbG14b3l6Y3ZkamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODczMTksImV4cCI6MjA5MTg2MzMxOX0.bAU-JCOSEH5RuJZcpDR5WTSU7zTjOEQ4sn6kaY8UIYg'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// NTIA NBAM ArcGIS Feature Service — public, no auth required
// Item ID: af49f79f0f4b4d73b4e0de81aa5534eb
// Org: NTIA ArcGIS Online (nbam.ntia.gov)
const ARCGIS_ITEM_ID = 'af49f79f0f4b4d73b4e0de81aa5534eb'

// Primary endpoint pattern for NBAM-hosted layers
const FEATURE_SERVICE_URLS = [
  // Try NBAM's hosted service first
  `https://services.arcgis.com/aJ16ENn1AaqdFlqx/arcgis/rest/services/TBCP_Awards/FeatureServer/0/query`,
  // Fallback: BroadbandUSA ArcGIS org
  `https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Tribal_Broadband_Connectivity_Program/FeatureServer/0/query`,
  // NBAM direct
  `https://nbam.ntia.gov/server/rest/services/Hosted/TBCP_Awards/FeatureServer/0/query`,
]

async function fetchArcGISLayer(baseUrl: string): Promise<GeoJSONFeature[]> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    f: 'geojson',
    resultRecordCount: '1000',
    outSR: '4326',
  })

  const res = await fetch(`${baseUrl}?${params}`, {
    headers: { 'User-Agent': 'Konative/1.0 (connectivity intelligence brokerage)' },
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${baseUrl}`)

  const data = await res.json()
  if (!data.features) throw new Error(`No features in response from ${baseUrl}`)
  return data.features
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

  // Field names vary by data source — try multiple keys
  const grantee = (
    p['Grantee_Name'] || p['grantee_name'] || p['GRANTEE'] ||
    p['Awardee'] || p['AWARDEE_NAME'] || p['Name'] || 'Unknown'
  ) as string

  const slug = grantee
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  return {
    ntia_award_id: (p['Award_Number'] || p['award_number'] || p['GRANT_NUMBER'] || null) as string | null,
    grantee_name: grantee,
    tribe_name: (p['Tribe_Name'] || p['tribe_name'] || p['TRIBE'] || null) as string | null,
    state: (p['State'] || p['state'] || p['STATE'] || null) as string | null,
    award_amount_usd: (p['Award_Amount'] || p['award_amount'] || p['AMOUNT'] || null) as number | null,
    award_date: (p['Award_Date'] || p['award_date'] || p['DATE'] || null) as string | null,
    nofo_round: (p['NOFO_Round'] || p['nofo_round'] || p['Round'] || null) as string | null,
    project_type: (p['Project_Type'] || p['project_type'] || p['TYPE'] || null) as string | null,
    project_description: (p['Description'] || p['description'] || p['Project_Description'] || null) as string | null,
    lat: feature.geometry?.coordinates?.[1] ?? null,
    lng: feature.geometry?.coordinates?.[0] ?? null,
    households_served: (p['Households_Served'] || p['households'] || null) as number | null,
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

  let features: GeoJSONFeature[] = []

  // Try each endpoint until one works
  for (const url of FEATURE_SERVICE_URLS) {
    try {
      console.log(`🔍 Trying ArcGIS endpoint: ${url}`)
      features = await fetchArcGISLayer(url)
      console.log(`✓ Fetched ${features.length} features`)
      break
    } catch (err) {
      console.warn(`  ✗ Failed: ${(err as Error).message}`)
    }
  }

  if (features.length === 0) {
    console.error('')
    console.error('❌ All ArcGIS endpoints failed. Manual fallback:')
    console.error('   1. Go to: https://nbam.ntia.gov/datasets/af49f79f0f4b4d73b4e0de81aa5534eb_0/explore')
    console.error('   2. Download as CSV or GeoJSON')
    console.error('   3. Run: npx tsx scripts/seed-tbcp-from-file.ts path/to/download.geojson')
    process.exit(1)
  }

  const awards = features.map(normalizeFeature)
  console.log(`\n📊 Normalized ${awards.length} award records`)

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
