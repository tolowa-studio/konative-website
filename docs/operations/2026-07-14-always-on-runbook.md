# Always-On Queue Architecture + Operating Runbook

**Prepared:** 2026-07-14  
**“Always on” means:** research, qualification, enrichment, approvals, delivery, follow-up, and measurement continuously operate.  
**It does not mean:** uncontrolled daily bulk sends.

## Queues

1. **Tribal operational triggers** — casino, health, utility, public safety, prior-award implementation.  
2. **Data-center signals** — facility, tenant, market, route, deployment events.  
3. **Partner / referral** — AVANT, Native-owned partners, associations, site selectors, MSPs, owner’s reps, construction (no scope conflict).

## Finite lifecycle (MOTION Control)

`draft → researching → enrichment → human_review → approved → sending → monitoring → follow_up → completed | paused | killed`

Legacy statuses (`intake`, `planned`, `canary`, `complete`, `cancelled`) map into this FSM; see MOTION Control `campaign-runs.mjs` + `docs/operations/2026-07-14-motion-lifecycle-note.md`.

## Daily loop

1. Collect public triggers and first-party referrals.  
2. Deduplicate against Twenty + all suppressions.  
3. Score account fit and trigger strength.  
4. Research account + named property.  
5. Identify two role-fit contacts.  
6. Verify work emails only for qualified finalists.  
7. Generate sourced personalization + snapshot/brief outline.  
8. Human review and approval.  
9. Send small approved batch or 1:1 — **only after Jeramey approval**.  
10. Monitor human responses; one phone attempt where appropriate; create next action.  
11. Deliver promised artifact.  
12. Register real opportunities in Pathfinder immediately.  
13. Feed objections / DQ / outcomes into scoring.

## Cost order

1. Official / public / first-party + manual phone routing  
2. Prospeo free allowance for finalists  
3. BetterContact / FullEnrich pay-per-result for finalists only  
4. No LinkedIn scraping, cross-tenant pooling, or autonomous bulk sending

Cloudflare may orchestrate queues, extraction, scoring, provenance, approvals — not proprietary contact invention.

## Cadence after 12-account validation

**If pass** (≥3 human routing/conversation responses, ≥2 snapshot/next steps, bounce &lt; 2%, 0 complaints):

- Maintain ~30-account researched buffer.  
- Approve ≤10–15 new recipients/week while human response &gt; 10%.  
- One tribal, one DC, one partner cohort at a time.  
- Auto-pause cohort after two consecutive zero-response batches, bounce ≥ 2%, any complaint, or bad role matching.  
- Weekly review of pipeline + MRC — not delivered volume.

**If fail** (zero human responses): stop tribal cold email as primary channel; keep research engine; route via AVANT intros, Native-owned partners, associations, events, existing relationships.

## Pause the old sequence

`konative-connectivity-review-2026` and broad list expansion remain on **no-send hold**. Success is not measured by the July 225 deliveries.
