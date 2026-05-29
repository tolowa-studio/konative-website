import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function GET() {
  try {
    const stats = await sanity.fetch(`{
      "operational": count(*[_type == "dataCenterProject" && country == "CA" && status == "operational"]),
      "construction": count(*[_type == "dataCenterProject" && country == "CA" && status == "construction"]),
      "announced": count(*[_type == "dataCenterProject" && country == "CA" && status == "announced"]),
      "stalled": count(*[_type == "dataCenterProject" && country == "CA" && status in ["stalled","blocked","paused"]]),
      "canceled": count(*[_type == "dataCenterProject" && country == "CA" && status == "canceled"]),
      "totalMw": math::sum(*[_type == "dataCenterProject" && country == "CA" && defined(capacityMw)].capacityMw),
      "byProvince": *[_type == "dataCenterProject" && country == "CA" && defined(provinceCode)]{
        "code": provinceCode,
        "status": status
      }
    }`)

    const byProvince: Record<string, { operational: number; pipeline: number; stalled: number }> = {}
    for (const row of stats.byProvince as { code: string; status: string }[]) {
      if (!byProvince[row.code]) byProvince[row.code] = { operational: 0, pipeline: 0, stalled: 0 }
      if (row.status === 'operational') byProvince[row.code].operational++
      else if (row.status === 'construction' || row.status === 'announced') byProvince[row.code].pipeline++
      else if (['stalled', 'blocked', 'paused', 'canceled'].includes(row.status)) byProvince[row.code].stalled++
    }

    const pipeline = stats.construction + stats.announced

    return NextResponse.json({
      operational: stats.operational,
      pipeline,
      stalled: stats.stalled + stats.canceled,
      totalMw: stats.totalMw ?? 0,
      byProvince,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Canada stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
