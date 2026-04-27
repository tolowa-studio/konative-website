import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type QueueAuthority = "IESO" | "AESO" | "HQ" | "BCH";
type QueueStudyPhase =
  | "application"
  | "feasibility"
  | "system_impact"
  | "facilities"
  | "agreement_signed"
  | "construction"
  | "in_service"
  | "withdrawn";
type QueueResourceType =
  | "load"
  | "gas"
  | "wind"
  | "solar"
  | "hydro"
  | "nuclear"
  | "battery"
  | "hybrid"
  | "other";

interface QueueUpsertRow {
  authority: QueueAuthority;
  source_id: string;
  project_name: string;
  capacity_mw: number;
  resource_type: QueueResourceType;
  study_phase: QueueStudyPhase;
  queue_date: string;
  expected_cod: string | null;
  poi_name: string | null;
  poi_lat: number | null;
  poi_lng: number | null;
  source_url: string;
  last_updated: string;
  metadata: Record<string, unknown>;
}

interface IesoRecord {
  Queue: string;
  Applicant: string;
  Name: string;
  CaaId: number;
  CaaIdAndDate: string;
  Location: string;
  Type: string;
  Size: string;
  ProposedInServiceDate: string;
  SiaStatus: string;
  ReportLinks: string;
  Committed: string;
}

export interface QueueIngestSummary {
  attempted: number;
  insertedOrUpdated: number;
  authorities: Partial<Record<QueueAuthority, number>>;
}

const IESO_JSON_URL = "https://www.ieso.ca/-/media/files/IESO/files/applicationstatusdata.json";
const AESO_LIST_URL = "https://www.interconnection.fyi/projects/market/AESO";
const HQ_LIST_URL = "https://www.interconnection.fyi/projects/market/Quebec";
const BCH_LIST_URL = "https://interconnection.fyi/projects/transmission-owner/bc-hydro";

const REGION_COORDS: Record<string, [number, number]> = {
  toronto: [43.6532, -79.3832],
  southwest: [42.9849, -81.2453],
  west: [43.4516, -80.4925],
  niagara: [43.0896, -79.0849],
  essa: [44.25, -79.7833],
  ottawa: [45.4215, -75.6972],
  east: [44.2312, -76.486],
  northeast: [46.4917, -80.993],
  northwest: [48.3809, -89.2477],
  bruce: [44.33, -81.34],
  ontario: [43.6532, -79.3832],
  unknown: [43.6532, -79.3832],
};

const PROVINCE_CENTROIDS: Record<string, [number, number]> = {
  AB: [53.9333, -116.5765],
  BC: [53.7267, -127.6476],
  QC: [52.9399, -73.5491],
  ON: [50.0, -85.0],
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function parsePossibleDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const asDate = new Date(input);
  if (Number.isNaN(asDate.valueOf())) return null;
  return asDate.toISOString().slice(0, 10);
}

function parseCapacityMw(text: string): number {
  const match = /(\d+(?:\.\d+)?)\s*MW/i.exec(text);
  if (!match) return 0;
  return Number.parseFloat(match[1]);
}

function inferResourceType(name: string): QueueResourceType {
  const value = name.toLowerCase();
  if (value.includes("hybrid")) return "hybrid";
  if (value.includes("battery") || value.includes("storage")) return "battery";
  if (value.includes("solar")) return "solar";
  if (value.includes("wind")) return "wind";
  if (value.includes("hydro")) return "hydro";
  if (value.includes("nuclear")) return "nuclear";
  if (value.includes("gas") || value.includes("cogen")) return "gas";
  if (value.includes("load")) return "load";
  return "other";
}

function mapMarketStatusToPhase(status: string): QueueStudyPhase {
  const value = status.toLowerCase();
  if (value.includes("withdrawn") || value.includes("cancel")) return "withdrawn";
  if (value.includes("operational") || value.includes("in service")) return "in_service";
  if (value.includes("construction")) return "construction";
  return "system_impact";
}

async function fetchIesoRows(): Promise<QueueUpsertRow[]> {
  const res = await fetch(IESO_JSON_URL, {
    headers: { "User-Agent": "konative-site/1.0 (queue-ingest)" },
  });
  if (!res.ok) throw new Error(`IESO fetch failed: ${res.status}`);

  const rows: IesoRecord[] = await res.json();
  const output: QueueUpsertRow[] = [];
  for (const row of rows) {
    const capacityMw = parseCapacityMw(row.Size || "");
    const region = (row.Location || "ontario").toLowerCase().trim();
    const [poiLat, poiLng] = REGION_COORDS[region] ?? REGION_COORDS.ontario;
    output.push({
      authority: "IESO",
      source_id: String(row.CaaId || row.CaaIdAndDate || row.Queue).trim(),
      project_name: row.Name || `IESO ${row.CaaIdAndDate || row.Queue}`,
      capacity_mw: capacityMw,
      resource_type: inferResourceType(row.Type || row.Name || ""),
      study_phase: mapMarketStatusToPhase(row.SiaStatus || ""),
      queue_date: parsePossibleDate(row.CaaIdAndDate) ?? todayIsoDate(),
      expected_cod: parsePossibleDate(row.ProposedInServiceDate),
      poi_name: row.Location || null,
      poi_lat: poiLat,
      poi_lng: poiLng,
      source_url: "https://www.ieso.ca/Sector-Participants/Connection-Process/Application-Status",
      last_updated: new Date().toISOString(),
      metadata: {
        rawQueue: row.Queue,
        applicant: row.Applicant,
        committed: row.Committed,
      },
    });
  }
  return output;
}

function parseMarkdownMarketRows(
  content: string,
  authority: QueueAuthority,
  sourceUrl: string
): QueueUpsertRow[] {
  const output: QueueUpsertRow[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    if (!line.startsWith("| [")) continue;
    const cols = line
      .split("|")
      .map((col) => col.trim())
      .filter(Boolean);
    if (cols.length < 5) continue;

    const nameMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(cols[0]);
    const projectName = nameMatch?.[1] ?? cols[0];
    const projectUrl = nameMatch?.[2] ?? null;
    const queueId = cols[1];
    const province = cols[2];
    const county = cols[3];
    const status = cols[4];
    const centroid = PROVINCE_CENTROIDS[province] ?? null;

    output.push({
      authority,
      source_id: queueId,
      project_name: projectName,
      capacity_mw: parseCapacityMw(projectName),
      resource_type: inferResourceType(projectName),
      study_phase: mapMarketStatusToPhase(status),
      queue_date: todayIsoDate(),
      expected_cod: null,
      poi_name: county || null,
      poi_lat: centroid?.[0] ?? null,
      poi_lng: centroid?.[1] ?? null,
      source_url: sourceUrl,
      last_updated: new Date().toISOString(),
      metadata: {
        province,
        status,
        marketProjectUrl: projectUrl,
      },
    });
  }
  return output;
}

async function fetchMarketRows(
  authority: QueueAuthority,
  sourceUrl: string
): Promise<QueueUpsertRow[]> {
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "konative-site/1.0 (queue-ingest)" },
  });
  if (!res.ok) throw new Error(`${authority} fetch failed: ${res.status}`);
  const content = await res.text();
  return parseMarkdownMarketRows(content, authority, sourceUrl);
}

export async function ingestAllAuthorities(client: SupabaseClient): Promise<QueueIngestSummary> {
  const [iesoRows, aesoRows, hqRows, bchRows] = await Promise.all([
    fetchIesoRows(),
    fetchMarketRows("AESO", AESO_LIST_URL),
    fetchMarketRows("HQ", HQ_LIST_URL),
    fetchMarketRows("BCH", BCH_LIST_URL),
  ]);

  const allRows = [...iesoRows, ...aesoRows, ...hqRows, ...bchRows];
  const { data, error } = await client
    .from("interconnection_queue")
    .upsert(allRows, { onConflict: "authority,source_id" })
    .select("authority");
  if (error) {
    throw new Error(`queue upsert failed: ${error.message}`);
  }

  const authorities: Partial<Record<QueueAuthority, number>> = {};
  for (const row of data ?? []) {
    const authority = row.authority as QueueAuthority;
    authorities[authority] = (authorities[authority] ?? 0) + 1;
  }

  return {
    attempted: allRows.length,
    insertedOrUpdated: data?.length ?? 0,
    authorities,
  };
}

export function getQueueAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
