# MOTION Control Lifecycle Note — Always-On FSM

**Prepared:** 2026-07-14  
**Repo:** `/Users/jerameyjames/repos/motion-control`  
**Code:** `src/campaign-runs.mjs` (`RUN_STATUSES`, `canonicalizeRunStatus`, `recommendRunTransition`)

## Canonical statuses

`draft → researching → enrichment → human_review → approved → sending → monitoring → follow_up → completed | paused | killed`

## Legacy aliases (still accepted)

| Legacy | Canonical |
| --- | --- |
| intake | draft |
| planned | approved |
| canary | sending |
| complete | completed |
| cancelled | killed |

## Why runs stayed in `sending`

1. Batch counters (`sent_count`) were not always reconciled when Mailgun events arrived in `campaign_events`.  
2. No automatic transition helper pushed `sending → monitoring` after deliveries.  
3. Exact-canary vs aggregate filters created “delivery exists but run looks open” confusion.

## Repair shipped in this pass

- Expanded accepted statuses to the always-on FSM.  
- Added `recommendRunTransition` for remediator/agents.  
- Terminal query ignores `completed` and `killed` as well as legacy `complete`/`cancelled`.  
- Tests cover canonicalize + transitions + create with `researching`.

## Operator follow-up (needs live Control + Jeramey ack)

1. List runs with `status=sending` older than monitoring window.  
2. For each, join Mailgun delivered counts; if deliveries &gt; 0 and window elapsed → set `monitoring` or `follow_up` / `completed` via Control API — **not** from this website workspace alone.  
3. Mark the July over-send campaigns `paused` or `killed` for expansion; validation campaign gets a **new** `campaign_id` (`konative-one-site-snapshot-validation-2026`).
