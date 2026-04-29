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
