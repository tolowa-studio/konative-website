"use client";

import { useState } from "react";
import Link from "next/link";
import type { LayerManifestEntry } from "@/types/map-layers";

interface Props {
  layers: LayerManifestEntry[];
}

export default function LayerCredits({ layers }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 5, fontFamily: "Inter, sans-serif" }}>
      {open && (
        <div style={{
          background: "rgba(8,20,45,0.96)", color: "#fff",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
          padding: 16, marginBottom: 8, width: 320, maxHeight: 360, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
            Layer credits
          </div>
          {layers.length === 0 ? (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>No layers loaded.</div>
          ) : (
            layers.map((layer) => (
              <div key={layer.id} style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>{layer.title}</div>
                <a href={layer.sourceUrl} target="_blank" rel="noopener noreferrer"
                   style={{ color: "#F0A050", textDecoration: "none" }}>
                  {layer.attribution} · {layer.license}
                </a>
              </div>
            ))
          )}
          <Link href="/licenses" style={{
            display: "inline-block", marginTop: 8, fontSize: 12, color: "#F0A050", textDecoration: "underline",
          }}>
            Full license page →
          </Link>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          background: "rgba(8,20,45,0.92)", color: "#fff",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
          padding: "6px 10px", fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", cursor: "pointer",
        }}
      >
        {open ? "Hide credits" : "Layer credits"}
      </button>
    </div>
  );
}
