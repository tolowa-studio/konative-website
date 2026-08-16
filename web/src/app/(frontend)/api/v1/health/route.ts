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

export async function GET() {
  // Sanity counts (editorial)
  const sanityPromise = sanity.fetch(`{
    "articleCount": count(*[_type == "newsItem"]),
    "feedCount": count(*[_type == "newsSource" && active == true]),
    "dealCount": count(*[_type == "landSubmission" && status == "active"])
  }`).catch(() => ({ articleCount: 0, feedCount: 0, dealCount: 0 }))

  try {
    const [stats, fac, gen, water, net] = await Promise.all([
      sanityPromise,
      countDcFacilities(),
      countGenerationPipeline(),
      supabase.from('water_sites').select('id', { count: 'exact', head: true }).then((r) => r.count ?? 0),
      countNetworkFacilities(),
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
  } catch (error) {
    console.error('Konative health dependency failure', {
      dependency: 'D1',
      operation: 'GET /api/v1/health',
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'D1 dependency unavailable', dependency: 'D1' },
      { status: 503 },
    )
  }
}
