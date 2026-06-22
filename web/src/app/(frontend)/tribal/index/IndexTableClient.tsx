"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

const RED = "#C8001F";
const STEEL = "#374151";
const MONO = "'JetBrains Mono', monospace";
const BODY = "'Inter', sans-serif";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  I: "Infrastructure",
  P: "Planning",
  A: "Adoption",
};

function fmt(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n).toLocaleString()}`;
}

export interface AwardRow {
  id: string;
  slug: string;
  grantee_name: string;
  award_amount_usd: number | null;
  nofo_round: string | null;
  project_type: string | null;
  lat: number | null;
  lng: number | null;
}

interface Props {
  awards: AwardRow[];
}

export default function IndexTableClient({ awards }: Props) {
  const [search, setSearch] = useState("");
  const [filterNofo, setFilterNofo] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState<"amount" | "name">("amount");

  const nofoOptions = useMemo(() => {
    const s = new Set(awards.map((a) => a.nofo_round).filter(Boolean));
    return Array.from(s).sort() as string[];
  }, [awards]);

  const typeOptions = useMemo(() => {
    const s = new Set(awards.map((a) => a.project_type).filter(Boolean));
    return Array.from(s).sort() as string[];
  }, [awards]);

  const filtered = useMemo(() => {
    let list = awards;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.grantee_name.toLowerCase().includes(q));
    }
    if (filterNofo) list = list.filter((a) => a.nofo_round === filterNofo);
    if (filterType) list = list.filter((a) => a.project_type === filterType);
    if (sortBy === "name")
      list = [...list].sort((a, b) =>
        a.grantee_name.localeCompare(b.grantee_name)
      );
    else
      list = [...list].sort(
        (a, b) => (b.award_amount_usd ?? 0) - (a.award_amount_usd ?? 0)
      );
    return list;
  }, [awards, search, filterNofo, filterType, sortBy]);

  const totalFunded = useMemo(
    () => filtered.reduce((s, a) => s + (a.award_amount_usd ?? 0), 0),
    [filtered]
  );

  return (
    <>
      {/* Live stats strip (client-updated as filters change) */}
      <div
        style={{
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          marginBottom: 24,
          padding: "16px 0",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {[
          { label: "Showing", value: filtered.length.toString() },
          {
            label: "Filtered Total",
            value:
              totalFunded >= 1e9
                ? `$${(totalFunded / 1e9).toFixed(2)}B`
                : fmt(totalFunded),
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
                color: "#6B7280",
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

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <input
          type="search"
          placeholder="Search grantee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            fontFamily: BODY,
            fontSize: 13,
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            outline: "none",
            flex: "1 1 220px",
            minWidth: 180,
          }}
        />
        <select
          value={filterNofo}
          onChange={(e) => setFilterNofo(e.target.value)}
          style={{
            fontFamily: BODY,
            fontSize: 13,
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="">All NOFO Rounds</option>
          {nofoOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            fontFamily: BODY,
            fontSize: 13,
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="">All Project Types</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {PROJECT_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "amount" | "name")}
          style={{
            fontFamily: BODY,
            fontSize: 13,
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="amount">Sort: Amount ↓</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
        {(search || filterNofo || filterType) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterNofo("");
              setFilterType("");
            }}
            style={{
              fontFamily: BODY,
              fontSize: 12,
              color: STEEL,
              background: "none",
              border: "1px solid #D1D5DB",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table — rows are filtered client-side but full dataset is in server HTML */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: BODY,
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #111", textAlign: "left" }}>
              {["Grantee", "Award", "NOFO Round", "Project Type", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px 10px 0",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: STEEL,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr
                key={a.id}
                style={{
                  borderBottom: "1px solid #F3F4F6",
                  background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                }}
              >
                <td
                  style={{
                    padding: "12px 12px 12px 0",
                    fontWeight: 500,
                    color: "#111",
                    maxWidth: 340,
                  }}
                >
                  {a.grantee_name}
                </td>
                <td
                  style={{
                    padding: "12px",
                    fontFamily: MONO,
                    fontWeight: 600,
                    fontSize: 13,
                    color: RED,
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(a.award_amount_usd)}
                </td>
                <td
                  style={{
                    padding: "12px",
                    color: STEEL,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.nofo_round || "—"}
                </td>
                <td style={{ padding: "12px", fontSize: 12 }}>
                  {a.project_type ? (
                    <span
                      style={{
                        background:
                          a.project_type === "I"
                            ? "#FEF2F2"
                            : a.project_type === "P"
                              ? "#EFF6FF"
                              : "#F0FDF4",
                        color:
                          a.project_type === "I"
                            ? RED
                            : a.project_type === "P"
                              ? "#1D4ED8"
                              : "#15803D",
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {PROJECT_TYPE_LABELS[a.project_type] ?? a.project_type}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td
                  style={{
                    padding: "12px 0 12px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Link
                    href={`/tribal/awards/${a.slug}`}
                    style={{
                      fontFamily: BODY,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: RED,
                      textDecoration: "none",
                    }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            fontFamily: BODY,
            fontSize: 14,
            color: "#9CA3AF",
            padding: "48px 0",
            textAlign: "center",
          }}
        >
          No awards match your filters.
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          fontFamily: BODY,
          fontSize: 12,
          color: "#9CA3AF",
        }}
      >
        {filtered.length} of {awards.length} awards · Source: NTIA Tribal
        Broadband Connectivity Program
      </div>
    </>
  );
}
