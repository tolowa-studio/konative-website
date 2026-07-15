# Suppression and Duplicate-Send Audit

**Prepared:** 2026-07-14  
**Mode:** Read-only planning. **No** Control, Mailgun, or Twenty suppression mutations from this document.

## Source artifacts (latest planning exports)

| Artifact | Path (tolowa-pacific-website) | Rows |
| --- | --- | --- |
| Control unsubscribe suppressions | `docs/gtm-campaigns/exports/2026-07-09T05-06-26-899Z-control-suppressions.json` | 5 (konative 2, tolowa-pacific 3); reason=`unsubscribe`; source=`unsubscribe_route` |
| Negative (bounce/failure) planning export | `docs/gtm-campaigns/exports/2026-07-09T05-06-27-428Z-control-negative-suppressions.json` | 3 (konative 1, tolowa-pacific 2); reasons bounce×2, delivery_failure×1 |

Next-batch preview tooling already consumes these as `--suppressions` input and reports **8** total suppression emails excluded from planning previews.

## Findings

1. **Unsubscribe ledger is small but real.** Five Control suppressions from the unsubscribe route; brands split 2 Konative / 3 Tolowa Pacific.
2. **Bounce/failure not fully in Control suppression ledger.** Negative export is a **planning-shaped** conversion of activity — “does not mutate Control, Mailgun, or Twenty.” GTM health Priority 1: finish bounce/failure suppression before any expansion.
3. **Tolowa DNC propagation had a Twenty mutation failure** on at least one unsub person (required direct DB repair historically). Re-test `updatePerson(doNotContact=true)` before larger batches.
4. **Duplicate-send risk remains elevated** because prior-send flags and email verification are incomplete on the tribal pool (nearly all `emailVerified=false`). Any new 12-account set must check: Control suppressions, negative export, Mailgun unsub, Twenty DNC, and the historical send CSV for both brands.
5. **Gate bypass already caused over-send relative to canary.** Do not trust “approved flag” alone; hold recommendation must block sending (sender bypass already removed in GTM tooling — keep that invariant).

## Required exclusion set for any future Konative send

Do not send when any is true:

- Present in Control unsubscribe suppressions.
- Present in bounce / soft-bounce / delivery-failure sets (even if only in the planning negative export until promoted).
- Twenty `Do not contact`, unsubscribe, complaint, or hard bounce.
- Prior send within the active campaign sequence without an approved new thread reason.
- Missing role, irrelevant role, unverified/guessed email, or grants-only contact for a commercial pitch.

## Duplicate-send check procedure (manual until automated)

1. Load approved candidate emails.
2. Diff against both suppression JSON exports above (or fresher exports).
3. Diff against MOTION campaign_events for `delivered|failed|complained|unsubscribed` on same address + brand.
4. Diff against Twenty person flags.
5. Only then mark `Approved for outreach`.

## Open actions (need Jeramey approval to execute)

- [ ] Promote bounce/failure rows into Control suppression ledger (live write).
- [ ] Confirm Twenty DNC for every unsubscribe (live write).
- [ ] Re-export suppressions and attach to 12-account packet before any send.
