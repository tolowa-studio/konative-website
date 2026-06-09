import type { Metadata } from "next";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";

export const metadata: Metadata = {
  title: "Tribal Enterprise Connectivity",
  description:
    "Sovereignty-aware, vendor-neutral connectivity for Tribal gaming, government, healthcare, and education. We source internet, SD-WAN, voice, transport, and security across the whole market — at no cost to your enterprise.",
  alternates: { canonical: "/tribal" },
};

const facts: { label: string; value: string; note: string }[] = [
  { value: "~$3B", label: "NTIA Tribal Broadband Connectivity Program", note: "$1B (CAA 2021) + $2B (Infrastructure Investment & Jobs Act) for Tribal connectivity." },
  { value: "Tribal-only", label: "Eligibility", note: "Tribal governments, TCUs, Tribal organizations, Alaska Native Corporations, DHHL — a sovereignty-aligned program." },
  { value: "Spring 2026", label: "Next combined NOFO (planned)", note: "~$500M+ in remaining Tribal broadband funding expected in a combined opportunity." },
];

const why: { title: string; body: string }[] = [
  { title: "Sovereignty-aware", body: "We understand Tribal jurisdiction, governance, and the difference between infrastructure grants and the operational connectivity that runs on top of them. We work with your enterprise, not around it." },
  { title: "Vendor-neutral", body: "Carriers historically skip low-density Tribal lands. We bring the whole market — including fixed wireless and satellite where fiber doesn't reach — and recommend what's right, not what pays us most." },
  { title: "Enterprise-grade", body: "Gaming floors, clinics, government offices, and schools need carrier-grade redundancy, security, and voice. We design and source it, then manage it for the life of the account." },
  { title: "No cost to you", body: "Suppliers pay our commission. Your enterprise gets an expert advisor and a single point of contact for every carrier — at no charge." },
];

export default function TribalPage() {
  return (
    <PitchLayout
      eyebrow="Tribal Enterprise · Where We Lean In"
      titleLines={[
        { text: "TRIBAL", tone: "white" },
        { text: "CONNECTIVITY,", tone: "rust" },
        { text: "BROKERED RIGHT.", tone: "white" },
      ]}
      subhead="Casinos, government, healthcare, and education on Tribal lands need carrier-grade connectivity, redundancy, and security — but rarely have a neutral advisor who understands sovereignty and the federal-funding landscape. Konative is that advisor: vendor-neutral, sovereignty-aware, and built for this market."
      secondaryCta={{ label: "What We Broker →", href: "/connectivity" }}
      ctaHeadlineTop="LET'S BUILD"
      ctaHeadlineBottom="SOVEREIGN CONNECTIVITY."
      ctaSub="Tell us about your enterprise — gaming, government, health, or education — and we'll design and source the network around it."
    >
      <PitchSection eyebrow="The Opportunity" heading="A historic moment for Tribal connectivity">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", maxWidth: 720, marginBottom: 44 }}>
          Federal money is flowing to Tribal <em>infrastructure</em>. The resulting Tribal <em>enterprises</em> still
          need someone to broker the ongoing connectivity, transport, SD-WAN, voice, and security that run on top of
          it. That recurring layer is where Konative serves.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          {facts.map((f, i) => (
            <div key={i} style={{ background: "#08142D", padding: "32px 28px" }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 44, color: "#E07B39", lineHeight: 1, marginBottom: 10 }}>{f.value}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, color: "#fff", marginBottom: 8 }}>{f.label}</div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.4)" }}>{f.note}</p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.3)", marginTop: 20 }}>
          Sources: NTIA Tribal Broadband Connectivity Program; figures are directional and updated as programs evolve.
        </p>
      </PitchSection>

      <PitchSection eyebrow="Why Konative" heading="Built for this market" background="#0C2046">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          {why.map((w, i) => (
            <div key={i} style={{ background: "#0C2046", padding: "32px 28px" }}>
              <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 24, textTransform: "uppercase", color: "#fff", lineHeight: 1.05, marginBottom: 12 }}>{w.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{w.body}</p>
            </div>
          ))}
        </div>
      </PitchSection>
    </PitchLayout>
  );
}
