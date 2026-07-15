import type { Metadata } from "next";
import Link from "next/link";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";
import TbcpIntelligence from "@/components/TbcpIntelligence";
import { getTbcpSummary } from "@/lib/data/tbcp";
import {
  JsonLd,
  SITE_URL,
  organizationSchema,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/seo/JsonLd";

// Public aggregate TBCP data — cache for an hour.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NTIA TBCP Round 3 Connectivity Partner | Konative",
  description:
    "TBCP Round 3 & NEGP close Sept 17, 2026. Separate grant help from commercial brokerage: Konative delivers a One-Site Carrier + Renewal Snapshot — vendor-neutral, sovereignty-aware, AVANT economics disclosed.",
  keywords: [
    "NTIA TBCP Round 3",
    "Tribal Broadband Connectivity Program",
    "Native Entities Grant Program",
    "Tribal broadband grant connectivity partner",
    "sovereignty-aware connectivity broker",
    "one-site carrier snapshot",
    "vendor-neutral Tribal connectivity",
  ],
  alternates: { canonical: "/ntia" },
};

const PAGE_URL = `${SITE_URL}/ntia`;

/** Program facts — sourced from NTIA TBCP Round 3 / NEGP guidance. */
const facts: { value: string; label: string; note: string }[] = [
  {
    value: "$790M",
    label: "TBCP Round 3 + NEGP available",
    note: "$540M in Tribal Broadband Connectivity Program Round 3 plus $250M in the Native Entities Grant Program (NTIA, June 2026 NOFO).",
  },
  {
    value: "Sept 17, 2026",
    label: "Application window closes",
    note: "The window is open now. Applications are due by September 17, 2026 — no partial extensions assumed.",
  },
  {
    value: "Spring 2027",
    label: "Awards begin (rolling)",
    note: "Awards are expected on a rolling basis beginning Spring 2027, with execution to follow.",
  },
];

const brings: { num: string; title: string; body: string }[] = [
  {
    num: "01 — Snapshot",
    title: "One-Site Carrier + Renewal Snapshot",
    body: "An asynchronous one-pager for a named property: public carrier/market options, renewal questions, redundancy questions that need engineering confirmation, relevant AVANT categories, and a short next-step tree — with citations and confidence labels. No meeting required to start.",
  },
  {
    num: "02 — Source",
    title: "Vendor-Neutral Sourcing",
    body: "Through Avant's portfolio of 100+ suppliers we quote the whole market instead of one carrier. On low-density Tribal lands that neutrality is the difference between a route that exists and one that doesn't.",
  },
  {
    num: "03 — Terms",
    title: "Procurement When Ready",
    body: "When you are ready to buy — pre-award or post-award — we line up comparable carrier pricing and terms so execution is a deliberate procurement step, not a scramble.",
  },
  {
    num: "04 — Sovereignty",
    title: "Sovereignty-Aware Advisory",
    body: "We understand Tribal jurisdiction. Grant application strategy stays on the Funding Navigator / Tolowa Pacific path; Konative stays in commercial carrier procurement for operating enterprises.",
  },
  {
    num: "05 — Economics",
    title: "Transparent Broker Economics",
    body: "Konative operates as an AVANT sub-agent. Suppliers may compensate us when you select a provider. We do not call the service \"free\" without that disclosure. You own the contracts, the data, and the relationship.",
  },
];

const timeline: { phase: string; window: string; body: string }[] = [
  {
    phase: "Pre-Award",
    window: "Now → Sept 17, 2026",
    body: "Engage early. We review the connectivity requirements and help specify carrier-grade operational connectivity into the proposal before the deadline closes.",
  },
  {
    phase: "Award",
    window: "Spring 2027 (rolling)",
    body: "Winners execute. Connectivity design and pre-negotiated carrier contracts move from plan to order the moment funding is confirmed.",
  },
  {
    phase: "Operations",
    window: "2027 and beyond",
    body: "We manage the resulting connectivity contracts — billing, moves/adds/changes, escalations, renewals — for the life of the account.",
  },
];

const eligibility: string[] = [
  "Tribal governments",
  "Tribal colleges & universities (TCUs)",
  "Tribal organizations",
  "Alaska Native Corporations (ANCs)",
  "Native Hawaiian organizations (DHHL)",
];

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is NTIA TBCP Round 3 and how much funding is available?",
    answer:
      "The NTIA Tribal Broadband Connectivity Program (TBCP) Round 3, combined with the Native Entities Grant Program (NEGP), makes approximately $790 million available for Tribal broadband. The application window is open now and closes September 17, 2026, with awards expected on a rolling basis beginning Spring 2027.",
  },
  {
    question: "Who is eligible to apply?",
    answer:
      "Eligible applicants include Tribal governments, Tribal colleges and universities, Tribal organizations, Alaska Native Corporations, and Native Hawaiian organizations (DHHL). This is a sovereignty-aligned program directed to Native entities.",
  },
  {
    question: "If the grant can fund infrastructure and design, what does Konative actually do?",
    answer:
      "TBCP eligible uses can include infrastructure, backhaul/middle/last mile, leases/IRUs, engineering, network design, consulting, and related costs — always confirm against the current NOFO with your program officer. Grant application strategy and funding-window help belong on our Funding Navigator (and Tolowa Pacific). Konative's commercial work is vendor-neutral carrier procurement for operating enterprises: DIA, transport, SD-WAN, voice, security, cloud on-ramps, and renewals, starting with a One-Site Carrier + Renewal Snapshot.",
  },
  {
    question: "What does Konative cost a Tribe or Native entity?",
    answer:
      "Konative operates as a vendor-neutral connectivity brokerage and AVANT sub-agent. Suppliers may compensate us when you select a provider. There is typically no separate advisory fee to the buyer for standard brokerage, but we do not market the service as \"free\" without that disclosure. You own the contracts.",
  },
  {
    question: "We haven't been awarded yet. Is it too early to engage Konative?",
    answer:
      "For grant writing and NOFO strategy, start with the Funding Navigator. For commercial carrier questions on an operating casino, clinic, utility, or government site, a One-Site Snapshot is useful any time — especially when renewals, expansions, or redundancy are already on the calendar. We do not disguise grant outreach as brokerage demand.",
  },
  {
    question: "Is Konative really vendor-neutral?",
    answer:
      "Yes. Konative is not a carrier. We source across Avant's portfolio of 100+ suppliers and recommend what fits your requirement, not what pays us most. On low-density Tribal lands, that neutrality — including fixed wireless and satellite where fiber doesn't reach — is what makes a workable route possible.",
  },
  {
    question: "Does a Round 3 award come with a specific connectivity contract, or does Konative sign anything on our behalf?",
    answer:
      "Neither the grant nor Konative puts the Tribe into a connectivity contract automatically. Commercial carrier agreements — internet, SD-WAN, voice, security — are between the Tribe (or Tribal entity) and the selected carrier. Konative runs vendor-neutral sourcing and stays engaged through the life of the contract; the Tribe contracts directly with the carrier.",
  },
];

export default async function NtiaPage() {
  const tbcpSummary = await getTbcpSummary();
  const service = serviceSchema({
    name: "NTIA TBCP Round 3 Connectivity Partner",
    description:
      "Vendor-neutral, sovereignty-aware connectivity architecture, sourcing, and lifecycle management for Tribal entities applying to the NTIA Tribal Broadband Connectivity Program Round 3 and the Native Entities Grant Program.",
    url: PAGE_URL,
    serviceType: "Tribal broadband connectivity brokerage",
    areaServed: "US",
  });

  const governmentService = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: "NTIA Tribal Broadband Connectivity Program (TBCP) Round 3 & Native Entities Grant Program (NEGP)",
    serviceType: "Federal broadband grant program",
    description:
      "Federal grant program administered by the NTIA making approximately $790 million available for Tribal broadband infrastructure. Application window closes September 17, 2026; awards begin on a rolling basis in Spring 2027.",
    provider: {
      "@type": "GovernmentOrganization",
      name: "National Telecommunications and Information Administration (NTIA)",
    },
    audience: {
      "@type": "Audience",
      audienceType:
        "Tribal governments, Tribal colleges & universities, Tribal organizations, Alaska Native Corporations, Native Hawaiian organizations",
    },
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Tribal Enterprise", url: `${SITE_URL}/tribal` },
    { name: "NTIA TBCP Round 3", url: PAGE_URL },
  ]);

  return (
    <>
      <JsonLd
        data={[
          organizationSchema,
          service,
          governmentService,
          faqSchema(faqs),
          breadcrumbs,
        ]}
      />
      <PitchLayout
        eyebrow="NTIA TBCP Round 3 · Deadline Sept 17, 2026"
        titleLines={[
          { text: "FUNDING WINDOW", tone: "white" },
          { text: "CLOSES SEPT 17.", tone: "white" },
          { text: "KEEP GRANT HELP", tone: "dim" },
          { text: "AND BROKERAGE CLEAR.", tone: "rust" },
        ]}
        subhead="TBCP Round 3 ($540M) and the Native Entities Grant Program ($250M) close September 17, 2026. Use the Funding Navigator for NOFO help. Use Konative for vendor-neutral enterprise carrier procurement — starting with a One-Site Carrier + Renewal Snapshot — with AVANT sub-agent economics disclosed."
        primaryCta={{ label: "Request a One-Site Snapshot →", href: "/contact#request" }}
        secondaryCta={{ label: "Funding Navigator →", href: "/tribal/funding-navigator" }}
        ctaHeadlineTop="TWO LANES."
        ctaHeadlineBottom="ONE DEADLINE."
        ctaSub="Grant strategy stays on the Funding Navigator. Commercial carrier questions for operating sites start with a cited One-Site Snapshot — no meeting required."
      >
        {/* Lane separation */}
        <PitchSection eyebrow="The Split" heading="Grant help vs commercial brokerage">
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              lineHeight: 1.75,
              color: "#6B7280",
              maxWidth: 760,
              marginBottom: 40,
            }}
          >
            The current TBCP Round 3 NOFO permits infrastructure, backhaul/middle/last mile,
            leases/IRUs, engineering, network design, consulting, and related costs — always
            confirm eligible uses with your NTIA program officer.{" "}
            <strong style={{ color: "#111111" }}>Do not treat prior marketing claims that TBCP
            &quot;does not fund the connectivity layer&quot; as accurate.</strong>{" "}
            Konative&apos;s job here is{" "}
            <strong style={{ color: "#111111" }}>vendor-neutral commercial procurement</strong>{" "}
            for casinos, clinics, utilities, public safety, and multi-site ops. See the{" "}
            <Link href="/tribal" style={{ color: "#C8001F", textDecoration: "underline" }}>
              Tribal Enterprise Connectivity
            </Link>{" "}
            page for the commercial lane and the{" "}
            <Link href="/tribal/funding-navigator" style={{ color: "#C8001F", textDecoration: "underline" }}>
              Funding Navigator
            </Link>{" "}
            for the grant lane.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderTop: "3px solid #6B7280",
                padding: "30px 28px",
              }}
            >
              <div
                style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  color: "#6B7280",
                  marginBottom: 12,
                }}
              >
                GRANT LANE
              </div>
              <h3
                style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 700,
                  fontSize: 22,
                  textTransform: "uppercase",
                  color: "#111111",
                  lineHeight: 1.05,
                  marginBottom: 12,
                }}
              >
                Funding Navigator
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: "#6B7280", margin: 0 }}>
                NOFO guidance, eligibility, eligible uses (including infrastructure, design, and related costs
                where permitted), and checklist help through Sept 17 — confirm with your NTIA officer.
              </p>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderTop: "3px solid #C8001F",
                padding: "30px 28px",
              }}
            >
              <div
                style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  color: "#C8001F",
                  marginBottom: 12,
                }}
              >
                KONATIVE LANE
              </div>
              <h3
                style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 700,
                  fontSize: 22,
                  textTransform: "uppercase",
                  color: "#111111",
                  lineHeight: 1.05,
                  marginBottom: 12,
                }}
              >
                One-Site Snapshot
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: "#6B7280", margin: 0 }}>
                Commercial carrier procurement for operating sites — DIA, SD-WAN, voice, security, renewals —
                with cited public options and AVANT sub-agent economics disclosed. You own the contracts.
              </p>
            </div>
          </div>
        </PitchSection>

        {/* Program facts */}
        <PitchSection eyebrow="The Opportunity" heading="Round 3, by the numbers" background="#0C2046">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            {facts.map((f, i) => (
              <div key={i} style={{ background: "#0C2046", padding: "32px 28px" }}>
                <div
                  style={{
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: 40,
                    color: "#C8001F",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {f.value}
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, color: "#fff", marginBottom: 8 }}>
                  {f.label}
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  {f.note}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.3)", marginTop: 20 }}>
            Source: NTIA Tribal Broadband Connectivity Program (TBCP) Round 3 &amp; Native Entities Grant Program (NEGP).
            Figures are directional and updated as program guidance evolves.
          </p>
        </PitchSection>

        {/* What Konative brings */}
        <PitchSection eyebrow="Why Konative" heading="What we bring to a Round 3 applicant">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {brings.map((b, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderTop: "3px solid #C8001F",
                  padding: "30px 28px",
                }}
              >
                <div
                  style={{
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    color: "#C8001F",
                    marginBottom: 12,
                  }}
                >
                  {b.num}
                </div>
                <h3
                  style={{
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: 22,
                    textTransform: "uppercase",
                    color: "#111111",
                    lineHeight: 1.05,
                    marginBottom: 10,
                  }}
                >
                  {b.title}
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.7, color: "#6B7280", margin: 0 }}>
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* TBCP Round 1–2 intelligence — real data from Supabase */}
        <TbcpIntelligence summary={tbcpSummary} background="#fff" />

        {/* Timeline */}
        <PitchSection eyebrow="The Motion" heading="Pre-award → Award → Operations" background="#F9FAFB">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 0,
            }}
          >
            {timeline.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderTop: "3px solid #C8001F",
                  borderRight: i < timeline.length - 1 ? "1px solid #E5E7EB" : "none",
                  borderBottom: "1px solid #E5E7EB",
                  borderLeft: "1px solid #E5E7EB",
                  padding: "30px 28px",
                }}
              >
                <div
                  style={{
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    color: "#C8001F",
                    marginBottom: 10,
                  }}
                >
                  {`PHASE ${String(i + 1).padStart(2, "0")}`}
                </div>
                <h3
                  style={{
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: 26,
                    textTransform: "uppercase",
                    color: "#111111",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {t.phase}
                </h3>
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: "#374151",
                    marginBottom: 14,
                  }}
                >
                  {t.window}
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: "#6B7280", margin: 0 }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* Eligibility */}
        <PitchSection eyebrow="Eligibility" heading="Who can apply">
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
              lineHeight: 1.75,
              color: "#6B7280",
              maxWidth: 720,
              marginBottom: 32,
            }}
          >
            TBCP Round 3 and the NEGP are directed to Native entities. If you fall into one of the categories below,
            you are eligible to apply before the September 17, 2026 deadline.
          </p>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 1,
              background: "#E5E7EB",
              border: "1px solid #E5E7EB",
            }}
          >
            {eligibility.map((e, i) => (
              <li
                key={i}
                style={{
                  background: "#F9FAFB",
                  padding: "22px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span aria-hidden="true" style={{ display: "block", width: 8, height: 8, background: "#C8001F", flexShrink: 0 }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15, color: "#111111" }}>{e}</span>
              </li>
            ))}
          </ul>
        </PitchSection>

        {/* FAQ */}
        <PitchSection eyebrow="Questions" heading="What a broadband director asks" background="#F9FAFB">
          <div style={{ display: "grid", gap: 16, maxWidth: 860 }}>
            {faqs.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderLeft: "3px solid #C8001F",
                  padding: "26px 28px",
                }}
              >
                <h3
                  style={{
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: 21,
                    textTransform: "uppercase",
                    color: "#111111",
                    lineHeight: 1.1,
                    marginBottom: 10,
                  }}
                >
                  {f.question}
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.75, color: "#6B7280", margin: 0 }}>
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </PitchSection>
      </PitchLayout>
    </>
  );
}
