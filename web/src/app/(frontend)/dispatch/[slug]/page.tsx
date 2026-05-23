import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import {
  ghostContentFetch,
  ghostContentKey,
  ghostUrl,
  KONATIVE_TAG_SLUG,
} from "@/lib/ghost";

export const revalidate = 300;

interface DispatchIssue {
  id: string;
  title: string;
  excerpt: string;
  html: string;
  slug: string;
  feature_image: string | null;
  published_at: string;
  reading_time: number;
  authors: Array<{ name: string; profile_image: string | null }>;
}

interface GhostPost {
  id: string;
  title?: string;
  custom_excerpt?: string | null;
  excerpt?: string | null;
  html?: string | null;
  slug?: string;
  feature_image?: string | null;
  published_at?: string | null;
  reading_time?: number | null;
  authors?: Array<{ name?: string; profile_image?: string | null }>;
  primary_tag?: { slug?: string } | null;
  tags?: Array<{ slug?: string }>;
}

async function getIssue(slug: string): Promise<DispatchIssue | null> {
  if (!ghostUrl() || !ghostContentKey()) return null;
  const fields = "id,title,custom_excerpt,excerpt,html,slug,feature_image,published_at,reading_time";
  const path = `/ghost/api/content/posts/slug/${encodeURIComponent(slug)}/?include=tags,authors&fields=${fields}`;
  try {
    const res = await ghostContentFetch(path);
    if (!res.ok) return null;
    const data = (await res.json()) as { posts?: GhostPost[] };
    const post = data.posts?.[0];
    if (!post) return null;
    // Only render if this post belongs to Konative Dispatch (by tag).
    const tagSlugs = new Set([
      post.primary_tag?.slug,
      ...(post.tags?.map((t) => t.slug) ?? []),
    ]);
    if (!tagSlugs.has(KONATIVE_TAG_SLUG)) return null;
    return {
      id: post.id,
      title: post.title ?? "",
      excerpt: post.custom_excerpt ?? post.excerpt ?? "",
      html: post.html ?? "",
      slug: post.slug ?? slug,
      feature_image: post.feature_image ?? null,
      published_at: post.published_at ?? "",
      reading_time: post.reading_time ?? 0,
      authors:
        (post.authors ?? []).map((a) => ({
          name: a.name ?? "",
          profile_image: a.profile_image ?? null,
        })) ?? [],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) return { title: "Konative Dispatch" };
  return {
    title: `${issue.title} — Konative Dispatch`,
    description: issue.excerpt,
    alternates: { canonical: `/dispatch/${issue.slug}` },
    openGraph: {
      title: issue.title,
      description: issue.excerpt,
      url: `/dispatch/${issue.slug}`,
      type: "article",
      images: issue.feature_image ? [issue.feature_image] : undefined,
      publishedTime: issue.published_at || undefined,
    },
  };
}

export default async function DispatchIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) notFound();

  return (
    <article className="dispatch-issue">
      <div className="dispatch-issue__inner">
        <Link href="/dispatch" className="dispatch-issue__back">
          ← All issues
        </Link>
        <header className="dispatch-issue__header">
          <p className="dispatch-issue__eyebrow">Konative Dispatch</p>
          <h1 className="dispatch-issue__title">{issue.title}</h1>
          {issue.excerpt && (
            <p className="dispatch-issue__excerpt">{issue.excerpt}</p>
          )}
          <div className="dispatch-issue__meta">
            <time dateTime={issue.published_at}>
              {issue.published_at
                ? new Date(issue.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
            {issue.reading_time > 0 && (
              <span> · {issue.reading_time} min read</span>
            )}
            {issue.authors.length > 0 && (
              <span> · by {issue.authors.map((a) => a.name).join(", ")}</span>
            )}
          </div>
        </header>

        {issue.feature_image && (
          <figure className="dispatch-issue__hero">
            <img src={issue.feature_image} alt={issue.title} />
          </figure>
        )}

        <div
          className="dispatch-issue__body prose"
          dangerouslySetInnerHTML={{ __html: issue.html }}
        />

        <footer className="dispatch-issue__footer">
          <h2>Get the next one in your inbox.</h2>
          <NewsletterSignup variant="inline" source="dispatch_issue" />
        </footer>
      </div>
    </article>
  );
}
