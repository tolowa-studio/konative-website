// Owned by Stream C (queue). Read by Stream B (map).
// See MULTIAGENT.md and the Notion plan.

export type QueueAuthority =
  | "IESO"
  | "AESO"
  | "HQ"
  | "BCH"
  | "PJM"
  | "MISO"
  | "ERCOT"
  | "CAISO"
  | "ISO-NE"
  | "NYISO";

export type QueueStudyPhase =
  | "application"
  | "feasibility"
  | "system_impact"
  | "facilities"
  | "agreement_signed"
  | "construction"
  | "in_service"
  | "withdrawn";

export type QueueResourceType =
  | "load"
  | "gas"
  | "wind"
  | "solar"
  | "hydro"
  | "nuclear"
  | "battery"
  | "hybrid"
  | "other";

export interface InterconnectionQueueRow {
  id: string;
  authority: QueueAuthority;
  projectName: string;
  capacityMw: number;
  resourceType: QueueResourceType;
  studyPhase: QueueStudyPhase;
  queueDate: string; // ISO date
  expectedCod: string | null; // ISO date
  poiName: string | null;
  poiLat: number | null;
  poiLng: number | null;
  sourceUrl: string;
  lastUpdated: string; // ISO date
}

export interface QueueRadiusResponse {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  totalMw: number;
  countByAuthority: Partial<Record<QueueAuthority, number>>;
  medianYearsToCod: number | null;
  rows: InterconnectionQueueRow[];
}
