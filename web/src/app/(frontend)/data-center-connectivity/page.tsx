import type { Metadata } from "next";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";

export const metadata: Metadata = {
  title: "Data Center Connectivity & Interconnection",
  description:
    "The connectivity layer for the AI buildout. We broker transport, dark fiber, wavelengths, cross-connects, and cloud on-ramps into data centers — and use our proprietary US & Canada data-center map to get ahead of demand.",
  alternates: { canonical: "/data-center-connectivity" },
};

const value: { title: string; body: string }[] = [
  { title: "Transport & dark fiber", body: "Long-haul and metro routes, IRUs, and 10G/100G/400G wavelengths between campuses, carrier hotels, and clouds." },
  { title: "Cross-connects & DCI", body: "Data-center interconnection and cross-connects that stitch facilities, cages, and providers together." },
  { title: "Cloud on-ramps", body: "Private, low-latency Direct Connect / ExpressRoute / Interconnect into AWS, Azure, Google Cloud, and Oracle." },
  { title: "Diverse & redundant", body: "Carrier-diverse, path-diverse design so a single cut never takes the facility — sourced across the whole market." },
];
const cardStyle = { background: "#fff", padding: "32px 28px", border: "1px solid #E5E7EB", borderTop: "3px solid #C8001F" };
const h3Style = { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 24, textTransform: "uppercase" as const, color: "#111111", lineHeight: 1.05, marginBottom: 12 };
const pStyle = { fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: "#6B7280" };

export default function DataCenterConnectivityPage() {
  return (
    <PitchLayout
      eyebrow="Data Center Connectivity · Where We Lean In"
      titleLines={[
        { text: "THE NETWORK", tone: "white" },
        { text: "BEHIND THE", tone: "dim" },
        { text: "AI BUILDOUT.", tone: "rust" },
      ]}
      subhead="Before a site can operate, it needs a credible network plan. Konative checks the location, structures capacity and diversity requirements, runs the supplier market, compares commercial terms, and manages transport, dark fiber, wavelengths, internet, cross-connects, and cloud access through installation."
      secondaryCta={{ label: "See the Data Center Map →", href: "/map" }}
      ctaHeadlineTop="BUILDING A CAMPUS?"
      ctaHeadlineBottom="WE'LL SOURCE THE NETWORK."
      ctaSub="Bring us the address, capacity plan, diversity requirement, and ready-for-service date. We'll turn them into a sourcing plan."
    >
      <PitchSection eyebrow="What We Source" heading="Connectivity into the facility">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {value.map((v, i) => (
            <div key={i} style={cardStyle}>
              <h3 style={h3Style}>{v.title}</h3>
              <p style={pStyle}>{v.body}</p>
            </div>
          ))}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Site Feasibility" heading="What we need to answer">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            ["Address + stage", "Site coordinates, development status, facility type, and required ready-for-service date."],
            ["Capacity profile", "Initial and ultimate DIA, transit, transport, wavelength, dark-fiber, DCI, and cloud requirements."],
            ["Physical resilience", "Carrier diversity, route diversity, building entrances, meet-me rooms, and failover assumptions."],
            ["Commercial path", "Serviceability, construction exposure, contract structure, install milestones, and supplier comparison."],
          ].map(([title, body]) => <div key={title} style={cardStyle}><h3 style={h3Style}>{title}</h3><p style={pStyle}>{body}</p></div>)}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Our Edge" heading="Data is our unfair advantage" background="#F9FAFB">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.75, color: "#6B7280", maxWidth: 720, marginBottom: 28 }}>
          Konative maps data-center demand, interconnection facilities, power and development signals across the
          United States and Canada. Public map proximity is not a serviceability guarantee; it tells us where to
          investigate. We combine that evidence with supplier checks and quoting to answer a specific site.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="/map" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C8001F", textDecoration: "none", borderBottom: "1px solid #C8001F", paddingBottom: 3 }}>Explore the map →</a>
          <a href="/intelligence" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#374151", textDecoration: "none", borderBottom: "1px solid #D1D5DB", paddingBottom: 3 }}>Market intelligence →</a>
        </div>
      </PitchSection>
    </PitchLayout>
  );
}
