import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/api/', '/dashboard/', '/cms/'],
      },
    ],
    sitemap: 'https://konative.com/sitemap.xml',
  }
}
