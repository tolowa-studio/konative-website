/**
 * Seed all 50 US governor docs for /governors map (idempotent).
 *
 * Run: cd web && npx tsx --env-file=.env.local scripts/seed-all-governors.ts
 *
 * Does NOT touch dataCenterProject docs — governors only.
 */
import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

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
    dcPolicyNotes: 'SB 484 (signed May 7, 2026) — first-in-nation law shielding ratepayers from DC cost-shifting; strengthens local zoning; bars "foreign countries of concern" from DC ownership. Chilled the $13.5B Project Jarvis.',
    accessNotes: 'Konative path: Darren Light. Pitch is "the DC type that passes the SB 484 cost-of-service test" (own power, own water).',
    priority: 4,
    sources: [
      'https://www.flgov.com/eog/news/press/2026/governor-ron-desantis-signs-law-protect-floridians-subsidizing-data-centers',
    ],
  },
  {
    state: 'AK',
    stateName: 'Alaska',
    name: 'Mike Dunleavy',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Juneau',
    lat: 58.3019,
    lng: -134.4197,
    priority: 5,
    sources: [
      'https://en.wikipedia.org/wiki/Mike_Dunleavy',
    ],
  },
  {
    state: 'AL',
    stateName: 'Alabama',
    name: 'Kay Ivey',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Montgomery',
    lat: 32.3668,
    lng: -86.3,
    priority: 6,
    sources: [
      'https://en.wikipedia.org/wiki/Kay_Ivey',
    ],
  },
  {
    state: 'AR',
    stateName: 'Arkansas',
    name: 'Sarah Huckabee Sanders',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Little Rock',
    lat: 34.7465,
    lng: -92.2896,
    priority: 7,
    sources: [
      'https://en.wikipedia.org/wiki/Sarah_Huckabee_Sanders',
    ],
  },
  {
    state: 'AZ',
    stateName: 'Arizona',
    name: 'Katie Hobbs',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Phoenix',
    lat: 33.4484,
    lng: -112.074,
    dcPolicyNotes: 'Phoenix metro and rural Arizona face water-scrutiny and local moratorium debates on hyperscale campuses.',
    priority: 8,
    sources: [
      'https://en.wikipedia.org/wiki/Katie_Hobbs',
    ],
  },
  {
    state: 'CA',
    stateName: 'California',
    name: 'Gavin Newsom',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Sacramento',
    lat: 38.5816,
    lng: -121.4944,
    priority: 9,
    sources: [
      'https://en.wikipedia.org/wiki/Gavin_Newsom',
    ],
  },
  {
    state: 'CO',
    stateName: 'Colorado',
    name: 'Jared Polis',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Denver',
    lat: 39.7392,
    lng: -104.9903,
    priority: 10,
    sources: [
      'https://en.wikipedia.org/wiki/Jared_Polis',
    ],
  },
  {
    state: 'CT',
    stateName: 'Connecticut',
    name: 'Ned Lamont',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Hartford',
    lat: 41.7658,
    lng: -72.6734,
    priority: 11,
    sources: [
      'https://en.wikipedia.org/wiki/Ned_Lamont',
    ],
  },
  {
    state: 'DE',
    stateName: 'Delaware',
    name: 'Matt Meyer',
    party: 'Democratic',
    termEnds: 'Jan 2029',
    capitalCity: 'Dover',
    lat: 39.1582,
    lng: -75.5244,
    priority: 12,
    sources: [
      'https://en.wikipedia.org/wiki/Matt_Meyer_(politician)',
    ],
  },
  {
    state: 'GA',
    stateName: 'Georgia',
    name: 'Brian Kemp',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Atlanta',
    lat: 33.749,
    lng: -84.388,
    dcPolicyNotes: 'Metro Atlanta and rural utility-scale data center approvals remain politically contested (water, grid, local zoning).',
    priority: 13,
    sources: [
      'https://en.wikipedia.org/wiki/Brian_Kemp',
    ],
  },
  {
    state: 'HI',
    stateName: 'Hawaii',
    name: 'Josh Green',
    party: 'Democratic',
    termEnds: 'Jan 2026 (term-limited)',
    capitalCity: 'Honolulu',
    lat: 21.3069,
    lng: -157.8583,
    priority: 14,
    sources: [
      'https://en.wikipedia.org/wiki/Josh_Green_(politician)',
    ],
  },
  {
    state: 'IA',
    stateName: 'Iowa',
    name: 'Kim Reynolds',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Des Moines',
    lat: 41.5868,
    lng: -93.625,
    priority: 15,
    sources: [
      'https://en.wikipedia.org/wiki/Kim_Reynolds',
    ],
  },
  {
    state: 'ID',
    stateName: 'Idaho',
    name: 'Brad Little',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Boise',
    lat: 43.615,
    lng: -116.2023,
    priority: 16,
    sources: [
      'https://en.wikipedia.org/wiki/Brad_Little',
    ],
  },
  {
    state: 'IL',
    stateName: 'Illinois',
    name: 'JB Pritzker',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Springfield',
    lat: 39.7817,
    lng: -89.6501,
    priority: 17,
    sources: [
      'https://en.wikipedia.org/wiki/JB_Pritzker',
    ],
  },
  {
    state: 'IN',
    stateName: 'Indiana',
    name: 'Mike Braun',
    party: 'Republican',
    termEnds: 'Jan 2029',
    capitalCity: 'Indianapolis',
    lat: 39.7684,
    lng: -86.1581,
    priority: 18,
    sources: [
      'https://en.wikipedia.org/wiki/Mike_Braun',
    ],
  },
  {
    state: 'KS',
    stateName: 'Kansas',
    name: 'Laura Kelly',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Topeka',
    lat: 39.0473,
    lng: -95.6752,
    priority: 19,
    sources: [
      'https://en.wikipedia.org/wiki/Laura_Kelly',
    ],
  },
  {
    state: 'KY',
    stateName: 'Kentucky',
    name: 'Andy Beshear',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Frankfort',
    lat: 38.2009,
    lng: -84.8733,
    priority: 20,
    sources: [
      'https://en.wikipedia.org/wiki/Andy_Beshear',
    ],
  },
  {
    state: 'LA',
    stateName: 'Louisiana',
    name: 'Jeff Landry',
    party: 'Republican',
    termEnds: 'Jan 2028',
    capitalCity: 'Baton Rouge',
    lat: 30.4515,
    lng: -91.1871,
    priority: 21,
    sources: [
      'https://en.wikipedia.org/wiki/Jeff_Landry',
    ],
  },
  {
    state: 'MA',
    stateName: 'Massachusetts',
    name: 'Maura Healey',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Boston',
    lat: 42.3601,
    lng: -71.0589,
    priority: 22,
    sources: [
      'https://en.wikipedia.org/wiki/Maura_Healey',
    ],
  },
  {
    state: 'MD',
    stateName: 'Maryland',
    name: 'Wes Moore',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Annapolis',
    lat: 38.9784,
    lng: -76.4922,
    priority: 23,
    sources: [
      'https://en.wikipedia.org/wiki/Wes_Moore',
    ],
  },
  {
    state: 'ME',
    stateName: 'Maine',
    name: 'Janet Mills',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Augusta',
    lat: 44.3106,
    lng: -69.7795,
    priority: 24,
    sources: [
      'https://en.wikipedia.org/wiki/Janet_Mills',
    ],
  },
  {
    state: 'MI',
    stateName: 'Michigan',
    name: 'Gretchen Whitmer',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Lansing',
    lat: 42.7325,
    lng: -84.5555,
    priority: 25,
    sources: [
      'https://en.wikipedia.org/wiki/Gretchen_Whitmer',
    ],
  },
  {
    state: 'MN',
    stateName: 'Minnesota',
    name: 'Tim Walz',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Saint Paul',
    lat: 44.9537,
    lng: -93.09,
    priority: 26,
    sources: [
      'https://en.wikipedia.org/wiki/Tim_Walz',
    ],
  },
  {
    state: 'MO',
    stateName: 'Missouri',
    name: 'Mike Kehoe',
    party: 'Republican',
    termEnds: 'Jan 2029',
    capitalCity: 'Jefferson City',
    lat: 38.5767,
    lng: -92.1735,
    priority: 27,
    sources: [
      'https://en.wikipedia.org/wiki/Mike_Kehoe',
    ],
  },
  {
    state: 'MS',
    stateName: 'Mississippi',
    name: 'Tate Reeves',
    party: 'Republican',
    termEnds: 'Jan 2028',
    capitalCity: 'Jackson',
    lat: 32.2988,
    lng: -90.1848,
    priority: 28,
    sources: [
      'https://en.wikipedia.org/wiki/Tate_Reeves',
    ],
  },
  {
    state: 'MT',
    stateName: 'Montana',
    name: 'Greg Gianforte',
    party: 'Republican',
    termEnds: 'Jan 2029',
    capitalCity: 'Helena',
    lat: 46.5891,
    lng: -112.0391,
    priority: 29,
    sources: [
      'https://en.wikipedia.org/wiki/Greg_Gianforte',
    ],
  },
  {
    state: 'NC',
    stateName: 'North Carolina',
    name: 'Josh Stein',
    party: 'Democratic',
    termEnds: 'Jan 2029',
    capitalCity: 'Raleigh',
    lat: 35.7796,
    lng: -78.6382,
    priority: 30,
    sources: [
      'https://en.wikipedia.org/wiki/Josh_Stein',
    ],
  },
  {
    state: 'ND',
    stateName: 'North Dakota',
    name: 'Kelly Armstrong',
    party: 'Republican',
    termEnds: 'Jan 2029',
    capitalCity: 'Bismarck',
    lat: 46.8083,
    lng: -100.7837,
    priority: 31,
    sources: [
      'https://en.wikipedia.org/wiki/Kelly_Armstrong_(politician)',
    ],
  },
  {
    state: 'NE',
    stateName: 'Nebraska',
    name: 'Jim Pillen',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Lincoln',
    lat: 40.8136,
    lng: -96.7026,
    priority: 32,
    sources: [
      'https://en.wikipedia.org/wiki/Jim_Pillen',
    ],
  },
  {
    state: 'NH',
    stateName: 'New Hampshire',
    name: 'Kelly Ayotte',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Concord',
    lat: 43.2081,
    lng: -71.5376,
    priority: 33,
    sources: [
      'https://en.wikipedia.org/wiki/Kelly_Ayotte',
    ],
  },
  {
    state: 'NJ',
    stateName: 'New Jersey',
    name: 'Phil Murphy',
    party: 'Democratic',
    termEnds: 'Jan 2026 (term-limited)',
    capitalCity: 'Trenton',
    lat: 40.2171,
    lng: -74.7429,
    priority: 34,
    sources: [
      'https://en.wikipedia.org/wiki/Phil_Murphy',
    ],
  },
  {
    state: 'NM',
    stateName: 'New Mexico',
    name: 'Michelle Lujan Grisham',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Santa Fe',
    lat: 35.687,
    lng: -105.9378,
    priority: 35,
    sources: [
      'https://en.wikipedia.org/wiki/Michelle_Lujan_Grisham',
    ],
  },
  {
    state: 'NY',
    stateName: 'New York',
    name: 'Kathy Hochul',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Albany',
    lat: 42.6526,
    lng: -73.7562,
    priority: 36,
    sources: [
      'https://en.wikipedia.org/wiki/Kathy_Hochul',
    ],
  },
  {
    state: 'OH',
    stateName: 'Ohio',
    name: 'Mike DeWine',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Columbus',
    lat: 39.9612,
    lng: -82.9988,
    priority: 37,
    sources: [
      'https://en.wikipedia.org/wiki/Mike_DeWine',
    ],
  },
  {
    state: 'OR',
    stateName: 'Oregon',
    name: 'Tina Kotek',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Salem',
    lat: 44.9429,
    lng: -123.0351,
    priority: 38,
    sources: [
      'https://en.wikipedia.org/wiki/Tina_Kotek',
    ],
  },
  {
    state: 'PA',
    stateName: 'Pennsylvania',
    name: 'Josh Shapiro',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Harrisburg',
    lat: 40.2732,
    lng: -76.8867,
    priority: 39,
    sources: [
      'https://en.wikipedia.org/wiki/Josh_Shapiro',
    ],
  },
  {
    state: 'RI',
    stateName: 'Rhode Island',
    name: 'Dan McKee',
    party: 'Democratic',
    termEnds: 'Jan 2027',
    capitalCity: 'Providence',
    lat: 41.824,
    lng: -71.4128,
    priority: 40,
    sources: [
      'https://en.wikipedia.org/wiki/Dan_McKee',
    ],
  },
  {
    state: 'SC',
    stateName: 'South Carolina',
    name: 'Henry McMaster',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Columbia',
    lat: 34.0007,
    lng: -81.0348,
    priority: 41,
    sources: [
      'https://en.wikipedia.org/wiki/Henry_McMaster',
    ],
  },
  {
    state: 'SD',
    stateName: 'South Dakota',
    name: 'Larry Rhoden',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Pierre',
    lat: 44.3683,
    lng: -100.351,
    priority: 42,
    sources: [
      'https://en.wikipedia.org/wiki/Larry_Rhoden',
    ],
  },
  {
    state: 'TN',
    stateName: 'Tennessee',
    name: 'Bill Lee',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Nashville',
    lat: 36.1627,
    lng: -86.7816,
    priority: 43,
    sources: [
      'https://en.wikipedia.org/wiki/Bill_Lee_(Tennessee_politician)',
    ],
  },
  {
    state: 'TX',
    stateName: 'Texas',
    name: 'Greg Abbott',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Austin',
    lat: 30.2672,
    lng: -97.7431,
    dcPolicyNotes: 'Large ERCOT pipeline of hyperscale and AI campuses; some counties pursuing moratoriums amid grid and water pressure.',
    priority: 44,
    sources: [
      'https://en.wikipedia.org/wiki/Greg_Abbott',
    ],
  },
  {
    state: 'UT',
    stateName: 'Utah',
    name: 'Spencer Cox',
    party: 'Republican',
    termEnds: 'Jan 2029',
    capitalCity: 'Salt Lake City',
    lat: 40.7608,
    lng: -111.891,
    priority: 45,
    sources: [
      'https://en.wikipedia.org/wiki/Spencer_Cox_(politician)',
    ],
  },
  {
    state: 'VA',
    stateName: 'Virginia',
    name: 'Abigail Spanberger',
    party: 'Democratic',
    termEnds: 'Jan 2030',
    capitalCity: 'Richmond',
    lat: 37.5407,
    lng: -77.436,
    dcPolicyNotes: 'Northern Virginia remains the largest US hyperscale market; state energy and land-use policy active under new 2026 administration.',
    priority: 46,
    sources: [
      'https://en.wikipedia.org/wiki/Abigail_Spanberger',
    ],
  },
  {
    state: 'VT',
    stateName: 'Vermont',
    name: 'Phil Scott',
    party: 'Republican',
    termEnds: 'Jan 2027',
    capitalCity: 'Montpelier',
    lat: 44.2601,
    lng: -72.5754,
    priority: 47,
    sources: [
      'https://en.wikipedia.org/wiki/Phil_Scott_(politician)',
    ],
  },
  {
    state: 'WA',
    stateName: 'Washington',
    name: 'Bob Ferguson',
    party: 'Democratic',
    termEnds: 'Jan 2029',
    capitalCity: 'Olympia',
    lat: 47.0379,
    lng: -122.9007,
    priority: 48,
    sources: [
      'https://en.wikipedia.org/wiki/Bob_Ferguson_(politician)',
    ],
  },
  {
    state: 'WI',
    stateName: 'Wisconsin',
    name: 'Tony Evers',
    party: 'Democratic',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Madison',
    lat: 43.0731,
    lng: -89.4012,
    priority: 49,
    sources: [
      'https://en.wikipedia.org/wiki/Tony_Evers',
    ],
  },
  {
    state: 'WY',
    stateName: 'Wyoming',
    name: 'Mark Gordon',
    party: 'Republican',
    termEnds: 'Jan 2027 (term-limited)',
    capitalCity: 'Cheyenne',
    lat: 41.14,
    lng: -104.8202,
    priority: 50,
    sources: [
      'https://en.wikipedia.org/wiki/Mark_Gordon_(politician)',
    ],
  },
]

;(async () => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN env vars.')
    process.exit(1)
  }

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
      ...(g.ngaRole ? { ngaRole: g.ngaRole } : {}),
      ...(g.ngaInitiative ? { ngaInitiative: g.ngaInitiative } : {}),
      ...(g.dcPolicyNotes ? { dcPolicyNotes: g.dcPolicyNotes } : {}),
      ...(g.accessNotes ? { accessNotes: g.accessNotes } : {}),
      priority: g.priority,
      sources: g.sources,
    })
    n++
  }
  console.log(`Governors upserted: ${n}`)

  const count = await sanity.fetch<number>('count(*[_type == "governor"])')
  console.log(`Sanity governor count: ${count}`)
  if (count !== 50) {
    console.warn(`Expected 50 governors, got ${count}`)
    process.exit(1)
  }
  console.log('Done.')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
