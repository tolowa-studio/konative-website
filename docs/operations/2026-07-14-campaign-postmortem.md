# Authoritative Campaign Postmortem — Konative + Tolowa Pacific (as of 2026-07-09)

**Prepared:** 2026-07-14  
**Sources:** MOTION Control campaign aggregates + exact external canary monitor (`2026-07-09T05-06-25-990Z`), GTM health (`19-gtm-health.md`), completion audit, suppression exports.  
**Decision already made:** Pause expansion of the current sequence. Do not treat delivered volume or scanner clicks as success.

## 1. Campaign identities

| Field | Konative | Tolowa Pacific |
| --- | --- | --- |
| Campaign ID | `konative-connectivity-review-2026` | `tolowa-tbcp-round-3-2026` |
| Sending domain | `mg.konative.com` | `mg.tolowapacific.com` |
| Lane | Commercial connectivity brokerage | Grant / funding trust lane |
| Historical offer | Connectivity architecture review | TBCP Round 3 / NEGP grant help |

## 2. Reconciled delivery table

### Control campaign aggregates (authoritative rollup used for totals)

| Metric | Konative | Tolowa Pacific | Combined |
| --- | --- | --- | --- |
| Delivered | 102 | 123 | **225** |
| Clicks (all, mostly scanners) | 153 | 206 | 359 |
| Bounces | 1 | 4 | **5** |
| Complaints | 0 | 0 | **0** |
| Unsubscribes | 1 | 1 | **2** |
| Human replies | 0 | 0 | **0** |
| Meetings | 0 | 0 | **0** |
| Opportunities | 0 | 0 | **0** |

### Exact external-canary view (same monitor file)

| Metric | Konative | Tolowa Pacific | Combined |
| --- | --- | --- | --- |
| Delivered | 101 | 122 | 223 |
| Clicks | 152 | 200 | 352 |
| Bounces | 1 | 4 | 5 |
| Unsubscribes | 1 | 1 | 2 |
| Replies / meetings | 0 / 0 | 0 / 0 | 0 / 0 |

**Discrepancy A — +2 delivered (225 vs 223):** Control `control_campaign_aggregates` is 2 messages ahead of `exact_external_canary.totals`. Treat **225 delivered** as the Control ledger total and **223** as the canary-scoped subset. Document rather than force-fit; likely late delivery events or events outside the exact-canary filter.

**Discrepancy B — “Expected canary 50” vs 223+ delivered:** Intended external canary was **50** (25 per brand). While the post-canary gate was still `hold`, additional next-batch sends went out (~100 Tolowa + ~76 Konative per coordination notes). Gate recommendation remaining: **hold**. Sender bypass since removed.

**Discrepancy C — Clicks as intent:** 352–359 click events on ~223–225 delivered messages. Monitor warning: likely security-scanner activity. **Clicks are diagnostic only, not buyer intent.**

## 3. Human conversion (primary outcome)

| Outcome | Count | Denominator | Result |
| --- | --- | --- | --- |
| Human positive reply | 0 | 225 delivered | 0% |
| Human routing reply | 0 | 225 delivered | 0% |
| Meeting booked | 0 | 225 delivered | 0% |
| Snapshot / artifact request | 0 | 225 delivered | 0% |
| Pathfinder registration | 0 | n/a | none |
| Closed MRC | 0 | n/a | none |

**Verdict:** Combined campaign produced **zero human conversion**. Delivered ≠ successful.

## 4. Guardrail metrics

| Guardrail | Value | Notes |
| --- | --- | --- |
| Bounce rate | 5 / 225 ≈ **2.2%** | At/above the 2% pause threshold for expansion |
| Complaint rate | 0 / 225 = **0%** | Pass |
| Unsubscribe rate | 2 / 225 ≈ **0.9%** | Acceptable but relevant |
| Duplicate-send | Not fully quantified in export | Prior-send status poorly marked in CRM; see quality report |
| Suppressed-recipient attempts | Preview tooling excludes unsub + negative exports | Keep required for any future batch |

## 5. List quality (why conversion failed upstream)

From handoff + working export analysis (not re-sliced here):

- Tribal Twenty pool: **2,961** with emails; **2,957** `emailVerified=false`; many missing titles/companies; few BROADBAND-tagged.
- Working campaign export (~520 rows): **242** lacked titles; only **~128** broadly matched tech/ops/procurement/exec roles.
- Of **101 unique Konative recipients:** 33 lacked titles; only ~31 broadly relevant decision roles; 8 lacked company; none marked verified; irrelevant/corrupt roles present.

**Root cause (primary):** Wrong accounts and roles + unverified emails, not merely “copy didn’t convert.” Secondary: offer was meeting-first architecture review without an asynchronous proof artifact.

## 6. Run / batch state problems

Observed in Control + GTM tooling:

1. Runs can remain **`sending`** after Mailgun has already delivered.
2. Batch `sent_count` can lag or stay **0** while `campaign_events` show deliveries (event lake vs batch counters not always reconciled).
3. Rollups from different filters (exact canary vs full campaign aggregates) disagree by small deltas without an ownership note.
4. Gate `hold` did not prevent a real next-batch send (bypass since removed).

**Repair direction:** Finite lifecycle in MOTION Control (see lifecycle note + `campaign-runs.mjs` status expansion), automatic transition `sending → monitoring` when deliveries land, and `completed` only after monitoring/follow-up window — never “success because delivered.”

## 7. What must not happen next

- Do not restart the broad `konative-connectivity-review-2026` sequence.
- Do not optimize for delivered volume or clicks.
- Do not enrich all 2,961 contacts.
- Do not send until each account clears: trigger, named site, two role-fit contacts, verified work email or phone path, suppression clear, human approval.

## 8. Replacement motion

Cap **12-account validation campaign** (6 tribal ops + 6 prior-award/DC), artifact = One-Site Carrier + Renewal Snapshot / Market Connectivity Brief, message shape from handoff G. Packet is prepared separately; **not sent without Jeramey approval.**

Pass gate (for the validation set only): ≥3 human routing/conversation responses, ≥2 snapshot requests or qualified next steps, bounce &lt; 2%, zero complaints. Zero human responses → stop tribal cold email as primary channel.
