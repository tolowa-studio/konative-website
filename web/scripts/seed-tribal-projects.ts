/**
 * One-shot seed for tribal / First Nations data center projects across US + Canada.
 *
 * Sourced from the Notion dossier "Tribal & First Nations data centers — US/Canada
 * (research pass)" (Konative.com Project Hub, 2026-05-08).
 *
 * Run: cd web && npx tsx --env-file=.env.local scripts/seed-tribal-projects.ts
 *
 * Idempotent: deterministic _ids; createOrReplace overwrites manual edits.
 */
import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface TribalSeed {
  slug: string
  name: string
  tribe: string
  city: string
  state: string
  country: 'US' | 'CA'
  lat: number
  lng: number
  tribalStatus:
    | 'operating'
    | 'approved'
    | 'feasibility'
    | 'opposition'
    | 'moratorium'
    | 'stranded-coal'
  partnerStructure?: string
  landType?:
    | 'on-reservation'
    | 'off-reservation'
    | 'fn-reserve'
    | 'traditional-territory'
    | 'stranded-coal'
  opportunityClass?: 'class-1' | 'class-2' | 'class-3' | 'context'
  capacityMw?: number
  partner?: string
  summary: string
  contactPath?: string
  voteOrDate?: string
  sources: string[]
  priority: number
}

const TRIBAL_PROJECTS: TribalSeed[] = [
  // ── Class 1 — Stranded coal infrastructure (no active DC project) ──────────
  {
    slug: 'navajo-ngs-kayenta',
    name: 'Navajo Generating Station / Kayenta Mine corridor',
    tribe: 'Navajo Nation',
    city: 'Page',
    state: 'AZ',
    country: 'US',
    lat: 36.9078,
    lng: -111.4564,
    tribalStatus: 'stranded-coal',
    landType: 'stranded-coal',
    opportunityClass: 'class-1',
    capacityMw: 2250,
    partner: '(Salt River Project — former operator)',
    partnerStructure: 'Tribally-led; HEARTH Act lease; Diné Development Corp + Nova Corp',
    summary: '2,250 MW coal plant ceased commercial generation 2019; primary stack demolished Oct 2024. 500 kV transmission to Phoenix + Las Vegas, Lake Powell water rights, 44,000-ac footprint, switchyard, rail spur. FAS (2025) flagged as candidate for adaptive reuse for AI data centers. Navajo Nation has NO moratorium and runs the Innava commercial DC via Nova Corp.',
    contactPath: 'Diné Development Corporation (Window Rock); Navajo Nation Office of the President; Nova Corp leadership.',
    sources: [
      'https://fas.org/publication/adaptive-reuse-legacy-coal-infrastructure/',
      'https://payneinstitute.mines.edu/the-future-of-ai-runs-through-indian-country/',
    ],
    priority: 1,
  },
  {
    slug: 'crow-westmoreland-colstrip',
    name: 'Westmoreland coal lease lands / Colstrip corridor',
    tribe: 'Crow Nation',
    city: 'Crow Agency',
    state: 'MT',
    country: 'US',
    lat: 45.6044,
    lng: -107.4593,
    tribalStatus: 'stranded-coal',
    landType: 'stranded-coal',
    opportunityClass: 'class-1',
    partnerStructure: 'No moratorium; tribally-led economic development looking for replacement revenue',
    summary: 'Crow Nation economy depended on coal royalties from Westmoreland Absaloka Mine (closed 2021–22), Spring Creek complex, plus retired Colstrip Units 1&2 (2020). Existing 500 kV Colstrip transmission corridor to PNW markets. FAS flagged Crow alongside Navajo/Hopi as a stranded-infrastructure candidate.',
    contactPath: 'Crow Nation Executive Branch; Apsáalooke Nation Department of Energy.',
    sources: ['https://fas.org/publication/adaptive-reuse-legacy-coal-infrastructure/'],
    priority: 2,
  },
  {
    slug: 'hopi-kayenta',
    name: 'Hopi Tribe — adjacent to Navajo / Kayenta closures',
    tribe: 'Hopi Tribe',
    city: 'Kykotsmovi Village',
    state: 'AZ',
    country: 'US',
    lat: 35.8783,
    lng: -110.6135,
    tribalStatus: 'stranded-coal',
    landType: 'stranded-coal',
    opportunityClass: 'class-1',
    partnerStructure: 'Smaller land base; historically more politically reluctant than Navajo',
    summary: 'Adjacent stranded coal opportunity on the Kayenta side. Smaller land base than Navajo and historically more political reluctance. Worth a phone call but not a primary target.',
    contactPath: 'Hopi Tribal Council.',
    sources: ['https://fas.org/publication/adaptive-reuse-legacy-coal-infrastructure/'],
    priority: 12,
  },

  // ── Class 2 — Orphaned developer (project just died, dev needs new home) ──
  {
    slug: 'sault-ste-marie-innova',
    name: 'Sault Tribe M-28 site (Innova Capital Partners discovery)',
    tribe: 'Sault Ste. Marie Tribe of Chippewa Indians',
    city: 'Upper Peninsula (M-28 site)',
    state: 'MI',
    country: 'US',
    lat: 46.5,
    lng: -86.6,
    tribalStatus: 'moratorium',
    landType: 'on-reservation',
    opportunityClass: 'class-2',
    partner: 'Innova Capital Partners (NY)',
    partnerStructure: 'Discovery phase — moratorium passed unanimously April 7 2026',
    summary: 'Innova was in discovery phase for an M-28 UP site; community pushback at March 24 board meeting drove a unanimous April 7 2026 moratorium. Innova has stated diligence on a tribal-trust-land DC strategy and just lost their site — actively hunting for the next tribal partner.',
    contactPath: 'Innova Capital Partners (NY) — directly. They are the developer most likely to walk into a Class-1 site (Navajo/Crow) ready to move.',
    voteOrDate: 'Unanimous moratorium, April 7 2026',
    sources: [
      'https://michiganadvance.com/2026/04/10/community-pushback-prompts-sault-tribe-leadership-to-adopt-moratorium-on-data-centers/',
      'https://gandernewsroom.com/news/rural/upper-peninsula-tribe-halts-data-center-plans-after-community-pushback/',
    ],
    priority: 3,
  },
  {
    slug: 'seminole-nation-startup',
    name: 'Unnamed startup approach (NDA + LOI)',
    tribe: 'Seminole Nation of Oklahoma',
    city: 'Wewoka',
    state: 'OK',
    country: 'US',
    lat: 35.1626,
    lng: -96.4936,
    tribalStatus: 'moratorium',
    landType: 'on-reservation',
    opportunityClass: 'class-2',
    partnerStructure: 'NDA-first / LOI-immediate; moratorium passed 24–0 unanimously',
    summary: 'A startup approached the Tribal Council with NDA + LOI before disclosing details. Council passed unanimous moratorium March 7 2026 (covers genAI + hyperscale). Resolution sponsor Glen Chebon Kernell has direct knowledge of the developer.',
    contactPath: 'Tribal Council member Glen Chebon Kernell (Mekusukey Band Rep) — sponsored the resolution; may know who else the developer shopped.',
    voteOrDate: '24–0 unanimous, March 7 2026',
    sources: [
      'https://nativenewsonline.net/sovereignty/seminole-nation-of-oklahoma-passes-moratorium-on-data-centers/',
      'https://www.okenergytoday.com/2026/03/first-tribal-council-to-block-data-center-development-on-tribal-lands-not-ready/',
    ],
    priority: 4,
  },
  {
    slug: 'muscogee-creek-mvskoke-tech-park',
    name: 'Mvskoke Tech Park (Looped Square Ranch)',
    tribe: 'Muscogee (Creek) Nation',
    city: 'Okmulgee County (Looped Square Ranch)',
    state: 'OK',
    country: 'US',
    lat: 35.5,
    lng: -96.0,
    tribalStatus: 'opposition',
    landType: 'on-reservation',
    opportunityClass: 'class-2',
    partnerStructure: 'No moratorium passed; failed 4–11 (some accounts 9–4); next ballot window Nov',
    summary: '5,570-acre food-sovereignty / cattle land rezoning to data center park. Citizen pressure was about water + ag conflict on the specific site, not data centers categorically. National Council voted down 4–11 (Nov 2025). Subsequent ballot initiatives postponed to November. Lower-confidence candidate — wrong site, possibly right tribe?',
    contactPath: 'Muscogee (Creek) Nation Speaker\'s office; MCN business arm.',
    voteOrDate: '4–11 vote Nov 2025; legislation postponed to Nov',
    sources: [
      'https://www.mvskokemedia.com/ballot-initiative-replacements-to-be-voted-on-by-citizens-mvskoke-tech-park-legislation-postponed-for-november/',
    ],
    priority: 5,
  },
  {
    slug: 'ebci-cherokee-nc',
    name: 'Eastern Band of Cherokee Indians DC moratorium',
    tribe: 'Eastern Band of Cherokee Indians',
    city: 'Cherokee',
    state: 'NC',
    country: 'US',
    lat: 35.4737,
    lng: -83.3158,
    tribalStatus: 'moratorium',
    landType: 'on-reservation',
    opportunityClass: 'class-2',
    partnerStructure: 'Indefinite moratorium 11–0; no specific developer publicly named',
    summary: 'Dinilawigi (Tribal Council) passed Ord. No. 158 (2026) 11–0 indefinite moratorium May 7 2026. Passed largely on regional water/community concerns; no specific developer publicly named.',
    voteOrDate: '11–0, May 7 2026 (Ord. No. 158)',
    sources: [
      'https://theonefeather.com/2026/05/07/dinilawigi-approves-indefinite-moratorium-on-data-centers/',
      'https://www.wunc.org/2026-05-07/ebci-passes-indefinite-moratorium-on-data-centers',
    ],
    priority: 8,
  },

  // ── Class 3 — Canadian approved / under development ──────────────────────
  {
    slug: 'woodland-cree-mihta-askiy',
    name: 'Mihta Askiy Datacenter',
    tribe: 'Woodland Cree First Nation',
    city: 'NE of Peace River',
    state: 'AB',
    country: 'CA',
    lat: 56.5,
    lng: -116.8,
    tribalStatus: 'approved',
    landType: 'fn-reserve',
    opportunityClass: 'class-3',
    capacityMw: 650,
    partner: 'Sovereign Digital Infrastructure',
    partnerStructure: '51% Woodland Cree, 49% Sovereign Digital Infrastructure',
    summary: 'Two 200 MW Siemens turbines already procured + grid backup + on-site natural gas. Partially-built gas plant being acquired; gas startup mid-2027. The most committed, most-shovel-ready Indigenous-led project in North America as of May 2026 — they will be hunting tenants. Obvious destination for developers stranded by Wonder Valley-style opposition.',
    contactPath: 'Mihta Askiy Datacenter LP via Sovereign Digital Infrastructure (Calgary); Woodland Cree FN economic development.',
    voteOrDate: 'Equipment procured; gas startup ~mid-2027',
    sources: [
      'https://www.datacenterdynamics.com/en/news/woodland-cree-first-nation-to-develop-650mw-data-center-in-alberta-canada/',
      'https://www.cbc.ca/news/canada/edmonton/first-indigenous-data-centre-abandoned-power-plant-1.7586072',
      'https://sovereigndigitalinfrastructure.com/',
    ],
    priority: 6,
  },
  {
    slug: 'upper-nicola-bell-itel',
    name: 'Bell / iTel data centre on Lot 87',
    tribe: 'Upper Nicola Band',
    city: 'Near Nicola Lake (Merritt)',
    state: 'BC',
    country: 'CA',
    lat: 50.1126,
    lng: -120.7866,
    tribalStatus: 'approved',
    landType: 'fn-reserve',
    opportunityClass: 'class-3',
    partner: 'Bell Canada + iTel Networks',
    partnerStructure: 'Membership-approved 98–33 (75%); 2-yr construction',
    summary: '$500M, 100–150 acres, ~200 permanent + 2,000 construction jobs. Part of a 6-site Bell/iTel BC plan (3 in Kamloops). Community vote: 98–33 (75%). Locked Bell + iTel as anchors — less pivot-able for stranded-developer thesis but the benchmark for "deal economics done right."',
    voteOrDate: '98–33 (75%) approved by membership',
    sources: [
      'https://www.castanetkamloops.net/news/Kamloops/561613/Merritt-area-First-Nation-votes-to-approve-Bell-data-centre-on-band-land-near-Nicola-Lake',
      'https://www.merrittherald.com/upper-nicola-indian-band-vote-yes-on-welcoming-one-of-the-countrys-largest-ai-data-centres/',
    ],
    priority: 11,
  },
  {
    slug: 'prophet-river-abct',
    name: 'Prophet River — ABCT Pacific (VCC) DC',
    tribe: 'Prophet River First Nation',
    city: 'Near Fort St. John',
    state: 'BC',
    country: 'CA',
    lat: 56.2467,
    lng: -120.847,
    tribalStatus: 'approved',
    landType: 'fn-reserve',
    opportunityClass: 'class-3',
    partner: 'ABCT Pacific (VCC) Ltd',
    partnerStructure: 'PRFN majority owner; LOI signed March 5 2025',
    summary: 'LOI signed March 5 2025. Real value is the Site C Dam (~1.1 GW clean hydro). Cooler climate + BC Hydro tariff. Earliest of the three Canadian projects to potentially restructure if a stranded developer arrived with a turnkey design.',
    contactPath: 'Prophet River First Nation Council; ABCT Pacific (Vancouver).',
    voteOrDate: 'LOI signed March 5 2025',
    sources: [
      'https://www.newswire.ca/news-releases/prophet-river-first-nation-and-abct-pacific-vcc-ltd-sign-loi-to-jointly-develop-major-data-centre-in-fort-st-john-area-819620927.html',
      'https://www.datacenterdynamics.com/en/news/canadian-first-nation-prophet-river-fn-plans-data-center-in-british-columbia/',
    ],
    priority: 9,
  },
  {
    slug: 'george-gordon-bell-regina',
    name: 'Bell Canada AI data centre (urban reserve)',
    tribe: 'George Gordon First Nation',
    city: 'Near Regina (RM of Sherwood)',
    state: 'SK',
    country: 'CA',
    lat: 50.4452,
    lng: -104.6189,
    tribalStatus: 'approved',
    landType: 'fn-reserve',
    opportunityClass: 'class-3',
    partner: 'Bell Canada (in talks)',
    partnerStructure: 'Documents filed with RM of Sherwood; talks ongoing',
    summary: '233-ha urban reserve near U. of Regina / Sask Polytech. Documents filed with RM of Sherwood; talks ongoing. One band member raising water/source-disclosure concerns.',
    sources: ['https://www.cbc.ca/news/indigenous/george-gordon-data-centre-regina-9.7103258'],
    priority: 13,
  },

  // ── U.S. — Operating tribal DCs (context) ─────────────────────────────────
  {
    slug: 'navajo-innava',
    name: 'Innava Data Solutions (Nova Corp / DDC)',
    tribe: 'Navajo Nation',
    city: 'Albuquerque',
    state: 'NM',
    country: 'US',
    lat: 35.0844,
    lng: -106.6504,
    tribalStatus: 'operating',
    landType: 'off-reservation',
    opportunityClass: 'context',
    partner: 'Nova Corp / Diné Development Corp',
    partnerStructure: 'Tribally-owned subsidiary; off-reservation site',
    summary: 'Operating since 2011. ~50–80k sq ft (130k bldg). SLA waives sovereign immunity for customers. DoD / DOE / state-of-NM customers. Demonstrates that Diné Development Corp / Nova Corp is technically and contractually sophisticated.',
    sources: [
      'https://www.datacenterknowledge.com/business/navajo-owned-data-center-offers-way-to-diversify-tribe-s-revenue-base-beyond-casinos',
      'https://ddc-dine.com/nova/',
    ],
    priority: 7,
  },
  {
    slug: 'potawatomi-data-holdings',
    name: 'Data Holdings (Potawatomi Ventures)',
    tribe: 'Forest County Potawatomi',
    city: 'Milwaukee',
    state: 'WI',
    country: 'US',
    lat: 43.0389,
    lng: -87.9065,
    tribalStatus: 'operating',
    landType: 'off-reservation',
    opportunityClass: 'context',
    partner: 'Potawatomi Ventures',
    partnerStructure: 'Tribal enterprise; Tier III+',
    summary: 'Operating, Tier III+. Hosts Milwaukee Internet Exchange (MIX). Off-reservation but tribally owned.',
    sources: ['https://www.potawatomiventures.com/the-hub/data-holdings-is-new-home-of-the-milwaukee-internet-exchange'],
    priority: 14,
  },
  {
    slug: 'choctaw-hq',
    name: 'Choctaw Nation HQ Data Center / EOC',
    tribe: 'Choctaw Nation of Oklahoma',
    city: 'Durant',
    state: 'OK',
    country: 'US',
    lat: 33.9937,
    lng: -96.3711,
    tribalStatus: 'operating',
    landType: 'on-reservation',
    opportunityClass: 'context',
    partnerStructure: 'In-house; FSB-designed',
    summary: 'Internal tribal IT — not a commercial colocation. Included for context: tribally-owned operating DC capability.',
    sources: ['https://fsb-ae.com/project/choctaw-nation-data-center/'],
    priority: 18,
  },

  // ── U.S. — Studying / feasibility ─────────────────────────────────────────
  {
    slug: 'northern-arapaho-wind-river',
    name: 'Wind River feasibility study',
    tribe: 'Northern Arapaho',
    city: 'Wind River Indian Reservation',
    state: 'WY',
    country: 'US',
    lat: 43.0,
    lng: -108.7,
    tribalStatus: 'feasibility',
    landType: 'on-reservation',
    opportunityClass: 'context',
    partnerStructure: '$50K Wyoming Business Council grant; partner TBD',
    summary: 'Feasibility study approved 2024; "large climate-controlled" sized. $50K Wyoming Business Council grant. No partner named yet — early-stage opportunity to pre-position.',
    sources: [
      'https://cowboystatedaily.com/2026/04/20/wyoming-business-council-giving-50-000-so-tribe-can-study-data-centers/',
      'https://www.wyomingpublicmedia.org/natural-resources-energy/2026-02-13/feds-are-encouraging-tribes-to-partner-with-data-centers',
    ],
    priority: 10,
  },
  {
    slug: 'cherokee-nation-task-force',
    name: 'Cherokee Nation EO 2026-02-CTH task force',
    tribe: 'Cherokee Nation',
    city: 'Tahlequah (7,000 sq mi reservation)',
    state: 'OK',
    country: 'US',
    lat: 35.9154,
    lng: -94.9694,
    tribalStatus: 'feasibility',
    landType: 'on-reservation',
    opportunityClass: 'context',
    partnerStructure: 'Internal task force (9 members); led by Sec. of Natural Resources Christina Justice',
    summary: 'EO signed Feb 24 2026. Task force report due June 30 2026. Internal study, no commercial partner yet — but the Notion access notes named Todd Gord (Cherokee Nation) as the Konative path to Stitt.',
    voteOrDate: 'EO signed Feb 24 2026; report due June 30 2026',
    sources: [
      'https://www.cherokee.org/media/vejlwntl/eo2026-02-cthdatacenters20260224.pdf',
      'https://www.cherokeephoenix.org/news/cherokee-nation-establishes-task-force-to-study-the-impact-of-data-centers/article_173a3f43-b44b-43f4-a373-4dfa9293e45e.html',
    ],
    priority: 7,
  },

  // ── U.S. — Active opposition (no moratorium yet) ──────────────────────────
  {
    slug: 'saint-regis-mohawk-massena',
    name: 'Massena industrial-zone code change opposition',
    tribe: 'Saint Regis Mohawk Tribe (Akwesasne)',
    city: 'Massena',
    state: 'NY',
    country: 'US',
    lat: 44.9295,
    lng: -74.8923,
    tribalStatus: 'opposition',
    landType: 'traditional-territory',
    opportunityClass: 'context',
    partnerStructure: 'Opposed at public hearing (Jan 2026)',
    summary: 'Concerns: water intake, downstream PCB legacy from Alcoa/GM, electric rates. Opposition to a town-level industrial-zone code change.',
    sources: ['https://www.northcountrynow.com/stories/saint-regis-mohawk-tribal-members-voice-strong-opposition-to-data-centers-in-industrial-zones,351850'],
    priority: 16,
  },
  {
    slug: 'pokagon-dowagiac',
    name: 'Hyperscale Data / Alliance Cloud Services 49-acre expansion',
    tribe: 'Pokagon Band of Potawatomi',
    city: 'Dowagiac',
    state: 'MI',
    country: 'US',
    lat: 41.9847,
    lng: -86.1086,
    tribalStatus: 'opposition',
    landType: 'traditional-territory',
    opportunityClass: 'context',
    partnerStructure: 'Demanding transparency; not categorically opposed',
    summary: 'Concerns about open-loop cooling drawing aquifer water. Pokagon stance — "not opposed, want transparency" — confirms the pattern: tribes want to be partners early, not surprised late.',
    sources: ['https://www.heraldpalladium.com/leaderpub/communities/dowagiac/pokagon-band-supports-dowagiacs-call-for-data-center-transparency/article_ebe19b30-8805-561a-b43c-f705340fb5a3.html'],
    priority: 17,
  },
  {
    slug: 'yakama-wa-tax-incentive',
    name: 'WA statewide DC tax incentive opposition',
    tribe: 'Yakama Nation',
    city: 'Toppenish',
    state: 'WA',
    country: 'US',
    lat: 46.3787,
    lng: -120.3091,
    tribalStatus: 'opposition',
    landType: 'traditional-territory',
    opportunityClass: 'context',
    partnerStructure: 'Opposed continuation without salmon/tribal-resource protections',
    summary: 'Yakama Nation issued findings & recommendations Nov 10 2025 opposing continuation of state DC tax incentives without salmon and tribal-resource protections. Statewide policy opposition rather than a single project.',
    voteOrDate: 'Findings published Nov 10 2025',
    sources: ['https://yakamafish-nsn.gov/sites/default/files/Yakama%20Nation%20Data%20Center%20Findings%20and%20Recommendations%20Nov%2010%202025%20only.pdf'],
    priority: 19,
  },

  // ── Canada — Active opposition / treaty-territory disputes ────────────────
  {
    slug: 'sturgeon-lake-wonder-valley',
    name: 'Wonder Valley opposition (O\'Leary Ventures, $70B)',
    tribe: 'Sturgeon Lake Cree Nation',
    city: 'MD of Greenview (near Grande Prairie)',
    state: 'AB',
    country: 'CA',
    lat: 55.7,
    lng: -118.7,
    tribalStatus: 'opposition',
    landType: 'traditional-territory',
    opportunityClass: 'context',
    partner: 'O\'Leary Ventures',
    partnerStructure: 'Cease-and-desist issued; lost AB Environmental Appeals Board challenge on water licence',
    summary: 'Project sits on Sturgeon Lake\'s traditional territory. Nation issued cease-and-desist to Premier Smith, lost AB EAB challenge, now appealing to AB superior court. Project granted EIA exemption. DeSmog headlined "wheels falling off" Feb 2025. Counterpoint to Mihta Askiy: same province, opposite story.',
    sources: [
      'https://www.ctvnews.ca/edmonton/article/first-nation-says-it-wasnt-consulted-on-wonder-valley-ai-data-centre-proposed-for-thousands-of-hectares-of-land/',
      'https://www.desmog.com/2025/02/19/the-wheels-are-falling-off-albertas-gas-powered-ai-data-centre-proposal/',
    ],
    priority: 15,
  },
]

;(async () => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN env vars.')
    process.exit(1)
  }

  let n = 0
  for (const p of TRIBAL_PROJECTS) {
    await sanity.createOrReplace({
      _id: `tribalProject.${p.slug}`,
      _type: 'tribalProject',
      name: p.name,
      tribe: p.tribe,
      location: { _type: 'geopoint', lat: p.lat, lng: p.lng },
      city: p.city,
      state: p.state,
      country: p.country,
      tribalStatus: p.tribalStatus,
      partnerStructure: p.partnerStructure,
      landType: p.landType,
      opportunityClass: p.opportunityClass,
      capacityMw: p.capacityMw,
      partner: p.partner,
      summary: p.summary,
      contactPath: p.contactPath,
      voteOrDate: p.voteOrDate,
      sources: p.sources,
      priority: p.priority,
    })
    n++
  }
  console.log(`Tribal projects upserted: ${n}`)
  console.log('Done. Visit Sanity Studio (Tribal / First Nations Data Center Project) to verify.')
})()
