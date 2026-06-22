import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";
import MapEmbed from "@/components/MapEmbed";
import {
  JsonLd,
  faqSchema,
  breadcrumbSchema,
  tribalConnectivityServiceSchema,
  SITE_URL,
} from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Tribal Enterprise Connectivity | Sovereignty-Aware Brokerage | Konative",
  description:
    "Sovereignty-aware, vendor-neutral connectivity brokerage for Tribal gaming, government, healthcare, and education. Internet, SD-WAN, voice, transport, and security — sourced from 100+ suppliers at no cost to your enterprise.",
  alternates: { canonical: "/tribal" },
  openGraph: {
    title: "Tribal Enterprise Connectivity | Sovereignty-Aware Brokerage | Konative",
    description:
      "Sovereignty-aware, vendor-neutral connectivity brokerage for Tribal gaming, government, healthcare, and education. Internet, SD-WAN, voice, transport, and security — sourced from 100+ suppliers at no cost to your enterprise.",
    url: `${SITE_URL}/tribal`,
  },
};

// --- JSON-LD data ---

const breadcrumbJsonLd = breadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Tribal Connectivity", url: `${SITE_URL}/tribal` },
]);

const FAQ_ITEMS = [
  {
    question: "What is a tribal connectivity broker?",
    answer:
      "A tribal connectivity broker is a vendor-neutral intermediary who represents the Tribal nation, enterprise, or authority — not any single carrier. The broker surveys the supplier market for internet, fiber, transport, voice, cloud, and security services, compares commercial terms across multiple providers, and manages the order through provisioning and renewal. Because suppliers pay the broker's fee, there is no cost to the Tribal buyer.",
  },
  {
    question: "What services does Konative broker for Tribal enterprises?",
    answer:
      "Konative brokers the full enterprise connectivity stack for Tribal organizations: dedicated internet access (DIA), SD-WAN, lit and dark fiber, middle-mile and last-mile transport, UCaaS and hosted voice, cloud connectivity (AWS Direct Connect, Azure ExpressRoute, Google Interconnect), managed security and SASE, mobility and fixed wireless, and colocation access. All sourced through Avant's portfolio of 100+ suppliers across the US and Canada.", // VERIFY: \"100+\" supplier count — verify current number at avant.com
  },
  {
    question: "What is the NTIA Tribal Broadband Connectivity Program (TBCP)?",
    answer:
      "NTIA's Tribal Broadband Connectivity Program (TBCP) is a $3 billion federal grant program (funded by the Infrastructure Investment and Jobs Act and the Consolidated Appropriations Act of 2021) for broadband infrastructure deployment, adoption, and capacity-building on Tribal lands. Prior rounds awarded approximately $2.2 billion across 275 projects serving 400+ Tribes. NTIA has now opened TBCP Round 3 together with the Native Entities Grant Program (NEGP), making ~$790 million available — the application window is open and closes September 17, 2026, with rolling awards expected beginning Spring 2027. Konative does not administer TBCP awards, but we help Tribal connectivity buyers align carrier-grade service requirements with funded project scopes. Always confirm eligibility and program terms with your NTIA program officer.",
  },
  {
    question: "Why does sovereignty matter in connectivity procurement?",
    answer:
      "Tribal sovereignty means Tribal nations and enterprises operate under a distinct legal and political framework that affects contracting, permitting, right-of-way, and vendor relationships. A connectivity broker who does not understand sovereignty may inadvertently route procurement decisions through state or local regulatory frameworks that do not apply — or miss federal funding pathways that do. Konative is built specifically to work within sovereignty-aware procurement processes.",
  },
  {
    question: "Does Konative cost anything to a Tribal buyer?",
    answer:
      "No. Konative is paid by the supplier that wins the business, not by the Tribal nation, EDC, or enterprise. This is the standard technology brokerage model. There is no advisory fee, no retainer, and no obligation to purchase. You get a fully brokered, supplier-competitive process at zero cost.",
  },
  {
    question: "What types of Tribal organizations does Konative serve?",
    answer:
      "Konative serves Tribal gaming enterprises, Tribal governments and councils, Tribal economic development corporations (EDCs), Tribal healthcare systems, Tribal education departments, Tribal public safety and emergency management, and Tribal broadband authorities across the United States and Canada.",
  },
  {
    question: "What is Avant and why does it matter for Tribal connectivity?",
    answer:
      "Avant is North America's largest technology services distributor. As an Avant sub-agent, Konative has access to Avant's portfolio of 100+ carriers and cloud providers across North America. That means Tribal buyers get quotes from the whole market — not just the two or three suppliers that happen to knock on the door — normalized and compared by an advisor who works for the Tribe, not the carrier.", // VERIFY: \"100+\" supplier count — verify current number at avant.com
  },
  {
    question: "How do I get started with Konative for a Tribal connectivity project?",
    answer:
      "Book a 15-minute discovery call at konative.com/call or fill out the contact form at konative.com/contact. Konative will ask about your locations, current services, bandwidth and resilience requirements, and any funding context (TBCP awards, other federal programs). From there we run the supplier market and return a structured comparison — usually within a few business days for straightforward requirements.",
  },
];

const faqJsonLd = faqSchema(FAQ_ITEMS);

// --- Style constants (matching /connectivity and /data-center-connectivity pillars) ---

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

// Proof / link card styles
const proofCardBase: CSSProperties = {
  background: "#fff",
  border: `1px solid ${DIVIDER}`,
  borderTop: `3px solid ${RED}`,
  padding: "36px 32px",
  display: "flex",
  flexDirection: "column",
};
const proofNumStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.2em",
  color: RED,
  marginBottom: 10,
};
const proofTitleStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: 26,
  textTransform: "uppercase",
  lineHeight: 1.0,
  color: TEXT,
  marginBottom: 14,
};
const proofDescStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 14,
  lineHeight: 1.7,
  color: MUTED,
  flexGrow: 1,
  marginBottom: 24,
};
const proofCtaStyle: CSSProperties = {
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

export default function TribalPage() {
  return (
    <>
      <JsonLd data={tribalConnectivityServiceSchema} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <PitchLayout
        eyebrow="Tribal &amp; Rural Connectivity · Avant Partner"
        titleLines={[
          { text: "SOVEREIGNTY-AWARE", tone: "white" },
          { text: "CONNECTIVITY", tone: "dim" },
          { text: "BROKERAGE.", tone: "rust" },
        ]}
        subhead="Konative is a sovereignty-aware, vendor-neutral connectivity broker serving tribal nations, tribal enterprises, and rural broadband authorities across the US and Canada. We source internet, fiber, transport, voice, cloud, and security from 100+ suppliers at no cost — and help you navigate NTIA Tribal Broadband Connectivity Program funding."
        primaryCta={{ label: "Book a Discovery Call →", href: "/call" }}
        secondaryCta={{ label: "Contact Us →", href: "/contact" }}
        ctaHeadlineTop="ONE REQUIREMENT."
        ctaHeadlineBottom="THE WHOLE MARKET."
        ctaSub="Tell us what your nation or enterprise needs — we'll quote it across the full supplier portfolio, sovereignty-aware, at no cost to you."
      >
        {/* Section 1: What we broker for Tribal & Rural */}
        <PitchSection eyebrow="The Portfolio" heading="What we broker for Tribal &amp; rural enterprises">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Tribal enterprises — gaming, government, healthcare, education, and public safety — need the same
            carrier-grade connectivity as any enterprise, plus an advisor who understands sovereignty, federal
            funding programs, and right-of-way on Tribal lands. Konative brokers the full stack.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                num: "01",
                title: "Dedicated Internet Access",
                body: "Carrier-grade dedicated internet — symmetrical, SLA-backed, and sourced from multiple suppliers across your service area. Konative normalizes pricing and terms across providers so you get a defensible comparison, not a single quote.",
              },
              {
                num: "02",
                title: "Fiber & Transport",
                body: "Lit and dark fiber, middle-mile transport, and last-mile connectivity for enterprise campuses, government facilities, gaming operations, and clinic sites. Includes multi-site aggregation and diverse-path design.",
              },
              {
                num: "03",
                title: "SD-WAN & Managed Network",
                body: "Software-defined WAN and managed network services connecting distributed Tribal locations — clinics, administrative offices, gaming floors, and community centers — on a unified, policy-driven platform.",
              },
              {
                num: "04",
                title: "Cloud Connectivity",
                body: "Private, low-latency connections into AWS Direct Connect, Azure ExpressRoute, and Google Cloud Interconnect for Tribal health records, finance systems, and enterprise workloads requiring consistent, compliant cloud access.",
              },
              {
                num: "05",
                title: "Voice & UCaaS",
                body: "Hosted voice and unified communications for Tribal government, healthcare, and enterprise — replacing legacy PBX with modern, survivable, multi-site UCaaS platforms sourced from the competitive market.",
              },
              {
                num: "06",
                title: "Security & SASE",
                body: "Managed security services, SASE, and next-generation firewall platforms for Tribal enterprises that need enterprise-grade protection without an in-house security operations team.",
              },
              {
                num: "07",
                title: "Mobility & Fixed Wireless",
                body: "Cellular mobility, fixed wireless broadband, and hybrid connectivity for Tribal locations where fiber is not yet available — bridging the coverage gap while longer-term infrastructure is planned or funded.",
              },
              {
                num: "08",
                title: "TBCP / Federal Funding Navigation",
                body: "NTIA has opened TBCP Round 3 alongside the Native Entities Grant Program (NEGP), making ~$790 million available for broadband on Tribal lands. The application window is open now and closes September 17, 2026 — awards expected on a rolling basis beginning Spring 2027. Konative does not administer grants, but we help Tribal connectivity teams structure carrier-grade service requirements that are defensible and program-aligned.",
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

        {/* Section 2: Why Konative — vendor-neutral + Avant + sovereignty-aware + no cost */}
        <PitchSection eyebrow="Why Konative" heading="We work for the Tribe. Not the carrier." background="#F9FAFB">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                num: "01",
                title: "Vendor-neutral by design",
                body: "Konative carries no inventory and owns no network. We represent the Tribal buyer's requirements across the full market — not the supplier that pays the highest commission.",
              },
              {
                num: "02",
                title: "100+ suppliers via Avant", // VERIFY: \"100+\" supplier count — verify current number at avant.com
                body: "As an Avant sub-agent, Konative accesses North America's largest technology services distributor portfolio — 100+ carriers, cloud providers, and managed service vendors across the US and Canada.",
              },
              {
                num: "03",
                title: "No cost to the Tribal buyer",
                body: "Suppliers pay Konative's fee when they win the business. There is no advisory charge, no retainer, and no obligation to purchase — ever. Tribal enterprises get a fully brokered, competitive process at zero cost.",
              },
              {
                num: "04",
                title: "Sovereignty-aware procurement",
                body: "Konative understands that Tribal enterprises operate under a distinct legal and political framework. We structure procurement and contracts to respect sovereignty, work within Tribal governance processes, and flag any supplier terms that may conflict.",
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

        {/* Section 3: Proof / Data — awards and index */}
        <PitchSection eyebrow="Proof &amp; Data" heading="Tribal connectivity records &amp; intelligence">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Konative maintains records of Tribal broadband awards and connectivity intelligence to help Tribal
            buyers understand the landscape before making procurement decisions.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            <div style={proofCardBase}>
              <div style={proofNumStyle}>01</div>
              <h3 style={proofTitleStyle}>Tribal Connectivity Awards</h3>
              <p style={proofDescStyle}>
                Explore NTIA Tribal Broadband Connectivity Program award records — grantee names, award rounds,
                and project types — compiled from public federal data to help Tribal IT directors and broadband
                authorities understand what has been funded and where.
              </p>
              <Link href="/tribal/awards" style={proofCtaStyle}>
                Browse Tribal Awards →
              </Link>
            </div>
            <div style={proofCardBase}>
              {/* VERIFY: /tribal/index ships in Wave 2 — this link may 404 until that task is complete */}
              <div style={proofNumStyle}>02</div>
              <h3 style={proofTitleStyle}>Tribal Connectivity Index</h3>
              <p style={proofDescStyle}>
                The Tribal Connectivity Index is a curated intelligence layer tracking broadband availability,
                carrier footprint, and funding activity across Tribal service areas in the US and Canada. Planned
                for public release in Wave 2 of the Konative platform.
              </p>
              <Link href="/tribal/index" style={proofCtaStyle}>
                {/* VERIFY: /tribal/index ships in Wave 2 — may 404 until then */}
                Tribal Connectivity Index →
              </Link>
            </div>
          </div>
        </PitchSection>

        {/* Section 4: Proof map */}
        <PitchSection eyebrow="Infrastructure Data" heading="Mapped to sovereign and rural ground">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 720, marginBottom: 36 }}>
            Konative maintains a proprietary infrastructure map with indigenous-lands, broadband, power, and
            transmission layers across the US and Canada — the geographic intelligence behind our Tribal
            connectivity work. Explore the full interactive map to see sovereign lands and infrastructure context
            in one view.
          </p>
          <MapEmbed
            readout={false}
            height={460}
            caption="Indigenous lands, broadband, power and transmission layers across the US and Canada." /* VERIFY */
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
          <div style={{ marginTop: 32 }}>
            <Link
              href="/tribal/awards"
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: MUTED,
                textDecoration: "none",
                borderBottom: `1px solid ${DIVIDER}`,
                paddingBottom: 2,
              }}
            >
              Browse Tribal Broadband Awards →
            </Link>
          </div>
        </PitchSection>

        {/* Section 5: FAQ */}
        <PitchSection eyebrow="Common Questions" heading="FAQ" background="#F9FAFB">
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
