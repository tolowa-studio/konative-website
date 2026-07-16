# Twenty CRM Quality Report + Safe Migration Plan

**Prepared:** 2026-07-14  
**Mode:** Planning from handoff evidence + prior campaign exports. Live Twenty API mutation is **out of scope** until Jeramey approves.

## Snapshot (handoff evidence)

| Slice | Finding |
| --- | --- |
| Tribal pool with emails | 2,961 |
| Missing title | 1,325 |
| Missing company | 370 |
| `emailVerified=false` | 2,957 |
| Missing tribal category | 766 |
| Categorized OTHER | 1,074 |
| Categorized BROADBAND | 18 |
| Working campaign export | 520 rows; 242 lacked titles; ~128 broadly role-fit |
| Actual Konative recipients (unique) | 101; 33 no title; ~31 relevant decision roles; 8 no company; 0 verified |

## Quality verdict

The CRM is a **research raw pool**, not a send-ready list. Treating it as send-ready produced 225 combined deliveries and **zero** human replies.

## Safe migration plan (ordered)

1. **Freeze** — No bulk enrichment of 2,961. No restart of old sequence.
2. **Schema** — Add account/contact fields from `twenty-connectivity-model.md` (triggers, verification, lane fit, artifact status). Prefer additive Twenty fields; avoid destructive renames.
3. **Qualify accounts first** — Build account objects with named site + trigger before touching more contacts.
4. **Roles second** — Two role-fit contacts per approved account; mark others `hold` / `irrelevant`.
5. **Verify third** — Prospeo free allowance → pay-per-result waterfall only for finalists.
6. **Suppressions** — Join Control unsub + negative bounce exports + Twenty DNC before any `Approved for outreach`.
7. **Researched buffer** — Cap at ~30 ready accounts; approve ≤10–15 new recipients/week only after validation pass.
8. **Grants vs commercial** — Grants-only people get Tolowa lane tags, never Konative commercial automation.

## Acceptance for send readiness (per contact)

- Account has trigger URL + named site.
- Title + normalized function in {technical, operations, procurement, finance, executive} (or approved partner).
- Work email verification = valid (or documented phone path).
- Not suppressed / DNC / prior-send conflict.
- Human approver recorded.

## Live audit TODO (requires Twenty API)

When credentials/session available:

```text
Count people with email
Count null title / company
Count emailVerified true/false
Count by tribal category
Count doNotContact / unsubscribed
Sample last-contacted Konative campaign recipients
```

Attach results to this file; do not mutate.
