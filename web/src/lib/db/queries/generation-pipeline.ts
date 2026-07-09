import { getD1 } from "@/lib/db/cloudflare";

export interface GenerationPipelineMapRow {
  plant_id: string | null;
  plant_name: string | null;
  utility_name: string | null;
  state: string | null;
  county: string | null;
  technology: string | null;
  capacity_mw: number | null;
  planned_year: number | null;
  status_code: string | null;
  balancing_authority: string | null;
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

function mapGenerationRow(row: {
  plant_id: string | null;
  plant_name: string | null;
  utility_name: string | null;
  state: string | null;
  county: string | null;
  technology: string | null;
  capacity_mw: number | null;
  planned_year: number | null;
  lat: number | null;
  lng: number | null;
  raw_data: string | null;
}): GenerationPipelineMapRow | null {
  if (row.lat == null || row.lng == null || row.capacity_mw == null) return null;
  const raw = parseRawData(row.raw_data);
  return {
    plant_id: row.plant_id,
    plant_name: row.plant_name,
    utility_name: row.utility_name,
    state: row.state,
    county: row.county,
    technology: row.technology,
    capacity_mw: row.capacity_mw,
    planned_year: row.planned_year,
    status_code: (raw.status_code as string) ?? null,
    balancing_authority: (raw.balancing_authority as string) ?? null,
    lng: row.lng,
    lat: row.lat,
  };
}

export async function queryGenerationPipelineMap(
  minYear = new Date().getFullYear(),
  limit = 500,
): Promise<GenerationPipelineMapRow[] | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const { results } = await db
      .prepare(
        `SELECT plant_id, plant_name, utility_name, state, county, technology,
                capacity_mw, planned_year, lat, lng, raw_data
         FROM generation_pipeline
         WHERE capacity_mw IS NOT NULL
           AND planned_year >= ?
           AND lat IS NOT NULL AND lng IS NOT NULL
         ORDER BY capacity_mw DESC
         LIMIT ?`,
      )
      .bind(minYear, limit)
      .all<Parameters<typeof mapGenerationRow>[0]>();

    return (results ?? [])
      .map(mapGenerationRow)
      .filter((r): r is GenerationPipelineMapRow => r !== null);
  } catch {
    return null;
  }
}

export async function countGenerationPipeline(): Promise<number | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const row = await db
      .prepare(`SELECT COUNT(*) AS count FROM generation_pipeline`)
      .first<{ count: number }>();
    return row?.count ?? 0;
  } catch {
    return null;
  }
}
