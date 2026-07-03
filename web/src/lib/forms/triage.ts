/**
 * Inquiry triage: scores, tiers, lanes, and routes every inbound form
 * submission so the team can prioritize responses.
 *
 * The rubric is intentionally transparent and rule-based (no ML, no LLM) so it
 * is fully testable and tunable. All weights live in {@link TRIAGE_RUBRIC}.
 *
 * `scoreInquiry` is a PURE function and must NEVER throw — partial or malformed
 * input degrades gracefully to a low score rather than blocking a submission.
 */

export type TriageTier = "hot" | "warm" | "cold";
export type TriageLane = "tribal" | "datacenter" | "general";
export type TriageRoute = "tribal-desk" | "datacenter-desk" | "general-desk";

export interface TriageResult {
  score: number; // 0-100
  tier: TriageTier;
  lane: TriageLane;
  routeTo: TriageRoute;
  reasons: string[];
  slaHours: number;
}

/** Normalized inquiry passed to {@link scoreInquiry}. */
export interface TriageInput {
  /** Sanity `_type` of the doc, e.g. "contactInquiry", "capacityRequest". */
  schemaType?: string;
  /** Arbitrary form fields (name, email, organization, message, etc.). */
  fields?: Record<string, unknown>;
}

/**
 * Tunable scoring rubric. Every weight and threshold that drives triage lives
 * here so the rules can be adjusted without touching scoring logic. Points are
 * additive and the total is capped to [0, 100].
 */
export const TRIAGE_RUBRIC = {
  points: {
    /** Identifiable org / company name present. */
    org: 15,
    /** Business email (not a free webmail provider). */
    businessEmail: 15,
    /** Phone number present. */
    phone: 10,
    /** Lane is tribal or datacenter (i.e. not "general"). */
    lanedInquiry: 15,
    /** Explicit capacity (MW) or deal-size / timeline signal. */
    dealSignal: 15,
    /** Message / notes longer & more specific than this many chars. */
    detailedMessage: 10,
    /** NTIA / TBCP / Round 3 / BEAD / grant mention — priority campaign. */
    grantCampaign: 20,
  },
  /** Message length (chars) above which the detail bonus applies. */
  detailedMessageMinChars: 120,
  /** Tier cutoffs, inclusive lower bounds. */
  tier: {
    hot: 65,
    warm: 35,
  },
  /** SLA response windows per tier, in hours. */
  sla: {
    hot: 4,
    warm: 24,
    cold: 72,
  },
  /** Free-webmail domains that do NOT count as a business email. */
  freeWebmailDomains: [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "aol.com",
    "icloud.com",
    "me.com",
    "live.com",
    "msn.com",
    "protonmail.com",
    "proton.me",
    "gmx.com",
    "mail.com",
    "yandex.com",
    "zoho.com",
  ],
  /** Substrings that mark an inquiry as the tribal lane. */
  tribalSignals: [
    "tribe",
    "tribal",
    "nation",
    "sovereign",
    "casino",
    "gaming",
    "tbcp",
    "first nations",
    "band",
    "reservation",
    "rancheria",
    "pueblo",
    "indigenous",
  ],
  /** Substrings that mark an inquiry as the datacenter lane. */
  datacenterSignals: [
    "datacenter",
    "data center",
    "data-center",
    "hyperscale",
    "colocation",
    "colo",
    "megawatt",
    "interconnect",
    "dci",
    "powered land",
    "powered-land",
  ],
  /** Substrings that mark the priority grant campaign. */
  grantSignals: [
    "ntia",
    "tbcp",
    "round 3",
    "round3",
    "bead",
    "grant",
  ],
} as const;

/** Schema types that inherently belong to the datacenter capacity lane. */
const DATACENTER_SCHEMA_TYPES = new Set(["capacityRequest"]);

const ROUTE_BY_LANE: Record<TriageLane, TriageRoute> = {
  tribal: "tribal-desk",
  datacenter: "datacenter-desk",
  general: "general-desk",
};

/** Lowercase every stringy value in the input into one searchable blob. */
function buildHaystack(input: TriageInput): string {
  const parts: string[] = [];
  if (input.schemaType) parts.push(input.schemaType);
  const fields = input.fields ?? {};
  for (const value of Object.values(fields)) {
    if (typeof value === "string") {
      parts.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") parts.push(item);
      }
    } else if (typeof value === "number") {
      parts.push(String(value));
    }
  }
  return parts.join("   ").toLowerCase();
}

function containsAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some(n => haystack.includes(n));
}

/** Detects a "MW" mention with a word boundary so it does not match "MWh"-free noise like "somewhere". */
function mentionsMegawatts(haystack: string): boolean {
  return /\bmw\b/.test(haystack) || haystack.includes("megawatt");
}

function firstString(fields: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = fields[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function firstNumber(fields: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const v = fields[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return undefined;
}

/** Detect the lane from schema type + signal keywords. Datacenter wins ties with tribal only when tribal is absent. */
function detectLane(schemaType: string | undefined, haystack: string): TriageLane {
  const isTribal = containsAny(haystack, TRIAGE_RUBRIC.tribalSignals);
  if (isTribal) return "tribal";

  const isDatacenterSchema = !!schemaType && DATACENTER_SCHEMA_TYPES.has(schemaType);
  const isDatacenterSignal =
    containsAny(haystack, TRIAGE_RUBRIC.datacenterSignals) || mentionsMegawatts(haystack);
  if (isDatacenterSchema || isDatacenterSignal) return "datacenter";

  return "general";
}

/**
 * Score a normalized inquiry. Pure, total, and non-throwing.
 */
export function scoreInquiry(input: TriageInput | null | undefined): TriageResult {
  const safeInput: TriageInput = input ?? {};
  const fields = safeInput.fields ?? {};
  const schemaType = typeof safeInput.schemaType === "string" ? safeInput.schemaType : undefined;

  const haystack = buildHaystack({ schemaType, fields });
  const { points } = TRIAGE_RUBRIC;
  const reasons: string[] = [];
  let score = 0;

  // --- Lane detection ---
  const lane = detectLane(schemaType, haystack);
  if (lane !== "general") {
    score += points.lanedInquiry;
    reasons.push(`Lane: ${lane} (+${points.lanedInquiry})`);
  } else {
    reasons.push("Lane: general (no lane bonus)");
  }

  // --- Identifiable org / company ---
  const org = firstString(fields, ["organization", "company", "firm", "org"]);
  if (org) {
    score += points.org;
    reasons.push(`Org present: "${org}" (+${points.org})`);
  }

  // --- Business vs free webmail ---
  const email = firstString(fields, ["email"]);
  if (email) {
    const domain = email.split("@")[1]?.toLowerCase().trim() ?? "";
    if (domain && !TRIAGE_RUBRIC.freeWebmailDomains.includes(domain as never)) {
      score += points.businessEmail;
      reasons.push(`Business email (@${domain}) (+${points.businessEmail})`);
    } else if (domain) {
      reasons.push(`Free webmail (@${domain}) (no bonus)`);
    }
  }

  // --- Phone ---
  const phone = firstString(fields, ["phone"]);
  if (phone) {
    score += points.phone;
    reasons.push(`Phone present (+${points.phone})`);
  }

  // --- Deal-size / capacity / timeline signal ---
  const mw =
    firstNumber(fields, ["mwRequired", "capacity_mw", "capacityMw", "mw"]) ?? undefined;
  const hasTimeline = firstString(fields, [
    "timeline",
    "targetOnlineDate",
    "priceExpectation",
    "checkSize",
    "aumBand",
    "power_context",
  ]);
  const hasDealSignal =
    (typeof mw === "number" && mw > 0) || !!hasTimeline || mentionsMegawatts(haystack);
  if (hasDealSignal) {
    score += points.dealSignal;
    const label =
      typeof mw === "number" && mw > 0
        ? `${mw}MW`
        : hasTimeline || "MW mention";
    reasons.push(`Deal signal (${label}) (+${points.dealSignal})`);
  }

  // --- Message specificity ---
  const message = firstString(fields, [
    "message",
    "notes",
    "connectivityNeeds",
    "geographyPreferences",
    "power_context",
  ]);
  if (message.length > TRIAGE_RUBRIC.detailedMessageMinChars) {
    score += points.detailedMessage;
    reasons.push(
      `Detailed message (${message.length} chars) (+${points.detailedMessage})`,
    );
  }

  // --- Priority grant campaign ---
  if (containsAny(haystack, TRIAGE_RUBRIC.grantSignals)) {
    score += points.grantCampaign;
    reasons.push(`Grant campaign signal (NTIA/TBCP/BEAD/etc.) (+${points.grantCampaign})`);
  }

  // Cap 0-100
  score = Math.max(0, Math.min(100, score));

  // --- Tier ---
  let tier: TriageTier;
  if (score >= TRIAGE_RUBRIC.tier.hot) tier = "hot";
  else if (score >= TRIAGE_RUBRIC.tier.warm) tier = "warm";
  else tier = "cold";

  const slaHours = TRIAGE_RUBRIC.sla[tier];
  const routeTo = ROUTE_BY_LANE[lane];

  return { score, tier, lane, routeTo, reasons, slaHours };
}
