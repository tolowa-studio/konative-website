# Konative Tribal + Connectivity Always-On GTM Repair Handoff

**Prepared:** 2026-07-14  
**Receiving agent:** Cursor or another implementation agent working across `konative-website`, Twenty CRM, MOTION Control, and the existing campaign tooling  
**Primary outcome:** repair Konative's targeting, proof, site conversion paths, CRM data, and campaign telemetry; then operate a continuously replenished, human-approved campaign across tribal enterprise and data-center connectivity.

## Read this first

Read `README.md`, `docs/strategy/2026-07-06-two-lane-gtm.md`, `docs/outreach/tribal-connectivity-campaign-drafts.md`, `docs/operations/twenty-connectivity-model.md`, and relevant campaign reports in the Tolowa Pacific campaign repo. Preserve the dirty worktrees. Do not send email, mutate Twenty, change suppressions, launch a batch, or publish outward-facing claims without Jeramey's explicit approval.

“Always on” means research, qualification, enrichment, approvals, delivery, follow-up, and measurement are continuously operating. It does not mean uncontrolled daily bulk sends.

## Mission

Konative has two connected but distinct revenue lanes:

1. **Tribal enterprise connectivity:** casinos, health systems, public safety, utilities, government, education, and multi-site operations buying DIA, transport, SD-WAN/SASE, voice, mobility, cloud connectivity, security, and redundancy.
2. **Data-center connectivity:** operators, developers, enterprises, AI companies, colo tenants, and ecosystem partners needing carrier sourcing, waves, dark fiber, DCI, transit, cross-connects, cloud on-ramps, laterals, and diverse routes.

The site, CRM, campaigns, and proof artifacts must make these lanes clear without conflating free grant help with a commercial connectivity pitch.

## Evidence and current reality

- The live Konative campaign recorded 102 delivered, 1 bounce, 1 unsubscribe, 159 scanner-heavy clicks, and zero real replies, meetings, or opportunities.
- The sibling Tolowa Pacific tribal campaign recorded 123 delivered, 5 bounces, 7 failures, 1 unsubscribe, and zero real replies or meetings.
- Combined: 225 delivered, 6 bounces, 2 unsubscribes, and no human conversion.
- The tribal Twenty pool has 2,961 records with emails, but 1,325 lack a title, 370 lack a company, 2,957 are marked `emailVerified=false`, 766 lack a tribal category, 1,074 are categorized OTHER, and only 18 are categorized BROADBAND.
- The working campaign export had 520 rows; 242 lacked titles. Only 128 broadly matched technical, operations, procurement, or executive roles.
- Of 101 unique actual Konative recipients, 33 lacked titles, only 31 had broadly relevant decision roles, 8 lacked a company, and none were marked verified. The list included obviously irrelevant or corrupt roles.
- MOTION Control campaign runs remain in `sending` and batch/run counters do not consistently reconcile with Mailgun delivery telemetry.
- Click activity is not reliable buyer intent because email-security scanners dominate it.
- TBCP Round 3 closes September 17, 2026. The existing claim that TBCP “does not fund the connectivity layer” is inaccurate and must be removed. The NOFO permits infrastructure, backhaul/middle/last mile, leases/IRUs, engineering, network design, consulting, and related costs.

## Decision already made

Pause expansion of the current sequence. Do not clean all 2,961 contacts or resend the existing offer. Rebuild around account signals, exact role fit, verified work email, a one-site proof artifact, and human approval.

The first active Konative campaign is a capped 12-account validation campaign. That campaign can run immediately as a research and approval queue; sending occurs only after each account passes the gates below.

## Workstream A — repair campaign truth and state

### A1. Reconcile historical runs

Create one authoritative report that joins:

- Campaign run and batch IDs.
- Intended target counts.
- Approved recipients.
- Messages submitted to Mailgun.
- Delivered, delayed, bounced, failed, complained, and unsubscribed events.
- Human replies, routing replies, meetings, snapshots requested, opportunities, and disqualifications.
- Twenty person/company IDs and prior-send status.

Resolve or document why run records remain `sending`, why `sent` can be zero while delivery events exist, and why batch delivered counts do not match rollups.

### A2. Define state transitions

Use a finite campaign lifecycle:

`draft → researching → enrichment → human_review → approved → sending → monitoring → follow_up → completed | paused | killed`

Runs must close automatically only after the monitoring/follow-up window. A campaign with zero replies is not “successful” because messages delivered.

### A3. Measurement rules

- Scanner clicks are diagnostic only, not buyer intent.
- Primary metrics: human positive reply, human routing reply, snapshot request, qualified conversation, Pathfinder registration, and booked/closed MRC.
- Guardrail metrics: bounce rate, failure rate, unsubscribe rate, complaint rate, duplicate-send rate, and suppressed-recipient attempts.
- Every metric needs a clear denominator and event source.

## Workstream B — CRM repair and enrichment schema

Do not enrich every tribal record. Qualify accounts first, roles second, contact data third.

### B1. Account fields

- Canonical organization name and domain.
- Tribal relationship and sovereignty/partner flags.
- Property/site name, address, geography, and site type.
- Vertical: casino/hospitality, health, utility, public safety, government, education, economic development, data center, developer, operator, tenant, partner.
- Prior award program, round, amount, date, status, and source URL.
- Active trigger type, observed date, source URL, and confidence.
- Current carriers or public network facts, if available.
- Renewal/procurement window.
- Multi-site and critical-application context.
- Existing AVANT/Pathfinder opportunity, conflict, registration, and owner.
- Last researched date and human approver.

### B2. Contact fields

- Exact job title and normalized function.
- Seniority and relationship to the relevant site/property.
- Lane: technical, operations, procurement, finance, executive, grants-only, partner, vendor, or irrelevant.
- Work email, verification provider, result, and timestamp.
- Phone and public source/profile.
- Prior messages, replies, unsubscribes, suppressions, DNC, and last-contact date.
- Confidence and human approval.

### B3. Required exclusions

No send when any of these is true:

- Missing or irrelevant role.
- Vendor salesperson, consultant selling into the same account, unrelated educator/public-safety role, or generic scraped persona.
- Unverified or guessed email.
- Generic inbox unless the message is explicitly a routing request.
- Existing suppression, DNC, unsubscribe, complaint, hard bounce, or duplicate-send conflict.
- No account trigger or no reason the named person should care.
- Grants-only contact being used for a Konative commercial pitch.

## Workstream C — lane architecture

### C1. Tribal enterprise lane

Prioritize:

- Casinos and hospitality properties.
- Tribal health systems.
- Utilities and public-safety operations.
- Multi-site government or enterprise networks.
- Previous-round broadband awardees that are now implementing and procuring.

Relevant triggers:

- Contract renewal.
- Outage or documented resilience concern.
- Expansion, new property, renovation, acquisition, or opening.
- RFP/procurement activity.
- Cloud, voice, security, POS, surveillance, guest Wi-Fi, or application migration.
- Prior grant award moving into implementation.

Current TBCP applicants are in an application crunch through September 17. Grant help belongs in the Tolowa Pacific trust lane. Do not disguise grant outreach as immediate Konative brokerage demand.

### C2. Data-center connectivity lane

Prioritize:

- Enterprises and AI companies deploying into colo.
- Regional operators and developers in secondary markets.
- Tenants with a facility, capacity, route, or deployment event.
- Site-selection consultants, owner's representatives, MSPs, construction firms, and other referral partners with no scope conflict.
- Tribal/data-center convergence opportunities only with consent-first, sovereignty-aware positioning.

Relevant triggers:

- New facility, expansion, powered-shell, or tenant announcement.
- RFP or carrier-neutral meet-me-room activity.
- Route, lateral, interconnect, or cloud-on-ramp requirement.
- New region/market entry.
- Public construction, permitting, land, or power milestone.

## Workstream D — offers and proof artifacts

### D1. Tribal/enterprise offer

Replace the 20-minute architecture-review CTA with an asynchronous **One-Site Carrier + Renewal Snapshot**.

The snapshot should contain:

- The site/address and business context.
- Publicly visible carrier/market options.
- Known contract and renewal questions.
- Redundancy and physical-path questions that require engineering confirmation.
- Relevant AVANT supplier categories.
- A short next-step decision tree.
- Clear source citations and confidence labels.

Never claim physical diversity from public carrier names alone. Route diversity requires carrier engineering/LOA confirmation.

### D2. Data-center offer

Use a **Market Connectivity Brief** or **Carrier/Fiber Path Intake**:

- Facility/project and market.
- Known carrier, fiber, cloud-on-ramp, and colo signals.
- Missing facts and engineering questions.
- Candidate supplier categories and procurement sequence.
- Explicitly mark estimates and custom-quote requirements.

The artifact demonstrates research quality before asking for a meeting.

### D3. Economics disclosure

State plainly that Konative operates as an AVANT sub-agent and may be compensated by the selected supplier. Do not call the service “free” without explaining the economics. Confirm current sub-agent, registration, evergreen, and assignability rules before publishing contractual claims.

## Workstream E — site repair and conversion paths

Audit and then build separate, coherent paths for:

### E1. Tribal enterprise

- Clear tribal-enterprise connectivity page.
- Sovereignty and data/contract ownership commitments.
- AVANT/sub-agent economics disclosure.
- Named human/Tolowa story and partner-first posture.
- One-site snapshot offer.
- Use cases for casino, health, utility, public safety, and multi-site operations.
- Routing form with property, address, role, timing, and current concern.

### E2. Tribal funding help

- Keep TBCP/NEGP education separate from the commercial offer.
- Correct all NOFO claims and cite the current official source.
- Route grants-only users to Tolowa Pacific help/nurture.
- Create an ethical bridge after help: implementation, procurement, and operational connectivity only when relevant.

### E3. Data-center connectivity

- Clear pages for enterprise/AI into colo, operators/developers, and referral partners.
- Market brief or path-intake CTA rather than generic “book a call.”
- Evidence-backed market and fiber content with dates, sources, and caveats.
- Pathfinder/SE capability positioned as delivery support, not as unsupported proof that a route exists.

### E4. Instrumentation

For each lane track:

- Landing-page source and account.
- Artifact requested/delivered.
- Human routing or positive response.
- Qualified opportunity and Pathfinder registration.
- MRC, provider, stage, install date, residual start, and closed reason.

## Workstream F — always-on campaign system

The system should maintain three campaign queues:

1. **Tribal operational triggers.** Casino, health, utility, public safety, and prior-award implementation accounts.
2. **Data-center signals.** Facility, tenant, market, route, and deployment events.
3. **Partner/referral.** AVANT, Native-owned partners, associations, site selectors, MSPs, owner's reps, and construction partners.

### Daily operating loop

1. Collect public triggers and first-party referrals.
2. Deduplicate against Twenty and all suppressions.
3. Score account fit and trigger strength.
4. Research the account and relevant property.
5. Identify two role-fit contacts.
6. Verify work emails only for qualified finalists.
7. Generate a sourced personalization fact and proof-artifact outline.
8. Human review and approval.
9. Send a small approved batch or a personal one-to-one message.
10. Monitor human responses, make one phone attempt where appropriate, and create the next action.
11. Deliver the promised artifact.
12. Register real opportunities in Pathfinder immediately.
13. Feed objections, disqualifications, and outcomes back into scoring.

### Cost order

1. Official/public/first-party sources and manual phone routing.
2. Prospeo free allowance for finalists.
3. BetterContact or FullEnrich pay-per-result waterfall only for finalists.
4. No LinkedIn scraping, cross-tenant pooling, or autonomous bulk sending.

Cloudflare can orchestrate research queues, extraction, scoring, provenance, and approvals. It cannot manufacture reliable proprietary contact data.

## Workstream G — immediate 12-account campaign

### Cohorts

- Six tribal operational accounts: casino, health, utility, public safety, or multi-site operations with a documented trigger.
- Six prior-award implementation or data-center accounts with an active procurement/deployment signal.

### Requirements per account

- One authoritative trigger source.
- One named property/site.
- Two role-fit contacts.
- Verified work email or documented phone/manual routing path.
- No prior-send/suppression conflict.
- Draft one-site snapshot or market-brief outline.
- Human approval.

### Message shape

Subject: `One carrier question for [property]`

Body structure:

1. One sourced trigger.
2. One operational consequence or question.
3. Offer the one-page snapshot with no meeting required.
4. Ask whether it is useful or who owns carrier contracts.
5. Plain identity/economics footer and compliant opt-out.

### Pass/fail gate

Pass only if the first 12 accounts produce:

- At least 3 human routing or conversation responses.
- At least 2 snapshot requests or qualified next steps.
- Bounce rate below 2%.
- Zero complaints.

Zero human responses means tribal cold email stops as the primary channel. Move effort to AVANT introductions, Native-owned partners, associations, events, and existing relationships.

## Workstream H — cadence after validation

If the 12-account test passes:

- Maintain a 30-account researched buffer.
- Approve no more than 10–15 new recipients per week until human response remains above 10%.
- Run one tribal operational cohort, one data-center cohort, and one partner cohort at a time.
- Pause a cohort automatically after two consecutive zero-response batches, bounce at or above 2%, any complaint, or evidence of bad role matching.
- Review pipeline and MRC weekly. Do not optimize for delivered volume.

If it fails, keep the research engine running but route opportunities through warm channels rather than forcing cold email.

## Required deliverables

1. Authoritative campaign postmortem and reconciled metrics.
2. Fixed campaign run/batch lifecycle and acceptance tests.
3. Twenty CRM data dictionary, quality report, and safe migration plan.
4. Suppression and duplicate-send audit.
5. Corrected tribal funding claims and lane separation.
6. Tribal-enterprise and data-center site conversion maps.
7. One-Site Carrier + Renewal Snapshot template.
8. Data-Center Market Connectivity Brief template.
9. Twelve-account campaign packet with sources, roles, verification, drafts, and approval status.
10. Always-on queue architecture and operating runbook.
11. Dashboard definitions for human response, artifact request, Pathfinder registration, MRC, and guardrails.
12. Updated repo documentation and Stash summary when complete.

## Definition of done

- Historical campaign numbers reconcile or discrepancies are explicitly explained.
- No campaign remains indefinitely in `sending`.
- Grants-only and commercial-brokerage audiences are separate.
- Bad roles and unverified contacts cannot enter a send queue.
- Site paths and claims match the two-lane strategy.
- Proof artifacts can be generated and delivered with cited evidence.
- The 12-account campaign is approved and ready to launch, but has not been sent without Jeramey's approval.
- A passing campaign can replenish itself from public signals while retaining human control.
- Real opportunities are registered and measured by MRC, not email volume.

## Do not do

- Do not restart the current broad sequence.
- Do not treat clicks as intent.
- Do not enrich all 2,961 records.
- Do not promise grant eligibility, route diversity, carrier availability, savings, or implementation timing without evidence.
- Do not combine Tolowa Pacific grant help and Konative brokerage in one deceptive message.
- Do not send to irrelevant roles, generic scraped personas, or suppressed recipients.
- Do not deploy bespoke campaign code if the existing approved n8n/MOTION Control path can safely support the workflow; repair the shared path first.

