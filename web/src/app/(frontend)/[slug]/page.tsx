import { notFound } from "next/navigation";

import { RenderBlocks } from "../../../blocks/RenderBlocks";
import { getSanityReadClient } from "../../../sanity/readClient";

export const revalidate = 3600;

export const dynamic = "force-dynamic";

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

const pageQuery = `*[_type == "page" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  layout,
  meta
}`;

function normalizeLayoutBlocks(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const latestNewsQuery = `*[_type == "newsItem" && status == "published"] | order(publishedAt desc)[0...20]{
  "id": _id,
  title,
  url,
  summary,
  sourceName,
  publishedAt,
  countries,
  topics
}`;

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = "home" } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);

  let pageData: { layout?: unknown; title?: string } | null = null;
  let newsItems: any[] = [];

  try {
    const client = getSanityReadClient();
    pageData = await client.fetch(pageQuery, { slug: decodedSlug });
    newsItems = await client.fetch(latestNewsQuery);
  } catch (error) {
    if (decodedSlug === "home") {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "4rem 1.5rem",
            textAlign: "center",
            background: "#0b1020",
            color: "#f6f7fb",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <p style={{ marginBottom: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Konative
            </p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", margin: 0 }}>Leadership. Learning. Legacy.</h1>
            <p style={{ marginTop: "1.25rem", lineHeight: 1.6, opacity: 0.9 }}>
              CMS configuration is updating. Set{" "}
              <code style={{ color: "#fbbf24" }}>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and dataset, then add a
              &quot;home&quot; page document in Sanity Studio.
            </p>
          </div>
        </main>
      );
    }

    console.error("[slug] Sanity fetch failed:", error);

    return notFound();
  }

  if (!pageData) {
    if (decodedSlug === "home") {
      return (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          Create a &quot;home&quot; page in Sanity Studio (slug <code>home</code>) to serve block content for
          this route.
        </div>
      );
    }
    return notFound();
  }

  const blocks = normalizeLayoutBlocks(pageData.layout);

  return <RenderBlocks blocks={blocks as any} newsItems={newsItems} />;
}
