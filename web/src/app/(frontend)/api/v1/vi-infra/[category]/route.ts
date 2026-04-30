import { NextRequest, NextResponse } from 'next/server'
import type { FeatureCollection, Feature, Point, LineString, Polygon } from 'geojson'

export const dynamic = 'force-dynamic'
// Cache for 6 hours — data is stable enough for customer demos
export const revalidate = 21600

const OVERPASS = 'https://overpass-api.de/api/interpreter'
const VI_BBOX = '48.3,-128.8,51.0,-122.8'  // Vancouver Island bounding box

// ── Overpass queries per category ─────────────────────────────────────────────

const QUERIES: Record<string, string> = {
  water: `[out:json][timeout:90];
(
  way["waterway"~"^(river|canal)$"](${VI_BBOX});
  way["natural"="water"]["water"!~"^(fountain|pond)$"](${VI_BBOX});
  relation["natural"="water"]["water"!~"^(fountain|pond)$"](${VI_BBOX});
);
out geom qt;`,

  power: `[out:json][timeout:90];
(
  way["power"="line"](${VI_BBOX});
  node["power"="substation"](${VI_BBOX});
  way["power"="substation"](${VI_BBOX});
  node["power"~"^(plant|generator)$"](${VI_BBOX});
  way["power"~"^(plant|generator)$"](${VI_BBOX});
);
out geom qt;`,

  fiber: `[out:json][timeout:90];
(
  way["telecom"="line"](${VI_BBOX});
  way["communication"="line"](${VI_BBOX});
  node["telecom"~"^(exchange|central_office)$"](${VI_BBOX});
  node["man_made"="communications_tower"](${VI_BBOX});
  way["man_made"="communications_tower"](${VI_BBOX});
);
out geom qt;`,
}

// ── Overpass element types ─────────────────────────────────────────────────────

interface OverpassNode {
  type: 'node'
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

interface OverpassWay {
  type: 'way'
  id: number
  geometry: { lat: number; lon: number }[]
  tags?: Record<string, string>
}

interface OverpassRelation {
  type: 'relation'
  id: number
  members?: { type: string; geometry?: { lat: number; lon: number }[] }[]
  tags?: Record<string, string>
}

type OverpassElement = OverpassNode | OverpassWay | OverpassRelation

// ── Overpass JSON → GeoJSON converter ─────────────────────────────────────────

function toGeoJSON(elements: OverpassElement[]): FeatureCollection {
  const features: Feature[] = []

  for (const el of elements) {
    const props = el.tags ?? {}

    if (el.type === 'node') {
      const pt: Feature<Point> = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
        properties: props,
      }
      features.push(pt)
    } else if (el.type === 'way' && el.geometry?.length) {
      const coords = el.geometry.map(p => [p.lon, p.lat])
      const closed =
        coords.length >= 4 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1]

      if (closed) {
        const poly: Feature<Polygon> = {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: props,
        }
        features.push(poly)
      } else {
        const line: Feature<LineString> = {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: props,
        }
        features.push(line)
      }
    } else if (el.type === 'relation' && el.members) {
      // Flatten outer ring members into a MultiPolygon approximation
      const rings: number[][][] = []
      for (const m of el.members) {
        if (m.geometry?.length) {
          rings.push(m.geometry.map(p => [p.lon, p.lat]))
        }
      }
      if (rings.length > 0) {
        features.push({
          type: 'Feature',
          geometry: { type: 'MultiPolygon', coordinates: rings.map(r => [r]) },
          properties: props,
        })
      }
    }
  }

  return { type: 'FeatureCollection', features }
}

// ── handler ────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { category: string } }
) {
  const category = params.category

  const query = QUERIES[category]
  if (!query) {
    return NextResponse.json({ error: `Unknown category: ${category}` }, { status: 400 })
  }

  try {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'konative-site/1.0 (deals@konative.com)',
      },
      body: 'data=' + encodeURIComponent(query),
      // Next.js fetch cache: 6 hours
      next: { revalidate: 21600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Overpass returned ${res.status}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    const fc = toGeoJSON(data.elements as OverpassElement[])

    return NextResponse.json(fc, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    console.error(`vi-infra/${category} error:`, err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
