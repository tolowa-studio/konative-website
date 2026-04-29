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
