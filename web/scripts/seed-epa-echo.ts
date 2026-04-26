/**
 * Seed epa_facilities from EPA ECHO (Enforcement and Compliance History Online).
 *
 * Two-step ECHO API flow:
 *   1. cwa_rest_services.get_facilities → returns QueryID
 *   2. cwa_rest_services.get_download?qid=<id>&output=GEOJSOND → GeoJSON features
 *
 * Fetches CWA (Clean Water Act) and CAA (Clean Air Act) permitted facilities
 * near major Konative DC markets.
 *
 * Free, no auth required.
 *
 * Usage (from web/):
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-epa-echo.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_ROLE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY required.'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const ECHO_BASE = 'https://echodata.epa.gov/echo'

const MARKETS = [
  { slug: 'virginia',   p_c1lat: 39.5, p_c1lon: -79.5, p_c2lat: 36.5, p_c2lon: -76.5 },
  { slug: 'texas',      p_c1lat: 33.5, p_c1lon: -97.8, p_c2lat: 32.0, p_c2lon: -95.8 },
  { slug: 'georgia',    p_c1lat: 34.5, p_c1lon: -85.2, p_c2lat: 33.0, p_c2lon: -83.5 },
  { slug: 'michigan',   p_c1lat: 43.5, p_c1lon: -86.5, p_c2lat: 42.5, p_c2lon: -84.0 },
  { slug: 'arizona',    p_c1lat: 34.5, p_c1lon: -113.0, p_c2lat: 33.0, p_c2lon: -111.0 },
  { slug: 'ohio',       p_c1lat: 41.0, p_c1lon: -83.5, p_c2lat: 39.5, p_c2lon: -81.5 },
  { slug: 'illinois',   p_c1lat: 42.5, p_c1lon: -88.5, p_c2lat: 41.0, p_c2lon: -87.0 },
  { slug: 'oregon',     p_c1lat: 46.0, p_c1lon: -123.5, p_c2lat: 45.0, p_c2lon: -121.5 },
  { slug: 'washington', p_c1lat: 48.0, p_c1lon: -122.8, p_c2lat: 47.0, p_c2lon: -121.0 },
]

type Program = 'cwa' | 'air'
const PROGRAM_SERVICES: Record<Program, string> = {
  cwa: 'cwa_rest_services',
  air: 'air_rest_services',
}

interface EchoFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: Record<string, string>
}

async function getQueryId(market: typeof MARKETS[0], program: Program): Promise<string | null> {
  const svc = PROGRAM_SERVICES[program]
  const params = new URLSearchParams({
    p_c1lat: String(market.p_c1lat),
    p_c1lon: String(market.p_c1lon),
    p_c2lat: String(market.p_c2lat),
    p_c2lon: String(market.p_c2lon),
    p_act: 'Y',
    p_rpp: '500',
    output: 'JSON',
  })
  const res = await fetch(`${ECHO_BASE}/${svc}.get_facilities?${params}`, {
    headers: { 'User-Agent': 'konative-ingest/1.0 (jeramey.james@gmail.com)' },
  })
  if (!res.ok) { console.warn(`  ECHO get_facilities HTTP ${res.status}`); return null }
  const data = await res.json() as { Results?: { QueryID?: string } }
  return data.Results?.QueryID ?? null
}

async function downloadFeatures(qid: string, program: Program): Promise<EchoFeature[]> {
  const svc = PROGRAM_SERVICES[program]
  const res = await fetch(`${ECHO_BASE}/${svc}.get_download?qid=${qid}&output=GEOJSOND`, {
    headers: { 'User-Agent': 'konative-ingest/1.0 (jeramey.james@gmail.com)' },
  })
  if (!res.ok) { console.warn(`  ECHO get_download HTTP ${res.status} qid=${qid}`); return [] }
  const text = await res.text()
  // GEOJSOND = newline-delimited GeoJSON features
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('{'))
    .map(line => { try { return JSON.parse(line) as EchoFeature } catch { return null } })
    .filter((f): f is EchoFeature => f !== null && f.geometry?.type === 'Point')
}

async function main() {
  console.log('Fetching EPA ECHO facilities for Konative markets…')

  const allFeatures: EchoFeature[] = []
  const seen = new Set<string>()

  for (const market of MARKETS) {
    process.stdout.write(`  ${market.slug}… `)
    let added = 0
    for (const program of ['cwa', 'air'] as Program[]) {
      const qid = await getQueryId(market, program)
      if (!qid) continue
      await new Promise(r => setTimeout(r, 500))
      const features = await downloadFeatures(qid, program)
      for (const f of features) {
        const id = f.properties['RegistryID'] || f.properties['FacilityID'] || ''
        if (id && !seen.has(id)) {
          seen.add(id)
          allFeatures.push(f)
          added++
        }
      }
      await new Promise(r => setTimeout(r, 400))
    }
    console.log(`${added} new facilities`)
  }

  console.log(`\n  Total: ${allFeatures.length} unique EPA facilities`)

  const records = allFeatures
    .map(f => {
      const [lng, lat] = f.geometry.coordinates
      if (!lng || !lat || isNaN(lng) || isNaN(lat)) return null
      const p = f.properties
      return {
        echo_id: p['RegistryID'] || p['FacilityID'] || String(Math.random()),
        name: p['CWPName'] || p['AIRName'] || p['FacilityName'] || 'Unknown',
        address: [p['CWPStreet'] || p['AIRStreet'], p['CWPCity'] || p['AIRCity'], p['CWPState'] || p['AIRState'], p['CWPZip'] || p['AIRZip']].filter(Boolean).join(', '),
        state: p['CWPState'] || p['AIRState'] || null,
        cwa_permit_types: p['CWPPermitTypeDesc'] || null,
        caa_permit_types: p['AIRIDs'] || null,
        active_cwa_permits: parseInt(p['CWPActiveProgramsDescs'] || '0') || 0,
        active_caa_permits: parseInt(p['AIRActivePrograms'] || '0') || 0,
        naics_codes: p['NAICSCodes'] || null,
        geom: `POINT(${lng} ${lat})`,
      }
    })
    .filter(Boolean) as Array<Record<string, unknown>>

  console.log(`  ${records.length} records with valid geometry`)

  if (records.length === 0) {
    console.log('  ⚠ No records to insert — EPA ECHO API may be down. Try again later.')
    process.exit(0)
  }

  console.log('  Truncating existing epa_facilities…')
  await supabase.from('epa_facilities').delete().neq('id', 0)

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const { error } = await supabase.from('epa_facilities').insert(records.slice(i, i + BATCH))
    if (error) { console.error(`  ✗ batch ${i}:`, error.message) }
    else { inserted += Math.min(BATCH, records.length - i); process.stdout.write(`\r  inserted ${inserted}/${records.length}`) }
  }
  console.log('\n  ✓ Done.')

  await supabase.from('data_sources')
    .upsert({ key: 'epa_echo', name: 'EPA ECHO Facility Database', last_ingested_at: new Date().toISOString(), record_count: inserted }, { onConflict: 'key' })

  console.log(`\nEPA ECHO seed complete. ${inserted} facilities inserted.`)
}

main().catch(e => { console.error(e); process.exit(1) })
