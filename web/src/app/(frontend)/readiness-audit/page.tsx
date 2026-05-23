import type { Metadata } from "next";
import Link from "next/link";
import {
  JsonLd,
  SITE_URL,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/seo/JsonLd";
import AuditInquiryForm from "@/components/forms/AuditInquiryForm";

// R4 Readiness Audit landing page — productized fixed-fee diligence for
// powered-land and modular data center decisions. See STRATEGY.md R4 + B12.
//
// Pricing band: $25K–$50K (operator-set 2026-05-23). Anchor at $35K
// "typical" in copy.
//
// Delivery: Scott Swartzbaugh (T4DevCo CEO, DLA Piper background) +
// Terry Van Roekel (SiteIQ) lead, Jeramey James supports.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Powered-Land Readiness Audit — Konative",
  description:
    "Fixed-fee diligence for powered-land and modular data center decisions. $25,000–$50,000, 4–6 weeks, decision-grade pro forma + risk register + go/no-go recommendation. Delivered by Scott Swartzbaugh, Terry Van Roekel, and Jeramey James.",
  alternates: { canonical: "/readiness-audit" },
  openGraph: {
    title: "Powered-Land Readiness Audit — Konative",
    description:
      "Fixed-fee diligence for powered-land and modular data center decisions. $25K–$50K, 4–6 weeks, decision-grade output.",
    url: "/readiness-audit",
    type: "website",
  },
};

const DELIVERABLES = [
  {
    title: "Project framing brief",
    body:
      "Target capacity, capital, and timeline assumptions written down so every subsequent decision can be checked against them.",
  },
  {
    title: "Site & infrastructure diligence memo",
    body:
      "Site viability, power path options and constraints, cooling and remote-environment implications, key land and infrastructure dependencies.",
  },
  {
    title: "Supply-chain & critical-path review",
    body:
      "Long-lead items (turbines, BESS, transformers), likely sequencing pressure points, near-term commitment implications.",
  },
  {
    title: "Risk register",
    body:
      "Major delivery, regulatory, infrastructure, and timing risks. Severity, likelihood, mitigation framing — formatted for boards and capital partners.",
  },
  {
    title: "Decision-grade pro forma",
    body:
      "Assumption-based commercial model, major cost and timing drivers, scenario sensitivity. Useful in an LP conversation, not a pitch deck.",
  },
  {
    title: "Go / no-go recommendation",
    body:
      "Whether to proceed, what must be true to proceed, what must be secured next, and what would change our answer.",
  },
  {
    title: "Executive readout",
    body:
      "Stakeholder-ready summary plus a 30-minute live walkthrough with your team.",
  },
];

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What is a Konative Readiness Audit?",
    answer:
      "A four-to-six-week fixed-fee engagement that produces a decision-grade view of whether a powered-land parcel or stalled / modular data center opportunity should move forward. It covers site viability, power and interconnection path, cooling and supply-chain critical path, a risk register, a pro forma, and a go / no-go recommendation. The output is the artifact you take into the next funding, partner, or commitment conversation.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Engagements run between $25,000 and $50,000 fixed-fee, with $35,000 the typical anchor for a single-site, single-decision scope. Multi-site comparisons or assemblage-level work are priced separately.",
  },
  {
    question: "How long does it take?",
    answer:
      "Four to six weeks from signed engagement letter to executive readout. We do not extend the timeline to bill more; if scope changes mid-engagement we re-quote.",
  },
  {
    question: "Who actually does the work?",
    answer:
      "Scott Swartzbaugh (CEO of T4DevCo, DLA Piper background) leads commercial and capital framing. Terry Van Roekel (SiteIQ) leads site, power, and grid analysis. Jeramey James leads the data, pro forma, and tech / AI workload assumptions. Specialist sub-contractors are pulled in as the parcel requires — never billed without disclosure.",
  },
  {
    question: "Who is this for?",
    answer:
      "Investment groups deploying capital into infrastructure with a real timing pressure; Indigenous Development Corporations and land-owning entities with a parcel and a decision to make; data center developers or sponsors with a stalled or distressed project that needs a salvage view; hyperscaler partners evaluating a build-to-suit site.",
  },
  {
    question: "When is this not the right fit?",
    answer:
      "If a project is still purely exploratory — no land, no capital, no timeline — the Readiness Audit is premature. If a buyer just needs a property valuation, an MAI appraisal is the right tool, not this. We will tell you on the intake call if Konative is not the right next step.",
  },
  {
    question: "How does it relate to brokering a transaction?",
    answer:
      "The Audit is a paid, scoped diligence engagement, not a brokerage retainer. If the conclusion is to proceed and Konative brokers the transaction, the audit fee can be credited toward the brokerage success fee on close — discussed and put in writing before engagement.",
  },
  {
    question: "What do I need to provide to start?",
    answer:
      "Target geography or specific parcel, intended use case and capacity direction, stakeholder and ownership structure, timeline urgency, known constraints (land, utility, opposition), and any financial assumptions you already have. We start a scope conversation as soon as the inquiry form is in.",
  },
];

export default function ReadinessAuditPage() {
  const canonicalUrl = `${SITE_URL}/readiness-audit`;
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Readiness Audit", url: canonicalUrl },
  ]);
  const service = serviceSchema({
    name: "Konative Powered-Land Readiness Audit",
    description:
      "Fixed-fee 4–6 week diligence engagement for powered-land and modular data center decisions. Decision-grade pro forma, risk register, and go/no-go recommendation.",
    url: canonicalUrl,
    serviceType: "Data center site diligence and brokerage advisory",
    areaServed: ["United States", "Canada"],
    offerLow: 25000,
    offerHigh: 50000,
    currency: "USD",
  });
  const faq = faqSchema(FAQS);

  return (
    <main className="audit">
      <JsonLd data={[breadcrumbs, service, faq]} />

      <section className="audit__hero">
        <div className="audit__hero-inner">
          <p className="audit__eyebrow">R4 — Konative Engagement</p>
          <h1 className="audit__title">
            A decision-grade view of your powered-land opportunity.<br />
            In six weeks. For a flat fee.
          </h1>
          <p className="audit__lede">
            The Konative Readiness Audit is a fixed-fee diligence engagement for
            powered-land owners, data center sponsors with a stalled project,
            and investors deploying capital with timing pressure. Site viability,
            power path, cooling and supply chain, a real pro forma, a risk
            register, and a go / no-go recommendation. Delivered by{" "}
            <strong>Scott Swartzbaugh</strong>, <strong>Terry Van Roekel</strong>,
            and <strong>Jeramey James</strong>.
          </p>
          <div className="audit__price-band">
            <div>
              <span className="audit__price-eyebrow">Fixed-fee</span>
              <span className="audit__price">$25,000 – $50,000</span>
              <span className="audit__price-sub">Typical engagement: $35,000</span>
            </div>
            <div>
              <span className="audit__price-eyebrow">Timeline</span>
              <span className="audit__price">4–6 weeks</span>
              <span className="audit__price-sub">Kickoff to executive readout</span>
            </div>
            <div>
              <span className="audit__price-eyebrow">Output</span>
              <span className="audit__price">7 artifacts</span>
              <span className="audit__price-sub">Plus a 30-min live walkthrough</span>
            </div>
          </div>
          <a href="#request" className="audit__cta-primary">
            Request an Audit →
          </a>
        </div>
      </section>

      <section className="audit__section">
        <div className="audit__container">
          <h2 className="audit__h2">What you get</h2>
          <ol className="audit__deliverables">
            {DELIVERABLES.map((d, i) => (
              <li key={d.title} className="audit__deliverable">
                <span className="audit__deliverable-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="audit__h3">{d.title}</h3>
                  <p>{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="audit__section audit__section--dark">
        <div className="audit__container">
          <h2 className="audit__h2">Who delivers it</h2>
          <div className="audit__team">
            <div className="audit__person">
              <h3 className="audit__h3">Scott Swartzbaugh</h3>
              <p className="audit__role">Commercial &amp; capital framing</p>
              <p>
                CEO of T4DevCo (modular data center developer). Background at
                DLA Piper. Leads the commercial structure, capital path, and
                stakeholder framing on every audit.
              </p>
            </div>
            <div className="audit__person">
              <h3 className="audit__h3">Terry Van Roekel</h3>
              <p className="audit__role">Site &amp; power analysis</p>
              <p>
                SiteIQ. Leads site selection, interconnection viability, grid
                capacity analysis, and the cooling / remote-environment view.
                Decades of operator-side diligence experience.
              </p>
            </div>
            <div className="audit__person">
              <h3 className="audit__h3">Jeramey James</h3>
              <p className="audit__role">Data, pro forma, AI workload</p>
              <p>
                Konative. Leads the data layer, the decision-grade pro forma,
                supply-chain analysis, and the workload-shape assumptions for
                AI vs. general-purpose buildouts.
              </p>
            </div>
          </div>
          <p>
            Specialist sub-contractors are pulled in when the parcel requires
            it — never billed without disclosure.
          </p>
        </div>
      </section>

      <section className="audit__section">
        <div className="audit__container">
          <h2 className="audit__h2">How the six weeks run</h2>
          <ol className="audit__process">
            {[
              {
                w: "Week 1",
                title: "Kickoff &amp; framing",
                body: "Engagement letter signed. Two scoping calls with your team. Project framing brief drafted by end of week.",
              },
              {
                w: "Weeks 2–3",
                title: "Diligence",
                body: "Site, power, interconnection, water, fiber, and entitlement review. Supply-chain critical path mapped. Risk register populated.",
              },
              {
                w: "Weeks 3–4",
                title: "Pro forma &amp; recommendation",
                body: "Decision-grade pro forma built. Scenario sensitivity run. Go / no-go recommendation drafted with named assumptions.",
              },
              {
                w: "Weeks 5–6",
                title: "Review &amp; readout",
                body: "Draft circulated for your review. One revision cycle. Final delivery and 30-minute live walkthrough with your stakeholders.",
              },
            ].map((p) => (
              <li key={p.w} className="audit__process-step">
                <span className="audit__process-w">{p.w}</span>
                <div>
                  <h3 className="audit__h3" dangerouslySetInnerHTML={{ __html: p.title }} />
                  <p dangerouslySetInnerHTML={{ __html: p.body }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="audit__section audit__section--dark">
        <div className="audit__container">
          <h2 className="audit__h2">Frequently asked</h2>
          <dl className="audit__faq">
            {FAQS.map((it) => (
              <div key={it.question} className="audit__faq-item">
                <dt>{it.question}</dt>
                <dd>{it.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="audit__cta-band" id="request">
        <div className="audit__container">
          <h2 className="audit__h2">Request an Audit</h2>
          <p>
            Tell us the basics. Scott or Terry will reply within one business day.
          </p>
          <AuditInquiryForm source="readiness_audit_page" />
          <p className="audit__direct">
            Prefer email? <a href="mailto:team@konative.com">team@konative.com</a>
          </p>
        </div>
      </section>

      <section className="audit__related">
        <div className="audit__container">
          <h2 className="audit__h2">Related</h2>
          <ul className="audit__related-list">
            <li>
              <Link href="/powered-land">What &ldquo;powered land&rdquo; means →</Link>
            </li>
            <li>
              <Link href="/dispatch">Konative Dispatch — the twice-weekly brief →</Link>
            </li>
            <li>
              <Link href="/dispatch/issue-2-stalled-projects">
                Issue #2: Where the $64B in stalled projects actually is →
              </Link>
            </li>
            <li>
              <Link href="/land/submit">Just want to list a parcel? →</Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
