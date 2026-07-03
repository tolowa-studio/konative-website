import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'
import { extractProjects } from '@/lib/projectExtraction'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function geocode(city?: string, state?: string, country?: string): Promise<{ lat: number; lng: number } | null> {
  if (!city && !state) return null
  const q = [city, state, country === 'US' ? 'USA' : 'Canada'].filter(Boolean).join(', ')
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'konative-site/1.0 (deals@konative.com)' } }
    )
    if (!res.ok) return null
    const arr = await res.json()
    if (!arr.length) return null
    return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = getSanityWriteClient()

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const articles = await client.fetch(
    `*[_type == "newsItem" && publishedAt > $since && !defined(extractedAt)] | order(publishedAt desc)[0...50]{
      _id, title, summary, url
    }`,
    { since: since.toISOString() }
  )

  let processed = 0, created = 0, lowConfidenceSkipped = 0

  for (const article of articles) {
    const extractions = await extractProjects(article)

    for (const proj of extractions) {
      if (proj.confidence < 0.6) {
        lowConfidenceSkipped++
        continue
      }

      const coords = await geocode(proj.city, proj.state, proj.country)
      if (!coords) continue

      const raw: RawProject = {
        name: proj.name,
        operator: proj.operator,
        lat: coords.lat,
        lng: coords.lng,
        city: proj.city,
        state: proj.state,
        country: proj.country,
        status: proj.status,
        capacityMw: proj.capacityMw,
        source: 'news_extraction',
        sourceId: `${article._id}.${proj.name.replace(/\s+/g, '_').slice(0, 40)}`,
        sourceUrl: article.url,
        extractionConfidence: proj.confidence,
      }

      const result = await upsertProject(client, raw)
      if (result === 'created') created++

      // Respect Nominatim rate limit (1 req/sec)
      await new Promise(r => setTimeout(r, 1100))
    }

    await client.patch(article._id).set({ extractedAt: new Date().toISOString() }).commit()
    processed++
  }

  return NextResponse.json({
    ok: true, articlesProcessed: processed, projectsCreated: created, lowConfidenceSkipped,
  })
}
