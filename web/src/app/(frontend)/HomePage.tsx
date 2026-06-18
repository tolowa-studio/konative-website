"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const DataCenterMap = dynamic(() => import("@/components/DataCenterMap"), { ssr: false });

const RED = "#C8001F";
const DARK = "#08111F";
const TEXT = "#111827";
const MUTED = "#667085";
const LINE = "#E5E7EB";
const DISPLAY = "'Barlow Condensed', sans-serif";

const outcomes = [
  ["Provider options", "Identify suppliers that can serve each address and requirement."],
  ["Comparable pricing", "Normalize recurring, installation, construction, term, and escalation costs."],
  ["Resilience review", "Check carrier, path, entrance, transport, and failover assumptions."],
  ["One accountable team", "Manage sourcing, ordering, installation, escalation, and renewal."],
];

export default function HomePage() {
  return (
    <main style={{ color: TEXT, background: "#fff" }}>
      <section style={{ minHeight: "92dvh", position: "relative", overflow: "hidden", background: DARK }}>
        <div style={{ position: "absolute", inset: 0, opacity: .38 }}><DataCenterMap backgroundMode /></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#08111F 0%,rgba(8,17,31,.96) 46%,rgba(8,17,31,.55) 100%)" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "150px 32px 72px" }}>
          <p style={eyebrow}>Vendor-neutral connectivity brokerage · AVANT partner</p>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(58px,9vw,118px)", lineHeight: .86, letterSpacing: "-.025em", textTransform: "uppercase", color: "#fff", maxWidth: 960, margin: "0 0 28px" }}>
            Find the right connectivity for <span style={{ color: RED }}>every critical site.</span>
          </h1>
          <p style={{ maxWidth: 720, color: "rgba(255,255,255,.72)", fontSize: 18, lineHeight: 1.7, marginBottom: 36 }}>
            Konative finds, compares, procures, and manages internet, fiber, transport, cloud, voice, and security for Tribal organizations, funded projects, data centers, and complex enterprises.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/contact#request" style={primary}>Check a location</Link>
            <Link href="/contact?projectType=tribal_funded#request" style={secondary}>Bring us an RFP or funded project</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", maxWidth: 880, marginTop: 54, border: "1px solid rgba(255,255,255,.15)" }}>
            {["100+ supplier portfolio", "One market comparison", "Supplier-paid advisory", "Lifecycle support"].map(x => <div key={x} style={{ padding: "18px 20px", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,.12)" }}>{x}</div>)}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 32px" }}>
        <p style={{ ...eyebrow, color: RED }}>Start with your situation</p>
        <h2 style={sectionTitle}>Two urgent markets. One sourcing desk.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,430px),1fr))", gap: 18, marginTop: 42 }}>
          <Door href="/tribal" number="01" title="Tribal or grant-funded project" body="Turn program dollars and operating requirements into serviceable locations, competitive options, defensible procurement, and installed connectivity." cta="Plan funded connectivity" />
          <Door href="/data-center-connectivity" number="02" title="Data-center site" body="Determine whether a site can obtain the internet, transport, dark fiber, wavelengths, cloud access, and physical diversity its operating plan requires." cta="Evaluate site connectivity" />
        </div>
        <p style={{ color: MUTED, marginTop: 22, lineHeight: 1.7 }}>Also sourcing multi-site enterprise, gaming and hospitality, healthcare, public safety, UCaaS/CCaaS, managed networks, cloud, mobility, and cybersecurity.</p>
      </section>

      <section style={{ background: "#F7F8FA", borderBlock: `1px solid ${LINE}`, padding: "88px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p style={{ ...eyebrow, color: RED }}>What you receive</p>
          <h2 style={sectionTitle}>A market answer—not one carrier&apos;s answer.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", marginTop: 40, border: `1px solid ${LINE}` }}>
            {outcomes.map(([title, body], i) => <div key={title} style={{ padding: 28, background: "#fff", borderRight: `1px solid ${LINE}` }}><span style={{ color: RED, fontWeight: 800, fontSize: 12 }}>0{i + 1}</span><h3 style={{ fontFamily: DISPLAY, textTransform: "uppercase", fontSize: 27, margin: "14px 0 10px" }}>{title}</h3><p style={{ color: MUTED, lineHeight: 1.65, margin: 0 }}>{body}</p></div>)}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 30, alignItems: "end", flexWrap: "wrap", marginBottom: 34 }}>
          <div><p style={{ ...eyebrow, color: RED }}>Connectivity opportunity map</p><h2 style={sectionTitle}>Demand, infrastructure, and funding context.</h2></div>
          <p style={{ color: MUTED, maxWidth: 430, lineHeight: 1.7 }}>The map is an evidence layer—not a promise of serviceability. We combine public infrastructure signals with supplier sourcing to answer a specific address.</p>
        </div>
        <div style={{ height: 560, position: "relative", border: `1px solid ${LINE}`, overflow: "hidden" }}>
          <DataCenterMap backgroundMode />
          <div style={{ position: "absolute", left: 18, bottom: 18, background: "rgba(255,255,255,.94)", padding: 16, maxWidth: 390, border: `1px solid ${LINE}` }}>
            <strong>Need a real answer for a site?</strong>
            <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>Submit the address and requirement. Konative will initiate a market and serviceability review.</p>
            <Link href="/contact#request" style={{ color: RED, fontWeight: 800, textDecoration: "none", textTransform: "uppercase", fontSize: 11, letterSpacing: ".1em" }}>Check this location →</Link>
          </div>
        </div>
      </section>

      <section style={{ background: DARK, padding: "84px 32px", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 850, margin: "0 auto" }}><p style={eyebrow}>One requirement is enough to start</p><h2 style={{ ...sectionTitle, color: "#fff", fontSize: "clamp(48px,7vw,82px)" }}>Bring the addresses. We&apos;ll run the market.</h2><p style={{ color: "rgba(255,255,255,.65)", lineHeight: 1.7, margin: "22px auto 30px", maxWidth: 650 }}>Share a funded project, renewal, new site, RFP, or urgent service problem. We will organize the requirement and identify the fastest credible sourcing path.</p><Link href="/contact#request" style={primary}>Get connectivity options</Link></div>
      </section>
    </main>
  );
}

function Door({ href, number, title, body, cta }: { href: string; number: string; title: string; body: string; cta: string }) {
  return <Link href={href} style={{ textDecoration: "none", color: TEXT, border: `1px solid ${LINE}`, borderTop: `4px solid ${RED}`, padding: "34px", minHeight: 300, display: "flex", flexDirection: "column" }}><span style={{ color: RED, fontWeight: 800 }}>{number}</span><h3 style={{ fontFamily: DISPLAY, fontSize: "clamp(38px,5vw,58px)", lineHeight: .95, textTransform: "uppercase", margin: "30px 0 18px" }}>{title}</h3><p style={{ color: MUTED, lineHeight: 1.7, maxWidth: 540 }}>{body}</p><span style={{ marginTop: "auto", paddingTop: 24, color: RED, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: ".11em" }}>{cta} →</span></Link>;
}

const eyebrow = { color: "#FF526B", textTransform: "uppercase" as const, letterSpacing: ".16em", fontWeight: 800, fontSize: 11, marginBottom: 18 };
const sectionTitle = { fontFamily: DISPLAY, fontSize: "clamp(42px,6vw,72px)", lineHeight: .92, textTransform: "uppercase" as const, margin: 0, maxWidth: 820 };
const primary = { display: "inline-block", padding: "16px 25px", background: RED, color: "#fff", textDecoration: "none", textTransform: "uppercase" as const, fontWeight: 800, letterSpacing: ".1em", fontSize: 12 };
const secondary = { ...primary, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.35)" };
