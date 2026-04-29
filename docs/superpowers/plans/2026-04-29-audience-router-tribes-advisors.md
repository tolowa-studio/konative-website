# Audience Router (Plan A) — `/for/tribes` + `/for/advisors` Implementation Plan (Sanity-backed)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reusable audience-page architecture on `konative.com` and the first two audience pages — `/for/tribes` (Jerry's deliverable) and `/for/advisors` (ambassador funnel). Audience copy lives as Sanity documents so it can be edited without a deploy and reused for newsletter (beehiiv) and other content surfaces.

**Architecture:** A new `audiencePage` Sanity schema models the full landing-page structure (hero, why-now, what-you-already-have, capability bands, engagement steps, trust items, adjacent-audience pointers, final CTA). Two seed scripts populate the tribes and advisors documents. A typed fetcher `getAudiencePage(slug)` runs GROQ against the read client. The dynamic route `/for/[audience]/page.tsx` fetches per request (Next 16 default cache; revalidate on demand later) and renders the `AudienceLanding` server component. The CTA form posts to the existing `/api/contact` endpoint with a new `audience` discriminator field.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript, Zod (form schema), Sanity (content + form-write store), `next-sanity` for fetching, Vitest, inline styling matching existing `markets/[state]` patterns (Konative palette: `#08142D` navy bg, `#E07B39` orange accent, Barlow Condensed display, Inter body).

---

## File Structure

**New files:**
- `web/src/content/audiences/types.ts` — TypeScript shape that both the Sanity schema and the React component conform to
- `web/src/sanity/schemaTypes/audiencePage.ts` — Sanity document + nested object types (capabilityBand, engagementStep, trustItem, ctaVariant, etc.)
- `web/src/lib/audiences/fetch.ts` — `getAudiencePage(slug)` and `listAudiencePages()` GROQ helpers
- `web/src/lib/audiences/__tests__/fetch.test.ts` — fetcher tests (mocked Sanity client)
- `web/scripts/seed-audience-tribes.ts` — one-time idempotent seed for the tribes document
- `web/scripts/seed-audience-advisors.ts` — one-time idempotent seed for the advisors document
- `web/scripts/_audience-seed-helpers.ts` — shared helper to upsert by `slug.current`
- `web/src/components/audience/AudienceLanding.tsx` — shared skeleton (server component)
- `web/src/components/audience/AudienceCTAForm.tsx` — client form, posts to `/api/contact`
- `web/src/components/audience/__tests__/AudienceLanding.test.tsx`
- `web/src/components/audience/__tests__/AudienceCTAForm.test.tsx`
- `web/src/app/(frontend)/for/page.tsx` — audience hub
- `web/src/app/(frontend)/for/[audience]/page.tsx` — dynamic audience page
- `web/src/content/audiences/seed-data/tribes.ts` — typed seed payload (the canonical first-cut copy)
- `web/src/content/audiences/seed-data/advisors.ts` — typed seed payload

**Modified files:**
- `web/src/sanity/schemaTypes/index.ts` — register `audiencePage`
- `web/src/lib/forms/schemas/contact.ts` — add optional `audience` field
- `web/src/sanity/schemaTypes/contactInquiry.ts` — add `audience` field
- `web/src/components/Header.tsx` — add "For" nav entry; widen `DARK_HERO_PAGES` to include `/for/*`
- `web/src/lib/forms/__tests__/submit.test.ts` — add audience round-trip test
- `web/package.json` — add `seed:audience:tribes` and `seed:audience:advisors` scripts

**Untouched:**
- `/api/contact/route.ts` — already passes the full payload through `submitForm`; no change needed.

---

## Working Conventions (read first)

- All work runs from `web/`. The dev server is `npm run dev` on port 3005.
- Tests are Vitest. Run `npm test` from `web/`. Test files live in `__tests__` next to the code.
- TypeScript path alias `@/` maps to `web/src/`.
- Visual style: copy patterns from `web/src/app/(frontend)/markets/[state]/page.tsx`. Inline styles, Konative palette, sharp brutalist boxes, Barlow Condensed headlines.
- Sanity writes use `getSanityWriteClient()` (token-backed, requires `SANITY_API_TOKEN` env var). Reads use `getSanityReadClient()`.
- Seed scripts run via `tsx`. Pattern: `npx tsx scripts/seed-audience-tribes.ts`. They must be idempotent — re-running updates the existing document by slug.
- Commit after every task using conventional commits (`feat:`, `test:`, `chore:`).

---

## Task 1: Audience content types (the data contract)

**Files:**
- Create: `web/src/content/audiences/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// web/src/content/audiences/types.ts

/**
 * Shared types for audience landing pages under /for/<slug>.
 * Both the Sanity schema and the AudienceLanding component conform to this shape.
 * Newsletter and other downstream consumers (beehiiv, OG, social) can reuse the same shape.
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
```

- [ ] **Step 2: Compile check**

Run: `cd web && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add web/src/content/audiences/types.ts
git commit -m "feat(audiences): shared AudiencePage type"
```

---

## Task 2: Sanity schema for `audiencePage`

**Files:**
- Create: `web/src/sanity/schemaTypes/audiencePage.ts`
- Modify: `web/src/sanity/schemaTypes/index.ts`

- [ ] **Step 1: Create the schema file**

```typescript
// web/src/sanity/schemaTypes/audiencePage.ts
import { defineArrayMember, defineField, defineType } from "sanity";

const AUDIENCE_SLUG_OPTIONS = [
  { title: "Tribes", value: "tribes" },
  { title: "Advisors", value: "advisors" },
  { title: "Investors", value: "investors" },
  { title: "Landowners", value: "landowners" },
  { title: "Utilities", value: "utilities" },
  { title: "Developers / EPCs", value: "developers-epcs" },
  { title: "Operators", value: "operators" },
];

const ctaVariant = defineField({
  name: "primaryCta",
  title: "Primary CTA",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: r => r.required() }),
    defineField({
      name: "href",
      type: "string",
      description: "Anchor like #cta or a URL. Defaults to the on-page form.",
      initialValue: "#cta",
      validation: r => r.required(),
    }),
  ],
});

const capabilityBand = defineArrayMember({
  type: "object",
  name: "capabilityBand",
  title: "Capability Band",
  fields: [
    defineField({ name: "title", type: "string", validation: r => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});

const engagementStep = defineArrayMember({
  type: "object",
  name: "engagementStep",
  title: "Engagement Step",
  fields: [
    defineField({ name: "label", type: "string", validation: r => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "body" } },
});

const trustItem = defineArrayMember({
  type: "object",
  name: "trustItem",
  title: "Trust Item",
  fields: [
    defineField({ name: "label", type: "string", validation: r => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "body" } },
});

export const audiencePage = defineType({
  name: "audiencePage",
  title: "Audience Page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { maxLength: 64 },
      validation: r =>
        r.required().custom(value => {
          const v = value?.current;
          if (!v) return "Slug is required";
          const ok = AUDIENCE_SLUG_OPTIONS.some(opt => opt.value === v);
          return ok ? true : `Slug must be one of ${AUDIENCE_SLUG_OPTIONS.map(o => o.value).join(", ")}`;
        }),
    }),
    defineField({ name: "displayName", type: "string", validation: r => r.required() }),
    defineField({ name: "tileDescription", type: "text", rows: 2, validation: r => r.required() }),
    defineField({ name: "metaTitle", type: "string", validation: r => r.required() }),
    defineField({ name: "metaDescription", type: "text", rows: 2, validation: r => r.required() }),
    defineField({
      name: "order",
      type: "number",
      description: "Display order on the /for hub. Lower numbers come first.",
      initialValue: 100,
      validation: r => r.required().min(0),
    }),
    defineField({
      name: "hero",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "eyebrow", type: "string", validation: r => r.required() }),
        defineField({ name: "headline", type: "text", rows: 3, validation: r => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 4, validation: r => r.required() }),
        ctaVariant,
      ],
    }),
    defineField({
      name: "whyNow",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2 }),
        defineField({
          name: "bullets",
          type: "array",
          of: [{ type: "string" }],
          validation: r => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "whatYouAlreadyHave",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2 }),
        defineField({
          name: "bullets",
          type: "array",
          of: [{ type: "string" }],
          validation: r => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "whatKonativeDoes",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({
          name: "bands",
          type: "array",
          of: [capabilityBand],
          validation: r => r.required().min(3),
        }),
      ],
    }),
    defineField({
      name: "firstEngagement",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2 }),
        defineField({
          name: "steps",
          type: "array",
          of: [engagementStep],
          validation: r => r.required().min(1),
        }),
        defineField({ name: "pricingPosture", type: "string", validation: r => r.required() }),
      ],
    }),
    defineField({
      name: "trust",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({
          name: "items",
          type: "array",
          of: [trustItem],
          validation: r => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "adjacentAudiences",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({
          name: "pointers",
          type: "array",
          of: [
            { type: "string", options: { list: AUDIENCE_SLUG_OPTIONS } },
          ],
          description: "Other audience slugs to link to from the bottom of this page.",
        }),
      ],
    }),
    defineField({
      name: "finalCta",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "headline", type: "text", rows: 2, validation: r => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 3, validation: r => r.required() }),
        ctaVariant,
      ],
    }),
  ],
  preview: {
    select: { title: "displayName", slug: "slug.current", order: "order" },
    prepare({ title, slug, order }) {
      return {
        title: title || "Untitled audience",
        subtitle: [slug ? `/for/${slug}` : null, order != null ? `order ${order}` : null]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
```

- [ ] **Step 2: Register the schema**

Open `web/src/sanity/schemaTypes/index.ts`. Add the import alongside the other imports:

```typescript
import { audiencePage } from "./audiencePage";
```

Add `audiencePage` to the `schemaTypes` export array. Find a comment that groups schemas (e.g. "Site structure" or similar) and put it there. Example placement (the exact neighboring lines may differ — preserve existing entries):

```typescript
  // Site structure
  audiencePage,
  page,
  navigation,
  // …rest unchanged
```

- [ ] **Step 3: Compile + Sanity typegen**

Run:
```bash
cd web && npx tsc --noEmit
cd web && npm run sanity:typegen
```
Expected: tsc passes; typegen completes (writes updated `extract.json` and types). If typegen errors due to missing local Sanity auth, log it and continue — typegen is not blocking.

- [ ] **Step 4: Commit**

```bash
git add web/src/sanity/schemaTypes/audiencePage.ts web/src/sanity/schemaTypes/index.ts web/src/sanity/extract.json 2>/dev/null || git add web/src/sanity/schemaTypes/audiencePage.ts web/src/sanity/schemaTypes/index.ts
git commit -m "feat(sanity): audiencePage schema"
```

---

## Task 3: Tribes seed-data file

**Files:**
- Create: `web/src/content/audiences/seed-data/tribes.ts`

- [ ] **Step 1: Create the seed payload**

```typescript
// web/src/content/audiences/seed-data/tribes.ts
import type { AudiencePage } from "../types";

export const tribesSeed: AudiencePage = {
  slug: "tribes",
  displayName: "Tribal Nations",
  tileDescription:
    "Turn land and power rights into a credible, financeable data center project — on your terms.",
  metaTitle: "Konative for Tribal Nations | Land + Power → Data Center",
  metaDescription:
    "You already hold the two scarcest assets in the AI buildout — land and interconnect. Konative is the development partner that converts them into a financeable data center project, on your terms.",
  order: 10,
  hero: {
    eyebrow: "For Tribal Nations and Indigenous Development Corporations",
    headline:
      "You already have what the AI buildout needs. Konative is how you put it to work.",
    subhead:
      "Land and interconnect rights are the two scarcest assets in North American data center development. Konative is the development partner that turns them into a credible, financeable project — on terms that preserve sovereignty and serve your nation.",
    primaryCta: { label: "Request a Project Readiness Review", href: "#cta" },
  },
  whyNow: {
    title: "Why now",
    intro: "The window to participate as a principal — not a lessee — is closing.",
    bullets: [
      "AI infrastructure demand is pulling decades of buildout into the next 36 months.",
      "Power and interconnect capacity is the constraint nationwide; nations with both have unusual leverage.",
      "Capital is committed and looking for sites that can move; sites that take a year to clarify get passed over.",
      "Tribes that act now sit at the table as owners and partners, not landlords.",
    ],
  },
  whatYouAlreadyHave: {
    title: "What you already have",
    intro:
      "The hardest pieces of a data center project are already inside your nation's footprint.",
    bullets: [
      "A land base outside the constraints that strangle metro markets.",
      "Treaty and jurisdictional standing that streamlines permitting and incentives.",
      "Existing utility relationships, energy rights, and in many cases, generation assets.",
      "A development corporation structure built for long-horizon, capital-intensive projects.",
      "Federal program alignment — US: NCAI, Treasury CDFI, DOE Loan Programs Office; Canada: CCAB, ISC, the Indigenous Loan Guarantee.",
    ],
  },
  whatKonativeDoes: {
    title: "What Konative does for you",
    bands: [
      {
        title: "Site path",
        body: "Identify, evaluate, and validate the parcels on your land base that can credibly host a data center — siting, environmental, civil, and timeline.",
      },
      {
        title: "Power and interconnect path",
        body: "Build the power case from interconnection studies, generation strategy, and utility coordination — including behind-the-meter options where they fit.",
      },
      {
        title: "Modular DC strategy",
        body: "Right-size the build for your nation's appetite. Phased modular capacity de-risks early commitments and matches deployment pace to capital readiness.",
      },
      {
        title: "Sovereignty-preserving capital structure",
        body: "Structure the deal so the nation retains ownership, control, and long-term economics. Equity, JV, lease, and development partnerships modeled for sovereignty fit.",
      },
      {
        title: "IDC governance integration",
        body: "Brief, structure, and pace the project to match council and IDC review cycles. No surprise board meetings, no rushed decisions.",
      },
      {
        title: "Indigenous procurement and partner curation",
        body: "Vet developers, EPCs, operators, and capital partners. Prioritize indigenous-owned vendors and contractors where they exist; hold non-indigenous partners to procurement standards your nation sets.",
      },
    ],
  },
  firstEngagement: {
    title: "What the first 60-90 days look like",
    intro: "The Project Readiness Review produces decision-grade clarity for your council and IDC.",
    steps: [
      {
        label: "Discovery",
        body: "Confirm fit, urgency, and scope with leadership. Map existing assets, prior studies, and active developer interest.",
      },
      {
        label: "Diligence",
        body: "Site, power, cooling, supply chain, capital structure, sovereignty fit, and procurement posture — analyzed in parallel.",
      },
      {
        label: "Risk register and decision framing",
        body: "Document what is known, what is unknown, what would need to be true to proceed, and at what cost.",
      },
      {
        label: "Executive readout",
        body: "A 60-minute briefing for council and IDC leadership with a go / no-go / refine recommendation and a phased path forward.",
      },
    ],
    pricingPosture: "Engagement-based pricing.",
  },
  trust: {
    title: "Why Konative",
    items: [
      {
        label: "Geography and specialization",
        body: "Canada and US, with deep indigenous and rural project experience. Cross-border literacy where it matters.",
      },
      {
        label: "Neutral clearinghouse",
        body: "Konative is not a developer competing for your land. The job is to help your nation evaluate and execute, not to sell you a building.",
      },
      {
        label: "Founder access",
        body: "You work directly with the team responsible for the recommendation. No layered account managers.",
      },
      {
        label: "Anonymized engagement examples",
        body: "Available on request under NDA.",
      },
    ],
  },
  adjacentAudiences: {
    title: "Are you actually here for something else?",
    pointers: ["advisors", "investors", "landowners", "utilities"],
  },
  finalCta: {
    headline: "Ready to talk through a real project?",
    subhead:
      "Tell us about the land, the energy posture, and what the council has authorized so far. We'll come back with a fit assessment and a path.",
    primaryCta: { label: "Request a Project Readiness Review", href: "#cta" },
  },
};
```

- [ ] **Step 2: Compile**

Run: `cd web && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add web/src/content/audiences/seed-data/tribes.ts
git commit -m "feat(audiences): tribes seed data"
```

---

## Task 4: Advisors seed-data file

**Files:**
- Create: `web/src/content/audiences/seed-data/advisors.ts`

- [ ] **Step 1: Create the seed payload**

```typescript
// web/src/content/audiences/seed-data/advisors.ts
import type { AudiencePage } from "../types";

export const advisorsSeed: AudiencePage = {
  slug: "advisors",
  displayName: "Advisors and Introducers",
  tileDescription:
    "You know who needs this. Konative makes it easy — and worthwhile — to introduce them.",
  metaTitle: "Konative for Advisors and Introducers | Ambassador Program",
  metaDescription:
    "If you work with tribal nations, investors, landowners, or utilities, you can introduce them to Konative and earn referral fees on closed engagements. Co-branded materials, tracked links, founder access.",
  order: 20,
  hero: {
    eyebrow: "For Advisors, Consultants, and Introducers",
    headline: "You know who needs this. We make it easy to introduce them.",
    subhead:
      "If you work with tribal nations, investors, landowners, or utilities thinking about data center development, Konative is the partner you can stand behind. We pay you on closed introductions, give you the materials to make the pitch, and treat you like a partner — not a tipster.",
    primaryCta: { label: "Apply to the ambassador program", href: "#cta" },
  },
  whyNow: {
    title: "Why now",
    bullets: [
      "Data center demand is the largest infrastructure story of the next decade.",
      "Your contacts are being approached by developers with a vested interest. They need a neutral partner.",
      "Konative pays referral fees on closed Project Readiness Reviews and a share of commission on closed deals.",
    ],
  },
  whatYouAlreadyHave: {
    title: "What you already have",
    bullets: [
      "Trust inside a community Konative cannot reach cold.",
      "Context on what your contacts are actually trying to solve.",
      "A reputation that an empty pitch deck cannot replace.",
    ],
  },
  whatKonativeDoes: {
    title: "What Konative does for you",
    bands: [
      {
        title: "Co-branded one-pager",
        body: "Send your contact a single URL that explains Konative in their language. No PDF to manage.",
      },
      {
        title: "Tracked referral link",
        body: "Your introductions are attributed automatically and routed to founder triage within one business day.",
      },
      {
        title: "Intro deck and talking points",
        body: "A short deck and a call script for the first conversation. Light enough to use, structured enough to land.",
      },
      {
        title: "Referral economics",
        body: "Fee on closed Project Readiness Reviews. Share of commission on closed development deals.",
      },
      {
        title: "Founder access and briefings",
        body: "Direct line to the Konative founder and quarterly briefings on market activity and platform changes.",
      },
    ],
  },
  firstEngagement: {
    title: "How onboarding works",
    steps: [
      {
        label: "Apply",
        body: "Tell us who you serve and what your introduction motion looks like. The program is invite-only at launch.",
      },
      {
        label: "Onboard",
        body: "30-minute call. We share materials, set up your tracked link, and align on the first 1-2 introductions.",
      },
      {
        label: "Operate",
        body: "Make introductions when they fit. Konative handles the follow-up, the pitch, and the diligence.",
      },
    ],
    pricingPosture: "Free to advisors. Compensation on closed referrals.",
  },
  trust: {
    title: "Why Konative",
    items: [
      {
        label: "Neutral clearinghouse",
        body: "Konative does not compete with your client's interests. We help them evaluate the field, not sell them a building.",
      },
      {
        label: "Founder responsiveness",
        body: "Introductions reach the founder within one business day. No wasted relationship capital.",
      },
      {
        label: "Indigenous and Canadian specialization",
        body: "If your network is in Indian country or Canada, this is unusually strong fit.",
      },
    ],
  },
  adjacentAudiences: {
    title: "Looking for the buyer-side story?",
    pointers: ["tribes", "investors", "landowners"],
  },
  finalCta: {
    headline: "Ready to introduce someone?",
    subhead:
      "Tell us who you typically work with. We'll set up a 30-minute onboarding and get you the materials to start.",
    primaryCta: { label: "Apply to the ambassador program", href: "#cta" },
  },
};
```

- [ ] **Step 2: Compile**

Run: `cd web && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add web/src/content/audiences/seed-data/advisors.ts
git commit -m "feat(audiences): advisors seed data"
```

---

## Task 5: Seed scripts (idempotent upsert into Sanity)

**Files:**
- Create: `web/scripts/_audience-seed-helpers.ts`
- Create: `web/scripts/seed-audience-tribes.ts`
- Create: `web/scripts/seed-audience-advisors.ts`
- Modify: `web/package.json`

- [ ] **Step 1: Create the shared helper**

```typescript
// web/scripts/_audience-seed-helpers.ts
import type { AudiencePage } from "@/content/audiences/types";
import { getSanityWriteClient } from "@/sanity/writeClient";

/**
 * Convert an AudiencePage TypeScript value into a Sanity document body.
 * Sanity slug fields are objects: { _type: "slug", current: "..." }.
 */
function toSanityDoc(page: AudiencePage): Record<string, unknown> {
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
      bands: page.whatKonativeDoes.bands.map(b => ({ _type: "capabilityBand", _key: keyFor(b.title), ...b })),
    },
    firstEngagement: {
      title: page.firstEngagement.title,
      intro: page.firstEngagement.intro,
      steps: page.firstEngagement.steps.map(s => ({ _type: "engagementStep", _key: keyFor(s.label), ...s })),
      pricingPosture: page.firstEngagement.pricingPosture,
    },
    trust: {
      title: page.trust.title,
      items: page.trust.items.map(i => ({ _type: "trustItem", _key: keyFor(i.label), ...i })),
    },
    adjacentAudiences: {
      title: page.adjacentAudiences.title,
      pointers: page.adjacentAudiences.pointers,
    },
    finalCta: page.finalCta,
  };
}

function keyFor(seed: string): string {
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "k";
}

/**
 * Upsert an audience page document by slug. Idempotent: re-running updates the existing doc.
 */
export async function upsertAudiencePage(page: AudiencePage): Promise<{ id: string; created: boolean }> {
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
```

- [ ] **Step 2: Create the tribes seed script**

```typescript
// web/scripts/seed-audience-tribes.ts
import { tribesSeed } from "@/content/audiences/seed-data/tribes";
import { upsertAudiencePage } from "./_audience-seed-helpers";

async function main() {
  const result = await upsertAudiencePage(tribesSeed);
  console.log(`[seed] tribes ${result.created ? "created" : "updated"}: ${result.id}`);
}

main().catch(err => {
  console.error("[seed] tribes failed:", err);
  process.exit(1);
});
```

- [ ] **Step 3: Create the advisors seed script**

```typescript
// web/scripts/seed-audience-advisors.ts
import { advisorsSeed } from "@/content/audiences/seed-data/advisors";
import { upsertAudiencePage } from "./_audience-seed-helpers";

async function main() {
  const result = await upsertAudiencePage(advisorsSeed);
  console.log(`[seed] advisors ${result.created ? "created" : "updated"}: ${result.id}`);
}

main().catch(err => {
  console.error("[seed] advisors failed:", err);
  process.exit(1);
});
```

- [ ] **Step 4: Add npm scripts**

Open `web/package.json`. In the `scripts` block, add:

```json
"seed:audience:tribes": "tsx scripts/seed-audience-tribes.ts",
"seed:audience:advisors": "tsx scripts/seed-audience-advisors.ts"
```

(Place them next to the other `seed:` / `etl:` scripts; preserve existing entries.)

- [ ] **Step 5: Run the seeds**

Make sure `SANITY_API_TOKEN` is in `web/.env.local`. Then:

```bash
cd web && npm run seed:audience:tribes
cd web && npm run seed:audience:advisors
```

Expected output:
- `[seed] tribes created: <id>` (or `updated: <id>` on rerun)
- `[seed] advisors created: <id>`

Verify in Sanity Studio (`http://localhost:3005/studio` once dev is running) that two `audiencePage` documents exist.

- [ ] **Step 6: Commit**

```bash
git add web/scripts/_audience-seed-helpers.ts web/scripts/seed-audience-tribes.ts web/scripts/seed-audience-advisors.ts web/package.json
git commit -m "feat(audiences): idempotent Sanity seed scripts for tribes + advisors"
```

---

## Task 6: GROQ fetcher with tests

**Files:**
- Create: `web/src/lib/audiences/fetch.ts`
- Create: `web/src/lib/audiences/__tests__/fetch.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// web/src/lib/audiences/__tests__/fetch.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AudiencePage } from "@/content/audiences/types";

const fetchMock = vi.fn();

vi.mock("@/sanity/readClient", () => ({
  getSanityReadClient: () => ({ fetch: fetchMock }),
}));

const sample: AudiencePage = {
  slug: "tribes",
  displayName: "Tribal Nations",
  tileDescription: "tile",
  metaTitle: "title",
  metaDescription: "meta",
  order: 10,
  hero: {
    eyebrow: "eyebrow",
    headline: "Headline",
    subhead: "Subhead",
    primaryCta: { label: "CTA", href: "#cta" },
  },
  whyNow: { title: "Why", bullets: ["a"] },
  whatYouAlreadyHave: { title: "Have", bullets: ["b"] },
  whatKonativeDoes: { title: "Does", bands: [{ title: "Path", body: "x" }, { title: "Power", body: "y" }, { title: "Cap", body: "z" }] },
  firstEngagement: {
    title: "First",
    steps: [{ label: "Discovery", body: "x" }],
    pricingPosture: "Engagement-based.",
  },
  trust: { title: "Why us", items: [{ label: "Geo", body: "x" }] },
  adjacentAudiences: { title: "Other?", pointers: ["advisors"] },
  finalCta: { headline: "Final", subhead: "Sub", primaryCta: { label: "Submit", href: "#cta" } },
};

describe("getAudiencePage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns the matching audience page when found", async () => {
    fetchMock.mockResolvedValue(sample);
    const { getAudiencePage } = await import("../fetch");
    const result = await getAudiencePage("tribes");
    expect(result).toEqual(sample);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [query, params] = fetchMock.mock.calls[0];
    expect(typeof query).toBe("string");
    expect(query).toContain('_type == "audiencePage"');
    expect(params).toEqual({ slug: "tribes" });
  });

  it("returns null when no document exists for the slug", async () => {
    fetchMock.mockResolvedValue(null);
    const { getAudiencePage } = await import("../fetch");
    const result = await getAudiencePage("does-not-exist");
    expect(result).toBeNull();
  });
});

describe("listAudiencePages", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns all audience pages ordered by order asc, then displayName", async () => {
    fetchMock.mockResolvedValue([sample, { ...sample, slug: "advisors", order: 20, displayName: "Advisors" }]);
    const { listAudiencePages } = await import("../fetch");
    const all = await listAudiencePages();
    expect(all).toHaveLength(2);
    expect(all[0].slug).toBe("tribes");
    const [query] = fetchMock.mock.calls[0];
    expect(query).toContain("order(order asc, displayName asc)");
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd web && npm test -- src/lib/audiences`
Expected: FAIL — module `../fetch` not found.

- [ ] **Step 3: Implement the fetcher**

```typescript
// web/src/lib/audiences/fetch.ts
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
```

- [ ] **Step 4: Run the test, confirm it passes**

Run: `cd web && npm test -- src/lib/audiences`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/audiences/fetch.ts web/src/lib/audiences/__tests__/fetch.test.ts
git commit -m "feat(audiences): GROQ fetcher (getAudiencePage + listAudiencePages)"
```

---

## Task 7: Extend `contactSchema` to accept `audience`

**Files:**
- Modify: `web/src/lib/forms/schemas/contact.ts`
- Modify: `web/src/lib/forms/__tests__/submit.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `web/src/lib/forms/__tests__/submit.test.ts`:

```typescript
import { contactSchema } from "@/lib/forms/schemas/contact";

describe("contactSchema audience field", () => {
  it("preserves a known audience slug on the parsed payload", () => {
    const parsed = contactSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      organization: "Test",
      audience: "tribes",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.audience).toBe("tribes");
    }
  });

  it("treats audience as optional", () => {
    const parsed = contactSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      organization: "Test",
    });
    expect(parsed.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd web && npm test -- submit`
Expected: FAIL — Zod strips unknown keys, so `parsed.data.audience` is `undefined` and the first test fails.

- [ ] **Step 3: Update the schema**

```typescript
// web/src/lib/forms/schemas/contact.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  organization: z.string().min(1, "Organization is required"),
  role: z.string().optional(),
  projectType: z.string().optional(),
  projectStage: z.string().optional(),
  message: z.string().optional(),
  referralSource: z.string().optional(),
  audience: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

- [ ] **Step 4: Re-run the test**

Run: `cd web && npm test -- submit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/forms/schemas/contact.ts web/src/lib/forms/__tests__/submit.test.ts
git commit -m "feat(forms): accept optional audience field on contact submissions"
```

---

## Task 8: Extend Sanity `contactInquiry` schema for `audience`

**Files:**
- Modify: `web/src/sanity/schemaTypes/contactInquiry.ts`

- [ ] **Step 1: Add the audience field**

```typescript
// web/src/sanity/schemaTypes/contactInquiry.ts
import { defineField, defineType } from "sanity";

export const contactInquiry = defineType({
  name: "contactInquiry",
  title: "Contact Inquiry",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "organization", type: "string", validation: r => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "projectType", type: "string" }),
    defineField({ name: "projectStage", type: "string" }),
    defineField({ name: "message", type: "text" }),
    defineField({ name: "referralSource", type: "string" }),
    defineField({
      name: "audience",
      type: "string",
      title: "Source audience page",
      description: "Set when the inquiry came from a /for/<slug> page. Empty for the generic /contact form.",
      options: {
        list: [
          { title: "Tribes", value: "tribes" },
          { title: "Advisors", value: "advisors" },
          { title: "Investors", value: "investors" },
          { title: "Landowners", value: "landowners" },
          { title: "Utilities", value: "utilities" },
          { title: "Developers / EPCs", value: "developers-epcs" },
          { title: "Operators", value: "operators" },
        ],
      },
    }),
    defineField({ name: "status", type: "string", options: { list: ["new", "contacted", "qualified", "dead"] }, initialValue: "new" }),
    defineField({ name: "utmSource", type: "string" }),
    defineField({ name: "submittedAt", type: "datetime" }),
  ],
  preview: {
    select: { name: "name", org: "organization", audience: "audience", status: "status" },
    prepare({ name, org, audience, status }: Record<string, string>) {
      const tail = [audience ? `[${audience}]` : null, org || null, status || "new"].filter(Boolean).join(" · ");
      return { title: name || "Unknown", subtitle: tail };
    },
  },
});
```

- [ ] **Step 2: Regenerate Sanity types**

Run: `cd web && npm run sanity:typegen`
Expected: completes without error (or logs a non-blocking auth warning).

- [ ] **Step 3: Commit**

```bash
git add web/src/sanity/schemaTypes/contactInquiry.ts web/src/sanity/extract.json 2>/dev/null || git add web/src/sanity/schemaTypes/contactInquiry.ts
git commit -m "feat(sanity): add audience field to contactInquiry"
```

---

## Task 9: AudienceCTAForm (client form, posts to /api/contact)

**Files:**
- Create: `web/src/components/audience/AudienceCTAForm.tsx`
- Create: `web/src/components/audience/__tests__/AudienceCTAForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// web/src/components/audience/__tests__/AudienceCTAForm.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AudienceCTAForm } from "../AudienceCTAForm";

describe("AudienceCTAForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to /api/contact with the audience slug attached", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, id: "abc" }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<AudienceCTAForm audienceSlug="tribes" submitLabel="Submit" />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/organization/i), { target: { value: "Test Nation IDC" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      organization: "Test Nation IDC",
      audience: "tribes",
    });
  });

  it("shows a success message after a 200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, id: "abc" }) }));
    render(<AudienceCTAForm audienceSlug="advisors" submitLabel="Submit" />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Jerry" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jerry@example.com" } });
    fireEvent.change(screen.getByLabelText(/organization/i), { target: { value: "Workday" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(screen.getByText(/thanks/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Confirm RTL+jsdom are available; install if missing**

```bash
cd web && grep -E "@testing-library/react|jsdom" package.json
```
If both are not present:
```bash
cd web && npm i -D @testing-library/react @testing-library/jest-dom jsdom
```

Verify `web/vitest.config.ts` (or `vite.config.ts`) sets `test.environment = "jsdom"`. If missing, add it.

- [ ] **Step 3: Run the test to confirm failure**

Run: `cd web && npm test -- AudienceCTAForm`
Expected: FAIL — `AudienceCTAForm` not found.

- [ ] **Step 4: Implement the form**

```tsx
// web/src/components/audience/AudienceCTAForm.tsx
"use client";
import { useState } from "react";

const ORANGE = "#E07B39";
const BODY_FONT = "Inter, sans-serif";
const BORDER = "rgba(255,255,255,0.15)";

type Status = "idle" | "submitting" | "success" | "error";

export function AudienceCTAForm({ audienceSlug, submitLabel }: { audienceSlug: string; submitLabel: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          organization,
          message: message || undefined,
          audience: audienceSlug,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(typeof data?.error === "string" ? data.error : "Submission failed.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p style={{ fontFamily: BODY_FONT, fontSize: 15, color: "#fff" }}>
        Thanks. We&apos;ll be in touch within one business day.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} data-audience={audienceSlug} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Name" id="cta-name" value={name} onChange={setName} required />
      <Field label="Email" id="cta-email" type="email" value={email} onChange={setEmail} required />
      <Field label="Organization" id="cta-org" value={organization} onChange={setOrganization} required />
      <Field label="Message (optional)" id="cta-message" value={message} onChange={setMessage} multiline />
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          alignSelf: "flex-start",
          marginTop: 8,
          padding: "14px 24px",
          background: ORANGE,
          color: "#fff",
          fontFamily: BODY_FONT,
          fontWeight: 600,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          border: "none",
          cursor: status === "submitting" ? "wait" : "pointer",
          opacity: status === "submitting" ? 0.6 : 1,
        }}
      >
        {status === "submitting" ? "Submitting…" : `${submitLabel} →`}
      </button>
      {status === "error" && (
        <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: "#f87171", margin: 0 }}>{errorMsg}</p>
      )}
    </form>
  );
}

function Field({
  label, id, value, onChange, type = "text", required = false, multiline = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const baseInputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${BORDER}`,
    color: "#fff",
    fontFamily: BODY_FONT,
    fontSize: 14,
    padding: "10px 12px",
    width: "100%",
  };
  return (
    <label htmlFor={id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
        {label}{required ? " *" : ""}
      </span>
      {multiline ? (
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={4} style={baseInputStyle} />
      ) : (
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} required={required} style={baseInputStyle} />
      )}
    </label>
  );
}
```

- [ ] **Step 5: Run the test, confirm pass**

Run: `cd web && npm test -- AudienceCTAForm`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/audience/AudienceCTAForm.tsx web/src/components/audience/__tests__/AudienceCTAForm.test.tsx
git commit -m "feat(audiences): AudienceCTAForm posts to /api/contact with audience field"
```

---

## Task 10: AudienceLanding component (shared skeleton)

**Files:**
- Create: `web/src/components/audience/AudienceLanding.tsx`
- Create: `web/src/components/audience/__tests__/AudienceLanding.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// web/src/components/audience/__tests__/AudienceLanding.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AudienceLanding } from "../AudienceLanding";
import { tribesSeed } from "@/content/audiences/seed-data/tribes";

describe("AudienceLanding", () => {
  it("renders the audience hero headline", () => {
    render(<AudienceLanding audience={tribesSeed} adjacentTitles={{}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tribesSeed.hero.headline);
  });

  it("renders all capability bands", () => {
    render(<AudienceLanding audience={tribesSeed} adjacentTitles={{}} />);
    for (const band of tribesSeed.whatKonativeDoes.bands) {
      expect(screen.getByText(band.title)).toBeInTheDocument();
    }
  });

  it("renders the primary CTA label twice (top and bottom)", () => {
    render(<AudienceLanding audience={tribesSeed} adjacentTitles={{}} />);
    const ctas = screen.getAllByText(new RegExp(tribesSeed.hero.primaryCta.label, "i"));
    expect(ctas.length).toBeGreaterThanOrEqual(2);
  });

  it("renders engagement steps", () => {
    render(<AudienceLanding audience={tribesSeed} adjacentTitles={{}} />);
    for (const step of tribesSeed.firstEngagement.steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  it("renders trust items", () => {
    render(<AudienceLanding audience={tribesSeed} adjacentTitles={{}} />);
    for (const item of tribesSeed.trust.items) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("only renders adjacent-audience pointers that have a known title", () => {
    render(<AudienceLanding audience={tribesSeed} adjacentTitles={{ advisors: "Advisors" }} />);
    expect(screen.getByText(/Advisors\s*→/)).toBeInTheDocument();
    expect(screen.queryByText(/investors\s*→/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd web && npm test -- AudienceLanding`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

```tsx
// web/src/components/audience/AudienceLanding.tsx
import Link from "next/link";
import type { AudiencePage, AudienceSlug } from "@/content/audiences/types";
import { AudienceCTAForm } from "./AudienceCTAForm";

const NAVY = "#08142D";
const ORANGE = "#E07B39";
const TEXT_DIM = "rgba(255,255,255,0.55)";
const TEXT_FAINT = "rgba(255,255,255,0.35)";
const BORDER = "rgba(255,255,255,0.07)";
const DISPLAY_FONT = '"Barlow Condensed", sans-serif';
const BODY_FONT = "Inter, sans-serif";

export type AdjacentTitleMap = Partial<Record<AudienceSlug, string>>;

export function AudienceLanding({
  audience,
  adjacentTitles,
}: {
  audience: AudiencePage;
  /** Map of slug -> displayName for adjacent-audience pointers known to exist. Pointers not in this map are skipped. */
  adjacentTitles: AdjacentTitleMap;
}) {
  return (
    <div style={{ background: NAVY, minHeight: "100vh", fontFamily: BODY_FONT, color: "#fff" }}>
      {/* Hero */}
      <section style={{ paddingTop: 96, paddingBottom: 64, paddingLeft: 48, paddingRight: 48, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: ORANGE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>
            {audience.hero.eyebrow}
          </div>
          <h1 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 24px" }}>
            {audience.hero.headline}
          </h1>
          <p style={{ fontFamily: BODY_FONT, fontSize: 17, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 760, margin: "0 0 32px" }}>
            {audience.hero.subhead}
          </p>
          <CTAButton cta={audience.hero.primaryCta} />
        </div>
      </section>

      <SectionBlock title={audience.whyNow.title} intro={audience.whyNow.intro}>
        <BulletList bullets={audience.whyNow.bullets} />
      </SectionBlock>

      <SectionBlock title={audience.whatYouAlreadyHave.title} intro={audience.whatYouAlreadyHave.intro}>
        <BulletList bullets={audience.whatYouAlreadyHave.bullets} />
      </SectionBlock>

      <SectionBlock title={audience.whatKonativeDoes.title}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {audience.whatKonativeDoes.bands.map(band => (
            <div key={band.title} style={{ border: `1px solid ${BORDER}`, padding: "20px 22px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 18, textTransform: "uppercase", marginBottom: 10 }}>{band.title}</div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: 0 }}>{band.body}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title={audience.firstEngagement.title} intro={audience.firstEngagement.intro}>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {audience.firstEngagement.steps.map((step, i) => (
            <li key={step.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, alignItems: "start" }}>
              <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 28, color: ORANGE, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#fff", marginBottom: 6 }}>{step.label}</div>
                <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: 0 }}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: TEXT_FAINT, marginTop: 24, marginBottom: 0, letterSpacing: "0.05em" }}>
          {audience.firstEngagement.pricingPosture}
        </p>
      </SectionBlock>

      <SectionBlock title={audience.trust.title}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {audience.trust.items.map(item => (
            <div key={item.label}>
              <div style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: ORANGE, marginBottom: 8 }}>{item.label}</div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title={audience.adjacentAudiences.title}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {audience.adjacentAudiences.pointers.map(slug => {
            const title = adjacentTitles[slug];
            if (!title) return null;
            return (
              <Link
                key={slug}
                href={`/for/${slug}`}
                style={{ fontFamily: BODY_FONT, fontSize: 13, fontWeight: 500, color: "#fff", border: `1px solid ${ORANGE}`, padding: "10px 16px", textDecoration: "none", letterSpacing: "0.02em" }}
              >
                {title} →
              </Link>
            );
          })}
        </div>
      </SectionBlock>

      <section id="cta" style={{ borderTop: `1px solid ${BORDER}`, padding: "64px 48px 96px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 16px" }}>
            {audience.finalCta.headline}
          </h2>
          <p style={{ fontFamily: BODY_FONT, fontSize: 16, lineHeight: 1.6, color: TEXT_DIM, margin: "0 0 32px" }}>
            {audience.finalCta.subhead}
          </p>
          <AudienceCTAForm audienceSlug={audience.slug} submitLabel={audience.finalCta.primaryCta.label} />
        </div>
      </section>
    </div>
  );
}

function CTAButton({ cta }: { cta: { label: string; href: string } }) {
  return (
    <a
      href={cta.href}
      style={{
        display: "inline-block",
        padding: "14px 24px",
        background: ORANGE,
        color: "#fff",
        fontFamily: BODY_FONT,
        fontWeight: 600,
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        textDecoration: "none",
      }}
    >
      {cta.label} →
    </a>
  );
}

function SectionBlock({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "64px 48px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1, textTransform: "uppercase", margin: "0 0 16px" }}>
          {title}
        </h2>
        {intro && (
          <p style={{ fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 760, margin: "0 0 32px" }}>{intro}</p>
        )}
        {children}
      </div>
    </section>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {bullets.map((b, i) => (
        <li key={i} style={{ display: "grid", gridTemplateColumns: "12px 1fr", gap: 12, alignItems: "start" }}>
          <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, background: ORANGE, marginTop: 8 }} />
          <span style={{ fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.55, color: TEXT_DIM }}>{b}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `cd web && npm test -- AudienceLanding`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/audience/AudienceLanding.tsx web/src/components/audience/__tests__/AudienceLanding.test.tsx
git commit -m "feat(audiences): AudienceLanding shared landing-page skeleton"
```

---

## Task 11: `/for` audience hub page (Sanity-driven)

**Files:**
- Create: `web/src/app/(frontend)/for/page.tsx`

- [ ] **Step 1: Create the hub page**

```tsx
// web/src/app/(frontend)/for/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { listAudiencePages } from "@/lib/audiences/fetch";

const NAVY = "#08142D";
const ORANGE = "#E07B39";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT_DIM = "rgba(255,255,255,0.55)";
const DISPLAY_FONT = '"Barlow Condensed", sans-serif';
const BODY_FONT = "Inter, sans-serif";

export const metadata: Metadata = {
  title: "Konative for… | Find your fit",
  description:
    "Konative serves tribal nations, investors, landowners, utilities, developers, operators, and advisors. Pick the page written for you.",
};

export const revalidate = 300;

export default async function AudienceHubPage() {
  const audiences = await listAudiencePages();
  return (
    <div style={{ background: NAVY, minHeight: "100vh", color: "#fff", fontFamily: BODY_FONT }}>
      <section style={{ padding: "96px 48px 48px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: ORANGE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            Konative is for…
          </div>
          <h1 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 16px" }}>
            Find the page written for you.
          </h1>
          <p style={{ fontFamily: BODY_FONT, fontSize: 17, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 720, margin: 0 }}>
            Konative serves multiple audiences across the data center development stack. Pick the one closest to your role and we&apos;ll lead with what matters most to you.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 48px 96px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {audiences.map(a => (
            <Link
              key={a.slug}
              href={`/for/${a.slug}`}
              style={{
                display: "block",
                border: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.02)",
                padding: "28px 28px",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 28, textTransform: "uppercase", lineHeight: 1, marginBottom: 12 }}>
                {a.displayName}
              </div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: "0 0 18px" }}>
                {a.tileDescription}
              </p>
              <span style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: ORANGE }}>
                Read the {a.displayName.toLowerCase()} page →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Compile**

Run: `cd web && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(frontend\)/for/page.tsx
git commit -m "feat(audiences): /for hub fetches audiences from Sanity"
```

---

## Task 12: `/for/[audience]` dynamic page

**Files:**
- Create: `web/src/app/(frontend)/for/[audience]/page.tsx`

- [ ] **Step 1: Create the dynamic route**

```tsx
// web/src/app/(frontend)/for/[audience]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudienceLanding, type AdjacentTitleMap } from "@/components/audience/AudienceLanding";
import { getAudiencePage, listAudiencePages } from "@/lib/audiences/fetch";

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await listAudiencePages();
  return all.map(a => ({ audience: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}): Promise<Metadata> {
  const { audience } = await params;
  const page = await getAudiencePage(audience);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: { title: page.metaTitle, description: page.metaDescription },
  };
}

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const page = await getAudiencePage(audience);
  if (!page) notFound();

  // Build adjacent-title map from the registry of pages that actually exist.
  const all = await listAudiencePages();
  const adjacentTitles: AdjacentTitleMap = {};
  for (const a of all) {
    adjacentTitles[a.slug] = a.displayName;
  }

  return <AudienceLanding audience={page} adjacentTitles={adjacentTitles} />;
}
```

- [ ] **Step 2: Smoke test in dev**

Run: `cd web && npm run dev`
Visit:
- `http://localhost:3005/for` — hub renders both tiles
- `http://localhost:3005/for/tribes` — tribes page renders end-to-end (data loads from Sanity)
- `http://localhost:3005/for/advisors` — advisors page renders end-to-end
- `http://localhost:3005/for/nonexistent` — returns 404

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(frontend\)/for/\[audience\]/page.tsx
git commit -m "feat(audiences): /for/[audience] dynamic page driven by Sanity"
```

---

## Task 13: Header nav — add "For" + dark-hero handling

**Files:**
- Modify: `web/src/components/Header.tsx`

- [ ] **Step 1: Add the nav link**

In `web/src/components/Header.tsx`, update `navLinks`:

```typescript
const navLinks: { label: string; url: string }[] = [
  { label: "Markets", url: "/markets" },
  { label: "Projects", url: "/projects" },
  { label: "Map", url: "/map" },
  { label: "Methodology", url: "/methodology" },
  { label: "Intelligence", url: "/intelligence" },
  { label: "For", url: "/for" },
  { label: "About", url: "/#team" },
];
```

- [ ] **Step 2: Widen dark-hero matching to cover `/for/*`**

Below the existing `DARK_HERO_PAGES` set, add a helper:

```typescript
function isDarkHeroPath(pathname: string): boolean {
  if (DARK_HERO_PAGES.has(pathname)) return true;
  if (pathname === "/for" || pathname.startsWith("/for/")) return true;
  return false;
}
```

Then change the existing line:
```typescript
const hasDarkHero = DARK_HERO_PAGES.has(pathname);
```
to:
```typescript
const hasDarkHero = isDarkHeroPath(pathname);
```

- [ ] **Step 3: Smoke test header in dev**

Visit `/for` and `/for/tribes`. Header should render in dark-hero mode.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/Header.tsx
git commit -m "feat(nav): add For link + dark-hero handling for /for routes"
```

---

## Task 14: Final test sweep + production build

- [ ] **Step 1: Full Vitest run**

Run: `cd web && npm test`
Expected: all suites PASS.

- [ ] **Step 2: Type check**

Run: `cd web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `cd web && npm run build`
Expected: build succeeds. Routes `/for` and `/for/[audience]` appear in the route list.

- [ ] **Step 4: Optional housekeeping commit**

```bash
git status
# if there are auto-formatter or codegen changes:
git add -A && git commit -m "chore: post-build housekeeping"
```

---

## Task 15: Manual QA + Sanity Studio verification

- [ ] **Step 1: Walk through both audience pages in dev**

Run: `cd web && npm run dev`. Visit both `/for/tribes` and `/for/advisors`. For each:
- All sections render with data sourced from Sanity (edit a field in Studio, reload — change appears within ~5 minutes due to `revalidate = 300`, or restart dev for instant).
- Primary CTAs jump to the `#cta` form anchor.
- Submit the form. Expect "Thanks. We'll be in touch within one business day."

- [ ] **Step 2: Verify the inquiry landed in Sanity**

Open `http://localhost:3005/studio` → Contact Inquiry. Confirm both submissions appear with `audience` populated.

- [ ] **Step 3: Verify Resend email**

Check the inbox at `RESEND_TO` (or local logs). Each submission should produce one email with the audience visible.

- [ ] **Step 4: Try editing copy in Studio**

In Studio, open the tribes audience page, change the hero subhead, save. Wait for cache or restart dev. Reload `/for/tribes`. Change appears.

---

## Spec Coverage Check

- ✅ Audience router under `/for` with hub + dynamic per-audience pages — Tasks 11, 12
- ✅ Shared `<AudienceLanding />` skeleton — Task 10
- ✅ Sanity-backed copy (editable in Studio, reusable for beehiiv) — Tasks 2, 3, 4, 5, 6
- ✅ Tribal page as the lead deliverable — Task 3 (seed) + Task 5 (run)
- ✅ Advisor page (lean but credible) — Task 4 (seed) + Task 5 (run)
- ✅ Adjacent-audience pointers, only rendered when target exists — Task 10
- ✅ CTA wired to existing `/api/contact` with `audience` discriminator — Tasks 7, 8, 9
- ✅ Top-level "For" nav entry; dark-hero treatment — Task 13
- ✅ Per-audience SEO title + OG metadata — Task 12 (`generateMetadata`)
- ⏭ Per-audience OG **image** — deferred; default OG image at `web/src/app/opengraph-image.tsx` covers `/for/*` at launch.
- ⏭ `/platform` page — Plan C.
- ⏭ Notion monetization doc — author directly.
- ⏭ Ambassador kit — Plan E.
- ⏭ Remaining 5 audience pages — Plan B (clones the same Sanity schema + a new seed script per audience).
- ⏭ Analytics CTA events — small follow-on; add `track("audience_cta_submitted", { audience })` in `AudienceCTAForm` when desired.
- ⏭ beehiiv integration — out of scope for this plan, but unblocked: a beehiiv-feeding script can now query `*[_type == "audiencePage" && slug.current == "tribes"]{...}` to pull copy.

## Open Questions (do not block launch)

- **Should Studio editors be able to add brand-new audiences without code?** Today the slug is constrained to a fixed list and a new audience requires updating `AudienceSlug` in `types.ts`. If you want fully data-driven audiences later, lift the slug constraint and turn `AudienceSlug` into `string`. Not needed for V1.
- **Cache invalidation.** `revalidate = 300` means edits take up to 5 minutes to appear. If you want instant invalidation, add a Sanity webhook → `/api/revalidate?path=/for/tribes` route. Future task.
- **Form fields per audience.** All audience pages share the same five-field form. If an audience needs different fields (e.g., advisor "who do you typically introduce?"), generalize `AudienceCTAForm` to accept a per-audience `fields` config in a follow-on.
