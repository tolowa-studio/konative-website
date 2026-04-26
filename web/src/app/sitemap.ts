import type { MetadataRoute } from 'next'
import { MARKETS } from './(frontend)/markets/[state]/page'

const BASE = 'https://konative.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                     lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/map`,            lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/markets`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/news`,           lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/market-intel`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/power-markets`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/land`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/land/submit`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/land/what-its-worth`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/capacity`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/invest`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/assessment`,     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,        lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/blog`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ]

  const marketRoutes: MetadataRoute.Sitemap = Object.keys(MARKETS).map(slug => ({
    url: `${BASE}/markets/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...marketRoutes]
}
