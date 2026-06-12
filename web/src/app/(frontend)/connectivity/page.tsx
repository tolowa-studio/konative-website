import type { Metadata } from "next";
import type { CSSProperties } from "react";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";
import { HOME_CONNECTIVITY_DEFAULT } from "@/content/homeConnectivity";

export const metadata: Metadata = {
  title: "What We Broker — Connectivity Portfolio",
  description:
    "Internet, fiber, dark fiber, wavelengths, SD-WAN, UCaaS/CCaaS, cloud on-ramps, data-center interconnection, and cybersecurity — sourced vendor-neutral through Avant's 100+ supplier portfolio, at no cost to you.",
  alternates: { canonical: "/connectivity" },
};

const c = HOME_CONNECTIVITY_DEFAULT;
const cardStyle: CSSProperties = { background: "#fff", padding: "30px 28px", border: "1px solid #E5E7EB", borderTop: "3px solid #C8001F" };
const numberStyle: CSSProperties = { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", color: "#C8001F", marginBottom: 12 };
const headingStyle: CSSProperties = { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 22, textTransform: "uppercase", color: "#111111", lineHeight: 1.05, marginBottom: 10 };
const bodyStyle: CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.7, color: "#6B7280" };

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {c.portfolioItems.map((item, i) => (
            <div key={i} style={cardStyle}>
              <div style={numberStyle}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 style={headingStyle}>
                {item.name}
              </h3>
              <p style={bodyStyle}>
                {item.blurb}
              </p>
            </div>
          ))}
        </div>
      </PitchSection>

      <PitchSection eyebrow="Why a Broker" heading="We work for you. Not the carrier." background="#F9FAFB">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {c.capabilities.map((cap, i) => (
            <div key={i} style={cardStyle}>
              <div style={numberStyle}>
                {cap.num}
              </div>
              <h3 style={headingStyle}>
                {cap.title}
              </h3>
              <p style={bodyStyle}>
                {cap.body}
              </p>
            </div>
          ))}
        </div>
      </PitchSection>
    </PitchLayout>
  );
}
