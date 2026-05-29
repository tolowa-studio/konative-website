/**
 * Load curated Canada datacenter research CSVs into Sanity.
 *
 * Run: cd web && npx tsx --env-file=.env.local scripts/seed-canada-dc.ts
 * Dry: cd web && npx tsx scripts/seed-canada-dc.ts --dry-run
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseCsv } from '../src/lib/parseCsv'
import {
  getSanityWriteClient,
  upsertProject,
  type BlockReason,
  type ProjectStatus,
  type RawProject,
} from '../src/lib/projectIngestion'
import { isDuplicateProject } from '../src/lib/dedupeProjects'
import { normalizeProvinceCode, provinceCodeToName, type CaProvinceCode } from '../src/lib/canadaProvinces'

const RESEARCH_DIR = join(process.cwd(), 'data/canada-dc/research')
const SKIP_SOURCE_IDS = new Set(['cyxtera-yvr1-legacy'])
const dryRun = process.argv.includes('--dry-run')

function num(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : undefined
}

function rowToRaw(row: Record<string, string>, kind: 'facility' | 'project'): RawProject | null {
  const sourceId = row.source_id?.trim()
  if (!sourceId || SKIP_SOURCE_IDS.has(sourceId)) return null

  const provinceCode = normalizeProvinceCode(row.province_code) as CaProvinceCode | null
  if (!provinceCode) {
    console.warn(`  skip ${sourceId}: invalid province ${row.province_code}`)
    return null
  }

  const lat = num(row.lat)
  const lng = num(row.lng)
  if (lat == null || lng == null) {
    console.warn(`  skip ${sourceId}: missing coords`)
    return null
  }

  const status = (row.status || 'operational') as ProjectStatus
  const blockReason = (row.block_reason || undefined) as BlockReason | undefined

  return {
    name: row.name,
    operator: row.operator || undefined,
    city: row.city || undefined,
    lat,
    lng,
    provinceCode,
    state: provinceCodeToName(provinceCode),
    country: 'CA',
    status,
    capacityMw: num(row.capacity_mw),
    expectedOnlineDate: row.expected_online_date || undefined,
    blockReason,
    blockReasonDetail: row.block_reason_detail || undefined,
    source: 'manual',
    sourceId,
    sourceUrl: row.source_url || undefined,
    extractionConfidence: kind === 'facility' ? 1.0 : 0.95,
  }
}

async function main() {
  const facilities = parseCsv(readFileSync(join(RESEARCH_DIR, 'facilities.csv'), 'utf8'))
  const projects = parseCsv(readFileSync(join(RESEARCH_DIR, 'projects.csv'), 'utf8'))

  const allRows: RawProject[] = []
  for (const row of facilities) {
    const raw = rowToRaw(row, 'facility')
    if (raw) allRows.push(raw)
  }
  for (const row of projects) {
    const raw = rowToRaw(row, 'project')
    if (raw) allRows.push(raw)
  }

  const deduped: RawProject[] = []
  for (const candidate of allRows) {
    const dup = deduped.some((existing) =>
      isDuplicateProject(
        { name: existing.name, operator: existing.operator, lat: existing.lat, lng: existing.lng },
        { name: candidate.name, operator: candidate.operator, lat: candidate.lat, lng: candidate.lng },
      ),
    )
    if (!dup) deduped.push(candidate)
  }

  console.log(`Parsed ${facilities.length} facilities + ${projects.length} projects → ${deduped.length} unique records`)

  if (dryRun) {
    const byProvince: Record<string, number> = {}
    for (const r of deduped) {
      const code = r.provinceCode ?? '??'
      byProvince[code] = (byProvince[code] ?? 0) + 1
    }
    console.log('By province:', byProvince)
    return
  }

  const client = getSanityWriteClient()
  let created = 0
  let updated = 0
  let skipped = 0

  for (const raw of deduped) {
    const result = await upsertProject(client, raw)
    if (result === 'created') created++
    else if (result === 'updated') updated++
    else skipped++
  }

  console.log(`Done — created:${created} updated:${updated} skipped:${skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
