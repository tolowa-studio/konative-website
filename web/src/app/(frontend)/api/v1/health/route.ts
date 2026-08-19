import { NextResponse } from 'next/server'
import { createClient as createSanity } from '@sanity/client'
import { createClient as createSupabase } from '@supabase/supabase-js'
import {
  CloudflareBindingUnavailableError,
  DatabaseUnavailableError,
  countDcFacilities,
  countGenerationPipeline,
  countNetworkFacilities,
} from '@/lib/db'
import { getKonativeDataRuntime } from '@/lib/db/runtime'
import { PostgresDatabaseUnavailableError } from '@/lib/db/postgres-errors'

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
    const dependency = resolveHealthDependency(error)
    console.error('Konative health dependency failure', {
      dependency,
      operation: 'GET /api/v1/health',
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: `${dependency} dependency unavailable`, dependency },
      { status: 503 },
    )
  }
}

function resolveHealthDependency(error: unknown): 'postgres' | 'D1' {
  if (
    error instanceof DatabaseUnavailableError ||
    error instanceof PostgresDatabaseUnavailableError
  ) {
    return 'postgres'
  }
  if (error instanceof CloudflareBindingUnavailableError) {
    return 'D1'
  }
  const runtime = getKonativeDataRuntime()
  if (runtime === 'postgres' || runtime === 'unconfigured-node') {
    return 'postgres'
  }
  return 'D1'
}
