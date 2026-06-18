"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

const RED = "#C8001F";
const RED_HOVER = "#A8001A";
const TEXT = "#111111";
const STEEL = "#374151";
const MUTED = "#6B7280";
const DIVIDER = "#E5E7EB";
const SURFACE = "#F9FAFB";
const DARK = "#0A0F1E";
const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'Inter', sans-serif";

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [buttonHover, setButtonHover] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setFormState("success");
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <main style={{ background: "#fff", minHeight: "100vh", display: "grid", placeItems: "center", padding: "120px 32px" }}>
        <div style={{ maxWidth: 680, textAlign: "center" }}>
          <p style={eyebrowStyle}>Request received</p>
          <h1 style={successTitleStyle}>
            WE&apos;LL BE IN <span style={{ color: RED }}>TOUCH.</span>
          </h1>
          <p style={{ ...ledeStyle, margin: "0 auto 32px" }}>
            Your inquiry has been submitted. A Konative advisor will review the requirement and follow up with the best next step.
          </p>
          <a href="/" style={secondaryLinkStyle}>
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      <section style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${DIVIDER}` }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(55,65,81,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(55,65,81,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div aria-hidden="true" style={{ position: "absolute", top: -80, right: "10%", width: 4, height: 420, background: RED, transform: "rotate(18deg)", opacity: 0.9 }} />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "150px 48px 72px" }}>
          <p style={eyebrowStyle}>Platform access</p>
          <h1 style={titleStyle}>
            LET&apos;S SOURCE THE <span style={{ color: RED }}>NETWORK.</span>
          </h1>
          <p style={ledeStyle}>
            Bring the site, market, route, or enterprise connectivity requirement. Konative runs the carrier-neutral market, frames the options, and manages the path from quote to install.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
            <a href="#request" style={primaryLinkStyle}>Get connectivity options</a>
            <a href="https://cal.com/jeramey-james" target="_blank" rel="noopener noreferrer" style={outlineLinkStyle}>Book a working session</a>
          </div>
        </div>
      </section>

      <section id="request" style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 48px 110px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 56 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16 }}>
            <Field label="Full name" required>
              <input type="text" name="name" required style={inputStyle} />
            </Field>
            <Field label="Email" required>
              <input type="email" name="email" required style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16 }}>
            <Field label="Organization">
              <input type="text" name="organization" style={inputStyle} />
            </Field>
            <Field label="Phone">
              <input type="tel" name="phone" style={inputStyle} />
            </Field>
          </div>

          <Field label="Requirement type">
            <select name="projectType" style={inputStyle}>
              <option value="">Select...</option>
              <option value="data_center">Datacenter connectivity</option>
              <option value="dark_fiber_transport">Dark fiber, transport, or wavelengths</option>
              <option value="business_connectivity">Enterprise internet, SD-WAN, or voice</option>
              <option value="cloud_security">Cloud connectivity, UCaaS/CCaaS, or security</option>
              <option value="market_intelligence">Market intelligence or brief request</option>
              <option value="partnership">Partnership or referral</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Stage">
            <select name="projectStage" style={inputStyle}>
              <option value="">Select...</option>
              <option value="exploring">Exploring options</option>
              <option value="quoting">Ready for quotes</option>
              <option value="renewal">Current contract ending</option>
              <option value="new_site">New site coming online</option>
              <option value="urgent">Active project, urgent timeline</option>
            </select>
          </Field>

          <Field label="Message">
            <textarea name="message" rows={6} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label="How did you hear about us?">
            <input type="text" name="referralSource" style={inputStyle} />
          </Field>

          {formState === "error" && (
            <p style={{ fontFamily: BODY, fontSize: 13, color: RED, margin: 0 }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={formState === "submitting"}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            style={{
              padding: "17px 40px",
              background: buttonHover ? RED_HOVER : RED,
              color: "#fff",
              border: "none",
              borderRadius: 2,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              cursor: formState === "submitting" ? "not-allowed" : "pointer",
              opacity: formState === "submitting" ? 0.7 : 1,
              alignSelf: "flex-start",
            }}
          >
            {formState === "submitting" ? "Sending..." : "Send requirement"}
          </button>
        </form>

        <aside style={{ background: SURFACE, border: `1px solid ${DIVIDER}`, padding: 32, alignSelf: "start" }}>
          <InfoBlock label="Response time" title="Advisor reviewed" body="Every request is reviewed by a principal or Konative advisor, then routed to the right next action." />
          <InfoBlock label="What happens next" title="Scope, source, recommend" body="We clarify locations, bandwidth, route constraints, carrier preferences, and timing before running the market." />
          <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 26 }}>
            <p style={smallLabelStyle}>Prefer email?</p>
            <a href="mailto:deals@konative.com" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: TEXT, textDecoration: "none", letterSpacing: "0.01em" }}>
              deals@konative.com
            </a>
          </div>
        </aside>
      </section>

      <section style={{ background: DARK, color: "#fff", padding: "72px 48px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...eyebrowStyle, justifyContent: "center", color: RED }}>Warm-intent booking</p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", textTransform: "uppercase", lineHeight: 0.95, margin: "0 0 18px" }}>
            NEED A LIVE READ ON A MARKET?
          </h2>
          <p style={{ fontFamily: BODY, color: "rgba(255,255,255,0.64)", fontSize: 16, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 30px" }}>
            Book a working session when you already have a site, route, renewal, or procurement question that needs a decision.
          </p>
          <a href="https://cal.com/jeramey-james" target="_blank" rel="noopener noreferrer" style={darkPrimaryLinkStyle}>
            Book on Cal.com
          </a>
        </div>
      </section>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={labelStyle}>{label}{required ? " *" : ""}</span>
      {children}
    </label>
  );
}

function InfoBlock({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={smallLabelStyle}>{label}</p>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, textTransform: "uppercase", color: TEXT, lineHeight: 1, margin: "0 0 10px" }}>
        {title}
      </h2>
      <p style={{ fontFamily: BODY, color: MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

const eyebrowStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: RED,
  margin: "0 0 18px",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const titleStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: "clamp(54px, 8vw, 104px)",
  lineHeight: 0.9,
  textTransform: "uppercase",
  color: TEXT,
  letterSpacing: "0.005em",
  margin: "0 0 28px",
  maxWidth: 900,
};

const successTitleStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: "clamp(48px, 7vw, 84px)",
  lineHeight: 0.92,
  textTransform: "uppercase",
  color: TEXT,
  margin: "0 0 20px",
};

const ledeStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 18,
  lineHeight: 1.65,
  color: MUTED,
  maxWidth: 680,
  margin: 0,
};

const labelStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: STEEL,
};

const smallLabelStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: RED,
  margin: "0 0 8px",
};

const inputStyle: CSSProperties = {
  background: "#fff",
  border: `1px solid ${DIVIDER}`,
  color: TEXT,
  fontFamily: BODY,
  fontSize: 14,
  padding: "13px 15px",
  outline: "none",
  borderRadius: 2,
  width: "100%",
  boxSizing: "border-box",
};

const primaryLinkStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  background: RED,
  color: "#fff",
  padding: "17px 34px",
  textDecoration: "none",
  borderRadius: 2,
};

const darkPrimaryLinkStyle: CSSProperties = {
  ...primaryLinkStyle,
  display: "inline-block",
};

const outlineLinkStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  background: "#fff",
  color: STEEL,
  padding: "16px 32px",
  textDecoration: "none",
  border: `1px solid ${DIVIDER}`,
  borderRadius: 2,
};

const secondaryLinkStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: RED,
  textDecoration: "none",
  borderBottom: `1px solid ${RED}`,
  paddingBottom: 4,
};
