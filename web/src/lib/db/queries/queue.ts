import { getD1 } from "@/lib/db/cloudflare";

export interface InterconnectionQueueDbRow {
  id: string;
  authority: string;
  project_name: string;
  capacity_mw: number;
  resource_type: string;
  study_phase: string;
  queue_date: string;
  expected_cod: string | null;
  poi_name: string | null;
  poi_lat: number | null;
  poi_lng: number | null;
  source_url: string;
  last_updated: string;
  distance_km?: number;
}

/** Great-circle distance in km between two WGS84 points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bounding box (degrees) for a radius search — pre-filter before Haversine. */
export function bboxForRadiusKm(
  lat: number,
  lng: number,
  radiusKm: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180) || 1e-6);
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export async function queryInterconnectionQueueRadius(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<InterconnectionQueueDbRow[] | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const { minLat, maxLat, minLng, maxLng } = bboxForRadiusKm(lat, lng, radiusKm);
    const { results } = await db
      .prepare(
        `SELECT id, authority, project_name, capacity_mw, resource_type, study_phase,
                queue_date, expected_cod, poi_name, poi_lat, poi_lng, source_url, last_updated
         FROM interconnection_queue
         WHERE poi_lat IS NOT NULL AND poi_lng IS NOT NULL
           AND poi_lat BETWEEN ? AND ?
           AND poi_lng BETWEEN ? AND ?`,
      )
      .bind(minLat, maxLat, minLng, maxLng)
      .all<Omit<InterconnectionQueueDbRow, "distance_km">>();

    const rows = (results ?? [])
      .map((row) => ({
        ...row,
        distance_km: haversineKm(lat, lng, row.poi_lat!, row.poi_lng!),
      }))
      .filter((row) => row.distance_km <= radiusKm)
      .sort((a, b) => {
        const dist = a.distance_km - b.distance_km;
        if (dist !== 0) return dist;
        return (b.capacity_mw ?? 0) - (a.capacity_mw ?? 0);
      });

    return rows;
  } catch {
    return null;
  }
}
