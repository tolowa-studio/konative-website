import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient, upsertProject, type RawProject } from '@/lib/projectIngestion'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const IESO_JSON_URL = 'https://www.ieso.ca/-/media/files/IESO/files/applicationstatusdata.json'

// IESO region → [lat, lng] centre points
const REGION_COORDS: Record<string, [number, number]> = {
  'toronto':   [43.6532, -79.3832],
  'southwest': [42.9849, -81.2453],  // London area
  'west':      [43.4516, -80.4925],  // Kitchener area
  'niagara':   [43.0896, -79.0849],
  'essa':      [44.2500, -79.7833],  // Barrie area
  'ottawa':    [45.4215, -75.6972],
  'east':      [44.2312, -76.4860],  // Kingston area
  'northeast': [46.4917, -80.9930],  // Sudbury area
  'northwest': [48.3809, -89.2477],  // Thunder Bay area
  'bruce':     [44.3300, -81.3400],
  'ontario':   [43.6532, -79.3832],  // fallback to Toronto
  'unknown':   [43.6532, -79.3832],
}

interface IesoRecord {
  Queue: string
  Applicant: string
  Name: string
  CaaId: number
  CaaIdAndDate: string
  Location: string
  Type: string
  Size: string
  ProposedInServiceDate: string
  SiaStatus: string
  ReportLinks: string
  Committed: string
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron')
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(IESO_JSON_URL, {
      headers: { 'User-Agent': 'konative-site/1.0 (deals@konative.com)' },
    })
    if (!res.ok) throw new Error(`IESO returned ${res.status}`)
    const rows: IesoRecord[] = await res.json()

    const client = getSanityWriteClient()
    let created = 0, updated = 0, skipped = 0

    for (const row of rows) {
      const type = (row.Type || '').toLowerCase()
      if (type !== 'load' && type !== 'additional load') continue

      // Parse MW — "300 MW<br>" → 300
      const mwMatch = /(\d+(?:\.\d+)?)\s*MW/i.exec(row.Size || '')
      const mw = mwMatch ? parseFloat(mwMatch[1]) : undefined
      if (!mw || mw < 50) continue

      const regionKey = (row.Location || '').toLowerCase().trim()
      const [lat, lng] = REGION_COORDS[regionKey] ?? REGION_COORDS['ontario']

      const siaStatus = (row.SiaStatus || '').toLowerCase()
      const mappedStatus: 'construction' | 'announced' =
        siaStatus.includes('complete') || siaStatus.includes('final') || siaStatus.includes('approved')
          ? 'construction'
          : 'announced'

      const raw: RawProject = {
        name: row.Name || `Load Project ${row.CaaIdAndDate}`,
        operator: row.Applicant || undefined,
        lat, lng,
        provinceCode: 'ON',
        state: 'ON',
        country: 'CA',
        status: mappedStatus,
        capacityMw: mw,
        source: 'ieso_queue',
        sourceId: String(row.CaaId || row.CaaIdAndDate).replace(/\s+/g, '_'),
        sourceUrl: 'https://www.ieso.ca/Sector-Participants/Connection-Process/Application-Status',
        extractionConfidence: 0.75,
      }

      const result = await upsertProject(client, raw)
      if (result === 'created') created++
      else if (result === 'updated') updated++
      else skipped++
    }

    return NextResponse.json({ ok: true, totalRows: rows.length, created, updated, skipped })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
