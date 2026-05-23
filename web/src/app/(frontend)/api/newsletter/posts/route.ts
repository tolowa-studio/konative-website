import { NextResponse } from "next/server";
import {
  ghostContentFetch,
  ghostContentKey,
  ghostUrl,
  KONATIVE_TAG_SLUG,
} from "@/lib/ghost";

export const dynamic = "force-dynamic";

interface NewsletterPost {
  id: string;
  title: string;
  subtitle: string;
  content_html: string;
  thumbnail_url: string | null;
  web_url: string;
  publish_date: string;
}

interface GhostContentPost {
  id: string;
  title?: string;
  custom_excerpt?: string | null;
  excerpt?: string | null;
  html?: string | null;
  feature_image?: string | null;
  url?: string | null;
  slug?: string;
  published_at?: string | null;
  primary_tag?: { slug?: string } | null;
}

// Source-of-truth pivot 2026-05-23: Beehiiv → shared Tolowa Studio Ghost.
// Posts belonging to Konative Dispatch are identified by primary_tag
// (more reliable than newsletter.slug — see web/src/lib/ghost.ts notes).

export async function GET() {
  if (!ghostUrl() || !ghostContentKey()) {
    return NextResponse.json({ posts: [] satisfies NewsletterPost[] });
  }

  const filter = encodeURIComponent(`primary_tag:${KONATIVE_TAG_SLUG}+status:published`);
  const fields = "id,title,custom_excerpt,excerpt,feature_image,url,slug,published_at";
  const path = `/ghost/api/content/posts/?filter=${filter}&fields=${fields}&limit=20&order=published_at%20desc`;

  let posts: NewsletterPost[] = [];
  try {
    const res = await ghostContentFetch(path);
    if (res.ok) {
      const data = (await res.json()) as { posts?: GhostContentPost[] };
      posts = (data.posts ?? []).map((p): NewsletterPost => ({
        id: p.id,
        title: p.title ?? "",
        subtitle: p.custom_excerpt ?? p.excerpt ?? "",
        content_html: p.html ?? "",
        thumbnail_url: p.feature_image ?? null,
        web_url: p.url ?? `${ghostUrl()}/${p.slug ?? ""}/`,
        publish_date: p.published_at ?? "",
      }));
    } else {
      const text = await res.text().catch(() => "");
      console.warn(`[newsletter/posts] Ghost ${res.status}:`, text.slice(0, 300));
    }
  } catch (err) {
    console.error("[newsletter/posts] Ghost fetch error:", err);
  }

  return NextResponse.json({ posts });
}
