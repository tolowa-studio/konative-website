"use client";

// Tribal Carrier Availability Check — intake form.
//
// Reuses the site's existing submission path: POST JSON to /api/contact
// (the same route already used by /contact, /invest, and the audience CTA
// forms — see web/src/app/(frontend)/contact/page.tsx,
// web/src/app/(frontend)/invest/page.tsx, and
// web/src/components/audience/AudienceCTAForm.tsx). We tag the payload with
// `projectType: "tribal_carrier_check"` so it can be routed/labeled distinctly
// downstream, following the same convention those pages use
// (`projectType`, `audience`, `inquiryType`).
//
// House rule: never silently swallow a failed submission. On error we show
// the real error text plus a mailto fallback — no "?? 0", no empty catch.

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
const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'Inter', sans-serif";

const NEEDS_OPTIONS = [
  { value: "dedicated_internet", label: "Dedicated internet access" },
  { value: "wan", label: "WAN between sites" },
  { value: "middle_mile_transport", label: "Middle-mile / transport" },
  { value: "voice_ucaas", label: "Voice / UCaaS" },
  { value: "security", label: "Security" },
  { value: "not_sure", label: "Not sure — assess everything" },
];

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

const labelStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: STEEL,
};

const checkboxRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontFamily: BODY,
  fontSize: 14,
  color: TEXT,
};

export default function CarrierCheckForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [buttonHover, setButtonHover] = useState(false);
  const [needs, setNeeds] = useState<string[]>([]);

  function toggleNeed(value: string) {
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

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
        body: JSON.stringify({
          ...data,
          needs: needs.join(", "),
          projectType: "tribal_carrier_check",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error ||
            "Something went wrong submitting your request. Please try again or email us directly.",
        );
      }

      setFormState("success");
      form.reset();
      setNeeds([]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your request. Please try again or email us directly.",
      );
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${DIVIDER}`,
          borderTop: `3px solid ${RED}`,
          padding: "40px 36px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: RED,
            margin: "0 0 14px",
          }}
        >
          Request received
        </p>
        <h3
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 30,
            textTransform: "uppercase",
            color: TEXT,
            lineHeight: 1.05,
            margin: "0 0 14px",
          }}
        >
          We&apos;re on it. Report in 48 hours.
        </h3>
        <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7, color: MUTED, maxWidth: 480, margin: "0 auto" }}>
          We&apos;ll pull carrier and regional-provider serviceability for the location and sites you gave us,
          and send a written report to the email you provided — no cost, no obligation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 16,
        }}
      >
        <Field label="Tribe / Nation or tribal enterprise" required>
          <input type="text" name="organization" required style={inputStyle} />
        </Field>
        <Field label="Contact name" required>
          <input type="text" name="name" required style={inputStyle} />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 16,
        }}
      >
        <Field label="Email" required>
          <input type="email" name="email" required style={inputStyle} />
        </Field>
        <Field label="Phone (optional)">
          <input type="tel" name="phone" style={inputStyle} />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 16,
        }}
      >
        <Field label="Reservation / community + state" required>
          <input
            type="text"
            name="location"
            required
            placeholder="Example: Fort Hall, Idaho"
            style={inputStyle}
          />
        </Field>
        <Field label="Number of sites" required>
          <input type="number" name="siteCount" min={1} required style={inputStyle} />
        </Field>
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <legend style={{ ...labelStyle, marginBottom: 4, padding: 0 }}>What do you need?</legend>
        {NEEDS_OPTIONS.map((opt) => (
          <label key={opt.value} style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={needs.includes(opt.value)}
              onChange={() => toggleNeed(opt.value)}
              style={{ width: 16, height: 16, accentColor: RED }}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <Field label="Current pain (optional)">
        <textarea
          name="message"
          rows={4}
          placeholder="What's not working today — dropped claims of coverage, no straight answers from carriers, slow quotes, anything."
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Field>

      {formState === "error" && (
        <div
          style={{
            background: "#FFF0F2",
            border: `1px solid ${RED}`,
            padding: "14px 16px",
            fontFamily: BODY,
            fontSize: 13,
            lineHeight: 1.6,
            color: TEXT,
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: RED }}>
            {errorMsg}
          </p>
          <p style={{ margin: 0 }}>
            You can also email us directly at{" "}
            <a href="mailto:deals@konative.com" style={{ color: RED }}>
              deals@konative.com
            </a>{" "}
            or use the{" "}
            <a href="/contact" style={{ color: RED }}>
              general contact form
            </a>
            .
          </p>
        </div>
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
        {formState === "submitting" ? "Submitting..." : "Get my free coverage report"}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
