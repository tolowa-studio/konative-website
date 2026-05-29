import type { CaProvinceCode } from './canadaProvinces'
import type { ProjectSource, ProjectStatus, RawProject } from './projectIngestion'

export type QueueAuthority = 'IESO' | 'AESO' | 'HQ' | 'BCH'

export type QueueStudyPhase =
  | 'application'
  | 'feasibility'
  | 'system_impact'
  | 'facilities'
  | 'agreement_signed'
  | 'construction'
  | 'in_service'
  | 'withdrawn'

export interface QueueRow {
  authority: QueueAuthority
  source_id: string
  project_name: string
  capacity_mw: number
  resource_type: string
  study_phase: QueueStudyPhase
  expected_cod: string | null
  poi_lat: number | null
  poi_lng: number | null
  source_url: string
  metadata?: Record<string, unknown>
}

const AUTHORITY_SOURCE: Record<QueueAuthority, ProjectSource> = {
  IESO: 'ieso_queue',
  AESO: 'aeso_queue',
  HQ: 'hq_queue',
  BCH: 'bch_queue',
}

const AUTHORITY_PROVINCE: Record<QueueAuthority, CaProvinceCode> = {
  IESO: 'ON',
  AESO: 'AB',
  HQ: 'QC',
  BCH: 'BC',
}

export function isLikelyDataCenterLoad(row: Pick<QueueRow, 'project_name' | 'resource_type' | 'capacity_mw'>): boolean {
  const name = row.project_name.toLowerCase()
  if (name.includes('data centre') || name.includes('data center') || name.includes('datacenter')) return true
  if (name.includes('ai ') || name.includes('hyperscale') || name.includes('hpc')) return true
  if (row.resource_type === 'load' && row.capacity_mw >= 20) return true
  return false
}

export function mapQueuePhaseToStatus(phase: QueueStudyPhase): ProjectStatus {
  switch (phase) {
    case 'in_service':
      return 'operational'
    case 'construction':
    case 'agreement_signed':
      return 'construction'
    case 'withdrawn':
      return 'canceled'
    default:
      return 'announced'
  }
}

export function queueRowToRawProject(row: QueueRow): RawProject | null {
  if (!isLikelyDataCenterLoad(row)) return null
  if (row.poi_lat == null || row.poi_lng == null) return null

  const provinceCode = AUTHORITY_PROVINCE[row.authority]
  return {
    name: row.project_name,
    lat: row.poi_lat,
    lng: row.poi_lng,
    provinceCode,
    state: provinceCode,
    country: 'CA',
    status: mapQueuePhaseToStatus(row.study_phase),
    capacityMw: row.capacity_mw || undefined,
    expectedOnlineDate: row.expected_cod ?? undefined,
    source: AUTHORITY_SOURCE[row.authority],
    sourceId: `${row.authority.toLowerCase()}_${row.source_id}`,
    sourceUrl: row.source_url,
    extractionConfidence: 0.65,
  }
}
