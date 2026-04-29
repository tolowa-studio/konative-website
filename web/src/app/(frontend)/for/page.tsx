import type { Metadata } from "next";
import Link from "next/link";
import { listAudiencePages } from "@/lib/audiences/fetch";
import { getAudienceIdentity } from "@/components/audience/audienceIdentity";

const NAVY = "#08142D";
const ORANGE = "#E07B39";
const BORDER = "rgba(255,255,255,0.07)";
const BORDER_MED = "rgba(255,255,255,0.12)";
const TEXT_DIM = "rgba(255,255,255,0.55)";
const TEXT_FAINT = "rgba(255,255,255,0.35)";
const DISPLAY_FONT = '"Barlow Condensed", sans-serif';
const BODY_FONT = "Inter, sans-serif";

export const metadata: Metadata = {
  title: "Konative for… | Pick your profile",
  description:
    "Konative serves tribal nations, investors, landowners, utilities, developers, operators, and advisors. Pick the page written for your role.",
};

export const revalidate = 300;

const HOW_STEPS = [
  { n: "1", label: "Pick your profile", body: "Choose the role below that best describes you." },
  { n: "2", label: "Read your page", body: "Each page explains Konative through your lens — what you have, what we do, and how to start." },
  { n: "3", label: "Request a conversation", body: "Every page ends with a direct line to the Konative team. No forms that vanish into a CRM." },
];

export default async function AudienceHubPage() {
  const audiences = await listAudiencePages();

  return (
    <div style={{ background: NAVY, minHeight: "100vh", color: "#fff", fontFamily: BODY_FONT }}>

      {/* Hero — instructional */}
      <section style={{ padding: "96px 48px 0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: ORANGE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            Konative is built for…
          </div>
          <h1 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 20px" }}>
            Which role describes you?
          </h1>
          <p style={{ fontFamily: BODY_FONT, fontSize: 17, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 680, margin: "0 0 48px" }}>
            Pick the page written for your situation. We&apos;ll lead with what matters most to you — not a generic pitch.
          </p>

          {/* 3-step how-it-works strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: `1px solid ${BORDER_MED}`, borderLeft: `1px solid ${BORDER_MED}` }}>
            {HOW_STEPS.map((step) => (
              <div key={step.n} style={{ padding: "24px 28px", borderRight: `1px solid ${BORDER_MED}`, borderBottom: `1px solid ${BORDER_MED}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: 32, color: ORANGE, lineHeight: 1 }}>{step.n}</span>
                  <span style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>{step.label}</span>
                </div>
                <p style={{ fontFamily: BODY_FONT, fontSize: 13, lineHeight: 1.55, color: TEXT_FAINT, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience grid */}
      <section style={{ padding: "64px 48px 96px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: TEXT_FAINT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
            Select your profile
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {audiences.map((a) => {
              const identity = getAudienceIdentity(a.slug);
              return (
                <Link
                  key={a.slug}
                  href={`/for/${a.slug}`}
                  style={{
                    display: "block",
                    border: `1px solid ${BORDER}`,
                    background: "rgba(255,255,255,0.02)",
                    textDecoration: "none",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Audience-specific top accent bar */}
                  <div style={{ height: 3, background: identity.color }} />

                  <div style={{ padding: "20px 24px 24px" }}>
                    {/* Large watermark number */}
                    <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: 52, lineHeight: 1, color: identity.color, opacity: 0.2, marginBottom: 4, userSelect: "none" }}>
                      {identity.mark}
                    </div>
                    <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 26, textTransform: "uppercase", lineHeight: 1, marginBottom: 10 }}>
                      {a.displayName}
                    </div>
                    <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: "0 0 20px" }}>
                      {a.tileDescription}
                    </p>
                    <span style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: identity.color }}>
                      This is my page →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Not-sure callout */}
          <div style={{ marginTop: 48, padding: "20px 28px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flexShrink: 0, fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: 28, color: TEXT_FAINT, lineHeight: 1 }}>?</div>
            <div>
              <div style={{ fontFamily: BODY_FONT, fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Not sure which one fits?</div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: TEXT_FAINT, margin: 0 }}>
                Start with Tribal Nations or Investors — both give a clear picture of how Konative works.{" "}
                <Link href="/contact" style={{ color: ORANGE, textDecoration: "none" }}>Or reach out directly.</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
