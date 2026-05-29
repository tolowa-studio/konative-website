import type { SanityClient } from '@sanity/client'
import { ingestAllAuthorities, getQueueAdminClient } from './queue/ingest'
import { queueRowToRawProject } from '../src/lib/queueToProject'
import { getSanityWriteClient, upsertProject } from '../src/lib/projectIngestion'

export interface PromoteQueueSummary {
  queueAttempted: number
  queueUpserted: number
  promoted: number
  created: number
  updated: number
  skipped: number
}

export async function promoteCanadaQueueToSanity(
  supabase = getQueueAdminClient(),
  sanity: SanityClient = getSanityWriteClient(),
): Promise<PromoteQueueSummary> {
  const queueSummary = await ingestAllAuthorities(supabase)

  const { data: queueRows, error } = await supabase
    .from('interconnection_queue')
    .select(
      'authority,source_id,project_name,capacity_mw,resource_type,study_phase,expected_cod,poi_lat,poi_lng,source_url,metadata',
    )
    .in('authority', ['IESO', 'AESO', 'HQ', 'BCH'])

  if (error) throw new Error(`queue read failed: ${error.message}`)

  let promoted = 0
  let created = 0
  let updated = 0
  let skipped = 0

  for (const row of queueRows ?? []) {
    const raw = queueRowToRawProject({
      authority: row.authority,
      source_id: row.source_id,
      project_name: row.project_name,
      capacity_mw: row.capacity_mw,
      resource_type: row.resource_type,
      study_phase: row.study_phase,
      expected_cod: row.expected_cod,
      poi_lat: row.poi_lat,
      poi_lng: row.poi_lng,
      source_url: row.source_url,
      metadata: row.metadata ?? {},
    })
    if (!raw) continue
    promoted++
    const result = await upsertProject(sanity, raw)
    if (result === 'created') created++
    else if (result === 'updated') updated++
    else skipped++
  }

  return {
    queueAttempted: queueSummary.attempted,
    queueUpserted: queueSummary.insertedOrUpdated,
    promoted,
    created,
    updated,
    skipped,
  }
}
