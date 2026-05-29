/**
 * QA gate for Canada datacenter dataset — local CSV + optional Sanity checks.
 *
 * Run: cd web && npx tsx scripts/verify-canada-dataset.ts
 * With Sanity: cd web && npx tsx --env-file=.env.local scripts/verify-canada-dataset.ts --sanity
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseCsv } from '../src/lib/parseCsv'
import { normalizeProvinceCode } from '../src/lib/canadaProvinces'
import { getSanityWriteClient } from '../src/lib/projectIngestion'

const RESEARCH_DIR = join(process.cwd(), 'data/canada-dc/research')
const checkSanity = process.argv.includes('--sanity')

interface CheckResult {
  name: string
  ok: boolean
  detail: string
}

function loadRollups(): Record<string, { operational_min?: number; operational_count?: number; pipeline_min?: number }> {
  return JSON.parse(readFileSync(join(RESEARCH_DIR, 'province-rollups.json'), 'utf8'))
}

function verifyCsv(): CheckResult[] {
  const facilities = parseCsv(readFileSync(join(RESEARCH_DIR, 'facilities.csv'), 'utf8'))
  const projects = parseCsv(readFileSync(join(RESEARCH_DIR, 'projects.csv'), 'utf8'))
  const rollups = loadRollups()
  const results: CheckResult[] = []

  const opByProvince: Record<string, number> = {}
  let missingProvince = 0
  let missingCoords = 0
  const sourceIds = new Set<string>()

  for (const row of facilities) {
    const code = normalizeProvinceCode(row.province_code)
    if (!code) missingProvince++
    else opByProvince[code] = (opByProvince[code] ?? 0) + 1
    if (!row.lat || !row.lng) missingCoords++
    if (sourceIds.has(row.source_id)) {
      results.push({ name: `duplicate source_id ${row.source_id}`, ok: false, detail: 'facilities.csv' })
    }
    sourceIds.add(row.source_id)
  }

  const stalledStatuses = new Set(['stalled', 'blocked', 'paused', 'canceled'])
  let stalledCount = 0
  for (const row of projects) {
    if (stalledStatuses.has(row.status)) stalledCount++
    if (sourceIds.has(row.source_id)) {
      results.push({ name: `duplicate source_id ${row.source_id}`, ok: false, detail: 'cross-file duplicate' })
    }
    sourceIds.add(row.source_id)
  }

  results.push({
    name: 'facilities.csv row count',
    ok: facilities.length >= 100,
    detail: `${facilities.length} rows (target ≥100)`,
  })

  results.push({
    name: 'projects.csv row count',
    ok: projects.length >= 25,
    detail: `${projects.length} rows (target ≥25)`,
  })

  results.push({
    name: 'operational missing province',
    ok: missingProvince === 0,
    detail: String(missingProvince),
  })

  results.push({
    name: 'operational missing coords',
    ok: missingCoords === 0,
    detail: String(missingCoords),
  })

  results.push({
    name: 'stalled/blocked/paused count',
    ok: stalledCount >= 10,
    detail: String(stalledCount),
  })

  for (const [code, rollup] of Object.entries(rollups)) {
    const count = opByProvince[code] ?? 0
    const min = rollup.operational_min ?? rollup.operational_count ?? 0
    if (min > 0) {
      results.push({
        name: `${code} operational ≥ ${min}`,
        ok: count >= min,
        detail: `${count} found`,
      })
    }
  }

  return results
}

async function verifySanity(): Promise<CheckResult[]> {
  const client = getSanityWriteClient()
  const stats = await client.fetch(`{
    "total": count(*[_type == "dataCenterProject" && country == "CA"]),
    "operational": count(*[_type == "dataCenterProject" && country == "CA" && status == "operational"]),
    "pipeline": count(*[_type == "dataCenterProject" && country == "CA" && status in ["announced","construction"]]),
    "stalled": count(*[_type == "dataCenterProject" && country == "CA" && status in ["stalled","blocked","paused","canceled"]]),
    "missingProvince": count(*[_type == "dataCenterProject" && country == "CA" && !defined(provinceCode)])
  }`)

  return [
    { name: 'Sanity CA total', ok: stats.total >= 100, detail: String(stats.total) },
    { name: 'Sanity CA operational', ok: stats.operational >= 100, detail: String(stats.operational) },
    { name: 'Sanity CA pipeline', ok: stats.pipeline >= 20, detail: String(stats.pipeline) },
    { name: 'Sanity CA stalled layer', ok: stats.stalled >= 10, detail: String(stats.stalled) },
    { name: 'Sanity missing provinceCode', ok: stats.missingProvince === 0, detail: String(stats.missingProvince) },
  ]
}

async function main() {
  const results = verifyCsv()
  if (checkSanity) {
    if (!process.env.SANITY_API_TOKEN) {
      console.error('SANITY_API_TOKEN required for --sanity checks')
      process.exit(1)
    }
    results.push(...(await verifySanity()))
  }

  let failed = 0
  for (const r of results) {
    const mark = r.ok ? 'PASS' : 'FAIL'
    console.log(`[${mark}] ${r.name}: ${r.detail}`)
    if (!r.ok) failed++
  }

  if (failed > 0) {
    console.error(`\n${failed} check(s) failed`)
    process.exit(1)
  }
  console.log('\nAll checks passed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
