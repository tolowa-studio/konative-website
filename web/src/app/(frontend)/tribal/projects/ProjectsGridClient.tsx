"use client";

import React, { useMemo, useState } from "react";

import {
  INTERCONNECT_TIER_LABELS,
  OPPORTUNITY_CLASS_LABELS,
  TRIBAL_STATUS_LABELS,
  type InterconnectTier,
  type TribalProjectRow,
  type TribalStatus,
} from "@/lib/tribalProjects";

const RED = "#C8001F";
const STEEL = "#374151";
const MUTED = "#6B7280";
const DIVIDER = "#E5E7EB";
const MONO = "'JetBrains Mono', monospace";
const BODY = "'Inter', sans-serif";
const DISPLAY = "'Barlow Condensed', sans-serif";

const STATUS_COLORS: Record<TribalStatus, string> = {
  operating: "#065F46",
  approved: "#1D4ED8",
  feasibility: "#7C3AED",
  opposition: "#B45309",
  moratorium: RED,
  "stranded-coal": STEEL,
};

const TIER_COLORS: Record<InterconnectTier, string> = {
  A: "#065F46",
  B: "#1D4ED8",
  C: "#B45309",
  D: RED,
};

interface Props {
  projects: TribalProjectRow[];
}

export default function ProjectsGridClient({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState<"" | "US" | "CA">("");
  const [filterStatus, setFilterStatus] = useState<"" | TribalStatus>("");
  const [filterTier, setFilterTier] = useState<"" | InterconnectTier>("");

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<TribalStatus, number>> = {};
    for (const p of projects) {
      counts[p.tribalStatus] = (counts[p.tribalStatus] ?? 0) + 1;
    }
    return counts;
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tribe.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.partner ?? "").toLowerCase().includes(q),
      );
    }
    if (filterCountry) list = list.filter((p) => p.country === filterCountry);
    if (filterStatus) list = list.filter((p) => p.tribalStatus === filterStatus);
    if (filterTier) list = list.filter((p) => p.interconnectTier === filterTier);
    return list;
  }, [projects, search, filterCountry, filterStatus, filterTier]);

  const selectStyle: React.CSSProperties = {
    fontFamily: BODY,
    fontSize: 13,
    padding: "10px 12px",
    border: `1px solid ${DIVIDER}`,
    background: "#fff",
    color: STEEL,
    minWidth: 0,
    flex: "1 1 160px",
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
    flex: "2 1 220px",
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          marginBottom: 24,
          padding: "16px 0",
          borderBottom: `1px solid ${DIVIDER}`,
        }}
      >
        {[
          { label: "Total tracked", value: projects.length.toString() },
          { label: "Showing", value: filtered.length.toString() },
          {
            label: "Operating",
            value: (statusCounts.operating ?? 0).toString(),
          },
          {
            label: "Moratoria",
            value: (statusCounts.moratorium ?? 0).toString(),
          },
        ].map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 600,
                fontSize: 22,
                color: RED,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: BODY,
                fontSize: 11,
                color: MUTED,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <input
          type="search"
          placeholder="Search tribe, project, partner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
          aria-label="Search projects"
        />
        <select
          value={filterCountry}
          onChange={(e) =>
            setFilterCountry(e.target.value as "" | "US" | "CA")
          }
          style={selectStyle}
          aria-label="Filter by country"
        >
          <option value="">All countries</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as "" | TribalStatus)
          }
          style={selectStyle}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {(Object.keys(TRIBAL_STATUS_LABELS) as TribalStatus[]).map((s) => (
            <option key={s} value={s}>
              {TRIBAL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={filterTier}
          onChange={(e) =>
            setFilterTier(e.target.value as "" | InterconnectTier)
          }
          style={selectStyle}
          aria-label="Filter by interconnect relevance"
        >
          <option value="">All interconnect tiers</option>
          {(Object.keys(INTERCONNECT_TIER_LABELS) as InterconnectTier[]).map(
            (t) => (
              <option key={t} value={t}>
                {INTERCONNECT_TIER_LABELS[t]}
              </option>
            ),
          )}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p
          style={{
            fontFamily: BODY,
            fontSize: 14,
            color: MUTED,
            padding: "48px 0",
          }}
        >
          No projects match your filters.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((p) => (
            <article
              key={p.id}
              style={{
                background: "#fff",
                border: `1px solid ${DIVIDER}`,
                borderTop: `3px solid ${RED}`,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                minHeight: 280,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: BODY,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: STATUS_COLORS[p.tribalStatus],
                    padding: "4px 8px",
                  }}
                >
                  {TRIBAL_STATUS_LABELS[p.tribalStatus]}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 600,
                    color: TIER_COLORS[p.interconnectTier],
                  }}
                  title={INTERCONNECT_TIER_LABELS[p.interconnectTier]}
                >
                  IX {p.interconnectTier}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  color: STEEL,
                  margin: "0 0 6px",
                }}
              >
                {p.name}
              </h2>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 600,
                  color: RED,
                  margin: "0 0 4px",
                }}
              >
                {p.tribe}
              </p>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 12,
                  color: MUTED,
                  margin: "0 0 14px",
                }}
              >
                {[p.city, p.state, p.country].filter(Boolean).join(", ")}
                {p.capacityMw ? ` · ${p.capacityMw} MW` : ""}
              </p>

              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: STEEL,
                  margin: "0 0 14px",
                  flex: 1,
                }}
              >
                {p.summary}
              </p>

              {p.partner && (
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 12,
                    color: MUTED,
                    margin: "0 0 8px",
                  }}
                >
                  <strong style={{ color: STEEL }}>Partner:</strong> {p.partner}
                </p>
              )}
              {p.opportunityClass && (
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 11,
                    color: MUTED,
                    margin: "0 0 8px",
                  }}
                >
                  {OPPORTUNITY_CLASS_LABELS[p.opportunityClass] ??
                    p.opportunityClass}
                </p>
              )}
              {p.voteOrDate && (
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: MUTED,
                    margin: "0 0 12px",
                  }}
                >
                  {p.voteOrDate}
                </p>
              )}

              {p.sources.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.sources.slice(0, 2).map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: BODY,
                        fontSize: 11,
                        fontWeight: 600,
                        color: RED,
                        textDecoration: "none",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Source →
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
