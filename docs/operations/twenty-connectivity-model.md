# Twenty CRM model for Konative connectivity brokerage

Updated: 2026-07-14 for always-on GTM repair.

**Rule:** Qualify accounts first, roles second, contact data third. Do not enrich every tribal record.

## Account (Company) fields

| Field | Type | Purpose |
|---|---|---|
| Canonical organization name | Text | Dedupe key with domain |
| Primary domain | Text | Work-email verification anchor |
| Tribal relationship | Select | Tribal gov, tribal enterprise, ANC, consortium, partner, none |
| Sovereignty / partner flags | Multi-select | Consent-first, Native-owned partner, association |
| Property / site name | Text | Named location for snapshot |
| Site address | Text | Exact or public address |
| Geography | Text | State / region / market |
| Site type | Select | Casino, clinic, utility, public safety, gov, education, DC, colo, other |
| Vertical | Select | casino/hospitality, health, utility, public safety, government, education, economic development, data center, developer, operator, tenant, partner |
| Prior award program | Text | TBCP/BEAD/etc. |
| Award round / amount / date / status | Text/Currency/Date/Select | Implementation trigger |
| Award source URL | URL | Evidence |
| Active trigger type | Select | renewal, outage, expansion, RFP, migration, award-implementation, facility-announce, route need |
| Trigger observed date | Date | Freshness |
| Trigger source URL | URL | Evidence |
| Trigger confidence | Select | verified, probable, unverified |
| Current carriers / public network facts | Text | Known market facts only |
| Renewal / procurement window | Date or Text | Timing |
| Multi-site / critical-app context | Text | Ops consequence |
| Pathfinder opportunity / conflict / registration / owner | Text | AVANT hygiene |
| Last researched date | Date | Research SLA |
| Human approver | Text | Name who cleared outreach |

## Contact (Person) fields

| Field | Type | Purpose |
|---|---|---|
| Exact job title | Text | As published |
| Normalized function | Select | technical, operations, procurement, finance, executive, grants-only, partner, vendor, irrelevant |
| Seniority | Select | C-level, VP, director, manager, individual, unknown |
| Relationship to site | Text | Owns named property or enterprise network |
| Lane fit | Select | tribal-ops, tribal-funding, data-center, partner, exclude |
| Work email | Email | Required for send queue |
| Verification provider | Text | Prospeo / BetterContact / FullEnrich / manual |
| Verification result | Select | valid, catchall, invalid, unknown, unverified |
| Verification timestamp | DateTime | Freshness |
| Phone + public source | Text/URL | Manual routing path |
| Prior messages / replies / unsubscribes / suppressions / DNC | Rel / flags | Send safety |
| Last contact date | Date | Cadence |
| Confidence | Select | high, medium, low |
| Human approval | Select | researching, ready for review, approved for outreach, hold, do not contact |

## Required opportunity fields

| Field | Type | Purpose |
|---|---|---|
| Konative lane | Select | Tribal, gaming/hospitality, data center, enterprise, travel |
| Campaign | Select | Award-to-operations, resilience, gaming uptime, DC build signal, one-site-snapshot, market-brief, inbound |
| Approval status | Select | Researching, ready for review, approved for outreach, hold, do not contact |
| Connectivity products | Multi-select | DIA, broadband, lit fiber, dark fiber, waves, SD-WAN/SASE, UCaaS, CCaaS, mobility, security, cloud, colo, DCI |
| Current providers | Text | Existing supplier context |
| Contract renewal date | Date | Primary timing trigger |
| Sites | Number | Location count |
| Expected MRC | Currency | Recurring-revenue forecast |
| Expected NRC | Currency | One-time revenue forecast |
| Pathfinder request ID | Text | Quote correlation |
| Install target | Date | Delivery timing |
| Residual start date | Date | Commission activation |
| Artifact type | Select | one-site-snapshot, market-brief, other |
| Artifact status | Select | outlined, delivered, not requested |
| Next action | Text | Required action |
| Next action date | Date | SLA and follow-up |
| Award/program | Text | TBCP/BEAD/public funding context |
| Award source URL | URL | Evidence |
| Research confidence | Select | Verified, probable, unverified |

## Opportunity stages

1. Target
2. Researched
3. Approved for outreach
4. Contacted
5. Qualified
6. Requirements received
7. Quoting
8. Proposal delivered
9. Verbal commit
10. Ordered
11. Installed
12. Residual active
13. Renewal
14. Closed lost

## Send-queue exclusions (hard gate)

No record may enter outbound automation when any is true:

- Missing or irrelevant role (`normalized function` = irrelevant, vendor salesperson, consultant selling into same account, unrelated educator/public-safety scrape, generic persona).
- Unverified or guessed email (`verification result` ≠ valid, unless explicit phone/manual routing and approval).
- Generic inbox unless message is explicitly a routing request.
- Existing suppression, DNC, unsubscribe, complaint, hard bounce, or duplicate-send conflict.
- No account trigger or no reason the named person should care.
- Grants-only contact used for a Konative commercial pitch (route to Tolowa Pacific trust lane instead).

## Automation rules

- New website inquiry creates or updates the person and company, creates an opportunity, assigns an owner, and creates a next-day task.
- A record cannot enter an outbound automation unless approval status is **Approved for outreach** and all hard gates pass.
- Artifact request creates a task to deliver One-Site Snapshot or Market Brief with citations.
- Requirements received creates a Pathfinder sourcing task.
- Proposal delivered creates a three-business-day follow-up.
- Ordered creates installation checkpoints.
- Installed creates residual verification and renewal records.
- Do not contact suppresses every outbound workflow.
- Every inbound or outbound touch records source, campaign, timestamp, owner, disposition, and next action.

## Website webhook mapping

The site sends:

- `source`
- `schemaType`
- `sanityDocumentId`
- `submittedAt`
- validated form `data`

The n8n workflow should:

1. Validate the bearer token.
2. Normalize email, organization, phone, geography, audience, and requirement.
3. Upsert person and company in Twenty.
4. Create or update the opportunity.
5. Link the Sanity intake ID.
6. Assign the correct campaign and owner.
7. Create a follow-up task.
8. Return a success response with the Twenty record IDs.

An importable implementation is checked in at
`docs/operations/n8n/konative-twenty-intake.workflow.json`. Deployment and
safe activation instructions are in the adjacent `README.md`.

## Safe migration plan

See `docs/operations/2026-07-14-twenty-quality-report.md`. Summary: freeze bulk enrichment; add fields above via Controlled schema changes; backfill only for accounts entering the researched buffer (≤30) and the 12-account validation set.
