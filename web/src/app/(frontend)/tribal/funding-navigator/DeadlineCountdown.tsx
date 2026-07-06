"use client";

// Live countdown to the TBCP Round 3 / NEGP application deadline.
// Renders a static fallback before hydration; renders a "closed" message
// once the deadline passes so the page never shows a stale clock.

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const DEADLINE_MS = new Date("2026-09-17T23:59:00-04:00").getTime();

const DISPLAY = '"Barlow Condensed", sans-serif';
const BODY = "Inter, sans-serif";
const RED = "#C8001F";

const wrapStyle: CSSProperties = {
  position: "relative",
  margin: "8px 0 40px",
};
const labelStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 600,
  fontSize: 10,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "#FF526B",
  marginBottom: 14,
};
const boxRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};
const boxStyle: CSSProperties = {
  minWidth: 104,
  padding: "18px 20px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderTop: `3px solid ${RED}`,
  textAlign: "center",
};
const numStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: 46,
  lineHeight: 1,
  color: "#fff",
  fontVariantNumeric: "tabular-nums",
};
const unitStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 600,
  fontSize: 10,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
  marginTop: 8,
};
const fallbackStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 24,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#fff",
};
const closedStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 16,
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.85)",
  maxWidth: 560,
};

export default function DeadlineCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Static fallback before hydration (also what crawlers without JS see).
  if (now === null) {
    return (
      <div style={wrapStyle}>
        <div style={labelStyle}>Application Window Closes</div>
        <div style={fallbackStyle}>Deadline: September 17, 2026 · 11:59 p.m. ET</div>
      </div>
    );
  }

  const remaining = DEADLINE_MS - now;

  if (remaining <= 0) {
    return (
      <div style={wrapStyle}>
        <div style={labelStyle}>Application Window</div>
        <p style={closedStyle}>
          Applications closed — awards roll out from Spring 2027. Talk to us about
          what&apos;s next.
        </p>
      </div>
    );
  }

  const totalMinutes = Math.floor(remaining / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const units: Array<{ value: number; unit: string }> = [
    { value: days, unit: "Days" },
    { value: hours, unit: "Hours" },
    { value: minutes, unit: "Minutes" },
  ];

  return (
    <div style={wrapStyle}>
      <div style={labelStyle}>Application Window Closes Sept 17, 2026 · 11:59 p.m. ET</div>
      <div style={boxRowStyle}>
        {units.map((u) => (
          <div key={u.unit} style={boxStyle}>
            <div style={numStyle}>{u.value}</div>
            <div style={unitStyle}>{u.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
