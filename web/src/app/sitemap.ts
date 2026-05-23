import type { MetadataRoute } from 'next'
import { MARKETS } from './(frontend)/markets/[state]/page'

// Sitemap regenerates hourly so newly-published Ghost posts (Konative Dispatch
// issues and blog posts) appear without a redeploy. See STRATEGY.md B1.
export const revalidate = 3600

const BASE = 'https://konative.com'

const AUDIENCE_SLUGS = [
  'tribes',
  'advisors',
  'investors',
  'landowners',
  'utilities',
  'developers-epcs',
  'operators',
] as const

interface GhostPostSitemapItem {
  slug: string
  updated_at: string | null
  primary_tag?: { slug?: string } | null
}

async function fetchGhostPosts(): Promise<GhostPostSitemapItem[]> {
  const url =
    process.env.GHOST_URL?.trim() ||
    process.env.NEXT_PUBLIC_GHOST_URL?.trim() ||
    ''
  const key =
    process.env.GHOST_CONTENT_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY?.trim() ||
    ''
  if (!url || !key) return []
  try {
    const res = await fetch(
      `${url.replace(/\/$/, '')}/ghost/api/content/posts/?key=${encodeURIComponent(
        key,
      )}&limit=500&fields=slug,updated_at&include=primary_tag&filter=${encodeURIComponent(
        'status:published',
      )}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { posts?: GhostPostSitemapItem[] }
    return data.posts ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // --- static, high-priority pages -----------------------------------------
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/dispatch`,            lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${BASE}/map`,                 lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/markets`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/powered-land`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE}/governors`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/intelligence`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/news`,                lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${BASE}/market-intel`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/projects`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/deals`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/land`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/land/what-its-worth`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/land/submit`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/land/process`,        lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/capacity`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/capacity/process`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/invest`,              lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/assessment`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/power-markets`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },
    { url: `${BASE}/methodology`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/reality-vs-press`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/partners`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/canada`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/licenses`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/for`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // --- per-state market pages ----------------------------------------------
  const marketRoutes: MetadataRoute.Sitemap = Object.keys(MARKETS).map(slug => ({
    url: `${BASE}/markets/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // --- per-audience landing pages ------------------------------------------
  const audienceRoutes: MetadataRoute.Sitemap = AUDIENCE_SLUGS.map(slug => ({
    url: `${BASE}/for/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // --- intelligence sub-pages ----------------------------------------------
  const intelligenceRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/intelligence/saudi`,        lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/intelligence/first-nations`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
  ]

  // --- Ghost-backed dynamic posts (Konative Dispatch + blog) ---------------
  const ghostPosts = await fetchGhostPosts()
  const dispatchRoutes: MetadataRoute.Sitemap = []
  const blogRoutes: MetadataRoute.Sitemap = []
  for (const p of ghostPosts) {
    if (!p.slug) continue
    const lm = p.updated_at ? new Date(p.updated_at) : now
    if (p.primary_tag?.slug === 'konative-dispatch') {
      dispatchRoutes.push({
        url: `${BASE}/dispatch/${p.slug}`,
        lastModified: lm,
        changeFrequency: 'monthly' as const,
        priority: 0.85,
      })
    } else {
      blogRoutes.push({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: lm,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })
    }
  }

  return [
    ...staticRoutes,
    ...marketRoutes,
    ...audienceRoutes,
    ...intelligenceRoutes,
    ...dispatchRoutes,
    ...blogRoutes,
  ]
}
