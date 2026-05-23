// Tiny helper for emitting JSON-LD structured data.
//
// Server-component only — emits a <script type="application/ld+json"> tag.
// Google now strongly weights structured data for AI Overviews and SERP rich
// results; per the SEO-landscape research, schema-tagged pages are ~3.7×
// more likely to be cited in AI Overviews. See STRATEGY.md B1.

import React from "react";

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
type JsonLdObject = { [key: string]: JsonLdValue | undefined };

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      // Safe: we control the JSON, no untrusted strings.
      // We intentionally do not escape `<` — Google's parser is lenient and
      // we never embed raw user HTML here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const SITE_URL = "https://konative.com";

// --- common schemas, factory-style so each page can compose what it needs ---

export const organizationSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Konative",
  alternateName: "Konative Datacenter Brokerage",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    "Konative brokers powered land to data center developers and hyperscalers. We source sites, connect investors, and manage the deal from first call to close.",
  founder: [
    { "@type": "Person", name: "Jeramey James" },
    { "@type": "Person", name: "Scott Swartzbaugh" },
    { "@type": "Person", name: "Terry Van Roekel" },
  ],
  knowsAbout: [
    "Data center real estate",
    "Powered land",
    "Data center site selection",
    "Build-to-suit data centers",
    "Energy infrastructure",
    "Interconnection",
  ],
};

export const websiteSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Konative",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-US",
};

export function articleSchema(args: {
  url: string;
  headline: string;
  description?: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authors?: Array<{ name: string }>;
  tags?: string[];
  section?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
    headline: args.headline,
    description: args.description ?? undefined,
    image: args.image ?? undefined,
    datePublished: args.datePublished ?? undefined,
    dateModified: args.dateModified ?? args.datePublished ?? undefined,
    author: args.authors?.length
      ? args.authors.map((a) => ({ "@type": "Person", name: a.name }))
      : { "@type": "Organization", name: "Konative" },
    publisher: {
      "@type": "Organization",
      name: "Konative",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
    },
    keywords: args.tags?.join(", "),
    articleSection: args.section,
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(
  items: Array<{ question: string; answer: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function definedTermSchema(args: {
  name: string;
  description: string;
  termCode?: string;
  inDefinedTermSet?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: args.name,
    description: args.description,
    termCode: args.termCode,
    inDefinedTermSet: args.inDefinedTermSet,
  };
}
