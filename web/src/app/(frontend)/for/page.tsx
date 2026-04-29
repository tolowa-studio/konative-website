import type { Metadata } from "next";
import Link from "next/link";
import { listAudiencePages } from "@/lib/audiences/fetch";

const NAVY = "#08142D";
const ORANGE = "#E07B39";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT_DIM = "rgba(255,255,255,0.55)";
const DISPLAY_FONT = '"Barlow Condensed", sans-serif';
const BODY_FONT = "Inter, sans-serif";

export const metadata: Metadata = {
  title: "Konative for… | Find your fit",
  description:
    "Konative serves tribal nations, investors, landowners, utilities, developers, operators, and advisors. Pick the page written for you.",
};

export const revalidate = 300;

export default async function AudienceHubPage() {
  const audiences = await listAudiencePages();
  return (
    <div style={{ background: NAVY, minHeight: "100vh", color: "#fff", fontFamily: BODY_FONT }}>
      <section style={{ padding: "96px 48px 48px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: ORANGE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            Konative is for…
          </div>
          <h1 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 16px" }}>
            Find the page written for you.
          </h1>
          <p style={{ fontFamily: BODY_FONT, fontSize: 17, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 720, margin: 0 }}>
            Konative serves multiple audiences across the data center development stack. Pick the one closest to your role and we&apos;ll lead with what matters most to you.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 48px 96px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {audiences.map(a => (
            <Link
              key={a.slug}
              href={`/for/${a.slug}`}
              style={{
                display: "block",
                border: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.02)",
                padding: "28px 28px",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 28, textTransform: "uppercase", lineHeight: 1, marginBottom: 12 }}>
                {a.displayName}
              </div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: "0 0 18px" }}>
                {a.tileDescription}
              </p>
              <span style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: ORANGE }}>
                Read the {a.displayName.toLowerCase()} page →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
