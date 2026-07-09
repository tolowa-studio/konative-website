import { getD1 } from "@/lib/db/cloudflare";

export interface NetworkFacilityMapRow {
  pdb_id: number | null;
  name: string | null;
  org_name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  net_count: number | null;
  ix_count: number | null;
  carrier_count: number | null;
  status: string | null;
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

function mapNetworkRow(row: {
  pdb_id: number | null;
  name: string | null;
  org_name: string | null;
  city: string | null;
  state: string | null;
  net_count: number | null;
  ix_count: number | null;
  lat: number | null;
  lng: number | null;
  raw_data: string | null;
}): NetworkFacilityMapRow | null {
  if (row.lat == null || row.lng == null) return null;
  const raw = parseRawData(row.raw_data);
  return {
    pdb_id: row.pdb_id,
    name: row.name,
    org_name: row.org_name,
    city: row.city,
    state: row.state,
    country: (raw.country as string) ?? null,
    net_count: row.net_count,
    ix_count: row.ix_count,
    carrier_count: (raw.carrier_count as number) ?? null,
    status: (raw.status as string) ?? "ok",
    lng: row.lng,
    lat: row.lat,
  };
}

export async function queryNetworkFacilitiesMap(): Promise<
  NetworkFacilityMapRow[] | null
> {
  const db = getD1();
  if (!db) return null;
  try {
    const PAGE = 1000;
    const all: Parameters<typeof mapNetworkRow>[0][] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { results } = await db
        .prepare(
          `SELECT pdb_id, name, org_name, city, state, net_count, ix_count, lat, lng, raw_data
           FROM network_facilities
           WHERE lat IS NOT NULL AND lng IS NOT NULL
           LIMIT ? OFFSET ?`,
        )
        .bind(PAGE, offset)
        .all<Parameters<typeof mapNetworkRow>[0]>();
      const batch = results ?? [];
      all.push(...batch);
      if (batch.length < PAGE) break;
    }

    return all
      .map(mapNetworkRow)
      .filter((r): r is NetworkFacilityMapRow => r !== null);
  } catch {
    return null;
  }
}

export async function countNetworkFacilities(): Promise<number | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const row = await db
      .prepare(`SELECT COUNT(*) AS count FROM network_facilities`)
      .first<{ count: number }>();
    return row?.count ?? 0;
  } catch {
    return null;
  }
}
