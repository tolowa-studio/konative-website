"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { VoiceIntakeWidget } from "@/components/forms/VoiceIntakeWidget";
import { CalEmbed } from "@/components/CalEmbed";

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
        <div style={{ position: "absolute", inset: 0, opacity: .5 }}>
          <Image
            src="https://images.unsplash.com/photo-1506606401543-2e73709cebb4?auto=format&fit=crop&w=2400&q=70"
            alt="Aerial view of a metropolitan grid glowing at night, conveying continental-scale connectivity"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: .32 }}><DataCenterMap backgroundMode /></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#08111F 0%,rgba(8,17,31,.94) 46%,rgba(8,17,31,.62) 100%)" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,17,31,.35) 0%, rgba(8,17,31,0) 30%, rgba(8,17,31,.72) 100%)" }} />
        <a
          href="https://unsplash.com/@zacong?utm_source=konative&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{ position: "absolute", right: 16, bottom: 12, zIndex: 2, fontFamily: "Inter, sans-serif", fontSize: 10, letterSpacing: ".04em", color: "rgba(255,255,255,.5)", textDecoration: "none" }}
        >
          Photo: Zac Ong / Unsplash
        </a>
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "150px 32px 72px" }}>
          <p style={eyebrow}>Vendor-neutral connectivity brokerage · AVANT partner</p>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(52px,8.5vw,108px)", lineHeight: .86, letterSpacing: "-.025em", textTransform: "uppercase", color: "#fff", maxWidth: 980, margin: "0 0 28px" }}>
            Nearby fiber is not <span style={{ color: RED }}>deliverable fiber.</span>
          </h1>
          <p style={{ maxWidth: 720, color: "rgba(255,255,255,.72)", fontSize: 18, lineHeight: 1.7, marginBottom: 36 }}>
            Konative maps which carriers can actually reach your mid-build data-center site — laterals, waves, DIA, diversity — before the schedule slips. Native-owned. Vendor-neutral. Suppliers pay us.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/contact?projectType=data_center#request" style={primary}>Get a one-page site brief</Link>
            <Link href="/tribal" style={secondary}>Tribal enterprise connectivity</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", maxWidth: 880, marginTop: 54, border: "1px solid rgba(255,255,255,.15)" }}>
            {["Site-specific deliverability", "100+ supplier portfolio", "Supplier-paid advisory", "Lifecycle support"].map(x => <div key={x} style={{ padding: "18px 20px", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,.12)" }}>{x}</div>)}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 32px 0" }}>
        <p style={{ ...eyebrow, color: RED }}>Describe it — we&apos;ll take it from there</p>
        <h2 style={sectionTitle}>Talk to us. Literally.</h2>
        <p style={{ color: MUTED, maxWidth: 640, lineHeight: 1.7, marginTop: 16, marginBottom: 42 }}>
          Click the mic and describe what you need in your own words. We transcribe it, organize it into
          a real brief, and get it to our team — no form to fill out. Or just book a time yourself below.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }} className="voice-intake-page-grid">
          <VoiceIntakeWidget />
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: RED, marginBottom: 12 }}>
              Prefer to just pick a time?
            </p>
            <CalEmbed />
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 32px" }}>
        <p style={{ ...eyebrow, color: RED }}>Where we lean in</p>
        <h2 style={sectionTitle}>One sourcing desk. Two rooms we know.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,430px),1fr))", gap: 18, marginTop: 42 }}>
          <Door href="/data-center-connectivity" number="01" title="Data center under construction" body="Prove which carriers can actually deliver multi-path connectivity to a named mid-build site — laterals, waves, DIA, DCI, diversity — without betting the schedule on a single carrier’s map. Free lateral cost estimator + published secondary-market benchmarks." cta="Get a site connectivity brief" />
          <Door href="/tribal" number="02" title="Tribal gaming & enterprise" body="Keep uptime. Make carriers compete. Native-owned, vendor-neutral brokerage for casinos, multi-site ops, health, and government — renewal continuity and failover without rip-and-replace. Suppliers pay us; you own the contracts." cta="Request a continuity snapshot" />
        </div>
        <p style={{ color: MUTED, marginTop: 22, lineHeight: 1.7 }}>
          Also sourcing multi-site enterprise, healthcare, public safety, UCaaS/CCaaS, managed networks, cloud, mobility, and cybersecurity.{" "}
          <Link href="/tribal/funding-navigator" style={{ color: RED, fontWeight: 600, textDecoration: "none" }}>
            Applying for TBCP Round 3 / NEGP by Sept 17?
          </Link>{" "}
          Free funding navigator — grant help is separate from brokerage.
        </p>
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
        <div style={{ maxWidth: 850, margin: "0 auto" }}>
          <p style={eyebrow}>One named site is enough to start</p>
          <h2 style={{ ...sectionTitle, color: "#fff", fontSize: "clamp(48px,7vw,82px)" }}>Bring the address. We&apos;ll prove deliverability.</h2>
          <p style={{ color: "rgba(255,255,255,.65)", lineHeight: 1.7, margin: "22px auto 30px", maxWidth: 650 }}>
            Share a mid-build campus, renewal window, multi-site WAN, or urgent service problem. We return a one-page market brief — not a carrier pitch deck.
          </p>
          <Link href="/contact#request" style={primary}>Get a one-page site brief</Link>
        </div>
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
