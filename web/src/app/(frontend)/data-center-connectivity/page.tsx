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

export default function DataCenterConnectivityPage() {
  return (
    <PitchLayout
      eyebrow="Data Center Connectivity · Where We Lean In"
      titleLines={[
        { text: "THE NETWORK", tone: "white" },
        { text: "BEHIND THE", tone: "dim" },
        { text: "AI BUILDOUT.", tone: "rust" },
      ]}
      subhead="Developers build the campus and the strategy — but someone has to source the network. Konative is the connectivity layer for data-center developers and operators: we broker the transport, dark fiber, wavelengths, cross-connects, and cloud on-ramps into the facility, and we use our proprietary data-center map to get ahead of where demand is landing."
      secondaryCta={{ label: "See the Data Center Map →", href: "/map" }}
      ctaHeadlineTop="BUILDING A CAMPUS?"
      ctaHeadlineBottom="WE'LL SOURCE THE NETWORK."
      ctaSub="Bring us the site. We'll design carrier-diverse connectivity, run the market, and manage the install."
    >
      <PitchSection eyebrow="What We Source" heading="Connectivity into the facility">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          {value.map((v, i) => (
            <div key={i} style={{ background: "#08142D", padding: "32px 28px" }}>
              <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 24, textTransform: "uppercase", color: "#fff", lineHeight: 1.05, marginBottom: 12 }}>{v.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{v.body}</p>
            </div>
          ))}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Our Edge" heading="Data is our unfair advantage" background="#0C2046">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", maxWidth: 720, marginBottom: 28 }}>
          Konative already maps data-center projects, capacity, status, and geography across the United States and
          Canada — including First Nations projects. That dataset is a live picture of where connectivity demand is
          forming, often before the network is even ordered. We use it to advise developers, target the right
          suppliers, and move first.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="/map" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E07B39", textDecoration: "none", borderBottom: "1px solid #E07B39", paddingBottom: 3 }}>Explore the map →</a>
          <a href="/intelligence" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 3 }}>Market intelligence →</a>
        </div>
      </PitchSection>
    </PitchLayout>
  );
}
