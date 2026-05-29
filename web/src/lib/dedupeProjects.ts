export interface DedupePoint {
  name: string
  operator?: string
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6371000

export function haversineMeters(a: DedupePoint, b: DedupePoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.85
  const aTokens = new Set(na.split(' '))
  const bTokens = nb.split(' ')
  let overlap = 0
  for (const t of bTokens) if (aTokens.has(t)) overlap++
  return overlap / Math.max(aTokens.size, bTokens.length)
}

export function isDuplicateProject(a: DedupePoint, b: DedupePoint, radiusM = 500): boolean {
  if (haversineMeters(a, b) > radiusM) return false
  const opA = (a.operator ?? '').toLowerCase().trim()
  const opB = (b.operator ?? '').toLowerCase().trim()
  if (opA && opB && opA === opB) return true
  return nameSimilarity(a.name, b.name) >= 0.8
}
