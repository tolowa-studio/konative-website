/**
 * Weekly governors / tribal / stalled-DC maintenance report (report-only).
 *
 * Run from repo root or web/:
 *   cd web && npx tsx --env-file=.env.local scripts/agents/governors-maintain.ts
 */
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const RSS_FEEDS = [
  'https://www.datacenterdynamics.com/en/rss/',
  'https://www.energy.gov/rss/indianenergy.xml',
  'https://www.cbc.ca/webfeed/rss/rss-canada',
  'https://fnigc.ca/feed/',
]

interface GovernorRow {
  state: string
  stateName?: string
  name?: string
  termEnds?: string
}

interface StateDcCounts {
  state: string
  live: number
  stalled: number
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<string | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'KonativeGovernorsMaintain/1.0 (+https://konative.com)' },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

function scanFeedHints(xml: string | null, keywords: string[]): string[] {
  if (!xml) return []
  const lower = xml.toLowerCase()
  return keywords.filter((k) => lower.includes(k.toLowerCase())).map((k) => `keyword hit: ${k}`)
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN')
    process.exit(1)
  }

  const today = new Date().toISOString().slice(0, 10)
  const governors = await sanity.fetch<GovernorRow[]>(
    `*[_type == "governor"] | order(priority asc) { state, stateName, name, termEnds }`,
  )
  const governorCount = governors.length
  const governorStates = new Set(governors.map((g) => g.state))
  const missingGovernors = US_STATES.filter((s) => !governorStates.has(s))

  const tribalCount = await sanity.fetch<number>('count(*[_type == "tribalProject"])')
  const tribalByCountry = await sanity.fetch<{ us: number; ca: number; other: number }>(
    `{"us": count(*[_type == "tribalProject" && country == "US"]), "ca": count(*[_type == "tribalProject" && country == "CA"]), "other": count(*[_type == "tribalProject" && !(country in ["US","CA"])])}`,
  )

  const stalledStatuses = new Set(['stalled', 'canceled', 'paused', 'blocked'])
  const liveStatuses = new Set(['operational', 'construction', 'announced', 'proposed'])

  const dcProjects = await sanity.fetch<{ state: string; status?: string }[]>(
    `*[_type == "dataCenterProject" && country == "US" && state in $states]{ state, status }`,
    { states: US_STATES },
  )

  const dcMap = new Map<string, StateDcCounts>()
  for (const st of US_STATES) dcMap.set(st, { state: st, live: 0, stalled: 0 })
  for (const p of dcProjects) {
    if (!p.state || !dcMap.has(p.state)) continue
    const row = dcMap.get(p.state)!
    const status = p.status ?? ''
    if (stalledStatuses.has(status)) row.stalled++
    else if (liveStatuses.has(status)) row.live++
  }

  const emptySignalStates: string[] = []
  for (const st of US_STATES) {
    const row = dcMap.get(st)
    const live = row?.live ?? 0
    const stalled = row?.stalled ?? 0
    if (live === 0 && stalled === 0) emptySignalStates.push(st)
  }

  const feedNotes: string[] = []
  const keywords = ['tribal', 'first nation', 'data center', 'stalled', 'data centre']
  for (const url of RSS_FEEDS) {
    const body = await fetchWithTimeout(url)
    const hits = scanFeedHints(body, keywords)
    if (hits.length) feedNotes.push(`- ${url}: ${hits.join(', ')}`)
    else if (body) feedNotes.push(`- ${url}: fetched (${Math.round(body.length / 1024)} KB), no keyword hits`)
    else feedNotes.push(`- ${url}: fetch failed (soft skip)`)
  }

  const tribalGaps = [
    'Lac du Flambeau / Menominee / Oneida (WI) — monitor for sovereign or utility-partnered DC announcements',
    'Fort Mojave / Colorado River tribes (AZ/CA/NV) — grid-adjacent lands; no verified hyperscale seed yet',
    'Mi’kmaq / Atlantic Canada FN beyond Malahat — scan CBC / DCD for new FN sovereign compute',
    'Alaska Native corporations (ANCSA) — utility-scale DC on corporation lands rarely public until permitting',
  ]

  const lines: string[] = [
    `# Governors / tribal / stalled-DC maintenance report`,
    ``,
    `Generated: ${today} (UTC date)`,
    ``,
    `## Sanity counts`,
    `- Governors: **${governorCount}** (target 50)`,
    `- Missing governor states: ${missingGovernors.length ? missingGovernors.join(', ') : 'none'}`,
    `- Tribal / FN projects: **${tribalCount}** (US ${tribalByCountry?.us ?? '—'}, CA ${tribalByCountry?.ca ?? '—'})`,
    ``,
    `## US states with zero live + zero stalled dataCenterProject`,
    emptySignalStates.length
      ? emptySignalStates.join(', ')
      : 'None — every state has at least one tracked project.',
    ``,
    `## Governor roster snapshot (priority order)`,
    ...governors.slice(0, 10).map((g) => `- ${g.state}: ${g.name ?? '—'} (term ${g.termEnds ?? '—'})`),
    governors.length > 10 ? `- … and ${governors.length - 10} more` : '',
    ``,
    `## External scan (soft)`,
    ...feedNotes,
    ``,
    `## Suggested research follow-ups`,
    `- Re-run \`seed-all-governors.ts\` after midterm / gubernatorial elections.`,
    `- Cross-check empty-signal states against D1 ingest before outreach.`,
    ...tribalGaps.map((g) => `- Tribal gap: ${g}`),
    ``,
    `## Policy`,
    `Report-only — no Sanity writes from this agent.`,
    ``,
  ]

  const outDir = path.join(process.cwd(), '..', 'docs', 'outreach', 'artifacts')
  const repoRoot = fs.existsSync(outDir)
    ? path.join(process.cwd(), '..')
    : path.join(process.cwd())
  const artifactDir = path.join(repoRoot, 'docs', 'outreach', 'artifacts')
  fs.mkdirSync(artifactDir, { recursive: true })
  const outPath = path.join(artifactDir, `${today}-governors-maintain-report.md`)
  fs.writeFileSync(outPath, lines.filter(Boolean).join('\n'))
  console.log(`Wrote ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
