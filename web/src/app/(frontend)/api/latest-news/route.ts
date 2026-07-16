import { NextResponse } from "next/server";

import { newsCurationSinceIso } from "../../../../lib/newsConstants";
import { getSanityReadClient } from "../../../../sanity/readClient";

export const dynamic = "force-dynamic";

const MAX = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(MAX, Math.max(1, Number.parseInt(searchParams.get("limit") || "8", 10) || 8));
  const country = searchParams.get("country");
  const since = newsCurationSinceIso();

  let filter = `_type == "newsItem" && status == "published" && defined(publishedAt) && publishedAt >= $since`;
  if (country === "us" || country === "ca") {
    filter += ` && "${country}" in coalesce(countries, [])`;
  }

  try {
    const client = getSanityReadClient();
    const items = await client.fetch<
      {
        id: string;
        title?: string;
        url?: string;
        imageUrl?: string;
        summary?: string;
        sourceName?: string;
        publishedAt?: string;
        countries?: string[];
      }[]
    >(
      `*[${filter}] | order(publishedAt desc)[0...${limit}]{
        "id": _id,
        title,
        url,
        imageUrl,
        summary,
        sourceName,
        publishedAt,
        countries
      }`,
      { since },
    );
    return NextResponse.json({ items: items ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
