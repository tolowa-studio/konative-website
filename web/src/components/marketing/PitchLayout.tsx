import Link from "next/link";
import type { ReactNode } from "react";

export type Tone = "white" | "rust" | "dim";

const toneColor = (tone: Tone): string =>
  tone === "rust" ? "#E07B39" : tone === "dim" ? "rgba(255,255,255,0.25)" : "#fff";

export interface PitchLayoutProps {
  eyebrow: string;
  titleLines: { text: string; tone: Tone }[];
  subhead: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children?: ReactNode;
  ctaHeadlineTop: string;
  ctaHeadlineBottom: string;
  ctaSub: string;
}

/** Shared server-rendered layout for connectivity wedge/landing pages. */
export default function PitchLayout({
  eyebrow,
  titleLines,
  subhead,
  primaryCta = { label: "Get a Connectivity Quote →", href: "/contact" },
  secondaryCta,
  children,
  ctaHeadlineTop,
  ctaHeadlineBottom,
  ctaSub,
}: PitchLayoutProps) {
  return (
    <div style={{ background: "#08142D" }}>
      {/* Hero */}
      <section style={{ background: "#08142D", padding: "160px 0 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            fontFamily: "Inter, sans-serif", fontWeight: 600,
            fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#E07B39", marginBottom: 28,
          }}>
            <span style={{ display: "block", width: 36, height: 1, background: "#E07B39" }} />
            {eyebrow}
          </div>
          <h1 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: "clamp(48px, 6.5vw, 92px)", lineHeight: 0.9,
            textTransform: "uppercase", letterSpacing: "0.01em", color: "#fff",
            marginBottom: 28, maxWidth: 900,
          }}>
            {titleLines.map((line, i) => (
              <span key={i} style={{ color: toneColor(line.tone), display: "block" }}>{line.text}</span>
            ))}
          </h1>
          <p style={{
            fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.7,
            color: "rgba(255,255,255,0.6)", maxWidth: 640, marginBottom: 40,
          }}>
            {subhead}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <Link href={primaryCta.href} style={{
              fontFamily: "Inter, sans-serif", fontWeight: 600,
              fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
              background: "#E07B39", color: "#fff", padding: "18px 40px", textDecoration: "none",
            }}>
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href} style={{
                fontFamily: "Inter, sans-serif", fontWeight: 500,
                fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
                background: "transparent", color: "rgba(255,255,255,0.7)",
                padding: "17px 32px", border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none",
              }}>
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      {children}

      {/* CTA band */}
      <section style={{ background: "#0C2046", padding: "90px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
          <h2 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: "clamp(40px, 5vw, 68px)", lineHeight: 0.92,
            textTransform: "uppercase", color: "#fff", marginBottom: 20,
          }}>
            {ctaHeadlineTop}<br /><span style={{ color: "#E07B39" }}>{ctaHeadlineBottom}</span>
          </h2>
          <p style={{
            fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto 36px",
          }}>
            {ctaSub}
          </p>
          <Link href="/contact" style={{
            fontFamily: "Inter, sans-serif", fontWeight: 600,
            fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
            background: "#E07B39", color: "#fff", padding: "18px 44px", textDecoration: "none",
          }}>
            Get a Connectivity Quote →
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Simple labelled content section used inside PitchLayout children. */
export function PitchSection({
  eyebrow,
  heading,
  children,
  background = "#08142D",
}: {
  eyebrow?: string;
  heading?: string;
  children: ReactNode;
  background?: string;
}) {
  return (
    <section style={{ background, padding: "90px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
        {eyebrow && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            fontFamily: "Inter, sans-serif", fontWeight: 600,
            fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#E07B39", marginBottom: 18,
          }}>
            <span style={{ display: "block", width: 28, height: 1, background: "#E07B39" }} />
            {eyebrow}
          </div>
        )}
        {heading && (
          <h2 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: "clamp(34px, 4vw, 56px)", lineHeight: 0.95,
            textTransform: "uppercase", color: "#fff", marginBottom: 40,
          }}>
            {heading}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
