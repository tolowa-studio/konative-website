/**
 * Seed transmission_lines from HIFLD Electric Power Transmission Lines.
 *
 * Source: HIFLD Open Data (ArcGIS Feature Service)
 * Free, no auth. ~230k transmission line segments across the US.
 * We import lines with voltage >= 115 kV to keep storage reasonable (~8k records).
 *
 * Usage (from web/):
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-hifld-transmission.ts
 *
 * Optional:
 *   MIN_KV=230    — minimum voltage to import (default 115)
 *   MAX_RECORDS=5000 — max records to import (default 3000)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_ROLE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY required.'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const MIN_KV = parseInt(process.env.MIN_KV || '115')
const MAX_RECORDS = parseInt(process.env.MAX_RECORDS || '3000')

// HIFLD Electric Power Transmission Lines feature service
const BASE_URL = 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Electric_Power_Transmission_Lines/FeatureServer/0/query'

interface HifldFeature {
  attributes: {
    ID?: string | number
    VOLTAGE?: number
    VOLT_CLASS?: string
    STATUS?: string
    OWNER?: string
    TYPE?: string
    SUB_1?: string
    SUB_2?: string
  }
  geometry?: {
    paths?: number[][][]
  }
}

interface HifldResponse {
  features: HifldFeature[]
  exceededTransferLimit?: boolean
}

async function fetchPage(offset: number, pageSize: number): Promise<HifldResponse> {
  // Use Esri JSON (f=json) — GeoJSON endpoint doesn't reliably return polyline geometry.
  // Build URL manually: URLSearchParams double-encodes >= which causes 400s on this service.
  // Note: geometryPrecision causes 400 on this service — omit it
  const qs = [
    `where=VOLTAGE+%3E%3D+${MIN_KV}`,
    `outFields=ID,VOLTAGE,VOLT_CLASS,STATUS,OWNER,TYPE,SUB_1,SUB_2`,
    `resultOffset=${offset}`,
    `resultRecordCount=${pageSize}`,
    `outSR=4326`,
    `f=json`,
    `returnGeometry=true`,
  ].join('&')

  const res = await fetch(`${BASE_URL}?${qs}`, {
    headers: { 'User-Agent': 'konative-ingest/1.0' },
  })
  if (!res.ok) throw new Error(`HIFLD HTTP ${res.status}`)
  // Esri JSON: { features: [{ attributes: {...}, geometry: { paths: [...] } }] }
  const data = await res.json() as {
    features?: Array<{ attributes: Record<string, unknown>; geometry?: { paths: number[][][] } }>
    exceededTransferLimit?: boolean
    error?: { message: string }
  }
  if (data.error) throw new Error(`HIFLD error: ${data.error.message}`)
  // Normalise to HifldResponse shape
  const features = (data.features ?? []).map(f => ({
    attributes: f.attributes as HifldFeature['attributes'],
    geometry: f.geometry,
  }))
  return { features, exceededTransferLimit: data.exceededTransferLimit }
}

function pathsToWKT(paths: number[][][]): string | null {
  if (!paths || paths.length === 0) return null
  // Use the first (longest) path
  const coords = paths[0]
  if (!coords || coords.length < 2) return null
  const pts = coords.map(([x, y]) => `${x} ${y}`).join(', ')
  return `LINESTRING(${pts})`
}

async function main() {
  console.log(`Fetching HIFLD transmission lines (>= ${MIN_KV} kV, IN SERVICE)…`)

  const PAGE = 1000
  let allFeatures: HifldFeature[] = []
  let offset = 0

  while (allFeatures.length < MAX_RECORDS) {
    const data = await fetchPage(offset, Math.min(PAGE, MAX_RECORDS - allFeatures.length))
    allFeatures = allFeatures.concat(data.features ?? [])
    console.log(`  fetched ${allFeatures.length} so far…`)
    if (!data.exceededTransferLimit || data.features.length === 0) break
    offset += PAGE
  }

  console.log(`  ${allFeatures.length} transmission line segments to import`)

  const records = allFeatures
    .filter(f => !f.attributes.STATUS || (f.attributes.STATUS as string).toUpperCase() !== 'INACTIVE')
    .map(f => {
      const geom = pathsToWKT(f.geometry?.paths ?? [])
      if (!geom) return null
      const a = f.attributes
      return {
        hifld_id: a.ID != null ? String(a.ID) : null,
        voltage_kv: a.VOLTAGE ?? null,
        status: a.STATUS ?? null,
        owner: a.OWNER ?? null,
        type: a.TYPE ?? null,
        state: null,  // STATE not available in this service
        geom,
      }
    })
    .filter(Boolean) as Array<{
      hifld_id: string | null; voltage_kv: number | null; status: string | null
      owner: string | null; type: string | null; state: string | null; geom: string
    }>

  console.log(`  ${records.length} records with valid geometry`)

  // Truncate and re-insert (full refresh)
  console.log('  Truncating existing transmission_lines…')
  await supabase.from('transmission_lines').delete().neq('id', 0)

  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    const { error } = await supabase.from('transmission_lines').insert(batch)
    if (error) {
      console.error(`  ✗ batch ${i}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r  inserted ${inserted}/${records.length}`)
    }
  }
  console.log('\n  ✓ Done.')

  await supabase.from('data_sources')
    .upsert({ key: 'hifld_transmission', name: 'HIFLD Electric Transmission Lines', last_ingested_at: new Date().toISOString(), record_count: inserted }, { onConflict: 'key' })

  console.log(`\nHIFLD seed complete. ${inserted} transmission lines inserted.`)
  console.log(`Source: https://hifld-geoplatform.opendata.arcgis.com/datasets/electric-power-transmission-lines`)
}

main().catch(e => { console.error(e); process.exit(1) })
