/**
 * Seed water_sites from USGS National Water Information System (NWIS).
 *
 * Fetches active streamflow + groundwater monitoring sites near major DC markets.
 * Free, no auth required. Uses USGS NWIS REST API (RDB format).
 *
 * Usage (from web/):
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-usgs-water.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_ROLE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY required.'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const NWIS_BASE = 'https://waterservices.usgs.gov/nwis/site/'

// Markets: bounding boxes [minLng,minLat,maxLng,maxLat]
const MARKET_BOXES = [
  { slug: 'virginia',   bbox: '-79.5,36.5,-76.5,39.5' },
  { slug: 'texas',      bbox: '-97.8,32.0,-95.8,33.5'  },
  { slug: 'georgia',    bbox: '-85.2,33.0,-83.5,34.5'  },
  { slug: 'michigan',   bbox: '-86.5,42.5,-84.0,43.5'  },
  { slug: 'arizona',    bbox: '-113.0,33.0,-111.0,34.5' },
  { slug: 'ohio',       bbox: '-83.5,39.5,-81.5,41.0'  },
  { slug: 'illinois',   bbox: '-88.5,41.0,-87.0,42.5'  },
  { slug: 'oregon',     bbox: '-123.5,45.0,-121.5,46.0' },
  { slug: 'washington', bbox: '-122.8,47.0,-121.0,48.0' },
]

interface WaterSite {
  site_no: string
  station_nm: string
  site_tp_cd: string
  dec_lat_va: string
  dec_long_va: string
  state_cd: string
  alt_va: string
  drain_area_va: string
}

function parseRdb(text: string): WaterSite[] {
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  if (lines.length < 3) return []
  const headers = lines[0].split('\t')
  // lines[1] is the width descriptor row — skip it
  const dataLines = lines.slice(2)
  return dataLines.map(line => {
    const vals = line.split('\t')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h.trim()] = (vals[i] || '').trim() })
    return row as unknown as WaterSite
  }).filter(r => r.site_no)
}

async function fetchSites(bbox: string, siteType: 'ST' | 'GW'): Promise<WaterSite[]> {
  const params = new URLSearchParams({
    format: 'rdb',
    bBox: bbox,
    siteType,
    siteStatus: 'active',
    siteOutput: 'expanded',
    hasDataTypeCd: 'dv,iv',
  })
  const res = await fetch(`${NWIS_BASE}?${params}`, {
    headers: { 'User-Agent': 'konative-ingest/1.0 (jeramey.james@gmail.com)' },
  })
  if (!res.ok) {
    console.warn(`  USGS HTTP ${res.status} for bbox=${bbox} type=${siteType}`)
    return []
  }
  const text = await res.text()
  return parseRdb(text)
}

async function main() {
  console.log('Fetching USGS NWIS water monitoring sites…')

  const allSites: WaterSite[] = []
  const seen = new Set<string>()

  for (const market of MARKET_BOXES) {
    process.stdout.write(`  ${market.slug}… `)
    const [streamflow, groundwater] = await Promise.all([
      fetchSites(market.bbox, 'ST'),
      fetchSites(market.bbox, 'GW'),
    ])
    let added = 0
    for (const s of [...streamflow, ...groundwater]) {
      if (!seen.has(s.site_no)) {
        seen.add(s.site_no)
        allSites.push(s)
        added++
      }
    }
    console.log(`${added} sites (${streamflow.length} streamflow + ${groundwater.length} GW)`)
    await new Promise(r => setTimeout(r, 600))
  }

  console.log(`\n  Total: ${allSites.length} unique water monitoring sites`)

  const records = allSites
    .map(s => {
      const lat = parseFloat(s.dec_lat_va)
      const lng = parseFloat(s.dec_long_va)
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null
      return {
        usgs_id: s.site_no,
        name: s.station_nm,
        site_type: s.site_tp_cd || null,
        agency_code: 'USGS',
        state_fips: s.state_cd || null,
        altitude_m: s.alt_va ? parseFloat(s.alt_va) * 0.3048 : null,
        drainage_area_km2: s.drain_area_va ? parseFloat(s.drain_area_va) * 2.58999 : null,
        geom: `POINT(${lng} ${lat})`,
      }
    })
    .filter(Boolean) as Array<{
      usgs_id: string; name: string; site_type: string | null; agency_code: string
      state_fips: string | null; altitude_m: number | null; drainage_area_km2: number | null; geom: string
    }>

  console.log(`  ${records.length} records with valid geometry`)

  console.log('  Truncating existing water_sites…')
  await supabase.from('water_sites').delete().neq('id', 0)

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const { error } = await supabase.from('water_sites').insert(records.slice(i, i + BATCH))
    if (error) { console.error(`  ✗ batch ${i}:`, error.message) }
    else { inserted += Math.min(BATCH, records.length - i); process.stdout.write(`\r  inserted ${inserted}/${records.length}`) }
  }
  console.log('\n  ✓ Done.')

  await supabase.from('data_sources')
    .upsert({ key: 'usgs_nwis', name: 'USGS National Water Information System', last_ingested_at: new Date().toISOString(), record_count: inserted }, { onConflict: 'key' })

  console.log(`\nUSGS NWIS seed complete. ${inserted} water sites inserted.`)
}

main().catch(e => { console.error(e); process.exit(1) })
