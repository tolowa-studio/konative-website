import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";
import MapEmbed from "@/components/MapEmbed";
import {
  JsonLd,
  faqSchema,
  breadcrumbSchema,
  dataCenterConnectivityServiceSchema,
  SITE_URL,
} from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Data Center Connectivity Broker | Transport, Dark Fiber & Interconnection | Konative",
  description:
    "Konative is a vendor-neutral data-center connectivity broker — an Avant sub-agent sourcing transport, dark fiber, cross-connects, colocation, and cloud on-ramps into your facility from 100+ carriers across North America. No cost to you.",
  alternates: { canonical: "/data-center-connectivity" },
  openGraph: {
    title: "Data Center Connectivity Broker | Transport, Dark Fiber & Interconnection | Konative",
    description:
      "Konative is a vendor-neutral data-center connectivity broker — an Avant sub-agent sourcing transport, dark fiber, cross-connects, colocation, and cloud on-ramps into your facility from 100+ carriers across North America. No cost to you.",
    url: `${SITE_URL}/data-center-connectivity`,
  },
};

// --- JSON-LD data ---

const breadcrumbJsonLd = breadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Data Center Connectivity", url: `${SITE_URL}/data-center-connectivity` },
]);

const FAQ_ITEMS = [
  {
    question: "What is a data center connectivity broker?",
    answer:
      "A data-center connectivity broker is a vendor-neutral intermediary who represents the facility owner or developer — not any single carrier. The broker surveys the market for transport, dark fiber, cross-connects, and cloud on-ramps, compares commercial terms across multiple suppliers, designs diverse and redundant routes, and manages the order through installation. Because suppliers pay the broker's fee, there is no cost to the buyer.",
  },
  {
    question: "What connectivity does Konative broker for data centers?",
    answer:
      "Konative brokers the full network layer into and between data-center facilities: long-haul and metro transport, lit and dark fiber, 10G/100G/400G wavelengths, data-center interconnection (DCI), cross-connects and carrier-neutral colocation, cloud on-ramps (AWS Direct Connect, Azure ExpressRoute, Google Interconnect, Oracle FastConnect), diverse internet access, and managed security. All sourced through Avant's portfolio of 100+ suppliers.", // VERIFY: "100+" supplier count — verify current number at avant.com
  },
  {
    question: "Why use a broker instead of going directly to a carrier?",
    answer:
      "A single carrier can only quote its own network. A broker quotes the whole market, identifies serviceability and construction exposure before they become delivery problems, normalizes pricing so terms are truly comparable, and holds the supplier accountable through provisioning. Because suppliers compete for the business, buyers typically see better pricing and faster timelines than they would negotiating alone.",
  },
  {
    question: "Does Konative cost anything?",
    answer:
      "No. Konative is paid by the supplier that wins the business, not by the buyer. This is the standard technology brokerage model. There is no advisory fee, no retainer, and no obligation to purchase.",
  },
  {
    question: "What information do you need to start a connectivity sourcing engagement?",
    answer:
      "Konative starts with four inputs: (1) site address and development stage, (2) capacity profile — initial and ultimate bandwidth, transport, wavelength, and cloud requirements, (3) physical resilience requirements — carrier diversity, route diversity, building entrances, and failover assumptions, and (4) commercial milestones — ready-for-service date and contract structure preferences. From there we run the supplier market and return a normalized comparison.",
  },
  {
    question: "What is Avant and why does it matter?",
    answer:
      "Avant is North America's largest technology services distributor. As an Avant sub-agent, Konative has access to Avant's portfolio of 100+ carriers and cloud providers, enabling us to compare real quotes from the whole market rather than the two or three suppliers any single agent typically carries.", // VERIFY: "100+" supplier count — verify current number at avant.com
  },
  {
    question: "Do you still help with powered land or site selection?",
    answer:
      "Yes — site and land buyers are a natural fit. If you are evaluating a site or securing powered land for a data center campus, connectivity is typically the next constraint after power. Konative can run a connectivity feasibility check alongside your land and power work, so you understand carrier availability, diversity options, and construction exposure before you commit to a site.",
  },
  {
    question: "Can you help with a site that is still in development or pre-construction?",
    answer:
      "Yes. Early engagement is better — carrier serviceability, route diversity, and construction lead times can affect site selection decisions. Konative can assess connectivity feasibility at the address or parcel level and give you a frank picture of what exists, what needs to be built, and what that costs before you are locked into a location.",
  },
  {
    question: "Who holds the contract — Konative or the carrier?",
    answer:
      "The carrier does. Konative runs the sourcing process — collecting bids, comparing serviceability and pricing across suppliers, and negotiating terms — but the facility owner or developer signs directly with the winning carrier. Konative is not a party to that agreement and does not take on carrier service-delivery liability. What Konative does take on is the ongoing relationship: staying in the account after signing to manage installation, escalations, and renewals.",
  },
  {
    question: "What happens after installation if there's an outage or a service issue?",
    answer:
      "Call Konative first. Post-installation, Konative remains the single point of contact across every carrier in your stack — that includes outage escalation, billing disputes, and moves/adds/changes. Rather than you managing a separate support relationship with each carrier, Konative works the escalation on your behalf and keeps pressure on the SLA. This ongoing role is part of the brokerage relationship, not a separate paid service.",
  },
];

const faqJsonLd = faqSchema(FAQ_ITEMS);

// --- Style constants (matching /connectivity pillar) ---

const RED = "#C8001F";
const DISPLAY = '"Barlow Condensed", sans-serif';
const BODY = "Inter, sans-serif";
const TEXT = "#111111";
const MUTED = "#6B7280";
const DIVIDER = "#E5E7EB";

const cardStyle: CSSProperties = {
  background: "#fff",
  padding: "30px 28px",
  border: `1px solid ${DIVIDER}`,
  borderTop: `3px solid ${RED}`,
};
const numberStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.18em",
  color: RED,
  marginBottom: 12,
};
const headingStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 22,
  textTransform: "uppercase",
  color: TEXT,
  lineHeight: 1.05,
  marginBottom: 10,
};
const bodyStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 13,
  lineHeight: 1.7,
  color: MUTED,
};

// FAQ styles
const faqQStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 20,
  lineHeight: 1.2,
  textTransform: "uppercase",
  color: TEXT,
  marginBottom: 12,
};
const faqAStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 15,
  lineHeight: 1.75,
  color: MUTED,
  margin: 0,
};

// Bridge section card styles
const bridgeCardBase: CSSProperties = {
  background: "#fff",
  border: `1px solid ${DIVIDER}`,
  borderTop: `3px solid ${RED}`,
  padding: "36px 32px",
  display: "flex",
  flexDirection: "column",
};
const bridgeNumStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.2em",
  color: RED,
  marginBottom: 10,
};
const bridgeTitleStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: 26,
  textTransform: "uppercase",
  lineHeight: 1.0,
  color: TEXT,
  marginBottom: 14,
};
const bridgeDescStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 14,
  lineHeight: 1.7,
  color: MUTED,
  flexGrow: 1,
  marginBottom: 24,
};
const bridgeCtaStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: RED,
  textDecoration: "none",
  borderBottom: `1px solid ${RED}`,
  paddingBottom: 2,
  alignSelf: "flex-start",
};

export default function DataCenterConnectivityPage() {
  return (
    <>
      <JsonLd data={dataCenterConnectivityServiceSchema} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <PitchLayout
        eyebrow="Data Center Connectivity · Avant Partner"
        titleLines={[
          { text: "THE NETWORK", tone: "white" },
          { text: "INTO YOUR", tone: "dim" },
          { text: "FACILITY.", tone: "rust" },
        ]}
        subhead="Konative is a vendor-neutral data-center connectivity broker — an Avant sub-agent that sources transport, dark fiber, cross-connects, colocation, and cloud on-ramps into your facility from 100+ carriers across North America. We work for you, not the supplier, and because carriers pay our fee, there is no cost to you."
        primaryCta={{ label: "Book a Discovery Call →", href: "/call" }}
        secondaryCta={{ label: "Contact Us →", href: "/contact" }}
        heroImage={{
          src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=70",
          alt: "Dense cable management and network cabling running along a data center server aisle",
          credit: { name: "Taylor Vick", url: "https://unsplash.com/@tvick" },
        }}
        ctaHeadlineTop="BUILDING A CAMPUS?"
        ctaHeadlineBottom="WE'LL SOURCE THE NETWORK."
        ctaSub="Bring us the address, capacity plan, diversity requirement, and ready-for-service date. We'll turn them into a sourcing plan across the full supplier market."
      >
        {/* Section 1: What we broker for data centers */}
        <PitchSection eyebrow="What We Broker" heading="Connectivity into the facility">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Konative sources and manages every network layer a data center or campus requires — from long-haul
            transport and dark fiber to cross-connects and cloud on-ramps. One vendor-neutral broker, the whole carrier
            market, no supplier bias.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                num: "01",
                title: "Cross-Connects & Interconnection",
                body: "Data-center cross-connects and interconnection circuits that stitch facilities, cages, carrier hotels, and internet exchanges together — sourced and managed across neutral and carrier-specific environments.",
              },
              {
                num: "02",
                title: "Interconnection / Peering",
                body: "Public and private peering, internet exchange access, and interconnection at carrier-neutral facilities — designed to reduce transit costs and latency for high-volume or latency-sensitive workloads.",
              },
              {
                num: "03",
                title: "Dark Fiber & Transport",
                body: "Long-haul and metro dark fiber, IRUs, lit fiber, and 10G/100G/400G wavelengths between campuses, carrier hotels, and clouds — competitive multi-supplier quoting on every route.",
              },
              {
                num: "04",
                title: "Carrier-Neutral Colocation",
                body: "Colocation in carrier-neutral facilities — power, space, and cross-connect access across major and secondary markets, sourced to fit your resilience and commercial requirements.",
              },
              {
                num: "05",
                title: "Cloud On-Ramps",
                body: "Private, low-latency dedicated connections into AWS Direct Connect, Azure ExpressRoute, Google Cloud Interconnect, and Oracle FastConnect — off the public internet, with committed SLAs.",
              },
              {
                num: "06",
                title: "Diverse & Redundant Routes",
                body: "Carrier-diverse and path-diverse design so a single fiber cut or supplier failure never takes the facility — sourced across the full market with independent physical paths.",
              },
            ].map((item) => (
              <div key={item.num} style={cardStyle}>
                <div style={numberStyle}>{item.num}</div>
                <h3 style={headingStyle}>{item.title}</h3>
                <p style={bodyStyle}>{item.body}</p>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* Section 2: Powered-land bridge */}
        <PitchSection eyebrow="Site & Land Buyers" heading="Securing powered land or a site? Connectivity is the next constraint." background="#F9FAFB">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Land and power are the headline constraints in the AI buildout — but every site also needs a credible
            network plan before it can operate. Visitors who arrive from our powered-land and capacity pages land
            here because connectivity brokerage is what Konative delivers: sourcing the transport, dark fiber,
            and interconnection that turns a powered site into a functioning data center campus.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <div style={bridgeCardBase}>
              <div style={bridgeNumStyle}>01</div>
              <h3 style={bridgeTitleStyle}>Evaluating a site?</h3>
              <p style={bridgeDescStyle}>
                Connectivity feasibility — carrier availability, route diversity, and construction exposure — can
                affect which site you choose. Konative can run a connectivity check at the address or parcel level
                before you commit, so the network picture is part of your site decision, not an afterthought.
              </p>
              <Link href="/call" style={bridgeCtaStyle}>
                Talk to us about your site →
              </Link>
            </div>
            <div style={bridgeCardBase}>
              <div style={bridgeNumStyle}>02</div>
              <h3 style={bridgeTitleStyle}>Secured the land?</h3>
              <p style={bridgeDescStyle}>
                Once the site is set, connectivity is typically the next item on the critical path. Konative runs
                the sourcing plan: capacity and diversity requirements, supplier RFPs, commercial term comparison,
                and order management through installation — one point of contact for the life of every circuit.
              </p>
              <Link href="/call" style={bridgeCtaStyle}>
                Start the sourcing plan →
              </Link>
            </div>
          </div>
        </PitchSection>

        {/* Section 3: Vendor-neutral + Avant + no cost */}
        <PitchSection eyebrow="Why a Broker" heading="We work for you. Not the carrier.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                num: "01",
                title: "Vendor-neutral by design",
                body: "Konative carries no inventory and owns no network. We represent the buyer's requirements across the full market — not the supplier that pays the highest commission.",
              },
              {
                num: "02",
                title: "100+ suppliers via Avant", // VERIFY: "100+" supplier count — verify current number at avant.com
                body: "As an Avant sub-agent, Konative accesses North America's largest technology services distributor portfolio. You get quotes from the whole market, normalized and compared, not just the two or three carriers any single agent typically carries.",
              },
              {
                num: "03",
                title: "No cost to the buyer",
                body: "Suppliers pay Konative's fee when they win the business. There is no advisory charge, no retainer, and no obligation to purchase — ever.",
              },
              {
                num: "04",
                title: "One point of contact for life",
                body: "We stay in the account through provisioning, installation, escalation, billing disputes, and renewal — one accountable advisor for the life of every service.",
              },
            ].map((item) => (
              <div key={item.num} style={cardStyle}>
                <div style={numberStyle}>{item.num}</div>
                <h3 style={headingStyle}>{item.title}</h3>
                <p style={bodyStyle}>{item.body}</p>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* Section 4: Proof map */}
        <PitchSection eyebrow="Infrastructure Data" heading="The infrastructure behind every connection">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Konative&apos;s brokerage is backed by a proprietary infrastructure map covering North American power,
            transmission, interconnection, and indigenous-lands layers — the data engine we use to assess connectivity
            feasibility before a single carrier quote is collected.
          </p>
          <MapEmbed
            readout={false}
            height={460}
            caption="North American power, transmission, and interconnection infrastructure — the map behind our data-center connectivity work." /* VERIFY */
          />
          <div style={{ marginTop: 20 }}>
            <Link
              href="/map"
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: RED,
                textDecoration: "none",
                borderBottom: `1px solid ${RED}`,
                paddingBottom: 2,
              }}
            >
              Explore the full interactive map →
            </Link>
          </div>
        </PitchSection>

        {/* Section 5: Proprietary proof trackers */}
        <PitchSection eyebrow="Proprietary Intelligence" heading="Live trackers behind our connectivity work" background="#F9FAFB">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Konative maintains proprietary trackers that surface where data-center demand is forming, stalling, or shifting — the intelligence layer that informs every sourcing engagement.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <div style={bridgeCardBase}>
              <div style={bridgeNumStyle}>01</div>
              <h3 style={bridgeTitleStyle}>Stalled &amp; blocked projects</h3>
              <p style={bridgeDescStyle}>
                Live tracker of stalled, canceled, paused, and blocked data-center projects in NV, WV, FL, and OK — with governor-level context for outreach. Where projects die is where connectivity demand disappears; knowing the map is part of every route-diversity assessment.
              </p>
              <Link href="/governors" style={bridgeCtaStyle}>
                View the stalled-project tracker →
              </Link>
            </div>
            <div style={bridgeCardBase}>
              <div style={bridgeNumStyle}>02</div>
              <h3 style={bridgeTitleStyle}>Canada DC market</h3>
              <p style={bridgeDescStyle}>
                Quebec, Ontario, Alberta, and BC provincial analysis — power markets, hyperscaler builds, First Nations partnerships, and the federal Sovereign AI Compute Strategy. Canada is an active sourcing market for cross-border connectivity and land plays.
              </p>
              <Link href="/canada" style={bridgeCtaStyle}>
                Explore the Canada market →
              </Link>
            </div>
          </div>
        </PitchSection>

        {/* Section 6: FAQ */}
        <PitchSection eyebrow="Common Questions" heading="FAQ" background="#F9FAFB">
          <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.7, color: MUTED, maxWidth: 720, marginBottom: 32 }}>
            More on brokerage pricing, contract structure, and response times in the{" "}
            <Link href="/answers" style={{ color: RED, textDecoration: "underline" }}>full Answers knowledge base</Link>.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "0 40px",
                  paddingBottom: 40,
                  borderBottom: i < FAQ_ITEMS.length - 1 ? `1px solid ${DIVIDER}` : "none",
                }}
              >
                <div>
                  <h3 style={faqQStyle}>{faq.question}</h3>
                </div>
                <div>
                  <p style={faqAStyle}>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, textAlign: "center" }}>
            <Link
              href="/call"
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                background: RED,
                color: "#fff",
                padding: "16px 36px",
                textDecoration: "none",
                borderRadius: 2,
                display: "inline-block",
              }}
            >
              Book a 15-Min Call →
            </Link>
          </div>
        </PitchSection>
      </PitchLayout>
    </>
  );
}
