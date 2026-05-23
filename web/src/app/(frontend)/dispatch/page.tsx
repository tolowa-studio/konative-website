import type { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import {
  ghostContentFetch,
  ghostContentKey,
  ghostUrl,
  KONATIVE_TAG_SLUG,
} from "@/lib/ghost";

export const revalidate = 300; // 5 min ISR — fresh enough, light on Ghost
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Konative Dispatch — Powered land, stalled projects, and the data center brokerage market",
  description:
    "Konative Dispatch — twice-weekly intelligence for energy infrastructure principals. Powered land, stalled data center projects, capacity, capital.",
  alternates: { canonical: "/dispatch" },
  openGraph: {
    title: "Konative Dispatch",
    description:
      "Twice-weekly intelligence for energy infrastructure principals: powered land, stalled data center projects, capacity, capital.",
    url: "/dispatch",
    type: "website",
  },
};

interface DispatchPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  feature_image: string | null;
  published_at: string;
  reading_time: number;
}

async function getDispatchPosts(): Promise<DispatchPost[]> {
  if (!ghostUrl() || !ghostContentKey()) return [];
  const filter = encodeURIComponent(`primary_tag:${KONATIVE_TAG_SLUG}+status:published`);
  const fields = "id,title,custom_excerpt,excerpt,slug,feature_image,published_at,reading_time";
  const path = `/ghost/api/content/posts/?filter=${filter}&fields=${fields}&limit=50&order=published_at%20desc`;
  try {
    const res = await ghostContentFetch(path);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      posts?: Array<{
        id: string;
        title?: string;
        custom_excerpt?: string | null;
        excerpt?: string | null;
        slug?: string;
        feature_image?: string | null;
        published_at?: string | null;
        reading_time?: number | null;
      }>;
    };
    return (data.posts ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? "",
      excerpt: p.custom_excerpt ?? p.excerpt ?? "",
      slug: p.slug ?? "",
      feature_image: p.feature_image ?? null,
      published_at: p.published_at ?? "",
      reading_time: p.reading_time ?? 0,
    }));
  } catch {
    return [];
  }
}

export default async function DispatchArchive() {
  const posts = await getDispatchPosts();
  return (
    <section className="dispatch">
      <div className="dispatch__inner">
        <header className="dispatch__header">
          <p className="dispatch__eyebrow">Konative Dispatch</p>
          <h1 className="dispatch__title">
            Powered land, stalled projects, and the rest of the data center brokerage market.
          </h1>
          <p className="dispatch__sub">
            Twice-weekly intelligence for energy infrastructure principals — developers, investors, landowners, occupiers.
          </p>
          <div className="dispatch__signup">
            <NewsletterSignup variant="inline" source="dispatch_archive" />
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="dispatch__empty">
            <h2>First issue is on the way.</h2>
            <p>
              Subscribe above and you&apos;ll get it the moment it ships.
            </p>
          </div>
        ) : (
          <ol className="dispatch__list">
            {posts.map((post) => (
              <li key={post.id} className="dispatch__item">
                <Link href={`/dispatch/${post.slug}`} className="dispatch__item-link">
                  {post.feature_image && (
                    <div className="dispatch__item-image">
                      <img src={post.feature_image} alt={post.title} loading="lazy" />
                    </div>
                  )}
                  <div className="dispatch__item-body">
                    <div className="dispatch__item-meta">
                      <time dateTime={post.published_at}>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </time>
                      {post.reading_time > 0 && (
                        <span className="dispatch__item-readtime">{post.reading_time} min read</span>
                      )}
                    </div>
                    <h2 className="dispatch__item-title">{post.title}</h2>
                    {post.excerpt && (
                      <p className="dispatch__item-excerpt">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
