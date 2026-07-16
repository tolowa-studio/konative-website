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
  alternateName: ["Konative Connectivity Brokerage", "Konative Tribal Data Center Brokerage"],
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    "Konative is a Native-owned, vendor-neutral connectivity brokerage — an Avant sub-agent — for data centers under construction and Tribal enterprises across North America. Nearby fiber is not deliverable fiber. Suppliers pay; buyers get site-specific market briefs.",
  founder: [
    { "@type": "Person", name: "Jeramey James" },
    { "@type": "Person", name: "Scott Swartzbaugh" },
    { "@type": "Person", name: "Terry Van Roekel" },
  ],
  areaServed: ["United States", "Canada"],
  knowsAbout: [
    // --- Connectivity-first terms (lead) ---
    "Tribal connectivity brokerage",
    "Rural enterprise connectivity brokerage",
    "Data-center connectivity brokerage",
    "Fiber and transport connectivity",
    "Interconnection and cross-connects",
    "Colocation connectivity brokerage",
    "Cloud connectivity brokerage",
    "Managed connectivity services",
    "Vendor-neutral connectivity brokerage",
    "SD-WAN brokerage",
    "Internet connectivity brokerage",
    "Indigenous connectivity brokerage",
    // --- Supporting terms ---
    "Tribal data center development",
    "Data center site selection",
    "Powered land brokerage",
    "Interconnection queue management",
    "Tribal land infrastructure",
    "Sovereign-compatible deal structures",
    "IDC governance for data center projects",
    "Federal tribal broadband programs",
    "NTIA Tribal Broadband Connectivity Program",
    "DOE Loan Programs Office tribal projects",
    "Indigenous Development Corporation infrastructure",
    "Build-to-suit data centers",
    "Tribal enterprise internet services",
    "North American data center markets",
    "Rural data center development",
    "First Nations data center Canada",
  ],
  sameAs: [
    "https://www.linkedin.com/company/konative",
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

// --- Canonical service schemas (connectivity-first) ---

export const tribalConnectivityServiceSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Tribal & rural enterprise connectivity brokerage",
  description:
    "Keep uptime. Make carriers compete. Native-owned, vendor-neutral connectivity brokerage for tribal gaming and multi-site enterprise ops — internet, SD-WAN, fiber, transport, and managed connectivity. Suppliers pay; Tribes own the contracts.",
  url: `${SITE_URL}/tribal`,
  serviceType: "Connectivity Brokerage",
  areaServed: ["United States", "Canada"],
  provider: { "@id": `${SITE_URL}/#organization` },
};

export const dataCenterConnectivityServiceSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Data-center connectivity brokerage",
  description:
    "Nearby fiber is not deliverable fiber. Vendor-neutral brokerage for mid-build data-center connectivity — laterals, waves, DIA, DCI, cross-connects, and cloud on-ramps — proved at a named site before the schedule slips.",
  url: `${SITE_URL}/data-center-connectivity`,
  serviceType: "Connectivity Brokerage",
  areaServed: ["United States", "Canada"],
  provider: { "@id": `${SITE_URL}/#organization` },
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

export function serviceSchema(args: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
  areaServed?: string | string[];
  offerLow?: number;
  offerHigh?: number;
  currency?: string;
}): JsonLdObject {
  const offers: JsonLdObject | undefined =
    args.offerLow !== undefined
      ? {
          "@type": "AggregateOffer",
          priceCurrency: args.currency ?? "USD",
          lowPrice: args.offerLow,
          highPrice: args.offerHigh ?? args.offerLow,
          availability: "https://schema.org/InStock",
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: args.name,
    description: args.description,
    url: args.url,
    serviceType: args.serviceType,
    areaServed: args.areaServed,
    provider: { "@id": `${SITE_URL}/#organization` },
    offers,
  };
}
