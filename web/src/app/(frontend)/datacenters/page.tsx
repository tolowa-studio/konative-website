import type { Metadata } from "next";
import Link from "next/link";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Datacenter Connectivity | Konative",
  description:
    "Connectivity advisory for greenfield datacenter developers, hyperscalers, and AI compute operators. Dark fiber, DIA, colocation uplinks, and signal intelligence via Avant's supplier network.",
  openGraph: {
    title: "Datacenter Connectivity Intelligence | Konative",
    description:
      "The connectivity intelligence brokerage for greenfield datacenters: early signal monitoring, fiber route analysis, and carrier-neutral procurement.",
  },
};

const timingLaw = [
  { phase: "Site Selection", timeline: "36-48 months pre-commissioning", note: "Fiber route feasibility, carrier coordination, conduit pathways, and redundancy constraints." },
  { phase: "Design & Engineering", timeline: "24-36 months", note: "Dark fiber permitting, IRU negotiations, carrier contracts, and diverse path planning." },
  { phase: "Construction", timeline: "18-30 months", note: "Physical build, testing, carrier provisioning, escalation, and installation management." },
  { phase: "Commissioning", timeline: "0-6 months", note: "Most advisors engage here. The best route and contract decisions are already locked." },
];

const signals = [
  { title: "FERC Queue Signals", body: "Large-load additions and transmission upgrades that imply AI compute or datacenter demand before public launch." },
  { title: "PUC Large-Load Filings", body: "Utility applications in active markets such as Texas, Virginia, Georgia, Arizona, Nevada, and Oregon." },
  { title: "County Permits", body: "Critical facility permits, substation work, and electrical packages that surface before press announcements." },
  { title: "Hiring Signals", body: "Network architect, critical facilities, and infrastructure roles that reveal early regional build activity." },
  { title: "Trade Press", body: "Daily monitoring of datacenter, fiber, utility, and capital markets coverage for route and supplier implications." },
  { title: "Sovereign Energy", body: "Tribal and First Nations energy filings where land, power, and sovereignty change development timelines." },
];

const suppliers = [
  "Zayo",
  "Lumen",
  "Arelion",
  "Uniti",
  "FiberLight",
  "Crown Castle",
  "Cogent",
  "Equinix",
  "200+ more via Avant",
];

export default function DatacentersPage() {
  return (
    <PitchLayout
      eyebrow="Datacenter Connectivity"
      titleLines={[
        { text: "THE RIGHT FIBER", tone: "white" },
        { text: "BEFORE THE", tone: "rust" },
        { text: "CONCRETE POURS.", tone: "white" },
      ]}
      subhead="Connectivity for greenfield datacenters is designed long before commissioning. Konative tracks early demand signals, maps carrier options, and brokers the transport, dark fiber, DIA, colocation uplinks, and cloud routes that make a campus bankable."
      primaryCta={{ label: "Get Site Analysis", href: "/contact" }}
      secondaryCta={{ label: "View Intelligence Hub", href: "/intelligence" }}
      heroImage={{
        src: "https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?auto=format&fit=crop&w=2000&q=70",
        alt: "Rows of illuminated server racks inside a modern data center hall",
        credit: { name: "Kevin Ache", url: "https://unsplash.com/@kevinache" },
      }}
      ctaHeadlineTop="TELL US YOUR SITE."
      ctaHeadlineBottom="WE'LL MAP THE NETWORK."
      ctaSub="Share the location, load profile, target carriers, and timeline. We will turn the market into options you can actually act on."
    >
      <PitchSection eyebrow="Timing Law" heading="The network window closes early">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {timingLaw.map((phase, i) => (
            <div key={phase.phase} style={{ background: "#fff", border: "1px solid #E5E7EB", borderTop: i === 3 ? "3px solid #111111" : "3px solid #C8001F", padding: "28px 24px" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: i === 3 ? "#111111" : "#C8001F", margin: "0 0 10px" }}>
                {phase.phase}
              </p>
              <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 26, lineHeight: 1, textTransform: "uppercase", margin: "0 0 14px", color: "#111111" }}>
                {phase.timeline}
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.65, fontSize: 13, margin: 0 }}>
                {phase.note}
              </p>
            </div>
          ))}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Early Signals" heading="We see demand before the RFP" background="#F9FAFB">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {signals.map((signal, i) => (
            <article key={signal.title} style={{ background: "#fff", border: "1px solid #E5E7EB", padding: "28px 24px" }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 24, fontWeight: 800, color: "#C8001F", lineHeight: 1, marginBottom: 16 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 25, textTransform: "uppercase", color: "#111111", margin: "0 0 10px", lineHeight: 1 }}>
                {signal.title}
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {signal.body}
              </p>
            </article>
          ))}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Supplier Depth" heading="Every carrier. One advisor.">
        <p style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.75, fontSize: 16, maxWidth: 720, margin: "0 0 32px" }}>
          As an Avant Trusted Advisor, Konative can source across a broad supplier ecosystem while staying vendor-neutral. The buyer gets one accountable point of contact, market pricing, and a managed path from analysis to installation.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {suppliers.map((supplier, i) => (
            <span key={supplier} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, border: "1px solid #E5E7EB", borderLeft: `3px solid ${i === suppliers.length - 1 ? "#111111" : "#C8001F"}`, padding: "0 18px", background: i === suppliers.length - 1 ? "#111111" : "#fff", color: i === suppliers.length - 1 ? "#fff" : "#374151", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13 }}>
              {supplier}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <Link href="/map" style={{ color: "#C8001F", fontFamily: "Inter, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, textDecoration: "none", borderBottom: "1px solid #C8001F", paddingBottom: 4 }}>
            Explore coverage map
          </Link>
        </div>
      </PitchSection>
    </PitchLayout>
  );
}
