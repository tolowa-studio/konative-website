/**
 * signal-agent-ntia.ts
 *
 * Konative Signal Machine — NTIA TBCP New Award Monitor
 *
 * Polls the NTIA NBAM ArcGIS Feature Service for new TBCP awards since last run.
 * When new awards appear, creates ConnectivitySignal records in Supabase and
 * updates the tbcp_awards table used by the Tribal Connectivity Index.
 *
 * Run: npx tsx scripts/signal-agent-ntia.ts
 * Schedule: daily via GitHub Actions (see .github/workflows/signal-agent.yml)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYndvcnhtbG14b3l6Y3ZkamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODczMTksImV4cCI6MjA5MTg2MzMxOX0.bAU-JCOSEH5RuJZcpDR5WTSU7zTjOEQ4sn6kaY8UIYg'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// NTIA ArcGIS Feature Service endpoints (try in order)
const NTIA_ENDPOINTS = [
  'https://services.arcgis.com/aJ16ENn1AaqdFlqx/arcgis/rest/services/TBCP_Awards/FeatureServer/0/query',
  'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Tribal_Broadband_Connectivity_Program/FeatureServer/0/query',
  'https://nbam.ntia.gov/server/rest/services/Hosted/TBCP_Awards/FeatureServer/0/query',
]

// BroadbandUSA award recipients page for text-based monitoring
const BROADBAND_USA_URL = 'https://broadbandusa.ntia.gov/funding-programs/tribal-broadband-connectivity/award-recipients'

async function getExistingAwardIds(): Promise<Set<string>> {
  const { data } = await supabase
    .from('tbcp_awards')
    .select('ntia_award_id, slug')

  const ids = new Set<string>()
  for (const row of (data || [])) {
    if (row.ntia_award_id) ids.add(row.ntia_award_id)
    if (row.slug) ids.add(row.slug)
  }
  return ids
}

async function fetchCurrentAwards(): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    f: 'geojson',
    resultRecordCount: '2000',
    outSR: '4326',
    orderByFields: 'Award_Date DESC',
  })

  for (const endpoint of NTIA_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}?${params}`, {
        headers: { 'User-Agent': 'Konative/1.0 Research Bot (jjames@tolowa.net)' },
      })
      if (!res.ok) continue

      const data = await res.json()
      if (data.features?.length > 0) {
        console.log(`  ✓ Fetched ${data.features.length} records from NTIA`)
        return data.features
      }
    } catch {
      continue
    }
  }

  return []
}

function extractSlug(properties: Record<string, unknown>): string {
  const name = (
    properties['Grantee_Name'] || properties['grantee_name'] ||
    properties['Awardee'] || properties['Name'] || 'unknown'
  ) as string

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

async function main() {
  console.log('🏛️  Konative NTIA Monitor — Checking for new TBCP awards')
  console.log(`Run time: ${new Date().toISOString()}`)

  const existingIds = await getExistingAwardIds()
  console.log(`  Known awards in DB: ${existingIds.size}`)

  const features = await fetchCurrentAwards()
  if (features.length === 0) {
    console.log('  No data from NTIA endpoints today — skipping')
    return
  }

  const newFeatures = features.filter((f: Record<string, unknown>) => {
    const props = (f as { properties: Record<string, unknown> }).properties || {}
    const id = String(props['Award_Number'] || props['award_number'] || '')
    const slug = extractSlug(props)
    return !existingIds.has(id) && !existingIds.has(slug)
  })

  console.log(`  New awards detected: ${newFeatures.length}`)

  if (newFeatures.length === 0) {
    console.log('✓ No new awards since last run')
    return
  }

  // Upsert new awards to tbcp_awards
  const awards = newFeatures.map((f: Record<string, unknown>) => {
    const feature = f as { geometry?: { coordinates?: [number, number] }; properties: Record<string, unknown> }
    const p = feature.properties
    const slug = extractSlug(p)

    return {
      ntia_award_id: (p['Award_Number'] || p['award_number'] || null) as string | null,
      grantee_name: (p['Grantee_Name'] || p['Awardee'] || p['Name'] || 'Unknown') as string,
      tribe_name: (p['Tribe_Name'] || p['tribe_name'] || null) as string | null,
      state: (p['State'] || p['state'] || null) as string | null,
      award_amount_usd: (p['Award_Amount'] || p['award_amount'] || null) as number | null,
      award_date: (p['Award_Date'] || p['award_date'] || null) as string | null,
      nofo_round: (p['NOFO_Round'] || p['nofo_round'] || null) as string | null,
      project_type: (p['Project_Type'] || p['project_type'] || null) as string | null,
      project_description: (p['Description'] || p['Project_Description'] || null) as string | null,
      lat: feature.geometry?.coordinates?.[1] ?? null,
      lng: feature.geometry?.coordinates?.[0] ?? null,
      households_served: (p['Households_Served'] || p['households'] || null) as number | null,
      slug,
      raw_properties: p,
    }
  })

  await supabase.from('tbcp_awards').upsert(awards, { onConflict: 'slug' })

  // Create signal records for new awards
  const signals = awards.map(a => ({
    signal_id: `ntia_tbcp_${a.slug}`,
    source: 'ntia_tbcp',
    lane: 'tribal',
    entity_name: a.grantee_name,
    location_state: a.state,
    location_lat: a.lat,
    location_lng: a.lng,
    signal_type: 'tbcp_award',
    estimated_mrc_band: null,
    capacity_mw: null,
    description: `New TBCP award: ${a.grantee_name} — $${(a.award_amount_usd || 0).toLocaleString()} for ${a.project_type || 'tribal broadband'} in ${a.state || 'TBD'}`,
    source_url: BROADBAND_USA_URL,
    raw_data: a as unknown as Record<string, unknown>,
    discovered_at: new Date().toISOString(),
    map_permalink: a.lat && a.lng ? `https://konative.com/map?lat=${a.lat}&lng=${a.lng}&zoom=10` : null,
    status: 'new',
  }))

  await supabase.from('connectivity_signals').upsert(signals, { onConflict: 'signal_id', ignoreDuplicates: true })

  console.log(`\n✅ Processed ${newFeatures.length} new TBCP awards`)
  console.log('\n🆕 New awards:')
  awards.forEach(a => {
    console.log(`  - ${a.grantee_name} | ${a.state} | $${(a.award_amount_usd || 0).toLocaleString()}`)
  })
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
