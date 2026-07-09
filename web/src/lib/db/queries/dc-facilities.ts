import { getD1 } from "@/lib/db/cloudflare";

export interface DcFacilityMapRow {
  id: string;
  name: string;
  operator: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string | null;
  capacity_mw: number | null;
  facility_type: string | null;
  source: string | null;
  source_url: string | null;
  lng: number;
  lat: number;
}

function parseRawData(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function mapFacilityRow(row: {
  id: string;
  name: string;
  operator: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  capacity_mw: number | null;
  facility_type: string | null;
  lat: number | null;
  lng: number | null;
  raw_data: string | null;
}): DcFacilityMapRow | null {
  if (row.lat == null || row.lng == null) return null;
  const raw = parseRawData(row.raw_data);
  return {
    id: row.id,
    name: row.name,
    operator: row.operator,
    city: row.city,
    state: row.state,
    country: (raw.country as string) ?? "US",
    status: row.status,
    capacity_mw: row.capacity_mw,
    facility_type: row.facility_type,
    source: (raw.source as string) ?? "im3",
    source_url: (raw.source_url as string) ?? null,
    lng: row.lng,
    lat: row.lat,
  };
}

export async function queryDcFacilitiesMap(
  limit = 2000,
): Promise<DcFacilityMapRow[] | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const { results } = await db
      .prepare(
        `SELECT id, name, operator, city, state, status, capacity_mw, facility_type, lat, lng, raw_data
         FROM dc_facilities
         WHERE lat IS NOT NULL AND lng IS NOT NULL
         LIMIT ?`,
      )
      .bind(limit)
      .all<Parameters<typeof mapFacilityRow>[0]>();

    return (results ?? [])
      .map(mapFacilityRow)
      .filter((r): r is DcFacilityMapRow => r !== null);
  } catch {
    return null;
  }
}

export async function countDcFacilities(): Promise<number | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const row = await db
      .prepare(`SELECT COUNT(*) AS count FROM dc_facilities`)
      .first<{ count: number }>();
    return row?.count ?? 0;
  } catch {
    return null;
  }
}
