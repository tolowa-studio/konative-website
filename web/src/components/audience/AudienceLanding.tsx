import Link from "next/link";
import type { AudiencePage, AudienceSlug } from "@/content/audiences/types";
import { AudienceCTAForm } from "./AudienceCTAForm";
import { getAudienceIdentity } from "./audienceIdentity";

const NAVY = "#08142D";
const ORANGE = "#E07B39";
const TEXT_DIM = "rgba(255,255,255,0.55)";
const TEXT_FAINT = "rgba(255,255,255,0.35)";
const BORDER = "rgba(255,255,255,0.07)";
const DISPLAY_FONT = '"Barlow Condensed", sans-serif';
const BODY_FONT = "Inter, sans-serif";

export type AdjacentTitleMap = Partial<Record<AudienceSlug, string>>;

export function AudienceLanding({
  audience,
  adjacentTitles,
}: {
  audience: AudiencePage;
  /** Map of slug -> displayName for adjacent-audience pointers known to exist. Pointers not in this map are skipped. */
  adjacentTitles: AdjacentTitleMap;
}) {
  const identity = getAudienceIdentity(audience.slug);

  return (
    <div style={{ background: NAVY, minHeight: "100vh", fontFamily: BODY_FONT, color: "#fff" }}>
      {/* Hero */}
      <section style={{ paddingTop: 96, paddingBottom: 64, paddingLeft: 48, paddingRight: 48, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* Identity marker + back link */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: 40, lineHeight: 1, color: identity.color, opacity: 0.4, userSelect: "none" }}>
              {identity.mark}
            </span>
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
            <Link
              href="/for"
              style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: TEXT_FAINT, textDecoration: "none" }}
            >
              ← All profiles
            </Link>
          </div>

          <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: identity.color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            {audience.hero.eyebrow}
          </div>
          <h1 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 24px" }}>
            {audience.hero.headline}
          </h1>
          <p style={{ fontFamily: BODY_FONT, fontSize: 17, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 760, margin: "0 0 28px" }}>
            {audience.hero.subhead}
          </p>

          {/* "You're in the right place if…" qualifier */}
          {identity.qualifier && (
            <div style={{ borderLeft: `3px solid ${identity.color}`, paddingLeft: 20, marginBottom: 32, maxWidth: 680 }}>
              <div style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: identity.color, marginBottom: 6 }}>
                You&apos;re in the right place if…
              </div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.6, color: TEXT_DIM, margin: 0 }}>
                {identity.qualifier}
              </p>
            </div>
          )}

          <CTAButton cta={audience.hero.primaryCta} color={identity.color} />
        </div>
      </section>

      <SectionBlock title={audience.whyNow.title} intro={audience.whyNow.intro} accentColor={identity.color}>
        <BulletList bullets={audience.whyNow.bullets} accentColor={identity.color} />
      </SectionBlock>

      <SectionBlock title={audience.whatYouAlreadyHave.title} intro={audience.whatYouAlreadyHave.intro} accentColor={identity.color}>
        <BulletList bullets={audience.whatYouAlreadyHave.bullets} accentColor={identity.color} />
      </SectionBlock>

      <SectionBlock title={audience.whatKonativeDoes.title} accentColor={identity.color}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {audience.whatKonativeDoes.bands.map(band => (
            <div key={band.title} style={{ border: `1px solid ${BORDER}`, borderTop: `2px solid ${identity.color}`, padding: "20px 22px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 18, textTransform: "uppercase", marginBottom: 10 }}>{band.title}</div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: 0 }}>{band.body}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title={audience.firstEngagement.title} intro={audience.firstEngagement.intro} accentColor={identity.color}>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {audience.firstEngagement.steps.map((step, i) => (
            <li key={step.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, alignItems: "start" }}>
              <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 28, color: identity.color, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#fff", marginBottom: 6 }}>{step.label}</div>
                <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: 0 }}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: TEXT_FAINT, marginTop: 24, marginBottom: 0, letterSpacing: "0.05em" }}>
          {audience.firstEngagement.pricingPosture}
        </p>
      </SectionBlock>

      <SectionBlock title={audience.trust.title} accentColor={identity.color}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {audience.trust.items.map(item => (
            <div key={item.label}>
              <div style={{ fontFamily: BODY_FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: identity.color, marginBottom: 8 }}>{item.label}</div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, lineHeight: 1.55, color: TEXT_DIM, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title={audience.adjacentAudiences.title} accentColor={identity.color}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {audience.adjacentAudiences.pointers.map(slug => {
            const title = adjacentTitles[slug];
            if (!title) return null;
            return (
              <Link
                key={slug}
                href={`/for/${slug}`}
                style={{ fontFamily: BODY_FONT, fontSize: 13, fontWeight: 500, color: "#fff", border: `1px solid ${ORANGE}`, padding: "10px 16px", textDecoration: "none", letterSpacing: "0.02em" }}
              >
                {title} →
              </Link>
            );
          })}
        </div>
      </SectionBlock>

      <section id="cta" style={{ borderTop: `1px solid ${BORDER}`, padding: "64px 48px 96px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ width: 40, height: 3, background: identity.color, marginBottom: 24 }} />
          <h2 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 0.95, textTransform: "uppercase", margin: "0 0 16px" }}>
            {audience.finalCta.headline}
          </h2>
          <p style={{ fontFamily: BODY_FONT, fontSize: 16, lineHeight: 1.6, color: TEXT_DIM, margin: "0 0 32px" }}>
            {audience.finalCta.subhead}
          </p>
          <AudienceCTAForm audienceSlug={audience.slug} submitLabel={audience.finalCta.primaryCta.label} />
        </div>
      </section>
    </div>
  );
}

function CTAButton({ cta, color }: { cta: { label: string; href: string }; color: string }) {
  return (
    <a
      href={cta.href}
      style={{
        display: "inline-block",
        padding: "14px 24px",
        background: color,
        color: "#fff",
        fontFamily: BODY_FONT,
        fontWeight: 600,
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        textDecoration: "none",
      }}
    >
      {cta.label} →
    </a>
  );
}

function SectionBlock({ title, intro, accentColor, children }: { title: string; intro?: string; accentColor: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "64px 48px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1, textTransform: "uppercase", margin: "0 0 16px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 16 }}>
          {title}
        </h2>
        {intro && (
          <p style={{ fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.6, color: TEXT_DIM, maxWidth: 760, margin: "0 0 32px" }}>{intro}</p>
        )}
        {children}
      </div>
    </section>
  );
}

function BulletList({ bullets, accentColor }: { bullets: string[]; accentColor: string }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {bullets.map((b, i) => (
        <li key={i} style={{ display: "grid", gridTemplateColumns: "12px 1fr", gap: 12, alignItems: "start" }}>
          <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, background: accentColor, marginTop: 8 }} />
          <span style={{ fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.55, color: TEXT_DIM }}>{b}</span>
        </li>
      ))}
    </ul>
  );
}
