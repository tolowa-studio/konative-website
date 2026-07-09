import { NextResponse } from 'next/server'
import { createClient as createSanity } from '@sanity/client'
import { createClient as createSupabase } from '@supabase/supabase-js'
import {
  countDcFacilities,
  countGenerationPipeline,
  countNetworkFacilities,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

const sanity = createSanity({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const supabase = createSupabase(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function countWithFallback(
  d1Count: () => Promise<number | null>,
  table: string,
): Promise<number> {
  const d1 = await d1Count()
  if (d1 !== null && d1 > 0) return d1

  const { count } = await supabase.from(table).select('id', { count: 'exact', head: true })
  return count ?? 0
}

export async function GET() {
  // Sanity counts (editorial)
  const sanityPromise = sanity.fetch(`{
    "articleCount": count(*[_type == "newsItem"]),
    "feedCount": count(*[_type == "newsSource" && active == true]),
    "dealCount": count(*[_type == "landSubmission" && status == "active"])
  }`).catch(() => ({ articleCount: 0, feedCount: 0, dealCount: 0 }))

  const [stats, fac, gen, water, net] = await Promise.all([
    sanityPromise,
    countWithFallback(countDcFacilities, 'dc_facilities'),
    countWithFallback(countGenerationPipeline, 'generation_pipeline'),
    supabase.from('water_sites').select('id', { count: 'exact', head: true }).then((r) => r.count ?? 0),
    countWithFallback(countNetworkFacilities, 'network_facilities'),
  ])

  return NextResponse.json({
    articleCount: stats.articleCount ?? 0,
    feedCount: stats.feedCount ?? 0,
    dealCount: stats.dealCount ?? 0,
    facilitiesScored: fac,
    generatorsTracked: gen,
    waterSitesIndexed: water,
    networkNodesIndexed: net,
  })
}
