import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const QUERY = `[out:json][timeout:180];
(
  area["ISO3166-1"="US"][admin_level=2];
  area["ISO3166-1"="CA"][admin_level=2];
)->.searchArea;
(
  nwr["telecom"="data_center"](area.searchArea);
  nwr["building"="data_center"](area.searchArea);
  nwr["man_made"="data_center"](area.searchArea);
);
out center tags;`

interface OsmElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'konative-site/1.0 (deals@konative.com)',
      },
      body: 'data=' + encodeURIComponent(QUERY),
    })

    if (!res.ok) throw new Error(`Overpass returned ${res.status}`)
    const data = await res.json()
    const elements = data.elements as OsmElement[]

    const client = getSanityWriteClient()
    let created = 0, updated = 0, skipped = 0, errored = 0

    for (const el of elements) {
      try {
        const lat = el.lat ?? el.center?.lat
        const lng = el.lon ?? el.center?.lon
        if (!lat || !lng) continue

        const name = el.tags.name || el.tags['name:en'] || el.tags.operator
        if (!name) continue

        // Rough country determination from coordinates
        const country: 'US' | 'CA' = lat > 49 && lng < -50 ? 'CA' : 'US'

        const raw: RawProject = {
          name,
          operator: el.tags.operator,
          lat,
          lng,
          city: el.tags['addr:city'],
          state: el.tags['addr:state'] || el.tags['addr:province'],
          country,
          status: 'operational',
          capacityMw: el.tags['power:rating'] ? parseFloat(el.tags['power:rating']) : undefined,
          source: 'osm',
          sourceId: `${el.type}/${el.id}`,
          sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
          extractionConfidence: 1.0,
        }

        const result = await upsertProject(client, raw)
        if (result === 'created') created++
        else if (result === 'updated') updated++
        else skipped++
      } catch (err) {
        errored++
        console.error('OSM upsert error:', err)
      }
    }

    return NextResponse.json({
      ok: true,
      total: elements.length,
      created, updated, skipped, errored,
    })
  } catch (err) {
    console.error('OSM ingest error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
