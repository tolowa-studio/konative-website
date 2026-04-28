/**
 * Canadian Availability Score™ (CAS) — pure scoring engine
 * No Supabase deps. All lookups use static/hardcoded tables or bounding box approximations.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type CASGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D'

export interface CASDimension {
  score: number
  maxScore: number
  label: string
  detail: string
}

export interface CASResult {
  lat: number
  lng: number
  score: number
  grade: CASGrade
  dimensions: {
    power: CASDimension
    queue: CASDimension
    water: CASDimension
    environmental: CASDimension
    wildfire: CASDimension
    labor: CASDimension
  }
  metadata: {
    radiusKm: number
    computedAt: string
    province: string | null
  }
}

// ── Province detection (bounding boxes) ───────────────────────────────────────

interface ProvinceBBox {
  code: string
  name: string
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const PROVINCE_BBOXES: ProvinceBBox[] = [
  // BC eastern edge approximates the Continental Divide at populated latitudes (~-116°W
   // at 51°N). Real BC extends to ~-114.05°W only at the southern panhandle — tightening
   // here trades minor SE-BC accuracy for correct AB classification of Calgary/Edmonton.
  { code: 'BC', name: 'British Columbia',  minLat: 48.3,  maxLat: 60.0, minLng: -139.1, maxLng: -116.0 },
  { code: 'AB', name: 'Alberta',           minLat: 49.0,  maxLat: 60.0, minLng: -120.0, maxLng: -110.0 },
  { code: 'SK', name: 'Saskatchewan',      minLat: 49.0,  maxLat: 60.0, minLng: -110.0, maxLng: -101.4 },
  { code: 'MB', name: 'Manitoba',          minLat: 49.0,  maxLat: 60.0, minLng: -102.0, maxLng:  -88.9 },
  { code: 'ON', name: 'Ontario',           minLat: 41.7,  maxLat: 56.9, minLng:  -95.2, maxLng:  -74.3 },
  { code: 'QC', name: 'Quebec',            minLat: 45.0,  maxLat: 62.6, minLng:  -79.8, maxLng:  -57.1 },
  { code: 'NB', name: 'New Brunswick',     minLat: 44.6,  maxLat: 48.1, minLng:  -69.1, maxLng:  -63.8 },
  { code: 'NS', name: 'Nova Scotia',       minLat: 43.4,  maxLat: 47.0, minLng:  -66.4, maxLng:  -59.7 },
  { code: 'PE', name: 'Prince Edward Is',  minLat: 45.9,  maxLat: 47.1, minLng:  -64.4, maxLng:  -62.0 },
  { code: 'NL', name: 'Newfoundland',      minLat: 46.6,  maxLat: 60.4, minLng:  -67.9, maxLng:  -52.6 },
  { code: 'YT', name: 'Yukon',             minLat: 59.9,  maxLat: 70.0, minLng: -141.0, maxLng: -123.8 },
  { code: 'NT', name: 'Northwest Territories', minLat: 60.0, maxLat: 78.6, minLng: -136.5, maxLng:  -96.0 },
  { code: 'NU', name: 'Nunavut',           minLat: 56.0,  maxLat: 83.1, minLng:  -95.4, maxLng:  -61.3 },
]

export function detectProvince(lat: number, lng: number): string | null {
  // Try exact bbox first (ordered by population/likelihood)
  const ordered = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU']
  for (const code of ordered) {
    const p = PROVINCE_BBOXES.find(b => b.code === code)!
    if (lat >= p.minLat && lat <= p.maxLat && lng >= p.minLng && lng <= p.maxLng) return code
  }
  return null
}

// ── Water risk by province (WRI Aqueduct 4.0 public summary) ─────────────────
// Score out of 15. Lower WRI Overall Water Risk → higher score.
// Sources: WRI Aqueduct 4.0 country/basin risk summaries, simplified to province level.

const WATER_RISK: Record<string, { score: number; detail: string }> = {
  BC: { score: 14, detail: 'Low overall water risk — abundant precipitation, well-managed watersheds' },
  AB: { score:  5, detail: 'High water risk — semi-arid, heavy agricultural/oil-sands demand' },
  SK: { score:  7, detail: 'Medium-high water risk — Prairie drought exposure' },
  MB: { score: 11, detail: 'Low-medium water risk — substantial freshwater, seasonal variability' },
  ON: { score: 10, detail: 'Medium water risk — Great Lakes access but regional stress in summer' },
  QC: { score: 13, detail: 'Low water risk — abundant freshwater, low industrial stress' },
  NB: { score: 13, detail: 'Low water risk — high precipitation, limited industrial draw' },
  NS: { score: 12, detail: 'Low-medium water risk — coastal access, moderate precipitation' },
  PE: { score: 11, detail: 'Low-medium water risk — small island, seasonal variability' },
  NL: { score: 14, detail: 'Low water risk — extensive freshwater resources' },
  YT: { score: 15, detail: 'Very low water risk — minimal industrial demand, large watersheds' },
  NT: { score: 15, detail: 'Very low water risk — permafrost melt dynamics managed' },
  NU: { score: 15, detail: 'Very low water risk — minimal development pressure' },
}

export function scoreWater(province: string | null): CASDimension {
  if (!province || !WATER_RISK[province]) {
    return { score: 8, maxScore: 15, label: 'Water Risk', detail: 'Province unknown — defaulting to medium score' }
  }
  const { score, detail } = WATER_RISK[province]
  return { score, maxScore: 15, label: 'Water Risk', detail }
}

// ── Wildfire risk — hardcoded provincial table (fallback when NFDB unavailable) ─

const WILDFIRE_RISK: Record<string, { score: number; detail: string }> = {
  BC: { score:  5, detail: 'High wildfire risk — interior BC has intense fire seasons' },
  AB: { score:  8, detail: 'Medium-high wildfire risk — boreal/prairie interface' },
  SK: { score:  9, detail: 'Medium wildfire risk — northern boreal fire corridor' },
  MB: { score: 10, detail: 'Medium wildfire risk — boreal exposure but lower frequency' },
  ON: { score: 10, detail: 'Medium wildfire risk — northern regions affected periodically' },
  QC: { score: 11, detail: 'Medium-low wildfire risk — historically lower southern fire density' },
  NB: { score: 13, detail: 'Low wildfire risk — high humidity, managed forests' },
  NS: { score: 12, detail: 'Low wildfire risk — coastal climate moderates risk' },
  PE: { score: 14, detail: 'Very low wildfire risk — small island, intensive agriculture' },
  NL: { score: 11, detail: 'Medium-low wildfire risk — boreal exposure in Labrador' },
  YT: { score:  6, detail: 'High wildfire risk — remote boreal, limited suppression resources' },
  NT: { score:  7, detail: 'High wildfire risk — large boreal fires increasingly common' },
  NU: { score: 13, detail: 'Low wildfire risk — tundra limits fire spread' },
}

export function scoreWildfire(
  province: string | null,
  nearbyFireCount?: number
): CASDimension {
  const MAX = 15
  // If we have a computed fire count from Supabase/API, use that
  if (typeof nearbyFireCount === 'number') {
    let score: number
    let detail: string
    if (nearbyFireCount === 0)      { score = 15; detail = 'No recorded fire occurrences within 50 km (20 yr)' }
    else if (nearbyFireCount <= 5)  { score = 12; detail = `${nearbyFireCount} fire occurrences within 50 km (20 yr) — low density` }
    else if (nearbyFireCount <= 20) { score =  8; detail = `${nearbyFireCount} fire occurrences within 50 km (20 yr) — moderate` }
    else if (nearbyFireCount <= 50) { score =  4; detail = `${nearbyFireCount} fire occurrences within 50 km (20 yr) — elevated` }
    else                            { score =  0; detail = `${nearbyFireCount}+ fire occurrences within 50 km (20 yr) — high risk` }
    return { score, maxScore: MAX, label: 'Wildfire Risk', detail }
  }
  // Fallback: province table
  if (!province || !WILDFIRE_RISK[province]) {
    return { score: 8, maxScore: MAX, label: 'Wildfire Risk', detail: 'Province unknown — defaulting to medium score' }
  }
  const { score, detail } = WILDFIRE_RISK[province]
  return { score, maxScore: MAX, label: 'Wildfire Risk', detail }
}

// ── Labor market — major metro centroids ──────────────────────────────────────

interface MetroCentroid {
  name: string
  lat: number
  lng: number
  score: number // out of 10
}

const METROS: MetroCentroid[] = [
  { name: 'Toronto',      lat: 43.65, lng:  -79.38, score: 10 },
  { name: 'Montreal',     lat: 45.50, lng:  -73.57, score: 10 },
  { name: 'Vancouver',    lat: 49.25, lng: -123.12, score: 10 },
  { name: 'Calgary',      lat: 51.05, lng: -114.07, score: 10 },
  { name: 'Edmonton',     lat: 53.55, lng: -113.49, score:  9 },
  { name: 'Ottawa',       lat: 45.42, lng:  -75.69, score:  9 },
  { name: 'Winnipeg',     lat: 49.90, lng:  -97.13, score:  8 },
  { name: 'Quebec City',  lat: 46.81, lng:  -71.21, score:  8 },
  { name: 'Hamilton',     lat: 43.25, lng:  -79.87, score:  8 },
  { name: 'Kitchener',    lat: 43.45, lng:  -80.49, score:  7 },
  { name: 'London ON',    lat: 42.98, lng:  -81.25, score:  7 },
  { name: 'Halifax',      lat: 44.64, lng:  -63.58, score:  7 },
  { name: 'Victoria',     lat: 48.42, lng: -123.37, score:  7 },
  { name: 'Saskatoon',    lat: 52.13, lng: -106.67, score:  7 },
  { name: 'Regina',       lat: 50.45, lng: -104.62, score:  6 },
  { name: 'St. John\'s',  lat: 47.56, lng:  -52.71, score:  6 },
  { name: 'Kelowna',      lat: 49.89, lng: -119.49, score:  6 },
  { name: 'Abbotsford',   lat: 49.05, lng: -122.31, score:  6 },
  { name: 'Sherbrooke',   lat: 45.40, lng:  -71.89, score:  6 },
  { name: 'Barrie',       lat: 44.39, lng:  -79.69, score:  6 },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function scoreLabor(lat: number, lng: number): CASDimension {
  const MAX = 10
  let bestScore = 4
  let bestName = 'rural'
  let bestDist = Infinity

  for (const m of METROS) {
    const dist = haversineKm(lat, lng, m.lat, m.lng)
    if (dist < bestDist) {
      bestDist = dist
      bestName = m.name
      // Decay score with distance: full score within 30km, decays linearly to rural floor at 150km
      const decayFactor = Math.max(0, 1 - Math.max(0, dist - 30) / 120)
      bestScore = Math.round(4 + (m.score - 4) * decayFactor)
    }
  }

  const detail =
    bestDist < 30
      ? `Within ${Math.round(bestDist)} km of ${bestName} metro — strong tech labor pool`
      : bestDist < 100
      ? `${Math.round(bestDist)} km from ${bestName} — commutable distance, good labor supply`
      : `>100 km from nearest metro (${bestName}) — limited local tech talent`

  return { score: bestScore, maxScore: MAX, label: 'Labor Market', detail }
}

// ── Power proximity (queue density proxy) ─────────────────────────────────────
// Scored by caller using Supabase data. This is the static fallback + pure scoring fn.

export function scorePower(nearestQueueKm: number | null, queueCountWithin25Km: number): CASDimension {
  const MAX = 25
  let distanceScore: number
  let distDetail: string

  if (nearestQueueKm === null) {
    distanceScore = 2
    distDetail = 'No queue POIs found nearby'
  } else if (nearestQueueKm <= 10)  { distanceScore = 25; distDetail = `${nearestQueueKm.toFixed(1)} km to nearest queue POI — excellent grid proximity` }
  else if (nearestQueueKm <= 25)    { distanceScore = 20; distDetail = `${nearestQueueKm.toFixed(1)} km to nearest queue POI — strong proximity` }
  else if (nearestQueueKm <= 50)    { distanceScore = 15; distDetail = `${nearestQueueKm.toFixed(1)} km to nearest queue POI — moderate proximity` }
  else if (nearestQueueKm <= 100)   { distanceScore =  8; distDetail = `${nearestQueueKm.toFixed(1)} km to nearest queue POI — marginal proximity` }
  else                              { distanceScore =  2; distDetail = `${nearestQueueKm.toFixed(1)} km to nearest queue POI — remote from grid` }

  // Density bonus (up to +3 pts) — capped at max
  const densityBonus = Math.min(3, Math.floor(queueCountWithin25Km / 3))
  const score = Math.min(MAX, distanceScore + densityBonus)
  const detail = densityBonus > 0
    ? `${distDetail}; ${queueCountWithin25Km} queue projects within 25 km (+${densityBonus} density bonus)`
    : distDetail

  return { score, maxScore: MAX, label: 'Power Proximity', detail }
}

// ── Grid queue capacity ───────────────────────────────────────────────────────

export function scoreQueue(totalMwWithin50Km: number, projectCount: number): CASDimension {
  const MAX = 20
  let score: number
  let detail: string

  if      (totalMwWithin50Km >= 5000) { score = 20; detail = `${totalMwWithin50Km.toLocaleString()} MW in queue within 50 km — exceptional capacity signal` }
  else if (totalMwWithin50Km >= 2000) { score = 18; detail = `${totalMwWithin50Km.toLocaleString()} MW in queue within 50 km — very strong` }
  else if (totalMwWithin50Km >= 1000) { score = 15; detail = `${totalMwWithin50Km.toLocaleString()} MW in queue within 50 km — strong` }
  else if (totalMwWithin50Km >=  500) { score = 10; detail = `${totalMwWithin50Km.toLocaleString()} MW in queue within 50 km — moderate` }
  else if (totalMwWithin50Km >=  100) { score =  5; detail = `${totalMwWithin50Km.toLocaleString()} MW in queue within 50 km — limited` }
  else                                { score =  0; detail = `${totalMwWithin50Km.toLocaleString()} MW in queue within 50 km — very limited` }

  if (projectCount > 0 && detail) {
    detail += ` (${projectCount} project${projectCount !== 1 ? 's' : ''})`
  }

  return { score, maxScore: MAX, label: 'Grid Queue Capacity', detail }
}

// ── Environmental constraints ─────────────────────────────────────────────────
// Caller provides flags from PostGIS or approximation; this fn scores them.

export interface EnvironmentalFlags {
  nearProtectedArea: boolean   // CPCAD within 2 km
  nearIndigenousLands: boolean // CIRNAC within 5 km
  protectedAreaName?: string
  indigenousLandsName?: string
}

export function scoreEnvironmental(flags: EnvironmentalFlags): CASDimension {
  const MAX = 15
  let score = MAX
  const notes: string[] = []

  if (flags.nearProtectedArea) {
    score -= 10
    notes.push(`Protected area within 2 km${flags.protectedAreaName ? ` (${flags.protectedAreaName})` : ''} — significant constraint`)
  }
  if (flags.nearIndigenousLands) {
    score -= 8
    notes.push(`Indigenous lands within 5 km${flags.indigenousLandsName ? ` (${flags.indigenousLandsName})` : ''} — consultation required`)
  }
  score = Math.max(0, score)

  const detail = notes.length > 0 ? notes.join('; ') : 'No major environmental constraints detected within search radius'
  return { score, maxScore: MAX, label: 'Environmental Constraints', detail }
}

// ── Grade ─────────────────────────────────────────────────────────────────────

export function computeGrade(score: number): CASGrade {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C+'
  if (score >= 40) return 'C'
  return 'D'
}

// ── Main assembly (for API routes that have already fetched Supabase data) ────

export interface CASInputs {
  lat: number
  lng: number
  // From Supabase queue RPC
  totalMwWithin50Km: number
  queueProjectCount: number
  nearestQueueKm: number | null
  queueCountWithin25Km: number
  // Environmental flags
  envFlags: EnvironmentalFlags
  // Optional — if fire count computed server-side
  nearbyFireCount?: number
}

export function assembleCAS(inputs: CASInputs): CASResult {
  const province = detectProvince(inputs.lat, inputs.lng)

  const power       = scorePower(inputs.nearestQueueKm, inputs.queueCountWithin25Km)
  const queue       = scoreQueue(inputs.totalMwWithin50Km, inputs.queueProjectCount)
  const water       = scoreWater(province)
  const environmental = scoreEnvironmental(inputs.envFlags)
  const wildfire    = scoreWildfire(province, inputs.nearbyFireCount)
  const labor       = scoreLabor(inputs.lat, inputs.lng)

  const score = Math.round(power.score + queue.score + water.score + environmental.score + wildfire.score + labor.score)

  return {
    lat: inputs.lat,
    lng: inputs.lng,
    score,
    grade: computeGrade(score),
    dimensions: { power, queue, water, environmental, wildfire, labor },
    metadata: {
      radiusKm: 50,
      computedAt: new Date().toISOString(),
      province,
    },
  }
}
