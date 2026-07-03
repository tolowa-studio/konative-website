import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SPARQL_URL = 'https://query.wikidata.org/sparql'

// Q671224 = data center (verified). Direct instance-of only — no P279* traversal (too slow).
const QUERY = `SELECT ?item ?itemLabel ?coord ?operatorLabel ?country WHERE {
  ?item wdt:P31 wd:Q671224 .
  ?item wdt:P17 ?country .
  VALUES ?country { wd:Q30 wd:Q16 }
  OPTIONAL { ?item wdt:P625 ?coord. }
  OPTIONAL { ?item wdt:P137 ?operator. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`

interface WdBinding {
  item: { value: string }
  itemLabel: { value: string }
  coord?: { value: string }
  operatorLabel?: { value: string }
  country: { value: string }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = `${SPARQL_URL}?format=json&query=${encodeURIComponent(QUERY)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'konative-site/1.0 (deals@konative.com)',
      },
    })

    if (!res.ok) throw new Error(`Wikidata returned ${res.status}`)
    const data = await res.json()
    const bindings = data.results.bindings as WdBinding[]

    const client = getSanityWriteClient()
    let created = 0, updated = 0, skipped = 0

    for (const b of bindings) {
      if (!b.coord?.value) continue
      const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value)
      if (!m) continue
      const lng = parseFloat(m[1])
      const lat = parseFloat(m[2])
      const qid = b.item.value.split('/').pop()!
      const country = b.country.value.includes('Q30') ? 'US' : 'CA'

      const raw: RawProject = {
        name: b.itemLabel.value,
        operator: b.operatorLabel?.value,
        lat, lng,
        country,
        status: 'operational',
        source: 'wikidata',
        sourceId: qid,
        sourceUrl: b.item.value,
        extractionConfidence: 1.0,
      }

      const result = await upsertProject(client, raw)
      if (result === 'created') created++
      else if (result === 'updated') updated++
      else skipped++
    }

    return NextResponse.json({
      ok: true, total: bindings.length, created, updated, skipped,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
