/**
 * Normalize provinceCode on existing Canadian Sanity records.
 *
 * Run: cd web && npx tsx --env-file=.env.local scripts/migrate-province-codes.ts
 */
import { getSanityWriteClient } from '../src/lib/projectIngestion'
import { normalizeProvinceCode, provinceCodeToName } from '../src/lib/canadaProvinces'

interface CaDoc {
  _id: string
  state?: string
  provinceCode?: string
}

;(async () => {
  const client = getSanityWriteClient()
  const rows: CaDoc[] = await client.fetch(
    `*[_type == "dataCenterProject" && country == "CA"]{ _id, state, provinceCode }`,
  )

  let patched = 0
  for (const row of rows) {
    const code = normalizeProvinceCode(row.provinceCode) ?? normalizeProvinceCode(row.state)
    if (!code) continue
    const patch: Record<string, string> = { provinceCode: code, state: provinceCodeToName(code) }
    await client.patch(row._id).set(patch).commit()
    patched++
  }

  console.log(`Patched ${patched} / ${rows.length} Canadian records`)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
