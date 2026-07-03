/**
 * enrich-tbcp-state.ts
 *
 * NON-DESTRUCTIVE enrichment: the tbcp_awards table was seeded from an NTIA
 * ArcGIS source whose feature properties use ZIP / LAT / LON / BIA_REGION but
 * carry NO explicit state field. The seed/signal scripts looked for a `State`
 * key that never existed, so `state` is NULL for every row even though each row
 * has a valid 5-digit ZIP in raw_properties.ZIP.
 *
 * This script derives the 2-letter USPS state from the ZIP prefix (ZIP3, a
 * deterministic static mapping) and writes it back to the `state` column ONLY.
 * It is idempotent and touches nothing else — no DROP/DELETE/TRUNCATE, no DDL.
 *
 * Run:      npx tsx scripts/enrich-tbcp-state.ts
 * Dry run:  DRY_RUN=1 npx tsx scripts/enrich-tbcp-state.ts
 */

import { createClient } from '@supabase/supabase-js'
import { zip3ToState, latLngToState, nearestState, loadStatePolys } from './lib/derive-state.js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Source web/.env.local first.')
  process.exit(1)
}

const DRY_RUN = process.env.DRY_RUN === '1'
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })


async function main() {
  console.log('Konative — tbcp_awards state enrichment (ZIP3 -> USPS state, lat/lng fallback)')
  console.log(`Target: ${SUPABASE_URL}  |  DRY_RUN=${DRY_RUN}`)

  const { data: rows, error } = await supabase
    .from('tbcp_awards')
    .select('id, slug, grantee_name, state, lat, lng, raw_properties')

  if (error) {
    console.error('Read failed:', error.message)
    process.exit(1)
  }
  if (!rows) {
    console.error('No rows returned.')
    process.exit(1)
  }

  console.log(`Fetched ${rows.length} rows`)

  const statePolys = loadStatePolys()
  console.log(`Loaded ${statePolys.length} state boundaries for lat/lng fallback`)

  let toUpdate = 0
  let already = 0
  let unresolved = 0
  let updated = 0
  let viaZip = 0
  let viaLatLng = 0
  const failedSamples: string[] = []

  for (const row of rows) {
    const rp = (row.raw_properties || {}) as Record<string, unknown>
    // Upstream ArcGIS stores ZIP as a value that can lose its leading zero
    // (e.g. Massachusetts "02649" arrives as "2649"). Zero-pad to 5 digits so
    // Northeast/NJ/PR ZIPs map to the correct state.
    const rawZip = String(rp['ZIP'] ?? '').trim()
    const zip = rawZip && /^\d+$/.test(rawZip) ? rawZip.padStart(5, '0') : rawZip
    let derived = zip ? zip3ToState(zip) : null
    if (derived) {
      viaZip++
    } else if (typeof row.lat === 'number' && typeof row.lng === 'number') {
      derived = latLngToState(row.lat, row.lng, statePolys) ??
        nearestState(row.lat, row.lng, statePolys)
      if (derived) viaLatLng++
    }

    if (!derived) {
      unresolved++
      if (failedSamples.length < 10) failedSamples.push(`${row.grantee_name} (ZIP="${zip}")`)
      continue
    }

    // Idempotent: only write when the value would actually change.
    if (row.state === derived) {
      already++
      continue
    }

    toUpdate++
    if (DRY_RUN) continue

    const { error: upErr } = await supabase
      .from('tbcp_awards')
      .update({ state: derived })
      .eq('id', row.id)

    if (upErr) {
      console.error(`  ✗ ${row.grantee_name}: ${upErr.message}`)
    } else {
      updated++
    }
  }

  console.log('')
  console.log(`Would update / updated : ${DRY_RUN ? toUpdate : updated}`)
  console.log(`Already correct        : ${already}`)
  console.log(`Resolved via ZIP3      : ${viaZip}`)
  console.log(`Resolved via lat/lng   : ${viaLatLng}`)
  console.log(`Unresolved             : ${unresolved}`)
  if (failedSamples.length) console.log('Unresolved samples     :', failedSamples.join(', '))
  console.log(DRY_RUN ? '\nDRY RUN — no writes performed.' : '\nDone.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
