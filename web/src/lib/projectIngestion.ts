import { createClient, type SanityClient } from '@sanity/client'
import {
  provinceCodeToName,
  resolveCanadianProvince,
  type CaProvinceCode,
} from './canadaProvinces'

export function getSanityWriteClient(): SanityClient {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  })
}

export type ProjectStatus =
  | 'operational'
  | 'construction'
  | 'announced'
  | 'stalled'
  | 'canceled'
  | 'paused'
  | 'blocked'

export type ProjectSource =
  | 'osm'
  | 'wikidata'
  | 'news_extraction'
  | 'ieso_queue'
  | 'aeso_queue'
  | 'hq_queue'
  | 'bch_queue'
  | 'peeringdb'
  | 'manual'

export type BlockReason =
  | 'water'
  | 'power'
  | 'community'
  | 'permits'
  | 'financing'
  | 'litigation'
  | 'regulation'
  | 'other'

export interface RawProject {
  name: string
  operator?: string
  lat: number
  lng: number
  city?: string
  state?: string
  provinceCode?: CaProvinceCode
  country: 'US' | 'CA'
  status: ProjectStatus
  capacityMw?: number
  announcedDate?: string
  expectedOnlineDate?: string
  blockReason?: BlockReason
  blockReasonDetail?: string
  relatedSources?: string[]
  source: ProjectSource
  sourceId: string
  sourceUrl?: string
  extractionConfidence: number
}

function makeDocId(p: RawProject): string {
  return `dcProject.${p.source}.${p.sourceId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

function enrichCanadianFields(raw: RawProject): RawProject {
  if (raw.country !== 'CA') return raw
  const code = resolveCanadianProvince(raw.provinceCode, raw.state)
  if (!code) return raw
  return {
    ...raw,
    provinceCode: code,
    state: provinceCodeToName(code),
  }
}

/**
 * Upsert one project. Returns 'created' | 'updated' | 'skipped'.
 * Skipped if a manually verified record exists (don't overwrite human curation).
 */
export async function upsertProject(
  client: SanityClient,
  rawInput: RawProject,
): Promise<'created' | 'updated' | 'skipped'> {
  const raw = enrichCanadianFields(rawInput)
  const docId = makeDocId(raw)
  const existing = await client.getDocument(docId)
  if (existing && existing.verified) return 'skipped'

  const doc = {
    _id: docId,
    _type: 'dataCenterProject' as const,
    name: raw.name,
    operator: raw.operator,
    location: { _type: 'geopoint' as const, lat: raw.lat, lng: raw.lng },
    city: raw.city,
    state: raw.state,
    country: raw.country,
    status: raw.status,
    capacityMw: raw.capacityMw,
    announcedDate: raw.announcedDate,
    expectedOnlineDate: raw.expectedOnlineDate,
    blockReason: raw.blockReason,
    blockReasonDetail: raw.blockReasonDetail,
    relatedSources: raw.relatedSources,
    source: raw.source,
    sourceId: raw.sourceId,
    sourceUrl: raw.sourceUrl,
    extractionConfidence: raw.extractionConfidence,
    lastSeenAt: new Date().toISOString(),
    ...(raw.provinceCode ? { provinceCode: raw.provinceCode } : {}),
  }

  await client.createOrReplace(doc)
  return existing ? 'updated' : 'created'
}
