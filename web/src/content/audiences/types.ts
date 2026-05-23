/**
 * Shared types for audience landing pages under /for/<slug>.
 * Both the Sanity schema and the AudienceLanding component conform to this shape.
 * Newsletter (Ghost) and other downstream consumers (OG, social) can reuse the same shape.
 */

export type AudienceSlug =
  | "tribes"
  | "advisors"
  | "investors"
  | "landowners"
  | "utilities"
  | "developers-epcs"
  | "operators";

export type CapabilityBand = {
  /** 2-4 word title, headline-cased. */
  title: string;
  /** One sentence, plain language. */
  body: string;
};

export type EngagementStep = {
  /** Short label for the step, e.g. "Day 1-30". */
  label: string;
  /** What happens during this step. */
  body: string;
};

export type TrustItem = {
  /** Short label, e.g. "Geography". */
  label: string;
  /** Supporting detail. */
  body: string;
};

export type CTAVariant = {
  /** Button text. */
  label: string;
  /** Anchor or URL. Anchor preferred so the form lives on-page. */
  href: string;
};

export type AudiencePage = {
  slug: AudienceSlug;
  /** Audience name as shown in nav and tiles, e.g. "Tribal Nations". */
  displayName: string;
  /** One-line tile description for /for hub. */
  tileDescription: string;
  /** SEO title — full page title shown in browser tab. */
  metaTitle: string;
  /** SEO description for OG + meta. */
  metaDescription: string;
  /** Display order on the /for hub. Lower numbers come first. */
  order: number;
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    primaryCta: CTAVariant;
  };
  whyNow: {
    title: string;
    intro?: string;
    bullets: string[];
  };
  whatYouAlreadyHave: {
    title: string;
    intro?: string;
    bullets: string[];
  };
  whatKonativeDoes: {
    title: string;
    bands: CapabilityBand[];
  };
  firstEngagement: {
    title: string;
    intro?: string;
    steps: EngagementStep[];
    pricingPosture: string;
  };
  trust: {
    title: string;
    items: TrustItem[];
  };
  adjacentAudiences: {
    title: string;
    pointers: AudienceSlug[];
  };
  finalCta: {
    headline: string;
    subhead: string;
    primaryCta: CTAVariant;
  };
};
