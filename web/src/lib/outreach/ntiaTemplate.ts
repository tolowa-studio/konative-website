/**
 * NTIA Round 3 first-touch email template.
 *
 * Pure rendering logic, split out from `scripts/ntia-outreach-send.ts` so it is
 * unit-testable without touching Supabase or Mailgun. Personalized first-touch
 * for a TBCP awardee: Konative offers an asynchronous One-Site Carrier +
 * Renewal Snapshot — vendor-neutral, sovereignty-aware, AVANT sub-agent
 * economics disclosed. NTIA Round 3 NOFO deadline: September 17, 2026.
 *
 * Do not claim TBCP "does not fund" operational connectivity. The NOFO permits
 * infrastructure, backhaul/middle/last mile, leases/IRUs, engineering, network
 * design, consulting, and related costs. Grant help belongs in the Tolowa
 * Pacific trust lane; this template is commercial brokerage only.
 */

/** Minimal shape of a `tbcp_awards` row needed to personalize the email. */
export interface TbcpAwardRow {
  grantee_name: string;
  tribe_name: string | null;
  state: string | null;
  award_amount_usd: number | null;
  nofo_round: string | null;
}

export interface RenderedOutreachEmail {
  subject: string;
  html: string;
  text: string;
}

const ROUND3_DEADLINE = "September 17, 2026";

function formatUsd(amount: number | null): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

/** Human-friendly recipient organization name: prefer tribe_name, else grantee_name. */
export function recipientOrgName(row: TbcpAwardRow): string {
  const tribe = (row.tribe_name || "").trim();
  if (tribe) return tribe;
  return (row.grantee_name || "").trim() || "your organization";
}

/**
 * Render the personalized NTIA Round 3 first-touch email for a TBCP award row.
 * Pure function — no I/O. Must never leave an unresolved `{{token}}` in output.
 */
export function renderNtiaRound3Email(row: TbcpAwardRow): RenderedOutreachEmail {
  const org = recipientOrgName(row);
  const state = (row.state || "").trim();
  const stateClause = state ? ` in ${state}` : "";
  const priorAward = formatUsd(row.award_amount_usd);
  const priorRound = (row.nofo_round || "").trim();

  const priorAwardSentence =
    priorAward && priorRound
      ? `We saw ${org} received a ${priorAward} TBCP ${priorRound} award${stateClause} — congratulations on getting that funded.`
      : priorAward
        ? `We saw ${org} received a ${priorAward} TBCP award${stateClause} — congratulations on getting that funded.`
        : `We've been tracking TBCP awardees${stateClause}, and ${org} is on our radar as a Round 3 candidate.`;

  const subject = `One carrier question for ${org}`;

  const text = [
    `Hi there,`,
    ``,
    priorAwardSentence,
    ``,
    `As award work moves into implementation, enterprise sites often still need a clear` +
      ` view of carrier options, renewals, and redundancy questions that require engineering` +
      ` confirmation — separate from grant administration.`,
    ``,
    `Konative is a vendor-neutral connectivity brokerage and AVANT sub-agent. We can prepare` +
      ` a One-Site Carrier + Renewal Snapshot (no meeting required): public carrier options,` +
      ` renewal questions, and a short next-step decision tree with sources cited. Suppliers` +
      ` may compensate us when you select a provider; you own the contracts.`,
    ``,
    `With the NTIA Round 3 window also closing ${ROUND3_DEADLINE}, grant strategy help stays` +
      ` with Tolowa Pacific — this note is only about commercial carrier procurement for` +
      ` operating sites.`,
    ``,
    `Would the one-page snapshot be useful, or who owns carrier contracts for the main site?`,
    ``,
    `— Jeramey James, Konative`,
    `Unsubscribe details are in the compliant footer of the live send.`,
  ].join("\n");

  const html = `
    <p>Hi there,</p>
    <p>${priorAwardSentence}</p>
    <p>As award work moves into implementation, enterprise sites often still need a clear
    view of carrier options, renewals, and redundancy questions that require engineering
    confirmation — separate from grant administration.</p>
    <p><strong>Konative</strong> is a vendor-neutral connectivity brokerage and AVANT sub-agent.
    We can prepare a <strong>One-Site Carrier + Renewal Snapshot</strong> (no meeting required):
    public carrier options, renewal questions, and a short next-step decision tree with sources
    cited. Suppliers may compensate us when you select a provider; you own the contracts.</p>
    <p>With the NTIA Round 3 window also closing <strong>${ROUND3_DEADLINE}</strong>, grant
    strategy help stays with Tolowa Pacific — this note is only about commercial carrier
    procurement for operating sites.</p>
    <p>Would the one-page snapshot be useful, or who owns carrier contracts for the main site?</p>
    <p>— Jeramey James, Konative</p>
  `.trim();

  return { subject, html, text };
}
