import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Powered Land — Konative",
  description:
    "Own land near a substation or transmission line? Find out what it's worth to the AI buildout. Konative brokers powered land to hyperscalers, developers, and data center operators.",
};

export default function LandPage() {
  return (
    <main className="land-hub">
      <section className="land-hub__hero">
        <div className="land-hub__hero-inner">
          <p className="land-hub__eyebrow">For Landowners</p>
          <h1 className="land-hub__headline">
            If you own powered land,<br />
            the AI buildout wants to talk to you.
          </h1>
          <p className="land-hub__sub">
            Hyperscalers, data center developers, and AI infrastructure companies are racing to
            find acreage near substations and transmission corridors. Konative sources, qualifies,
            and brokers powered land — and manages the project from contract to construction.
          </p>
          <div className="land-hub__ctas">
            <Link href="/land/submit" className="land-hub__cta-primary">Submit your land →</Link>
            <Link href="/land/what-its-worth" className="land-hub__cta-secondary">What is it worth?</Link>
          </div>
        </div>
      </section>

      <section className="land-hub__criteria">
        <div className="land-hub__criteria-inner">
          <h2 className="land-hub__section-heading">What buyers look for</h2>
          <div className="land-hub__criteria-grid">
            {[
              { icon: "⚡", title: "Power proximity", body: "Within 5 miles of a 115kV+ substation. 230kV+ opens more buyers." },
              { icon: "📐", title: "Acreage", body: "50–5,000+ acres. Utility-scale builds need room for cooling, generation, and buffers." },
              { icon: "🌊", title: "Water access", body: "Evaporative cooling is water-intensive. Access to water supply or non-potable sources matters." },
              { icon: "📡", title: "Fiber connectivity", body: "Within reach of a fiber backbone. Metro adjacency earns a premium." },
              { icon: "🏗️", title: "Zoning", body: "Industrial or heavy commercial zoning is ideal. Agricultural can often be re-zoned." },
              { icon: "🗺️", title: "Geography", body: "US and Canada. Priority markets: Texas, Carolinas, Pacific Northwest, Ontario, Alberta." },
            ].map(item => (
              <div key={item.title} className="land-hub__criterion">
                <div className="land-hub__criterion-icon">{item.icon}</div>
                <h3 className="land-hub__criterion-title">{item.title}</h3>
                <p className="land-hub__criterion-body">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="land-hub__process">
        <div className="land-hub__process-inner">
          <h2 className="land-hub__section-heading">How it works</h2>
          <ol className="land-hub__steps">
            {[
              { n: "01", title: "Submit your parcel", body: "Five minutes. Tell us the basics — location, acreage, power situation, your goals." },
              { n: "02", title: "Qualification call", body: "Within 48 hours we'll review your submission and schedule a call to ask a few questions." },
              { n: "03", title: "Site analysis", body: "We run a full power, transmission, and market analysis. No cost to you." },
              { n: "04", title: "Buyer outreach", body: "We take your parcel to our network of hyperscalers, developers, and infrastructure investors." },
              { n: "05", title: "LOI and negotiation", body: "We negotiate deal structure — sell, ground lease, or JV — to maximize your outcome." },
              { n: "06", title: "Close and project management", body: "We stay on through due diligence, permitting, and construction milestones." },
            ].map(step => (
              <li key={step.n} className="land-hub__step">
                <span className="land-hub__step-num">{step.n}</span>
                <div>
                  <strong className="land-hub__step-title">{step.title}</strong>
                  <p className="land-hub__step-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/land/submit" className="land-hub__cta-primary" style={{ marginTop: 32, display: "inline-block" }}>
            Submit your land →
          </Link>
        </div>
      </section>
    </main>
  );
}
