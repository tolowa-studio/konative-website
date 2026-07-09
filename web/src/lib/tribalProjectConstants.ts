export type TribalStatus =
  | "operating"
  | "approved"
  | "feasibility"
  | "opposition"
  | "moratorium"
  | "stranded-coal";

export type InterconnectTier = "A" | "B" | "C" | "D";

/** Research-derived interconnect tiers (Phase 2 will move into Sanity schema). */
export const INTERCONNECT_TIER_BY_SLUG: Record<string, InterconnectTier> = {
  "navajo-ngs-kayenta": "B",
  "crow-westmoreland-colstrip": "C",
  "hopi-kayenta": "C",
  "sault-ste-marie-innova": "C",
  "seminole-nation-startup": "C",
  "muscogee-creek-mvskoke-tech-park": "B",
  "ebci-cherokee-nc": "C",
  "woodland-cree-mihta-askiy": "B",
  "upper-nicola-bell-itel": "B",
  "prophet-river-abct": "C",
  "george-gordon-bell-regina": "B",
  "navajo-innava": "A",
  "potawatomi-data-holdings": "A",
  "choctaw-hq": "B",
  "northern-arapaho-wind-river": "C",
  "cherokee-nation-task-force": "B",
  "saint-regis-mohawk-massena": "B",
  "pokagon-dowagiac": "B",
  "yakama-wa-tax-incentive": "C",
  "sturgeon-lake-wonder-valley": "B",
  "colusa-amphix-strata": "A",
  "wiikwemkoong-sovereign-dc": "B",
  "malahat-dmg-ai": "B",
  "ntua-shiprock-dc": "A",
  "lion-point-san-juan-hub": "B",
  "colville-microgrids-future": "C",
  "ute-mountain-foxtail-meta": "B",
  "hoopa-tbcp-modular-dc": "B",
  "cheyenne-river-biodata": "C",
  "srpmic-heritage-dc": "A",
  "quantica-big-sky-northern-cheyenne": "C",
  "stamp-double-reed-seneca": "B",
  "google-project-spring-osage": "B",
  "tohono-oodham-watershed": "B",
};

export const TRIBAL_STATUS_LABELS: Record<TribalStatus, string> = {
  operating: "Operating",
  approved: "Approved / construction",
  feasibility: "Feasibility study",
  opposition: "Active opposition",
  moratorium: "Moratorium",
  "stranded-coal": "Stranded coal infra",
};

export const INTERCONNECT_TIER_LABELS: Record<InterconnectTier, string> = {
  A: "Tier A — trunk fiber / multi-carrier",
  B: "Tier B — grid + regional fiber",
  C: "Tier C — remote / build required",
  D: "Tier D — high lateral cost",
};

export const OPPORTUNITY_CLASS_LABELS: Record<string, string> = {
  "class-1": "Class 1 — stranded infra",
  "class-2": "Class 2 — orphaned developer",
  "class-3": "Class 3 — Canada approved",
  context: "Context",
};

export function getInterconnectTier(slug: string): InterconnectTier {
  return INTERCONNECT_TIER_BY_SLUG[slug] ?? "C";
}

export function slugFromTribalProjectId(id: string): string {
  return id.startsWith("tribalProject.") ? id.slice("tribalProject.".length) : id;
}
