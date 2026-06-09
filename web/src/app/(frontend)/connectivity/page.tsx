import type { Metadata } from "next";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";
import { HOME_CONNECTIVITY_DEFAULT } from "@/content/homeConnectivity";

export const metadata: Metadata = {
  title: "What We Broker — Connectivity Portfolio",
  description:
    "Internet, fiber, dark fiber, wavelengths, SD-WAN, UCaaS/CCaaS, cloud on-ramps, data-center interconnection, and cybersecurity — sourced vendor-neutral through Avant's 100+ supplier portfolio, at no cost to you.",
  alternates: { canonical: "/connectivity" },
};

const c = HOME_CONNECTIVITY_DEFAULT;

export default function ConnectivityPage() {
  return (
    <PitchLayout
      eyebrow="What We Broker · Avant Partner"
      titleLines={[
        { text: "ONE BROKER.", tone: "white" },
        { text: "EVERY NETWORK.", tone: "rust" },
      ]}
      subhead="We're carrier-neutral. Through Avant's supplier portfolio we source, design, and manage the full connectivity stack — then stay in the account for its life. You get the whole market and one point of contact, not ten carrier reps. And because suppliers pay us, it costs you nothing."
      secondaryCta={{ label: "Why a Broker →", href: "/#capabilities" }}
      ctaHeadlineTop="ONE REQUIREMENT."
      ctaHeadlineBottom="THE WHOLE MARKET."
      ctaSub="Tell us what you need across any site — we'll quote it across the portfolio and recommend the best fit."
    >
      <PitchSection eyebrow="The Portfolio" heading="What we source & manage">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          {c.portfolioItems.map((item, i) => (
            <div key={i} style={{ background: "#08142D", padding: "30px 28px" }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", color: "rgba(224,123,57,0.7)", marginBottom: 12 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 22, textTransform: "uppercase", color: "#fff", lineHeight: 1.05, marginBottom: 10 }}>
                {item.name}
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>
                {item.blurb}
              </p>
            </div>
          ))}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Why a Broker" heading="We work for you. Not the carrier." background="#0C2046">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          {c.capabilities.map((cap, i) => (
            <div key={i} style={{ background: "#0C2046", padding: "30px 28px" }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "#E07B39", marginBottom: 14 }}>
                {cap.num}
              </div>
              <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 22, textTransform: "uppercase", color: "#fff", lineHeight: 1.05, marginBottom: 10 }}>
                {cap.title}
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>
                {cap.body}
              </p>
            </div>
          ))}
        </div>
      </PitchSection>
    </PitchLayout>
  );
}
