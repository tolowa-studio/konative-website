# Dashboard Metric Definitions — Always-On Konative GTM

**Prepared:** 2026-07-14  
**Principle:** A campaign with zero human replies is not successful because messages delivered.

## Primary metrics (optimize these)

| Metric | Definition | Event source | Denominator |
| --- | --- | --- | --- |
| Human positive reply | Prospect expresses interest in the offer or conversation | Inbox / CRM disposition tagged `human_positive` (not auto-reply) | Messages delivered (unique recipients) |
| Human routing reply | Prospect names the right owner or forwards internally | Same, tagged `human_routing` | Messages delivered |
| Snapshot / brief request | Prospect asks for the promised one-pager (or form submission for artifact) | CRM + site form `schemaType` / campaign tag | Recipients contacted |
| Qualified conversation | Live call or substantive email thread confirming site, timing, and owner | CRM opportunity stage ≥ Qualified | Recipients contacted |
| Pathfinder registration | Opportunity registered in AVANT Pathfinder with ID stored | Twenty `Pathfinder request ID` | Qualified conversations |
| Booked / closed MRC | Monthly recurring revenue under management | Twenty expected/actual MRC + residual start | Opportunities |

## Guardrail metrics (pause rules)

| Metric | Definition | Event source | Denominator | Pause if |
| --- | --- | --- | --- | --- |
| Bounce rate | Hard + soft bounces attributed to batch | Mailgun → Control `campaign_events` | Messages submitted / accepted by Mailgun | ≥ 2% |
| Failure rate | Permanent delivery failures | Mailgun failed events | Submitted | Material rise vs prior batch |
| Unsubscribe rate | Explicit unsub | Mailgun unsub + site route | Delivered | Rising trend; investigate at ≥ 2% |
| Complaint rate | Spam complaints | Mailgun complained | Delivered | **Any** complaint |
| Duplicate-send rate | Same email contacted again while prior-send / suppression active | Control suppressions + send ledger | Recipients in batch | Any duplicate in approved batch |
| Suppressed-recipient attempts | Preview/send tried a suppressed address | Preview dry-run vs suppression exports | Preview set | Any attempt that would have sent |

## Diagnostic-only (do not optimize)

| Metric | Why diagnostic |
| --- | --- |
| Click rate | Email-security scanners dominate (352 clicks / 223 delivered in July canary monitor). |
| Open rate | Same scanner noise; unreliable for tribal enterprise. |
| Delivered count | Necessary hygiene, not a success metric. |

## Lifecycle window

- **Sending window:** messages accepted by Mailgun for an approved batch.
- **Monitoring window:** minimum **24 hours** after last message in batch (canary rule from GTM tooling); prefer **7 / 14 day** human-response reads for validation and expansion.
- **Follow-up window:** one phone attempt where appropriate + promised artifact delivery SLA.
- Runs close to `completed` or `killed` only after monitoring/follow-up — never while still awaiting the observation window.

## Always-on scoreboard (weekly)

1. Human response rate (positive + routing) on approved sends in the last 14 days.
2. Artifact requests fulfilled.
3. Pathfinder registrations.
4. MRC under management (and residual start dates).
5. Guardrail red flags (bounce/complaint/duplicate).
