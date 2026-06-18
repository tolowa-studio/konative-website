/**
 * seed-twenty-deals.ts
 *
 * Seeds Konative deal register into TwentyCRM via GraphQL API.
 * Creates People (contacts), Companies (organizations), and Opportunities (deals)
 * tagged by lane: tribal | datacenter
 *
 * Requires: TWENTY_API_KEY in .env.local
 * TwentyCRM: https://crm.tolowastudio.com (→ app.twenty.com)
 *
 * Run: npx tsx scripts/seed-twenty-deals.ts
 */

import { config } from 'dotenv'
import path from 'path'

config({ path: path.join(__dirname, '../.env.local') })

const TWENTY_API_KEY = process.env.TWENTY_API_KEY || ''
const TWENTY_API_URL = process.env.TWENTY_API_URL || 'https://api.twenty.com'

if (!TWENTY_API_KEY) {
  console.error('❌ TWENTY_API_KEY not set in .env.local')
  console.error('   Get it from: https://app.twenty.com/settings/developers/api-keys')
  console.error('   Then add:    TWENTY_API_KEY="your-key-here"')
  process.exit(1)
}

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

// ── Deal definitions ────────────────────────────────────────────────────────

interface DealSeed {
  name: string
  lane: 'tribal' | 'datacenter'
  stage: string
  value: number | null
  probability: number
  closeDate: string
  notes: string
  companyDomain?: string
  companyCity?: string
  companyState?: string
  contactName?: string
  contactTitle?: string
  contactEmail?: string
}

const TRIBAL_DEALS: DealSeed[] = [
  {
    name: 'Navajo Nation — Enterprise WAN + SD-WAN',
    lane: 'tribal',
    stage: 'NEW',
    value: 180000,
    probability: 20,
    closeDate: '2026-12-31',
    notes: 'Largest tribal nation by land area. 175K sq mi, 110 chapters. TBCP infrastructure grant received. Multi-carrier strategy: AT&T primary, Verizon backup, SpaceX Starlink for remote chapters. MRC opportunity $15K+/mo.',
    companyDomain: 'navajo-nsn.gov',
    companyCity: 'Window Rock',
    companyState: 'AZ',
    contactTitle: 'IT Director',
  },
  {
    name: 'Cherokee Nation — SD-WAN Refresh',
    lane: 'tribal',
    stage: 'MEETING',
    value: 96000,
    probability: 35,
    closeDate: '2026-09-30',
    notes: 'Cherokee Nation is the largest tribal employer in Oklahoma. Casino, health system, government offices, tribal college. Evaluating Meraki vs Fortinet SD-WAN. Decision Q3 2026.',
    companyDomain: 'cherokee.org',
    companyCity: 'Tahlequah',
    companyState: 'OK',
    contactTitle: 'VP of Technology',
  },
  {
    name: 'Lummi Nation — BGP Redundancy + Security',
    lane: 'tribal',
    stage: 'MEETING',
    value: 60000,
    probability: 40,
    closeDate: '2026-08-31',
    notes: 'NW Washington. Tribal fisheries, school, business council. $25K-100K TBCP award received. Needs BGP-redundant 10G enterprise WAN with Seattle-diverse fiber paths. Currently single-homed to Comcast.',
    companyDomain: 'lummi-nsn.gov',
    companyCity: 'Bellingham',
    companyState: 'WA',
    contactTitle: 'Network Administrator',
  },
  {
    name: 'Eastern Band Cherokee — Casino Telecom',
    lane: 'tribal',
    stage: 'PROPOSAL',
    value: 120000,
    probability: 50,
    closeDate: '2026-07-31',
    notes: 'Harrah\'s Cherokee Casino Resort is 6th largest employer in NC. Telecom modernization RFP issued. SD-WAN and managed security shortlist. Competing against CDW and Presidio. Decision expected July.',
    companyDomain: 'ebci.com',
    companyCity: 'Cherokee',
    companyState: 'NC',
    contactTitle: 'Director of IT',
  },
  {
    name: 'Muscogee Nation — Government WAN RFP',
    lane: 'tribal',
    stage: 'PROPOSAL',
    value: 84000,
    probability: 45,
    closeDate: '2026-08-15',
    notes: 'Muscogee Nation Dept of Commerce WAN refresh RFP for 7 tribal government facilities in Tulsa metro. Published Q2 2026. Evaluating SD-WAN + managed security through Q3.',
    companyDomain: 'muscogeenation.com',
    companyCity: 'Okmulgee',
    companyState: 'OK',
    contactTitle: 'CIO',
  },
  {
    name: 'Confederated Salish and Kootenai — Flathead Network',
    lane: 'tribal',
    stage: 'NEW',
    value: 72000,
    probability: 25,
    closeDate: '2026-12-31',
    notes: 'Montana Flathead Reservation. SKC college, tribal health, gaming. TBCP award received. Needs carrier-grade WAN with Missoula-diverse paths. Starting discovery conversation.',
    companyDomain: 'cskt.org',
    companyCity: 'Pablo',
    companyState: 'MT',
    contactTitle: 'IT Manager',
  },
  {
    name: 'Fort Peck Tribes — Rural Enterprise Connectivity',
    lane: 'tribal',
    stage: 'NEW',
    value: 54000,
    probability: 20,
    closeDate: '2027-03-31',
    notes: '2.1M acre reservation in NE Montana. Two hospitals, tribal college, government services. TBCP award. Remote location — fixed wireless + fiber hybrid with Billings/Williston backup paths.',
    companyDomain: 'fortpecktribes.org',
    companyCity: 'Poplar',
    companyState: 'MT',
    contactTitle: 'Telecom Coordinator',
  },
  {
    name: 'Cheyenne River Sioux — Multi-PoP SD-WAN',
    lane: 'tribal',
    stage: 'NEW',
    value: 90000,
    probability: 25,
    closeDate: '2027-06-30',
    notes: '2.8M acre reservation in South Dakota. Health, government, education require distributed SD-WAN with multiple PoPs. TBCP infrastructure build underway. Long-term connectivity procurement 2026-2027.',
    companyDomain: 'cheyenneriversioux.com',
    companyCity: 'Eagle Butte',
    companyState: 'SD',
    contactTitle: 'IT Director',
  },
]

const DATACENTER_DEALS: DealSeed[] = [
  {
    name: 'Stargate AI Campus Ames IA — 100G Transport',
    lane: 'datacenter',
    stage: 'MEETING',
    value: 480000,
    probability: 30,
    closeDate: '2026-09-30',
    notes: 'MISO queue shows 800MW large-load filing near Ames. Matches Stargate Project footprint. 100G+ dark fiber and managed transport required for construction phase 2026-2027. Carrier: Zayo primary, Lumen backup.',
    companyCity: 'Ames',
    companyState: 'IA',
    contactTitle: 'Infrastructure Lead',
  },
  {
    name: 'Loudoun County Hyperscale Expansion — Fiber',
    lane: 'datacenter',
    stage: 'NEW',
    value: 360000,
    probability: 20,
    closeDate: '2026-12-31',
    notes: 'PJM queue: 400MW large-load in Data Center Alley. Multi-tenant campus Building J. 100G transport and diverse fiber paths required Q3 2026. Carrier diversity: Zayo, Crown Castle, Cogent.',
    companyCity: 'Ashburn',
    companyState: 'VA',
    contactTitle: 'Procurement Director',
  },
  {
    name: 'Tracy CA AI Inference Campus — DWDM',
    lane: 'datacenter',
    stage: 'NEW',
    value: 300000,
    probability: 20,
    closeDate: '2027-01-31',
    notes: 'CAISO: 320MW AI inference campus near Tracy. Central Valley location requires DWDM transport to Sacramento and San Jose, 100G rings. Evaluating carriers 2026 procurement.',
    companyCity: 'Tracy',
    companyState: 'CA',
    contactTitle: 'Network Architect',
  },
  {
    name: 'Samsung Taylor TX — 100G Transport',
    lane: 'datacenter',
    stage: 'MEETING',
    value: 420000,
    probability: 35,
    closeDate: '2026-10-31',
    notes: 'ERCOT: 600MW expansion adjacent to Samsung fab in Taylor. AI/HPC colocation campus. 100G transport to Austin and Dallas, low-latency fiber to AWS us-east-2. Zayo/Lumen carriers preferred.',
    companyCity: 'Taylor',
    companyState: 'TX',
    contactTitle: 'Data Center Director',
  },
  {
    name: 'Ohio Data Center Corridor — Multi-Tenant Fiber',
    lane: 'datacenter',
    stage: 'NEW',
    value: 600000,
    probability: 25,
    closeDate: '2027-03-31',
    notes: 'PJM: 1.2GW hyperscale corridor in New Albany OH. Meta/Amazon/Google cluster building out. Multi-tenant dark fiber and colocation transport for 2026 phased construction. Largest opportunity in pipeline.',
    companyCity: 'New Albany',
    companyState: 'OH',
    contactTitle: 'Infrastructure VP',
  },
  {
    name: 'Whitestown IN Greenfield AI Campus',
    lane: 'datacenter',
    stage: 'NEW',
    value: 300000,
    probability: 20,
    closeDate: '2027-06-30',
    notes: 'MISO: 450MW greenfield AI campus in Whitestown IN (Indianapolis metro). Adjacent to Switch campus. 100G dark fiber and carrier-managed transport to Chicago required. Q4 2026 construction start.',
    companyCity: 'Whitestown',
    companyState: 'IN',
    contactTitle: 'Development Director',
  },
  {
    name: 'Permian Basin AI Campus Midland TX',
    lane: 'datacenter',
    stage: 'MEETING',
    value: 390000,
    probability: 30,
    closeDate: '2026-11-30',
    notes: 'ERCOT: 750MW AI campus in Permian Basin leveraging stranded gas power. 100G to Dallas hub, private fiber to oilfield fiber network. Zayo/Lumen carrier diversity. Decision late 2026.',
    companyCity: 'Midland',
    companyState: 'TX',
    contactTitle: 'Infrastructure Lead',
  },
  {
    name: 'Jackson MS AI Training Campus',
    lane: 'datacenter',
    stage: 'NEW',
    value: 240000,
    probability: 15,
    closeDate: '2027-06-30',
    notes: 'MISO: 500MW AI training campus near Jackson MS. Emerging tier-2 market, low power cost. 100G transport to Memphis and Atlanta. AT&T and Zayo carrier diversity required.',
    companyCity: 'Jackson',
    companyState: 'MS',
    contactTitle: 'Development VP',
  },
]

// ── TwentyCRM GraphQL mutations ─────────────────────────────────────────────

async function findOrCreateCompany(name: string, domain?: string, city?: string, state?: string): Promise<string> {
  // Try to find existing company first
  const existing = await gql(`
    query FindCompany($filter: CompanyFilterInput) {
      companies(filter: $filter) { edges { node { id name } } }
    }
  `, { filter: { name: { eq: name } } })
  const found = existing.companies?.edges?.[0]?.node
  if (found) return found.id

  const data = await gql(`
    mutation CreateCompany($input: CompanyCreateInput!) {
      createCompany(data: $input) { id name }
    }
  `, {
    input: {
      name,
      domainName: domain ? { primaryLinkUrl: `https://${domain}`, primaryLinkLabel: domain } : undefined,
      address: (city || state) ? {
        addressCity: city || '',
        addressState: state || '',
        addressCountry: 'US',
      } : undefined,
    },
  })
  return data.createCompany.id
}

async function createOpportunity(deal: DealSeed, companyId?: string): Promise<{ id: string; existed: boolean }> {
  // Check if already exists
  const existing = await gql(`
    query FindOpp($filter: OpportunityFilterInput) {
      opportunities(filter: $filter) { edges { node { id name } } }
    }
  `, { filter: { name: { eq: deal.name } } })
  const found = existing.opportunities?.edges?.[0]?.node
  if (found) return { id: found.id, existed: true }

  // Map MRC value to enum
  const mrcEnum = deal.value == null ? 'BAND_5K_25K'
    : deal.value >= 400000 ? 'OVER_100K'
    : deal.value >= 100000 ? 'BAND_25K_100K'
    : deal.value >= 25000 ? 'BAND_5K_25K'
    : 'BAND_1K_5K'

  const data = await gql(`
    mutation CreateOpportunity($input: OpportunityCreateInput!) {
      createOpportunity(data: $input) { id name }
    }
  `, {
    input: {
      name: deal.name,
      stage: deal.stage,
      amount: deal.value ? { amountMicros: deal.value * 1_000_000, currencyCode: 'USD' } : undefined,
      closeDate: new Date(deal.closeDate).toISOString(),
      lane: deal.lane.toUpperCase(),
      estimatedMrcBand: mrcEnum,
      signalSource: deal.lane === 'tribal' ? 'ntia_tbcp' : 'ferc_queue',
      companyId: companyId || undefined,
    },
  })
  return { id: data.createOpportunity.id, existed: false }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏢 Konative — TwentyCRM Deal Register Seed')
  console.log(`Target: ${TWENTY_API_URL}`)
  console.log('')

  // Verify connection
  try {
    await gql(`query { workspaceMembers { edges { node { id name { firstName } } } } }`)
    console.log('✓ TwentyCRM connection verified')
  } catch (err) {
    console.error('❌ TwentyCRM connection failed:', (err as Error).message)
    process.exit(1)
  }

  let created = 0
  let errors = 0

  const allDeals = [...TRIBAL_DEALS, ...DATACENTER_DEALS]
  console.log(`\nSeeding ${allDeals.length} deals (${TRIBAL_DEALS.length} tribal, ${DATACENTER_DEALS.length} datacenter)...\n`)

  for (const deal of allDeals) {
    try {
      let companyId: string | undefined

      // Create company if we have domain/location info
      if (deal.companyDomain || deal.companyCity) {
        const companyName = deal.companyDomain
          ? deal.companyDomain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          : deal.name.split('—')[0].trim()
        companyId = await findOrCreateCompany(companyName, deal.companyDomain, deal.companyCity, deal.companyState)
      }

      const { id: oppId, existed } = await createOpportunity(deal, companyId)
      if (existed) {
        console.log(`  ~ [${deal.lane.toUpperCase()}] ${deal.name} (already exists: ${oppId})`)
      } else {
        created++
        console.log(`  ✓ [${deal.lane.toUpperCase()}] ${deal.name} → ${oppId}`)
      }
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('duplicate') || msg.includes('Duplicate')) {
        console.log(`  ~ [${deal.lane.toUpperCase()}] ${deal.name} (skipped: already exists in CRM)`)
      } else {
        errors++
        console.error(`  ✗ ${deal.name}: ${msg}`)
      }
    }
  }

  console.log(`\n✅ Done: ${created} deals created, ${errors} errors`)
  console.log(`\nView in TwentyCRM: https://app.twenty.com/opportunities`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
