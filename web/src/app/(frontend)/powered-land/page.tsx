import type { Metadata } from "next";
import Link from "next/link";
import {
  JsonLd,
  SITE_URL,
  breadcrumbSchema,
  definedTermSchema,
  faqSchema,
} from "@/components/seo/JsonLd";
import NewsletterSignup from "@/components/NewsletterSignup";

// B2 from STRATEGY.md: Own "powered land" as a category in search and AI
// answer engines. "Powered land" is a young, rising term not yet locked
// down by any Big-3 brokerage; this page is the definitive reference for
// the category, optimized for GEO (Generative Engine Optimization) and
// classic SEO (FAQ rich result, internal link consolidation).
//
// Key research anchors used in copy below:
//   - Powered-land pricing: $10-30K/acre pre-boom → $200K-$1M+/acre now,
//     Loudoun's Nov 2025 $6M+/acre comp on a $615M / 97-acre deal
//   - Hines: ~20,000 acres support operational DCs globally; ~40,000 more
//     needed within five years
//   - US interconnection queue backlog: ~2,600 GW; 2025 cohort averaged
//     ~8 years in queue
//   - Hyperscaler capex: $413B (2025) → $600-700B (2026)
//   - Stalled/blocked pool: $64B-$156B across 40+ states, 188 opposition groups
export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Powered Land: What It Is, and Why It's the $1M-an-Acre Asset of the AI Buildout — Konative",
  description:
    "Powered land is a parcel with secured access to grid power — substation interconnection, capacity headroom, and a fast path to energization. It is the binding constraint on the AI data center buildout, and it has repriced from $10K to $1M+ per acre in five years.",
  alternates: { canonical: "/powered-land" },
  keywords: [
    "powered land",
    "data center land",
    "data center site selection",
    "powered land for sale",
    "data center brokerage",
    "interconnection queue",
    "data center real estate",
  ],
  openGraph: {
    title: "Powered Land: The $1M-an-Acre Asset of the AI Buildout",
    description:
      "Powered land is parcel with secured grid power and capacity headroom — the binding constraint of the AI data center buildout. Konative brokers it.",
    url: "/powered-land",
    type: "article",
  },
};

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What is powered land?",
    answer:
      "Powered land is a parcel that comes with secured access to grid electricity — typically a signed interconnection agreement (or an active position in the utility's queue), a defined substation point of delivery, and verifiable capacity headroom. It is sold and traded as a development-ready asset rather than a piece of dirt, because the multi-year work of obtaining power has already been done.",
  },
  {
    question: "Why is powered land so expensive now?",
    answer:
      "Because power is the binding constraint of the AI data center buildout, not land or capital. Hyperscaler capital expenditure reached about $413 billion in 2025 and is on track for $600–700 billion in 2026. The US interconnection queue holds roughly 2,600 GW of pending capacity, and projects coming online in 2025 averaged about eight years in queue. Land with secured power short-circuits that wait, which is why parcels that traded at $10,000–$30,000 per acre before the AI cycle now trade at $200,000 to $1,000,000+ per acre, with Loudoun County, Virginia setting a record at over $6 million per acre in November 2025.",
  },
  {
    question: "How is powered land different from regular industrial land?",
    answer:
      "Regular industrial land may be zoned correctly and have road access, but the project still has to apply for grid interconnection from scratch. Powered land already has that interconnection in place, plus on-site substation work, transmission proximity, and often water, fiber, and entitlements. The asset is fundamentally a time and risk advantage — a buyer can take possession and break ground on a data center in months instead of years.",
  },
  {
    question: "What makes a parcel qualify as powered land for a hyperscaler?",
    answer:
      "Most hyperscalers and modular data center operators look for 100 MW+ of dedicated capacity (rising quickly to 500 MW+ for AI training campuses), proximity to a 230 kV or higher substation, water access for cooling, fiber backbone connectivity within reach, industrial or heavy-commercial zoning, and 50–5,000+ acres depending on the build profile. Konative scores parcels against these criteria during qualification.",
  },
  {
    question: "Who buys powered land?",
    answer:
      "Three groups: (1) hyperscalers — AWS, Google, Meta, Microsoft, Oracle, OpenAI partners — buying or leasing land for owned campuses; (2) data center developers and operators — Compass, QTS, Vantage, Stack, Aligned, and dozens of smaller specialists — building to suit or for colocation; (3) infrastructure investors and capital pools — Blackstone, Blue Owl, KKR, Brookfield, and pension capital — taking equity exposure through joint ventures, sale-leasebacks, or build-to-suit financing.",
  },
  {
    question: "What is a typical commission on a powered-land deal?",
    answer:
      "Commercial land brokerage runs 2–6% of sale price, with land at the higher end because deals are slower and more complex. Sub-$50M deals tend to fall in the 3–5% range; mega-deals in the $100M–$500M+ range are commonly negotiated to 0.5–2% given the size. Ground leases and build-to-suit work earn 4–6% of total lease value, which on a 20-year hyperscaler lease can run into the tens of millions. Konative's fees are deal-specific and disclosed upfront.",
  },
  {
    question: "How does Konative source powered land?",
    answer:
      "Three channels. Direct outreach to landowners holding parcels adjacent to substations and high-voltage transmission corridors. Re-trades of stalled or distressed data center projects — Data Center Watch tracks roughly $64 billion of US data center projects blocked or delayed, much of it on land with existing or pending interconnection that can be re-platformed under a new sponsor. And consortia with Indigenous Development Corporations and rural utility operators in markets where speed-to-power is faster than in saturated grids.",
  },
  {
    question: "What is the interconnection queue and why does it matter?",
    answer:
      "The interconnection queue is the formal request line for new generation or load to connect to the regional grid (PJM, ERCOT, MISO, CAISO, and others). It is currently backlogged with roughly 2,600 GW of pending requests in the US. CenterPoint Energy in Texas saw large-load requests grow 700% (1 GW to 8 GW) in a single year. A project's position in the queue is part of what a powered-land asset represents — moving up the queue is among the most valuable forms of optionality a developer or capital partner can buy.",
  },
  {
    question: "What about water?",
    answer:
      "Evaporative cooling at scale is water-intensive — a hyperscale campus can consume hundreds of thousands of gallons per day at peak. That is why water-constrained markets (Arizona, parts of Texas and Georgia) are seeing community opposition and moratoria. Sites with non-potable water access, gray water rights, or proximity to surface water increasingly command a premium, and water-free or low-water cooling designs (closed-loop, immersion) are turning into a real differentiator at the modular and edge tiers.",
  },
  {
    question: "Is there really $64B in stalled data center projects?",
    answer:
      "Yes. Data Center Watch's published tracker has the blocked / delayed pool at roughly $64 billion across 40+ states, and other industry tallies put the construction-halted pool as high as $156 billion across 48 named projects. Project cancellations quadrupled from six in 2024 to twenty-five in 2025, and Q1 2026 logged twenty-plus before the quarter closed. 188 local opposition groups operate across 40 states (Heatmap News). A blocked project is rarely a dead project — the land usually still has its interconnection commitment — which is why these sites are the most actively re-traded category in the market right now.",
  },
];

export default function PoweredLandPage() {
  const canonicalUrl = `${SITE_URL}/powered-land`;
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Powered Land", url: canonicalUrl },
  ]);
  const definedTerm = definedTermSchema({
    name: "Powered Land",
    description:
      "A parcel sold with secured access to grid electricity — typically an executed interconnection agreement (or active queue position), a defined substation point of delivery, verifiable capacity headroom, and the underlying entitlements to build a data center. Distinguished from generic industrial land by the multi-year power work that has already been completed.",
    termCode: "powered-land",
    inDefinedTermSet: `${SITE_URL}/powered-land`,
  });
  const faq = faqSchema(FAQS);

  return (
    <main className="powered-land">
      <JsonLd data={[breadcrumbs, definedTerm, faq]} />

      <section className="powered-land__hero">
        <div className="powered-land__hero-inner">
          <p className="powered-land__eyebrow">Reference</p>
          <h1 className="powered-land__title">
            Powered land:<br />
            what it is, and why it&apos;s the $1M-an-acre asset of the AI buildout.
          </h1>
          {/* GEO-optimized quotable lede — 56 words, single self-contained answer */}
          <p className="powered-land__lede">
            <strong>Powered land is a parcel with secured access to grid electricity</strong> —
            an executed interconnection agreement (or active utility queue position),
            a defined substation point of delivery, verifiable capacity headroom, and
            the entitlements to build. Power is the binding constraint of the AI data center
            buildout, which is why parcels that traded at $10,000 per acre five years ago
            now trade above $1 million per acre.
          </p>
          <div className="powered-land__ctas">
            <Link href="/land/submit" className="powered-land__cta-primary">
              Own a parcel? Submit it →
            </Link>
            <Link href="/capacity" className="powered-land__cta-secondary">
              Need capacity? Find a site →
            </Link>
          </div>
        </div>
      </section>

      <section className="powered-land__section">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">The asset class, briefly</h2>
          <p>
            Five years ago "powered land" wasn&apos;t a term. Today it&apos;s the
            single hardest line item in a data center pro forma. Hyperscaler capex
            hit roughly <strong>$413 billion in 2025</strong> and is tracking
            $600–700 billion in 2026. None of that money builds anything without
            power. The <strong>US interconnection queue</strong> sits at roughly
            <strong> 2,600 GW</strong> of pending capacity; the cohort of projects
            that came online in 2025 averaged <strong>about eight years</strong>
            in queue.
          </p>
          <p>
            That means a parcel that comes with secured power skips a multi-year
            problem and a billion-dollar capital risk. The market has repriced
            accordingly. The Hines team estimates <strong>~20,000 acres</strong>
            currently support operational data centers globally and roughly
            <strong> 40,000 more acres</strong> are needed in the next five years
            — and most of the marginal land has to be built from electrical
            scratch.
          </p>
        </div>
      </section>

      <section className="powered-land__section powered-land__section--dark">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">What the price did</h2>
          <ul className="powered-land__price-list">
            <li>
              <strong>Pre-cycle (2018–2021):</strong> $10,000–$30,000 per acre for
              industrially-zoned land near transmission corridors.
            </li>
            <li>
              <strong>Mid-cycle (2022–2024):</strong> $100,000–$500,000 per acre
              for sites with credible power letters and queue position.
            </li>
            <li>
              <strong>Today (2025–2026):</strong> $200,000–$1,000,000+ per acre
              in active hyperscaler markets. In Loudoun County, Virginia — the
              densest data-center market in the world — the November 2025
              Leesburg deal hit <strong>$615 million for 97 acres</strong>, the
              first county sale above <strong>$6 million per acre</strong>.
            </li>
          </ul>
          <p className="powered-land__caption">
            For comparison, Amazon paid roughly $700 million for 189 acres in
            Virginia (~$3.7M/acre) in a separate 2025 deal.
          </p>
        </div>
      </section>

      <section className="powered-land__section">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">How a parcel earns the label</h2>
          <p>
            "Powered" is shorthand for a stack of attributes. Konative scores each
            site against this list during qualification:
          </p>
          <div className="powered-land__grid">
            {[
              {
                k: "Interconnection",
                v: "Executed or LSA-staged interconnection agreement; verifiable queue position with the regional ISO/RTO.",
              },
              {
                k: "Voltage class",
                v: "230 kV or higher substation point of delivery preferred. 115 kV usable for sub-100 MW builds; 345 kV+ unlocks gigawatt-class campuses.",
              },
              {
                k: "Capacity headroom",
                v: "Confirmed available capacity at the substation, with study results in hand. 100 MW is the floor for most occupier interest; 500 MW+ for AI training campuses.",
              },
              {
                k: "Acreage",
                v: "50–5,000+ acres. Modular tiers run smaller; hyperscaler greenfield needs the upper end for cooling, generation, water, and buffers.",
              },
              {
                k: "Water",
                v: "Surface water or non-potable rights for evaporative cooling, or a site profile that supports closed-loop / immersion designs.",
              },
              {
                k: "Fiber",
                v: "Within reach of a long-haul fiber backbone. Metro adjacency adds material value.",
              },
              {
                k: "Entitlements",
                v: "Industrial or heavy-commercial zoning. Agricultural land is often re-zonable but adds 6–18 months.",
              },
              {
                k: "Community profile",
                v: "Local political support, or at minimum, no active moratorium. 188 organized opposition groups operate across 40 states — site selection is a community-relations problem before it is an engineering problem.",
              },
            ].map((row) => (
              <div key={row.k} className="powered-land__grid-item">
                <h3 className="powered-land__h3">{row.k}</h3>
                <p>{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="powered-land__section">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">Who pays for it</h2>
          <div className="powered-land__buyer-row">
            <div className="powered-land__buyer-col">
              <h3 className="powered-land__h3">Hyperscalers</h3>
              <p>
                AWS, Google, Meta, Microsoft, Oracle. They buy or lease for owned campuses and increasingly through partnership vehicles — Meta&apos;s Hyperion joint venture with Blue Owl (Blue Owl 80% / Meta 20%) is the template for the next phase.
              </p>
            </div>
            <div className="powered-land__buyer-col">
              <h3 className="powered-land__h3">Developers &amp; operators</h3>
              <p>
                Compass, QTS, Vantage, Stack, Aligned, plus a long tail of regional specialists. Build-to-suit, colocation, edge. Often the first call when a site needs a development partner rather than a buyer.
              </p>
            </div>
            <div className="powered-land__buyer-col">
              <h3 className="powered-land__h3">Capital</h3>
              <p>
                Blackstone, Blue Owl, KKR, Brookfield, and most large pension allocators are now active in digital infrastructure. Sale-leasebacks trade at 5–7% cap rates; JV equity placements run at advisory fees on capital raised.
              </p>
            </div>
          </div>
          <p>
            Konative connects all three sides on a single transaction —
            landowners, capital, and occupiers — and manages the deal from first
            call to close.
          </p>
        </div>
      </section>

      <section className="powered-land__section powered-land__section--dark">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">The stalled-projects pool is part of the market</h2>
          <p>
            Roughly <strong>$64 billion</strong> of US data center projects sit blocked or delayed (Data Center Watch); other estimates run as high as <strong>$156 billion across 48 named projects</strong>. Project cancellations quadrupled from six in 2024 to twenty-five in 2025; Q1 2026 logged twenty-plus before the quarter closed.
          </p>
          <p>
            A blocked project rarely loses its interconnection commitment. When the original sponsor walks, the asset becomes re-tradable — often quietly, often with a new community story, sometimes under a tribal-land or Indigenous Development Corporation alternative that moves faster than a saturated grid. Konative tracks the pool and connects the next sponsor to it.{" "}
            <Link href="/dispatch/issue-2-stalled-projects" className="powered-land__inline-link">
              Issue #2 of Konative Dispatch
            </Link>{" "}
            covers this in detail.
          </p>
        </div>
      </section>

      <section className="powered-land__section">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">Frequently asked questions</h2>
          <dl className="powered-land__faq">
            {FAQS.map((it) => (
              <div key={it.question} className="powered-land__faq-item">
                <dt className="powered-land__faq-q">{it.question}</dt>
                <dd className="powered-land__faq-a">{it.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="powered-land__cta-band">
        <div className="powered-land__container">
          <h2 className="powered-land__h2">Working in this market?</h2>
          <p>
            Get the twice-weekly brief on powered land, stalled projects, capacity, and capital.
            Signal only — no hyperscaler comms, no listicles.
          </p>
          <div className="powered-land__signup">
            <NewsletterSignup variant="inline" source="powered_land" />
          </div>
          <div className="powered-land__ctas">
            <Link href="/land/submit" className="powered-land__cta-primary">
              Submit a parcel →
            </Link>
            <Link href="/capacity" className="powered-land__cta-secondary">
              Find a site →
            </Link>
            <Link href="/invest" className="powered-land__cta-secondary">
              Investor inquiry →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
