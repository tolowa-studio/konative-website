import { PitchSection } from "@/components/marketing/PitchLayout";
import {
  type TbcpSummary,
  formatUsdCompact,
} from "@/lib/data/tbcp";

const RED = "#C8001F";
const TEXT = "#111111";
const STEEL = "#374151";
const MUTED = "#6B7280";
const DIVIDER = "#E5E7EB";
const DISPLAY = '"Barlow Condensed", sans-serif';
const BODY = "Inter, sans-serif";
const MONO = '"JetBrains Mono", monospace';

export interface TbcpIntelligenceProps {
  summary: TbcpSummary | null;
  /** Section background — defaults to the light surface. */
  background?: string;
}

/**
 * Credibility / intelligence artifact: renders the real, aggregated NTIA TBCP
 * Round 1–2 award data pulled from Supabase (`getTbcpSummary`).
 *
 * If `summary` is null (Supabase unreachable / static no-network build), this
 * renders nothing — no broken empty state. Numbers are never hardcoded; they
 * flow entirely from the live query result passed in.
 *
 * On light surfaces the section frames the brokerage thesis: awards create
 * implementation and procurement work; Konative brokers vendor-neutral
 * enterprise carrier options for operating sites.
 */
export default function TbcpIntelligence({
  summary,
  background = "#F9FAFB",
}: TbcpIntelligenceProps) {
  if (!summary || summary.totalAwards === 0) return null;

  const {
    totalAwards,
    totalUsd,
    distinctStates,
    topStatesByUsd,
    roundSplit,
  } = summary;

  const stats: { value: string; label: string }[] = [
    { value: formatUsdCompact(totalUsd), label: "Awarded, Round 1–2" },
    { value: totalAwards.toLocaleString("en-US"), label: "Grant awards" },
    { value: String(distinctStates), label: "States reached" },
    {
      value: `${roundSplit.round1.count} / ${roundSplit.round2.count}`,
      label: "Round 1 / Round 2 awards",
    },
  ];

  const maxUsd = Math.max(...topStatesByUsd.map((s) => s.totalUsd), 1);

  return (
    <PitchSection
      eyebrow="The Data · NTIA TBCP Round 1–2"
      heading={`Where ${formatUsdCompact(totalUsd)} in TBCP Round 1–2 has already landed`}
      background={background}
    >
      <p
        style={{
          fontFamily: BODY,
          fontSize: 17,
          lineHeight: 1.75,
          color: MUTED,
          maxWidth: 780,
          marginBottom: 40,
        }}
      >
        We track every NTIA Tribal Broadband Connectivity Program award —{" "}
        <strong style={{ color: TEXT }}>
          {totalAwards.toLocaleString("en-US")} grants worth{" "}
          {formatUsdCompact(totalUsd)}
        </strong>{" "}
        across {distinctStates} states in Rounds 1 and 2. TBCP can fund
        infrastructure, backhaul, middle/last mile, leases/IRUs, engineering, and
        related design work (confirm against the current NOFO). Konative brokers{" "}
        <strong style={{ color: TEXT }}>vendor-neutral enterprise carrier
        procurement</strong> for casinos, health, government, and multi-site ops —
        with sources cited and supplier economics disclosed.
      </p>

      {/* Stat band */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 1,
          background: DIVIDER,
          border: `1px solid ${DIVIDER}`,
          marginBottom: 48,
        }}
      >
        {stats.map((s, i) => (
          <div key={i} style={{ background: "#fff", padding: "30px 28px" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 42,
                color: RED,
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.02em",
                color: STEEL,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Top states by dollars — horizontal bars */}
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: STEEL,
          marginBottom: 20,
        }}
      >
        Top states by award dollars
      </div>
      <div style={{ display: "grid", gap: 14, maxWidth: 820 }}>
        {topStatesByUsd.map((s) => {
          const pct = Math.max((s.totalUsd / maxUsd) * 100, 2);
          return (
            <div
              key={s.state}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 128px",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT,
                }}
              >
                {s.state}
              </div>
              <div
                style={{
                  position: "relative",
                  height: 22,
                  background: "#fff",
                  border: `1px solid ${DIVIDER}`,
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${pct}%`,
                    background: RED,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: STEEL,
                  textAlign: "right",
                }}
              >
                {formatUsdCompact(s.totalUsd)}
                <span style={{ color: MUTED }}>{`  · ${s.count}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontFamily: BODY,
          fontSize: 11,
          lineHeight: 1.6,
          color: MUTED,
          marginTop: 28,
        }}
      >
        Source: NTIA Tribal Broadband Connectivity Program award data (Rounds 1 &amp;
        2), aggregated live from Konative&apos;s intelligence dataset. Award-count and
        dollar figures reflect the records currently tracked.
      </p>
    </PitchSection>
  );
}
