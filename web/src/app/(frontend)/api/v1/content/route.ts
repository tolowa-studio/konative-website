import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

import { newsCurationSinceIso } from '../../../../../lib/newsConstants'

export const dynamic = 'force-dynamic'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const category = params.get('category')
  const search = params.get('search')
  const limit = Math.min(Number(params.get('limit')) || 50, 200)
  const offset = Number(params.get('offset')) || 0
  const since = newsCurationSinceIso()

  const filters = [
    `_type == "newsItem"`,
    `status == "published"`,
    `defined(title)`,
    `defined(publishedAt)`,
    `publishedAt >= $since`,
  ]
  const groqParams: Record<string, unknown> = { limit, offset, offsetEnd: offset + limit, since }

  if (category) {
    filters.push(`topics[] match $category`)
    groqParams.category = category
  }
  if (search) {
    filters.push(`title match $search`)
    groqParams.search = `*${search}*`
  }

  const where = filters.join(' && ')

  const query = `{
    "articles": *[${where}] | order(publishedAt desc) [$offset...$offsetEnd] {
      "id": _id,
      title,
      summary,
      "category": select(
        topics[0] != null => topics[0],
        "Data Center"
      ),
      "source": sourceName,
      "published_at": publishedAt,
      url,
      "image_url": imageUrl
    },
    "total": count(*[${where}])
  }`

  try {
    const result = await sanity.fetch(query, groqParams)
    return NextResponse.json({
      articles: result.articles || [],
      total: result.total || 0,
      offset,
      limit,
    })
  } catch (err) {
    console.error('Content API (Sanity) error:', err)
    return NextResponse.json({ articles: [], total: 0, offset, limit }, { status: 500 })
  }
}
