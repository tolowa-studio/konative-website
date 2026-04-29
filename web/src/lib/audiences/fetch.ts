import type { AudiencePage } from "@/content/audiences/types";
import { getSanityReadClient } from "@/sanity/readClient";

const AUDIENCE_PROJECTION = `{
  "slug": slug.current,
  displayName,
  tileDescription,
  metaTitle,
  metaDescription,
  order,
  hero,
  whyNow,
  whatYouAlreadyHave,
  whatKonativeDoes,
  firstEngagement,
  trust,
  adjacentAudiences,
  finalCta
}`;

export async function getAudiencePage(slug: string): Promise<AudiencePage | null> {
  const client = getSanityReadClient();
  const result = await client.fetch<AudiencePage | null>(
    `*[_type == "audiencePage" && slug.current == $slug][0]${AUDIENCE_PROJECTION}`,
    { slug },
  );
  return result ?? null;
}

export async function listAudiencePages(): Promise<AudiencePage[]> {
  const client = getSanityReadClient();
  const result = await client.fetch<AudiencePage[]>(
    `*[_type == "audiencePage"] | order(order asc, displayName asc)${AUDIENCE_PROJECTION}`,
  );
  return result ?? [];
}
