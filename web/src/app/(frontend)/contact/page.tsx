"use client";

import React, { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      <div style={{ background: "#0C2046", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, textAlign: "center", padding: "0 32px" }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: "clamp(48px, 6vw, 72px)", textTransform: "uppercase",
            color: "#fff", lineHeight: 0.95, marginBottom: 20,
          }}>
            WE&rsquo;LL BE IN<br /><span style={{ color: "#E07B39" }}>TOUCH.</span>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32 }}>
            Your inquiry has been submitted. Expect a response within one business day.
          </p>
          <a href="/" style={{
            display: "inline-block", fontFamily: "'Inter', sans-serif",
            fontWeight: 600, fontSize: 11, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#E07B39", textDecoration: "none",
          }}>
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0C2046", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 48px 0" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          fontFamily: "'Inter', sans-serif", fontWeight: 600,
          fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
          color: "#E07B39", marginBottom: 20,
        }}>
          <span style={{ display: "block", width: 28, height: 1, background: "#E07B39" }} />
          Get In Touch
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
          fontSize: "clamp(44px, 5.5vw, 80px)", lineHeight: 0.9,
          textTransform: "uppercase", color: "#fff",
          letterSpacing: "0.01em", marginBottom: 16,
        }}>
          LET&rsquo;S TALK<br /><span style={{ color: "#E07B39" }}>CONNECTIVITY.</span>
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.65,
          color: "rgba(255,255,255,0.5)", maxWidth: 540, marginBottom: 60,
        }}>
          Tribal enterprise, a data center coming online, or multi-site business connectivity — tell us what you need. We&rsquo;re vendor-neutral, we quote the whole market through Avant&rsquo;s portfolio, and it costs you nothing.
        </p>
      </div>

      {/* Form */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 48px 120px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80,
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" name="name" required style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="email" required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Organization</label>
              <input type="text" name="organization" style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Phone</label>
              <input type="tel" name="phone" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>I am reaching out about…</label>
            <select name="projectType" style={inputStyle}>
              <option value="">Select…</option>
              <option value="tribal_enterprise">Tribal enterprise connectivity</option>
              <option value="data_center">Data center / interconnection connectivity</option>
              <option value="business_connectivity">Multi-site business connectivity (internet, SD-WAN, voice)</option>
              <option value="dark_fiber_transport">Dark fiber, transport, or wavelengths</option>
              <option value="cloud_security">Cloud connectivity, UCaaS/CCaaS, or cybersecurity</option>
              <option value="partnership">Partnership / referral (developer, MSP, agent)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Where are you in the process?</label>
            <select name="projectStage" style={inputStyle}>
              <option value="">Select…</option>
              <option value="early">Early — just exploring options</option>
              <option value="quoting">Ready for quotes / pricing</option>
              <option value="renewal">Current contract ending / renewal</option>
              <option value="new_site">New site or build coming online</option>
              <option value="urgent">Urgent — active project, need to move</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Message</label>
            <textarea name="message" rows={5} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>How did you hear about us?</label>
            <input type="text" name="referralSource" style={inputStyle} />
          </div>

          {formState === "error" && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#f87171", margin: 0 }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={formState === "submitting"}
            style={{
              padding: "16px 40px", background: "#E07B39", color: "#fff",
              border: "none", fontFamily: "'Inter', sans-serif",
              fontWeight: 700, fontSize: 12, textTransform: "uppercase",
              letterSpacing: "0.16em", cursor: formState === "submitting" ? "not-allowed" : "pointer",
              opacity: formState === "submitting" ? 0.7 : 1,
              alignSelf: "flex-start",
            }}
          >
            {formState === "submitting" ? "Sending…" : "Send Inquiry →"}
          </button>
        </form>

        {/* Right side info panel */}
        <div style={{ paddingTop: 8 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={eyebrowStyle}>Response Time</div>
            <div style={factHeadStyle}>Within 24 hours</div>
            <p style={factBodyStyle}>Every inquiry is reviewed by a principal, not a form-processing queue.</p>
          </div>

          <div style={{ marginBottom: 48 }}>
            <div style={eyebrowStyle}>What Happens Next</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
              {[
                ["01", "We review your requirement and identify the right suppliers."],
                ["02", "A Konative advisor reaches out to scope sites, speeds, and timeline."],
                ["03", "We quote the market through Avant, recommend the best fit, and manage the install."],
              ].map(([num, text]) => (
                <div key={num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 22, color: "#E07B39", lineHeight: 1, minWidth: 28,
                  }}>{num}</span>
                  <p style={factBodyStyle}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32,
          }}>
            <div style={eyebrowStyle}>Prefer Email?</div>
            <a href="mailto:deals@konative.com" style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 22, textTransform: "uppercase", color: "#fff",
              textDecoration: "none", letterSpacing: "0.02em",
            }}>
              deals@konative.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontWeight: 500,
  fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 14,
  padding: "12px 16px", outline: "none", borderRadius: 0, width: "100%",
  boxSizing: "border-box",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontWeight: 600,
  fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
  color: "#E07B39", marginBottom: 8,
};

const factHeadStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
  fontSize: 28, textTransform: "uppercase", color: "#fff",
  lineHeight: 1, marginBottom: 8,
};

const factBodyStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.65,
  color: "rgba(255,255,255,0.45)", margin: 0,
};
