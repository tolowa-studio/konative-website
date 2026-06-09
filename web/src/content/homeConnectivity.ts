/**
 * Connectivity-brokerage homepage content.
 *
 * Single source of truth for the rebranded homepage copy. The home page server
 * component fetches a `homeConnectivity` singleton from Sanity (editable in
 * Studio) and falls back to this object when the document is absent — so the
 * site renders the correct brokerage messaging even before Sanity is seeded.
 * This same object is used to seed the Sanity document.
 */

export type Tone = "white" | "rust" | "dim";

export interface HeadlineLine {
  text: string;
  tone: Tone;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface HeroStat {
  value: string;
  label: string;
  /** Render value in rust accent */
  rust?: boolean;
  /** Highlight tile (rust border) — used for the final emphasis stat */
  highlight?: boolean;
}

export interface PortfolioItem {
  name: string;
  blurb: string;
}

export interface WedgeCard {
  num: string;
  eyebrow: string;
  /** May contain "\n" for a manual line break */
  title: string;
  desc: string;
  cta: string;
  href: string;
  primary?: boolean;
}

export interface Capability {
  num: string;
  title: string;
  body: string;
}

export interface HomeConnectivityContent {
  heroEyebrow: string;
  heroHeadline: HeadlineLine[];
  heroSubhead: string;
  heroPrimaryCta: CtaLink;
  heroSecondaryCtas: CtaLink[];
  heroStats: HeroStat[];

  portfolioEyebrow: string;
  portfolioHeadingTop: string;
  portfolioHeadingBottom: string;
  portfolioIntro: string;
  portfolioItems: PortfolioItem[];

  wedgeEyebrow: string;
  wedgeHeadingTop: string;
  wedgeHeadingBottom: string;
  wedges: WedgeCard[];

  howEyebrow: string;
  howHeadingTop: string;
  howHeadingBottom: string;
  howIntro: string;
  capabilities: Capability[];
}

export const HOME_CONNECTIVITY_DEFAULT: HomeConnectivityContent = {
  heroEyebrow: "Connectivity Brokerage · Avant Partner",
  heroHeadline: [
    { text: "WE BROKER THE", tone: "white" },
    { text: "CONNECTIVITY", tone: "rust" },
    { text: "THE AI ERA", tone: "dim" },
    { text: "RUNS ON.", tone: "white" },
  ],
  heroSubhead:
    "Konative is a vendor-neutral internet & network connectivity brokerage. We source, design, and manage the fiber, transport, internet, and cloud connectivity that Tribal enterprises and the data centers powering AI depend on — backed by Avant's portfolio of 100+ suppliers, at no cost to you.",
  heroPrimaryCta: { label: "Get a Connectivity Quote →", href: "/contact" },
  heroSecondaryCtas: [
    { label: "What We Broker →", href: "/connectivity" },
    { label: "Tribal Enterprise →", href: "/tribal" },
  ],
  heroStats: [
    { value: "100+", label: "Supplier Portfolio · via Avant", rust: true },
    { value: "$0", label: "Cost to You — Suppliers Pay Us" },
    { value: "2", label: "Verticals: Tribal + Data Center" },
    { value: "1 POINT", label: "Of Contact, for the Life of the Account", highlight: true },
  ],

  portfolioEyebrow: "What We Broker",
  portfolioHeadingTop: "ONE BROKER.",
  portfolioHeadingBottom: "EVERY NETWORK.",
  portfolioIntro:
    "We're carrier-neutral. Through Avant's supplier portfolio we source and manage the full connectivity stack — then stay in the account for its life. You get the whole market and one point of contact, not ten carrier reps.",
  portfolioItems: [
    { name: "Dedicated Internet & Broadband", blurb: "DIA, fiber, and broadband across every market — sourced competitively, not single-carrier." },
    { name: "Lit & Dark Fiber", blurb: "Long-haul and metro fiber, IRUs, and dark fiber for high-capacity, private routes." },
    { name: "Wavelengths & Transport", blurb: "10G/100G/400G waves and Ethernet transport between sites, data centers, and clouds." },
    { name: "SD-WAN & Managed Networks", blurb: "Software-defined WAN and managed network services across multi-site footprints." },
    { name: "UCaaS & CCaaS", blurb: "Cloud voice, collaboration, and contact-center platforms — and POTS replacement." },
    { name: "Cloud On-Ramps & Direct Connect", blurb: "Private, low-latency connectivity into AWS, Azure, Google Cloud, and Oracle." },
    { name: "Data Center Interconnect & Colo", blurb: "Cross-connects, DCI, and colocation between facilities, carrier hotels, and clouds." },
    { name: "Wireless WAN, FWA & Mobility", blurb: "Fixed wireless, cellular failover, and mobility for rural, Tribal, and edge sites." },
    { name: "Cybersecurity & Managed Services", blurb: "SASE, managed firewall, and security services layered onto the network we source." },
  ],

  wedgeEyebrow: "Where We Lean In",
  wedgeHeadingTop: "TWO MARKETS.",
  wedgeHeadingBottom: "ONE BROKERAGE.",
  wedges: [
    {
      num: "01",
      eyebrow: "For Tribal Enterprises",
      title: "Tribal\nconnectivity.",
      desc:
        "Casinos, government, healthcare, and education on Tribal lands need carrier-grade connectivity, redundancy, and security — but rarely have a neutral advisor who understands sovereignty and federal funding. We're that advisor: vendor-neutral, sovereignty-aware, and built for this market.",
      cta: "Explore Tribal →",
      href: "/tribal",
      primary: true,
    },
    {
      num: "02",
      eyebrow: "For Data Centers & Developers",
      title: "Data center\nconnectivity.",
      desc:
        "Developers build the campus and strategy — but someone has to source the network. We broker transport, dark fiber, wavelengths, cross-connects, and cloud on-ramps into the facility, using our proprietary data-center map to get ahead of demand.",
      cta: "Data Center Connectivity →",
      href: "/data-center-connectivity",
      primary: false,
    },
    {
      num: "03",
      eyebrow: "For Multi-Site Business",
      title: "Business\nconnectivity.",
      desc:
        "Internet, SD-WAN, voice, and security across every location — sourced from the whole market, not one carrier. One advisor, many carriers, full lifecycle support at no cost to you.",
      cta: "Talk to Us →",
      href: "/contact",
      primary: false,
    },
  ],

  howEyebrow: "Why a Broker",
  howHeadingTop: "WE WORK FOR YOU.",
  howHeadingBottom: "NOT THE CARRIER.",
  howIntro:
    "Going direct means one carrier's price and one carrier's answer. We bring the whole market, design the right network, and stay accountable for its life — and suppliers pay us, so our advice costs you nothing.",
  capabilities: [
    { num: "01 — Neutral", title: "Vendor-Neutral Sourcing", body: "We're not a carrier. We quote the whole market through Avant's 100+ suppliers and recommend what's right for you — not what pays us most." },
    { num: "02 — Design", title: "Network Design & Strategy", body: "DIA, fiber, waves, SD-WAN, voice, cloud on-ramps, and security — architected around your sites, workloads, and budget." },
    { num: "03 — Source", title: "Competitive Procurement", body: "We run carriers against each other, surface real pricing and availability, and negotiate terms — so you get market, not list." },
    { num: "04 — Project", title: "Install & Project Management", body: "We manage orders, provisioning, and installs across carriers so you have one point of contact instead of ten." },
    { num: "05 — Manage", title: "Lifecycle Support", body: "Billing disputes, moves/adds/changes, escalations, and renewals. We stay in the account for its life — at no cost to you." },
    { num: "06 — Data", title: "Demand Intelligence", body: "Our proprietary data-center and market dataset tells us where connectivity demand is landing — so our advice is grounded in the market, not guesswork." },
  ],
};
