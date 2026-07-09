import { getD1 } from "@/lib/db/cloudflare";

export interface SponsorshipPlacementRow {
  id: string;
  sponsor_name: string;
  logo_url: string | null;
  tagline: string | null;
  cta_url: string | null;
  cta_text: string | null;
  placement_type: string;
  is_active?: number | boolean;
  start_date?: string | null;
  end_date?: string | null;
  impressions?: number | null;
  clicks?: number | null;
}

export interface SponsorshipAnalyticsFilters {
  sponsorName?: string;
  fromDate?: string;
  toDate?: string;
}

export async function queryActiveSponsorshipPlacement(
  placementType: string,
): Promise<SponsorshipPlacementRow | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const now = new Date().toISOString();
    return await db
      .prepare(
        `SELECT id, sponsor_name, logo_url, tagline, cta_url, cta_text, placement_type
         FROM sponsorship_placements
         WHERE is_active = 1
           AND placement_type = ?
           AND (start_date IS NULL OR start_date <= ?)
           AND (end_date IS NULL OR end_date >= ?)
         LIMIT 1`,
      )
      .bind(placementType, now, now)
      .first<SponsorshipPlacementRow>();
  } catch {
    return null;
  }
}

export async function querySponsorshipPlacements(
  filters: SponsorshipAnalyticsFilters = {},
): Promise<SponsorshipPlacementRow[] | null> {
  const db = getD1();
  if (!db) return null;
  try {
    const conditions: string[] = [];
    const binds: string[] = [];

    if (filters.sponsorName) {
      conditions.push("sponsor_name LIKE ?");
      binds.push(`%${filters.sponsorName}%`);
    }
    if (filters.fromDate) {
      conditions.push("start_date >= ?");
      binds.push(filters.fromDate);
    }
    if (filters.toDate) {
      conditions.push("end_date <= ?");
      binds.push(filters.toDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { results } = await db
      .prepare(
        `SELECT id, sponsor_name, placement_type, start_date, end_date, impressions, clicks, is_active
         FROM sponsorship_placements
         ${where}
         ORDER BY start_date DESC`,
      )
      .bind(...binds)
      .all<SponsorshipPlacementRow>();
    return results ?? [];
  } catch {
    return null;
  }
}
