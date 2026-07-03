/**
 * derive-state.ts — shared, offline USPS-state derivation for TBCP awards.
 *
 * The live NTIA/NBAM ArcGIS source that populates tbcp_awards carries NO state
 * field — only ZIP, LAT/LON, and BIA_REGION. This module derives the 2-letter
 * USPS state from the ZIP prefix (deterministic) with a lat/lng point-in-polygon
 * fallback for rows whose ZIP is null. Used by both the seed/enrichment script
 * and the ongoing signal-agent so `state` never regresses to null.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * ZIP3 (first 3 digits) -> USPS state. Standard USPS ZIP zone allocations.
 * ZIPs are zero-padded to 5 digits first so Northeast/NJ/PR ZIPs that lost a
 * leading zero upstream (e.g. "2649" for MA "02649") map correctly.
 */
export function zip3ToState(zipRaw: string): string | null {
  const zip = /^\d+$/.test(zipRaw) ? zipRaw.padStart(5, '0') : zipRaw
  const z = parseInt(zip.slice(0, 3), 10)
  if (Number.isNaN(z)) return null
  const ranges: Array<[number, number, string]> = [
    [5, 5, 'NY'], [6, 9, 'PR'], [10, 27, 'MA'], [28, 29, 'RI'], [30, 38, 'NH'],
    [39, 49, 'ME'], [50, 54, 'VT'], [55, 55, 'MA'], [56, 59, 'VT'], [60, 69, 'CT'],
    [70, 89, 'NJ'], [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'],
    [200, 205, 'DC'], [206, 219, 'MD'], [220, 246, 'VA'], [247, 268, 'WV'],
    [270, 289, 'NC'], [290, 299, 'SC'], [300, 319, 'GA'], [320, 349, 'FL'],
    [350, 369, 'AL'], [370, 385, 'TN'], [386, 397, 'MS'], [398, 399, 'GA'],
    [400, 427, 'KY'], [430, 459, 'OH'], [460, 479, 'IN'], [480, 499, 'MI'],
    [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'], [569, 579, 'SD'],
    [580, 588, 'ND'], [590, 599, 'MT'], [600, 629, 'IL'], [630, 658, 'MO'],
    [660, 679, 'KS'], [680, 693, 'NE'], [700, 714, 'LA'], [716, 729, 'AR'],
    [730, 749, 'OK'], [750, 799, 'TX'], [800, 816, 'CO'], [820, 831, 'WY'],
    [832, 838, 'ID'], [840, 847, 'UT'], [850, 865, 'AZ'], [870, 884, 'NM'],
    [889, 898, 'NV'], [900, 961, 'CA'], [967, 968, 'HI'], [969, 969, 'GU'],
    [970, 979, 'OR'], [980, 994, 'WA'], [995, 999, 'AK'],
  ]
  for (const [lo, hi, st] of ranges) {
    if (z >= lo && z <= hi) return st
  }
  return null
}

const STATE_NAME_TO_ABBR: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Puerto Rico': 'PR', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX',
  Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
}

type Ring = number[][]
interface StatePoly { abbr: string; polys: Ring[][] }

let _cache: StatePoly[] | null = null

export function loadStatePolys(): StatePoly[] {
  if (_cache) return _cache
  const here = dirname(fileURLToPath(import.meta.url))
  // us-states.geojson lives in scripts/data (one level up from scripts/lib)
  const geo = JSON.parse(readFileSync(join(here, '..', 'data', 'us-states.geojson'), 'utf8'))
  const out: StatePoly[] = []
  for (const f of geo.features) {
    const abbr = STATE_NAME_TO_ABBR[f.properties.name]
    if (!abbr) continue
    const g = f.geometry
    const polys: Ring[][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
    out.push({ abbr, polys })
  }
  _cache = out
  return out
}

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPoly(lng: number, lat: number, poly: Ring[]): boolean {
  if (!pointInRing(lng, lat, poly[0])) return false
  for (let h = 1; h < poly.length; h++) {
    if (pointInRing(lng, lat, poly[h])) return false
  }
  return true
}

export function latLngToState(lat: number, lng: number, states = loadStatePolys()): string | null {
  for (const s of states) {
    for (const poly of s.polys) {
      if (pointInPoly(lng, lat, poly)) return s.abbr
    }
  }
  return null
}

/** Bounded nearest-state fallback for coastal/island points just outside a low-res polygon. */
export function nearestState(lat: number, lng: number, states = loadStatePolys(), maxDeg = 0.5): string | null {
  let best: string | null = null
  let bestD = maxDeg * maxDeg
  for (const s of states) {
    for (const poly of s.polys) {
      for (const ring of poly) {
        for (const [x, y] of ring) {
          const dx = x - lng, dy = y - lat
          const d = dx * dx + dy * dy
          if (d < bestD) { bestD = d; best = s.abbr }
        }
      }
    }
  }
  return best
}

/**
 * Derive USPS state from an ArcGIS feature's properties (+ optional geometry
 * coordinates as [lng, lat]). ZIP first, then lat/lng point-in-polygon, then
 * bounded nearest-state. Returns null if nothing resolves.
 */
export function deriveState(
  props: Record<string, unknown>,
  coords?: [number, number] | number[],
): string | null {
  const zip = String(props['ZIP'] ?? props['zip'] ?? '').trim()
  if (zip) {
    const st = zip3ToState(zip)
    if (st) return st
  }
  const lat = (coords?.[1] ?? props['LAT'] ?? props['lat']) as number | undefined
  const lng = (coords?.[0] ?? props['LON'] ?? props['lng'] ?? props['lon']) as number | undefined
  if (typeof lat === 'number' && typeof lng === 'number') {
    return latLngToState(lat, lng) ?? nearestState(lat, lng)
  }
  return null
}
