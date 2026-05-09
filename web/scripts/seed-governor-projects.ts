/**
 * One-shot seed for the /governors map page.
 *
 *   - 4 governor docs (NV, WV, FL, OK)
 *   - ~22 stalled / canceled / paused / blocked data center projects in those states
 *
 * Run: cd web && npx tsx scripts/seed-governor-projects.ts
 *
 * Idempotent: uses deterministic _ids so re-running updates in place.
 * `createOrReplace` is used unconditionally — running it again will overwrite manual
 * edits in Studio, so re-run sparingly.
 */
import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ── Governors ─────────────────────────────────────────────────────────────────

interface GovernorSeed {
  state: string
  stateName: string
  name: string
  party: 'Democratic' | 'Republican' | 'Independent'
  termEnds: string
  capitalCity: string
  lat: number
  lng: number
  ngaRole?: string
  ngaInitiative?: string
  dcPolicyNotes?: string
  accessNotes?: string
  priority: number
  sources: string[]
}

const GOVERNORS: GovernorSeed[] = [
  {
    state: 'OK',
    stateName: 'Oklahoma',
    name: 'Kevin Stitt',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Oklahoma City',
    lat: 35.4676,
    lng: -97.5164,
    ngaRole: 'Chair 2025–2026',
    ngaInitiative: 'Reigniting the American Dream — pillar: powering America\'s AI future',
    dcPolicyNotes: 'Aggressively pro-DC at the state level. Meta "Project Anthem" Tulsa announced under his banner. City-level fights in Stillwater, Coweta, Yukon, Luther are the friction.',
    accessNotes: 'Konative path: Todd Gord (Cherokee Nation). Highest-leverage of the four — NGA Chair pillar literally names AI infrastructure.',
    priority: 1,
    sources: [
      'https://www.nga.org/news/press-releases/oklahoma-governor-kevin-stitt-elected-chair-of-national-governors-association/',
      'https://www.nga.org/americandream/',
    ],
  },
  {
    state: 'NV',
    stateName: 'Nevada',
    name: 'Joe Lombardo',
    party: 'Republican',
    termEnds: 'Jan 2027 (running for re-election Nov 2026)',
    capitalCity: 'Carson City',
    lat: 39.1638,
    lng: -119.7674,
    ngaRole: '',
    ngaInitiative: '',
    dcPolicyNotes: 'No state-level DC zoning law. DC tax abatements via Governor\'s Office of Energy. Lombardo position: DCs should not raise rates or strain water — Konative\'s value prop satisfies both.',
    accessNotes: 'Konative path: Bob Potts → direct to governor. Boulder City (Townsite Solar 2) on Nov 2026 ballot.',
    priority: 2,
    sources: [
      'https://www.reviewjournal.com/news/politics-and-government/nevada/nevada-governor-launches-re-election-bid-for-2026-3461156/',
    ],
  },
  {
    state: 'WV',
    stateName: 'West Virginia',
    name: 'Patrick Morrisey',
    party: 'Republican',
    termEnds: 'Jan 2029',
    capitalCity: 'Charleston',
    lat: 38.3498,
    lng: -81.6326,
    ngaRole: '',
    ngaInitiative: '',
    dcPolicyNotes: 'HB 2014 / Power Generation and Consumption Act (Apr 30, 2025) created Certified Microgrid + High-Impact DC programs and strips county/municipal zoning over qualifying projects. Most aggressive pro-DC governor in the four states.',
    accessNotes: 'Konative path: Dan Caprio. Pitch is trust restoration — green DC alternative that doesn\'t require Morrisey to override local zoning.',
    priority: 3,
    sources: [
      'https://governor.wv.gov/article/governor-patrick-morrisey-signs-power-generation-and-consumption-and-one-stop-shop',
    ],
  },
  {
    state: 'FL',
    stateName: 'Florida',
    name: 'Ron DeSantis',
    party: 'Republican',
    termEnds: 'Jan 5, 2027 (term-limited)',
    capitalCity: 'Tallahassee',
    lat: 30.4383,
    lng: -84.2807,
    ngaRole: '',
    ngaInitiative: '',
    dcPolicyNotes: 'SB 484 (signed May 7, 2026) — first-in-nation law shielding ratepayers from DC cost-shifting; strengthens local zoning; bars "foreign countries of concern" from DC ownership. Chilled the $13.5B Project Jarvis.',
    accessNotes: 'Konative path: Darren Light. Pitch is "the DC type that passes the SB 484 cost-of-service test" (own power, own water).',
    priority: 4,
    sources: [
      'https://www.flgov.com/eog/news/press/2026/governor-ron-desantis-signs-law-protect-floridians-subsidizing-data-centers',
    ],
  },
]

// ── Stalled / canceled projects ───────────────────────────────────────────────

interface ProjectSeed {
  slug: string
  name: string
  operator?: string
  ownerFunder?: string
  city: string
  state: string
  country: 'US'
  lat: number
  lng: number
  status: 'stalled' | 'canceled' | 'paused' | 'blocked'
  capacityMw?: number
  blockReason: 'water' | 'power' | 'community' | 'permits' | 'financing' | 'litigation' | 'regulation' | 'other'
  blockReasonDetail: string
  stalledAt?: string
  relatedSources: string[]
  sourceUrl?: string
}

const PROJECTS: ProjectSeed[] = [
  // ── Florida ────────────────────────────────────────────────────────────────
  {
    slug: 'fl-sentinel-grove-jarvis',
    name: 'Sentinel Grove Technology Park (Project Jarvis)',
    operator: 'Epic Estates 68 LLC',
    ownerFunder: 'Epic Estates 68 LLC',
    city: 'Port St. Lucie',
    state: 'FL',
    country: 'US',
    lat: 27.2730,
    lng: -80.3582,
    status: 'canceled',
    capacityMw: 1000,
    blockReason: 'regulation',
    blockReasonDetail: 'Developer withdrew land-use application (Feb 2026) citing pending state regulation (SB 484). 1,218 acres / 15M sq ft / ~1 GW.',
    stalledAt: '2026-02-26',
    relatedSources: [
      'https://www.datacenterdynamics.com/en/news/data-center-developer-withdraws-application-in-florida-in-response-to-proposed-regulations/',
      'https://floridadatacenters.org/',
    ],
  },
  {
    slug: 'fl-okee-one',
    name: 'Okee-One Data Campus',
    operator: 'Indian River State College',
    ownerFunder: 'Indian River State College',
    city: 'Okeechobee',
    state: 'FL',
    country: 'US',
    lat: 27.2439,
    lng: -80.8298,
    status: 'canceled',
    capacityMw: 10,
    blockReason: 'community',
    blockReasonDetail: 'State accused IRSC of falsehoods re energy/water claims; $1.5M state grant clawed back; ~3,000 residents organized opposition. 205 acres.',
    stalledAt: '2026-04-29',
    relatedSources: [
      'https://cbs12.com/news/local/-florida-news-public-outcry-wins-okeechobee-scraps-data-center-project',
      'https://www.wlrn.org/government-politics/2026-04-29/scrapped-data-center-in-okeechobee-county-mirrors-rising-opposition-to-data-centers-in-south-florida',
    ],
  },
  {
    slug: 'fl-project-tango',
    name: 'Central Park Commerce Center (Project Tango)',
    operator: 'PBA Holdings',
    ownerFunder: 'PBA Holdings',
    city: 'Loxahatchee (Palm Beach County)',
    state: 'FL',
    country: 'US',
    lat: 26.7062,
    lng: -80.2667,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Vote postponed three times (next hearing Jul 15, 2026). 202 acres / 3.7M sq ft. Community pushback amplified by SB 484.',
    relatedSources: [
      'https://floridadatacenters.org/',
      'https://www.discoversouthflorida.com/blog/data-center-backlash-grows-across-south-florida/',
    ],
  },
  {
    slug: 'fl-fort-meade',
    name: 'Fort Meade Data Center Campus',
    operator: 'Stonebridge',
    ownerFunder: 'Stonebridge',
    city: 'Fort Meade (Polk County)',
    state: 'FL',
    country: 'US',
    lat: 27.7517,
    lng: -81.8023,
    status: 'blocked',
    capacityMw: 1200,
    blockReason: 'water',
    blockReasonDetail: 'Approved Apr 2026 but new state water rule (consumptive-use) may block permits. 4.4M sq ft on former phosphate mine.',
    stalledAt: '2026-04-14',
    relatedSources: [
      'https://www.tampabay.com/news/florida-politics/2026/04/14/florida-data-center-fort-meade-polk-water-permit/',
    ],
  },
  {
    slug: 'fl-indiantown-silver-fox',
    name: 'Indiantown Silver Fox Proposal',
    city: 'Indiantown (Martin County)',
    state: 'FL',
    country: 'US',
    lat: 27.0289,
    lng: -80.4789,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Public hearings pending under organized community opposition. 606 acres.',
    relatedSources: ['https://floridadatacenters.org/'],
  },
  {
    slug: 'fl-camden-border',
    name: 'Camden County Project (FL-based developer)',
    city: 'Kingsland (FL-GA border)',
    state: 'FL',
    country: 'US',
    lat: 30.9296,
    lng: -81.6356,
    status: 'paused',
    blockReason: 'community',
    blockReasonDetail: 'FL-based businessman suspended plans amid backlash. Border project — listed under FL for governor outreach context.',
    stalledAt: '2026-05-04',
    relatedSources: ['https://thecurrentga.org/2026/05/04/florida-businessman-suspends-data-center-plans-in-camden-county/'],
  },

  // ── Nevada ─────────────────────────────────────────────────────────────────
  {
    slug: 'nv-townsite-solar-2',
    name: 'Townsite Solar 2 / Eldorado Valley DC',
    operator: 'Townsite Solar 2 LLC',
    ownerFunder: 'Townsite Solar 2 LLC',
    city: 'Boulder City',
    state: 'NV',
    country: 'US',
    lat: 35.9758,
    lng: -114.8311,
    status: 'blocked',
    blockReason: 'water',
    blockReasonDetail: '$24.3M+ tax abatement contested. 2,600+ petition signers; 350 yard signs. On Nov 2026 ballot. Concerns: Colorado River water, power, noise, heat. 88.5 acres.',
    relatedSources: [
      'https://www.reviewjournal.com/news/environment/data-centers-will-be-on-the-ballot-in-this-southern-nevada-city-3727498/',
      'https://thenevadaindependent.com/article/opinion-pushback-begins-against-a-proposed-data-center-in-boulder-city-is-it-too-late',
    ],
  },
  {
    slug: 'nv-reno-moratorium',
    name: 'Reno DC Moratorium (multiple proposals)',
    city: 'Reno',
    state: 'NV',
    country: 'US',
    lat: 39.5296,
    lng: -119.8138,
    status: 'paused',
    blockReason: 'regulation',
    blockReasonDetail: 'Reno City Council voted Apr 2026 to advance new DC standards / possible moratorium. Cumulative water + power load on Truckee Meadows is the concern.',
    stalledAt: '2026-04-23',
    relatedSources: [
      'https://www.kunr.org/local-stories/2026-04-23/reno-city-council-takes-first-step-toward-changing-data-center-development-rules',
      'https://thisisreno.com/2026/04/reno-city-council-data-center-standards/',
    ],
  },
  {
    slug: 'nv-webb-reno',
    name: 'Webb Data Center (Reno North Valleys)',
    operator: 'Webb',
    ownerFunder: 'Webb',
    city: 'Reno (North Valleys)',
    state: 'NV',
    country: 'US',
    lat: 39.6094,
    lng: -119.8094,
    status: 'stalled',
    blockReason: 'litigation',
    blockReasonDetail: 'Approved Jan 2025 over Sierra Club Toiyabe appeal; Planning Commission denial reversed by Council. 82,000 sq ft / 6 acres. Listed for context — political heat in Reno.',
    stalledAt: '2025-01-22',
    relatedSources: [
      'https://thisisreno.com/2025/01/sierra-club-appeals-reno-planning-commission-data-center-approval/',
      'https://www.datacenterdynamics.com/en/news/sierra-club-appeals-against-82000-sq-ft-data-center-in-reno-nevada/',
    ],
  },

  // ── West Virginia ──────────────────────────────────────────────────────────
  {
    slug: 'wv-ridgeline-tucker',
    name: 'Ridgeline Facility',
    operator: 'Fundamental Data, LLC',
    ownerFunder: 'Fundamental Data, LLC (VA-based)',
    city: 'Davis (Tucker County)',
    state: 'WV',
    country: 'US',
    lat: 39.1284,
    lng: -79.4684,
    status: 'blocked',
    capacityMw: 785,
    blockReason: 'litigation',
    blockReasonDetail: 'Air-quality permit issued 2025; appealed by Tucker United, WV Highlands Conservancy, Sierra Club. 500 acres (potentially 10,000 into Grant Co). Plans 785 MW gas + 1.3 GW solar.',
    stalledAt: '2025-11-25',
    relatedSources: [
      'https://westvirginiawatch.com/2025/05/28/it-will-destroy-this-place-tucker-county-residents-fight-for-future-against-proposed-data-center/',
      'https://www.wvhighlands.org/tucker-county-data-center-ridgeline-facility/',
      'https://mountainstatespotlight.org/2025/11/25/tucker-co-data-center-air-quality-permit/',
    ],
  },
  {
    slug: 'wv-adams-fork-mingo',
    name: 'Adams Fork Energy DC + Ammonia Plant',
    operator: 'TransGas',
    ownerFunder: 'TransGas (NY-based)',
    city: 'Wharncliffe (Mingo County)',
    state: 'WV',
    country: 'US',
    lat: 37.5168,
    lng: -82.0815,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Air permit 2024; opposition escalating into 2026 election cycle. Project history of pivots (coal-to-liquids → ammonia → DC). 200,000 sq ft DC + ammonia plant.',
    relatedSources: ['https://mountainstatespotlight.org/2026/05/03/mingo-county-data-centers/'],
  },
  {
    slug: 'wv-monarch-mason',
    name: 'Monarch AI Data Center Campus',
    operator: 'Fidelis',
    ownerFunder: 'Fidelis',
    city: 'Point Pleasant (Mason County)',
    state: 'WV',
    country: 'US',
    lat: 38.8451,
    lng: -82.1376,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Site of HB 2014 signing ceremony. Moving forward under HB 2014 cover but community trust collapse — listed for governor outreach context. 2,000+ acres.',
    relatedSources: ['https://westvirginiawatch.com/2025/04/30/morrisey-signs-priority-bill-meant-to-incentivize-data-centers-micro-grids-locating-in-wv/'],
  },
  {
    slug: 'wv-bioenergy-mason',
    name: 'Bioenergy + Carbon Capture DC complex',
    city: 'Point Pleasant (Mason County)',
    state: 'WV',
    country: 'US',
    lat: 38.8451,
    lng: -82.1476,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Early planning, bundled with coal/CCS. Community opposition forming.',
    relatedSources: ['https://mountainstatespotlight.org/2025/09/28/data-center-residents-questions-unanswered/'],
  },

  // ── Oklahoma ───────────────────────────────────────────────────────────────
  {
    slug: 'ok-google-stillwater',
    name: 'Google Stillwater Campus (6 DCs)',
    operator: 'Google',
    ownerFunder: 'Google (Alphabet)',
    city: 'Stillwater (Payne County)',
    state: 'OK',
    country: 'US',
    lat: 36.1156,
    lng: -97.0586,
    status: 'stalled',
    blockReason: 'litigation',
    blockReasonDetail: '$9B campus; ~3B gallons/yr water at full buildout. Park View Estates HOA suit (Aug 2025) over runoff/sediment damage; contractors Kipper LLC, Manhattan Construction, Olsson, Emery Sapp & Sons named.',
    stalledAt: '2025-08-19',
    relatedSources: [
      'https://www.news9.com/story/68a87d4cd79483d4597c5395/stillwater-homeowner-association-sues-google-data-center-construction',
      'https://tulsaworld.com/news/local/business/article_dbde137a-b934-4fec-aab2-71099701fd52.html',
    ],
  },
  {
    slug: 'ok-project-atlas-coweta',
    name: 'Project Atlas',
    operator: 'Beale Infrastructure',
    ownerFunder: 'Beale Infrastructure',
    city: 'Coweta (Wagoner County)',
    state: 'OK',
    country: 'US',
    lat: 35.9526,
    lng: -95.6519,
    status: 'stalled',
    blockReason: 'water',
    blockReasonDetail: '$800M. Originally planned 5.4M gal/day water; switched to air-cooled after pushback; developer offering to build city wastewater plant. Zoning hearings deferred.',
    relatedSources: [
      'https://www.readfrontier.org/stories/as-data-centers-boom-in-oklahoma-so-does-water-demand/',
      'https://www.kosu.org/energy-environment/2025-11-17/we-see-these-coming-how-oklahoma-communities-are-prepping-for-data-centers',
    ],
  },
  {
    slug: 'ok-yukon-gamma',
    name: 'Yukon DC (Gamma Resources)',
    operator: 'Gamma Resources',
    ownerFunder: 'Gamma Resources',
    city: 'Yukon (Canadian County)',
    state: 'OK',
    country: 'US',
    lat: 35.5067,
    lng: -97.7625,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Zoning hearings deferred twice on local outcry.',
    relatedSources: [
      'https://www.datacenterdynamics.com/en/news/data-center-proposal-in-luther-oklahoma-faces-opposition-prior-to-official-filing/',
      'https://www.readfrontier.org/stories/fact-check-are-claims-about-oklahoma-data-centers-holding-up/',
    ],
  },
  {
    slug: 'ok-beltline-luther',
    name: 'Beltline Energy / Luther Site',
    operator: 'Beltline Energy',
    ownerFunder: 'Beltline Energy',
    city: 'Luther (Oklahoma County)',
    state: 'OK',
    country: 'US',
    lat: 35.6606,
    lng: -97.1947,
    status: 'blocked',
    blockReason: 'community',
    blockReasonDetail: 'Heavy pre-filing opposition: "Citizens for Responsible Development" group. Concerns: noise, property values, water. Near Redbud power plant.',
    relatedSources: ['https://www.datacenterdynamics.com/en/news/data-center-proposal-in-luther-oklahoma-faces-opposition-prior-to-official-filing/'],
  },
  {
    slug: 'ok-stillwater-power-referendum',
    name: 'Stillwater Power Buildout (DC support referendum)',
    city: 'Stillwater',
    state: 'OK',
    country: 'US',
    lat: 36.1056,
    lng: -97.0686,
    status: 'stalled',
    blockReason: 'power',
    blockReasonDetail: 'Voter-approved Nov 2024 for DC power buildout — but ratepayer cost concerns continue. Listed for governor narrative context.',
    stalledAt: '2024-11-04',
    relatedSources: ['https://www.kosu.org/politics/2024-11-04/stillwater-voters-to-decide-how-to-power-data-center-project'],
  },
  {
    slug: 'ok-meta-anthem-tulsa',
    name: 'Project Anthem (Meta Tulsa)',
    operator: 'Meta',
    ownerFunder: 'Meta',
    city: 'Tulsa',
    state: 'OK',
    country: 'US',
    lat: 36.1540,
    lng: -95.9928,
    status: 'stalled',
    blockReason: 'community',
    blockReasonDetail: 'Proceeding (Apr 2026 groundbreak). Listed as repeat-buyer signal — Meta is a known Konative-relevant operator.',
    stalledAt: '2026-04-01',
    relatedSources: ['https://www.newson6.com/tulsa-oklahoma-news/tulsa-meta-data-center-project-announcement'],
  },
  {
    slug: 'ok-google-muskogee',
    name: 'Google Muskogee DC',
    operator: 'Google',
    ownerFunder: 'Google (Alphabet)',
    city: 'Muskogee',
    state: 'OK',
    country: 'US',
    lat: 35.7479,
    lng: -95.3697,
    status: 'stalled',
    blockReason: 'water',
    blockReasonDetail: 'Proceeding under scrutiny — legislators raising water concerns Feb 2026.',
    stalledAt: '2026-02-01',
    relatedSources: ['https://www.okenergytoday.com/2026/02/legislators-worry-about-google-centers-impact-on-water-use/'],
  },
]

// ── Upserts ───────────────────────────────────────────────────────────────────

async function upsertGovernors() {
  let n = 0
  for (const g of GOVERNORS) {
    await sanity.createOrReplace({
      _id: `governor.${g.state}`,
      _type: 'governor',
      state: g.state,
      stateName: g.stateName,
      name: g.name,
      party: g.party,
      termEnds: g.termEnds,
      capitalCity: g.capitalCity,
      capitalLocation: { _type: 'geopoint', lat: g.lat, lng: g.lng },
      ngaRole: g.ngaRole,
      ngaInitiative: g.ngaInitiative,
      dcPolicyNotes: g.dcPolicyNotes,
      accessNotes: g.accessNotes,
      priority: g.priority,
      sources: g.sources,
    })
    n++
  }
  console.log(`Governors upserted: ${n}`)
}

async function upsertProjects() {
  let n = 0
  for (const p of PROJECTS) {
    await sanity.createOrReplace({
      _id: `dcProject.governor-seed.${p.slug}`,
      _type: 'dataCenterProject',
      name: p.name,
      operator: p.operator,
      location: { _type: 'geopoint', lat: p.lat, lng: p.lng },
      city: p.city,
      state: p.state,
      country: p.country,
      status: p.status,
      capacityMw: p.capacityMw,
      blockReason: p.blockReason,
      blockReasonDetail: p.blockReasonDetail,
      ownerFunder: p.ownerFunder,
      relatedSources: p.relatedSources,
      stalledAt: p.stalledAt,
      source: 'manual',
      sourceId: p.slug,
      sourceUrl: p.relatedSources[0],
      extractionConfidence: 1.0,
      lastSeenAt: new Date().toISOString(),
      verified: false,
    })
    n++
  }
  console.log(`Stalled / blocked projects upserted: ${n}`)
}

;(async () => {
  try {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
      console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN env vars.')
      process.exit(1)
    }
    await upsertGovernors()
    await upsertProjects()
    console.log('\nSeed complete. Visit Sanity Studio to verify.')
  } catch (e) {
    console.error('Seed failed:', e)
    process.exit(1)
  }
})()
