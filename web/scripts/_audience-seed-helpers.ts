import type { AudiencePage } from "@/content/audiences/types";
import { getSanityWriteClient } from "@/sanity/writeClient";

function keyFor(seed: string): string {
  return (
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "k"
  );
}

type AudienceSanityDoc = Record<string, unknown> & { _type: "audiencePage" };

function toSanityDoc(page: AudiencePage): AudienceSanityDoc {
  return {
    _type: "audiencePage",
    slug: { _type: "slug", current: page.slug },
    displayName: page.displayName,
    tileDescription: page.tileDescription,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    order: page.order,
    hero: page.hero,
    whyNow: page.whyNow,
    whatYouAlreadyHave: page.whatYouAlreadyHave,
    whatKonativeDoes: {
      title: page.whatKonativeDoes.title,
      bands: page.whatKonativeDoes.bands.map(b => ({
        _type: "capabilityBand",
        _key: keyFor(b.title),
        ...b,
      })),
    },
    firstEngagement: {
      title: page.firstEngagement.title,
      intro: page.firstEngagement.intro,
      steps: page.firstEngagement.steps.map(s => ({
        _type: "engagementStep",
        _key: keyFor(s.label),
        ...s,
      })),
      pricingPosture: page.firstEngagement.pricingPosture,
    },
    trust: {
      title: page.trust.title,
      items: page.trust.items.map(i => ({
        _type: "trustItem",
        _key: keyFor(i.label),
        ...i,
      })),
    },
    adjacentAudiences: {
      title: page.adjacentAudiences.title,
      pointers: page.adjacentAudiences.pointers,
    },
    finalCta: page.finalCta,
  };
}

/** Upsert an audience page document by slug. Idempotent. */
export async function upsertAudiencePage(
  page: AudiencePage,
): Promise<{ id: string; created: boolean }> {
  const client = getSanityWriteClient();
  const body = toSanityDoc(page);

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "audiencePage" && slug.current == $slug][0]{_id}`,
    { slug: page.slug },
  );

  if (existing) {
    await client.createOrReplace({ _id: existing._id, ...body });
    return { id: existing._id, created: false };
  }
  const created = await client.create(body);
  return { id: created._id, created: true };
}
