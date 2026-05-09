/**
 * GET /api/v1/governor-data?type=governors|stalled-projects|tribal-projects|all
 *
 * Returns GeoJSON FeatureCollections backing the /governors map page:
 *   - governors        : Sanity `governor` docs (capital city points)
 *   - stalled-projects : Sanity `dataCenterProject` filtered to stalled/canceled/paused/blocked
 *   - tribal-projects  : Sanity `tribalProject` docs (US + Canada tribal/First Nations)
 *
 * Properties on each feature carry everything the sidebar needs (no second fetch).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSanity } from "@sanity/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sanity = createSanity({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

type FC = GeoJSON.FeatureCollection<GeoJSON.Point>;

function point(lng: number, lat: number): GeoJSON.Point {
  return { type: "Point", coordinates: [lng, lat] };
}

function fc(features: GeoJSON.Feature<GeoJSON.Point>[]): FC {
  return { type: "FeatureCollection", features };
}

interface GovernorRow {
  _id: string;
  state: string;
  stateName?: string;
  name: string;
  party?: string;
  termEnds?: string;
  capitalCity?: string;
  capitalLocation: { lat: number; lng: number };
  ngaRole?: string;
  ngaInitiative?: string;
  dcPolicyNotes?: string;
  priority?: number;
  sources?: string[];
}

async function fetchGovernors(): Promise<FC> {
  const rows = await sanity.fetch<GovernorRow[]>(
    `*[_type == "governor" && defined(capitalLocation)] | order(coalesce(priority, 100) asc){
      _id, state, stateName, name, party, termEnds,
      capitalCity, capitalLocation,
      ngaRole, ngaInitiative, dcPolicyNotes, priority, sources
    }`,
  );
  const features = rows.map((g) => ({
    type: "Feature" as const,
    geometry: point(g.capitalLocation.lng, g.capitalLocation.lat),
    properties: {
      layer: "governors",
      id: g._id,
      state: g.state,
      stateName: g.stateName ?? "",
      name: g.name,
      party: g.party ?? "",
      termEnds: g.termEnds ?? "",
      capitalCity: g.capitalCity ?? "",
      ngaRole: g.ngaRole ?? "",
      ngaInitiative: g.ngaInitiative ?? "",
      dcPolicyNotes: g.dcPolicyNotes ?? "",
      sources: g.sources ?? [],
    },
  }));
  return fc(features);
}

interface ProjectRow {
  _id: string;
  name: string;
  operator?: string;
  location: { lat: number; lng: number };
  city?: string;
  state?: string;
  country?: string;
  status: string;
  capacityMw?: number;
  blockReason?: string;
  blockReasonDetail?: string;
  ownerFunder?: string;
  relatedSources?: string[];
  stalledAt?: string;
  sourceUrl?: string;
}

async function fetchStalledProjects(): Promise<FC> {
  const rows = await sanity.fetch<ProjectRow[]>(
    `*[_type == "dataCenterProject" && defined(location) && status in ["stalled","canceled","paused","blocked"]]{
      _id, name, operator, location, city, state, country,
      status, capacityMw,
      blockReason, blockReasonDetail, ownerFunder, relatedSources, stalledAt, sourceUrl
    }`,
  );
  const features = rows.map((p) => ({
    type: "Feature" as const,
    geometry: point(p.location.lng, p.location.lat),
    properties: {
      layer: "stalled-projects",
      id: p._id,
      name: p.name,
      operator: p.operator ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country ?? "US",
      status: p.status,
      mw: p.capacityMw ?? null,
      blockReason: p.blockReason ?? "",
      blockReasonDetail: p.blockReasonDetail ?? "",
      ownerFunder: p.ownerFunder ?? "",
      relatedSources: p.relatedSources ?? [],
      stalledAt: p.stalledAt ?? null,
      sourceUrl: p.sourceUrl ?? "",
    },
  }));
  return fc(features);
}

interface TribalRow {
  _id: string;
  name: string;
  tribe: string;
  location: { lat: number; lng: number };
  city?: string;
  state?: string;
  country: "US" | "CA";
  tribalStatus: string;
  partnerStructure?: string;
  landType?: string;
  opportunityClass?: string;
  capacityMw?: number;
  partner?: string;
  summary?: string;
  voteOrDate?: string;
  sources?: string[];
  priority?: number;
  // contactPath intentionally NOT exposed to client.
}

async function fetchTribalProjects(): Promise<FC> {
  const rows = await sanity.fetch<TribalRow[]>(
    `*[_type == "tribalProject" && defined(location)] | order(coalesce(priority, 100) asc){
      _id, name, tribe, location, city, state, country,
      tribalStatus, partnerStructure, landType, opportunityClass,
      capacityMw, partner, summary, voteOrDate, sources, priority
    }`,
  );
  const features = rows.map((p) => ({
    type: "Feature" as const,
    geometry: point(p.location.lng, p.location.lat),
    properties: {
      layer: "tribal-projects",
      id: p._id,
      name: p.name,
      tribe: p.tribe,
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country,
      tribalStatus: p.tribalStatus,
      partnerStructure: p.partnerStructure ?? "",
      landType: p.landType ?? "",
      opportunityClass: p.opportunityClass ?? "",
      mw: p.capacityMw ?? null,
      partner: p.partner ?? "",
      summary: p.summary ?? "",
      voteOrDate: p.voteOrDate ?? "",
      sources: p.sources ?? [],
    },
  }));
  return fc(features);
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "all";

  try {
    if (type === "governors") {
      return NextResponse.json(await fetchGovernors());
    }
    if (type === "stalled-projects") {
      return NextResponse.json(await fetchStalledProjects());
    }
    if (type === "tribal-projects") {
      return NextResponse.json(await fetchTribalProjects());
    }
    const [governors, stalled, tribal] = await Promise.all([
      fetchGovernors(),
      fetchStalledProjects(),
      fetchTribalProjects(),
    ]);
    return NextResponse.json({
      type: "FeatureCollection",
      features: [
        ...governors.features,
        ...stalled.features,
        ...tribal.features,
      ],
      counts: {
        governors: governors.features.length,
        stalledProjects: stalled.features.length,
        tribalProjects: tribal.features.length,
        total:
          governors.features.length +
          stalled.features.length +
          tribal.features.length,
      },
    });
  } catch (e) {
    console.error("governor-data error", e);
    return NextResponse.json(fc([]), { status: 200 });
  }
}
