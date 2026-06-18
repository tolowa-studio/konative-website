/**
 * tribal-outreach-match.ts
 *
 * Phase 1: Match TwentyCRM tribal contacts against TBCP award data.
 * Outputs a JSON file with segmented contacts ready for email outreach.
 *
 * Segments:
 *   A — Direct TBCP match: contact's company/nation matched to a specific award
 *   B — NSN/tribal domain (no direct award match but confirmed tribal entity)
 *   C — Casino/gaming tribal (gaming-sector tribal contacts)
 *
 * Run: npx tsx scripts/tribal-outreach-match.ts
 */

import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'

config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const TWENTY_API_KEY = process.env.TWENTY_API_KEY!
const TWENTY_API_URL = process.env.TWENTY_API_URL || 'https://api.twenty.com'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(`${TWENTY_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  if (data.errors?.length) throw new Error(data.errors.map((e: { message: string }) => e.message).join('; '))
  return data.data
}

interface CrmPerson {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  companyName: string
  companyId: string
}

interface Award {
  slug: string
  grantee_name: string
  award_amount_usd: number | null
  nofo_round: string | null
  project_type: string | null
}

export interface OutreachContact {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  companyName: string
  segment: 'A' | 'B' | 'C'
  award?: {
    slug: string
    grantee_name: string
    award_amount_usd: number | null
    nofo_round: string | null
    project_type: string | null
  }
  nationName: string
}

// Pull all tribal contacts from TwentyCRM in pages
async function fetchTribalContacts(): Promise<CrmPerson[]> {
  const all: CrmPerson[] = []
  let cursor: string | null = null
  let page = 0

  console.log('Fetching tribal contacts from TwentyCRM...')

  while (true) {
    page++
    const data = await gql(`
      query FetchPeople($filter: PersonFilterInput, $after: String) {
        people(filter: $filter, first: 100, after: $after, orderBy: { createdAt: AscNullsFirst }) {
          edges {
            node {
              id
              name { firstName lastName }
              emails { primaryEmail }
              jobTitle
              company { id name }
            }
            cursor
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `, {
      filter: {
        or: [
          { emails: { primaryEmail: { like: '%nsn.gov%' } } },
          { emails: { primaryEmail: { like: '%tribe%' } } },
          { emails: { primaryEmail: { like: '%tribal%' } } },
          { emails: { primaryEmail: { like: '%nation%' } } },
          { emails: { primaryEmail: { like: '%casino%' } } },
          { emails: { primaryEmail: { like: '%gaming%' } } },
          { emails: { primaryEmail: { like: '%pueblo%' } } },
          { emails: { primaryEmail: { like: '%bia.gov%' } } },
        ]
      },
      after: cursor,
    })

    const edges = data.people?.edges || []
    for (const { node } of edges) {
      const email = node.emails?.primaryEmail || ''
      if (!email || email === '') continue
      all.push({
        id: node.id,
        firstName: node.name?.firstName || '',
        lastName: node.name?.lastName || '',
        email,
        jobTitle: node.jobTitle || '',
        companyName: node.company?.name || '',
        companyId: node.company?.id || '',
      })
    }

    const pageInfo = data.people?.pageInfo
    if (!pageInfo?.hasNextPage) break
    cursor = pageInfo.endCursor
    console.log(`  Page ${page}: fetched ${all.length} contacts so far...`)
    if (page > 50) break // safety cap
  }

  return all
}

// Normalize a name for fuzzy matching
function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/\btribe\b|\btribal\b|\bnation\b|\bnations\b|\bindian\b|\bband\b|\bpueblo\b|\bcommunity\b|\bof\b|\bthe\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Score how well two names match (0-1)
function matchScore(a: string, b: string): number {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return 0
  if (na === nb) return 1.0
  if (na.includes(nb) || nb.includes(na)) return 0.85

  // Token overlap
  const ta = new Set(na.split(' ').filter(t => t.length > 2))
  const tb = new Set(nb.split(' ').filter(t => t.length > 2))
  const intersection = [...ta].filter(t => tb.has(t)).length
  const union = new Set([...ta, ...tb]).size
  return union > 0 ? intersection / union : 0
}

// Extract nation name from email domain or company name
function extractNationName(contact: CrmPerson): string {
  if (contact.companyName) return contact.companyName

  // Try to derive from email domain
  const domain = contact.email.split('@')[1] || ''
  if (domain.endsWith('.nsn.gov')) {
    // e.g. yochadehe-nsn.gov → Yochadehe
    return domain.replace('.nsn.gov', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  return domain.split('.')[0].replace(/-/g, ' ')
}

async function main() {
  console.log('🎯 Konative Tribal Outreach Matcher')
  console.log(`Date: ${new Date().toISOString()}\n`)

  // Load TBCP awards from Supabase
  console.log('Loading 252 TBCP awards from Supabase...')
  const { data: awards, error: awardError } = await supabase
    .from('tbcp_awards')
    .select('slug, grantee_name, award_amount_usd, nofo_round, project_type')
    .order('award_amount_usd', { ascending: false })

  if (awardError || !awards) {
    console.error('Failed to load awards:', awardError)
    process.exit(1)
  }
  console.log(`✓ Loaded ${awards.length} awards`)

  // Fetch tribal contacts from CRM
  const contacts = await fetchTribalContacts()
  console.log(`\n✓ Fetched ${contacts.length} tribal contacts from TwentyCRM`)

  // Match contacts to awards
  console.log('\nMatching contacts to TBCP awards...')
  const output: OutreachContact[] = []
  let segA = 0, segB = 0, segC = 0, skipped = 0

  for (const contact of contacts) {
    // Skip contacts without real emails or likely system/auto accounts
    if (!contact.email.includes('@')) { skipped++; continue }
    const localPart = contact.email.split('@')[0].toLowerCase()
    const skipPrefixes = ['noreply', 'no-reply', 'info', 'support', 'admin', 'events', 'smallbusiness', 'newsletter', 'sales', 'marketing', 'webmaster', 'postmaster', 'help', 'contact']
    if (skipPrefixes.some(p => localPart === p || localPart.startsWith(p + '.'))) { skipped++; continue }

    const nationName = extractNationName(contact)
    const emailLower = contact.email.toLowerCase()
    const isCasino = emailLower.includes('casino') || emailLower.includes('gaming')
    const isNsn = emailLower.includes('nsn.gov')

    // Skip contacts from known commercial tech/non-tribal domains
    const emailDomain = contact.email.split('@')[1]?.toLowerCase() || ''
    const commercialDomains = ['connectwise.com', 'microsoft.com', 'cisco.com', 'vmware.com', 'google.com', 'amazon.com', 'outlook.com', 'gmail.com', 'yahoo.com', 'hotmail.com']
    if (commercialDomains.some(d => emailDomain === d || emailDomain.endsWith('.' + d))) { skipped++; continue }

    // Try award match against company name and nation name
    // Require contact to have a real tribal signal — skip generic company names that could false-match
    const companyLower = (contact.companyName || '').toLowerCase()
    const isGenericCompany = !isNsn && !isCasino
      && !companyLower.includes('nation') && !companyLower.includes('tribe')
      && !companyLower.includes('tribal') && !companyLower.includes('pueblo')
      && !companyLower.includes('band') && !companyLower.includes('nsn')

    let bestAward: Award | null = null
    let bestScore = 0

    if (!isGenericCompany) for (const award of awards as Award[]) {
      const scoreVsCompany = contact.companyName ? matchScore(contact.companyName, award.grantee_name) : 0
      const scoreVsNation = matchScore(nationName, award.grantee_name)
      const score = Math.max(scoreVsCompany, scoreVsNation)
      if (score > bestScore && score >= 0.5) {
        bestScore = score
        bestAward = award
      }
    }

    if (bestAward) {
      output.push({
        ...contact,
        segment: 'A',
        award: bestAward,
        nationName: bestAward.grantee_name,
      })
      segA++
    } else if (isCasino) {
      output.push({ ...contact, segment: 'C', nationName })
      segC++
    } else {
      output.push({ ...contact, segment: 'B', nationName })
      segB++
    }
  }

  console.log(`\n📊 Segmentation results:`)
  console.log(`  Segment A (TBCP award match):     ${segA} contacts`)
  console.log(`  Segment B (tribal, no award match): ${segB} contacts`)
  console.log(`  Segment C (casino/gaming tribal):   ${segC} contacts`)
  console.log(`  Skipped (bad email):                ${skipped}`)
  console.log(`  Total ready:                        ${output.length}`)

  // Save to file
  const outputPath = path.join(__dirname, '../.tribal-outreach-contacts.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\n✅ Saved to ${outputPath}`)

  // Preview top segment A contacts
  const segAContacts = output.filter(c => c.segment === 'A').slice(0, 10)
  if (segAContacts.length > 0) {
    console.log('\n🏆 Top Segment A contacts (TBCP award matched):')
    for (const c of segAContacts) {
      const amt = c.award?.award_amount_usd
        ? `$${(c.award.award_amount_usd / 1_000_000).toFixed(2)}M`
        : 'unknown'
      console.log(`  ${c.firstName} ${c.lastName} <${c.email}> — ${c.jobTitle || 'unknown title'}`)
      console.log(`    Nation: ${c.award?.grantee_name} | Award: ${amt} | NOFO: ${c.award?.nofo_round || '?'}`)
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
