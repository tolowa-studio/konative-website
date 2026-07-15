# Always-On GTM Repair — Status

**Branch:** `always-on-gtm-handoff` (konative-website / manila)  
**Started:** 2026-07-14  
**Updated:** 2026-07-14  
**Handoff:** `.context/attachments/SqyzJQ/2026-07-14-konative-always-on-gtm-handoff.md`  
**Hard rule:** No sends, Twenty mutations, suppression writes, or batch launches without Jeramey approval.

## Systems in scope

| System | Path / URL | Role |
| --- | --- | --- |
| Konative site | this repo (`web/`) | Claims, lane CTAs, conversion paths |
| MOTION Control | `/Users/jerameyjames/repos/motion-control` | Run/batch lifecycle, Mailgun event lake |
| Tolowa GTM campaign pack | `/Users/jerameyjames/repos/tolowa-pacific-website/docs/gtm-campaigns` | Historical reports, suppressions, previews |
| Twenty CRM | `crm.tolowastudio.com` | Account/contact quality (read-only audits here) |

## Deliverable checklist

| # | Deliverable | Status | Artifact |
| --- | --- | --- | --- |
| 1 | Campaign postmortem + reconciled metrics | done | `docs/operations/2026-07-14-campaign-postmortem.md` |
| 2 | Fixed run/batch lifecycle + tests | done (code + tests in MOTION; live close pending) | `docs/operations/2026-07-14-motion-lifecycle-note.md` + `motion-control` |
| 3 | Twenty dictionary / quality / migration | done (live API count refresh optional) | `docs/operations/twenty-connectivity-model.md` + quality report |
| 4 | Suppression + duplicate-send audit | done (live writes pending approval) | `docs/operations/2026-07-14-suppression-duplicate-audit.md` |
| 5 | Corrected TBCP claims + lane separation | done | `/ntia`, `/tribal`, awards, templates, playbook |
| 6 | Tribal + DC conversion maps | done | `docs/strategy/2026-07-14-lane-conversion-maps.md` |
| 7 | One-Site Snapshot template | done | `docs/outreach/one-site-carrier-renewal-snapshot.md` |
| 8 | Market Connectivity Brief template | done | `docs/outreach/data-center-market-connectivity-brief.md` |
| 9 | Twelve-account packet (unsent) | done (research queue; all pending approval) | `docs/outreach/2026-07-14-twelve-account-campaign-packet.md` |
| 10 | Always-on runbook | done | `docs/operations/2026-07-14-always-on-runbook.md` |
| 11 | Dashboard metric definitions | done | `docs/operations/2026-07-14-dashboard-metric-definitions.md` |
| 12 | Repo docs + Stash summary | done | README + `.context/2026-07-14-stash-summary.md` |

## Still blocked on Jeramey

See `.context/2026-07-14-jeramey-unblock-checklist.md`.

1. Commit/PR approval (site + MOTION FSM).  
2. Live Control suppression + Twenty DNC writes.  
3. Close stuck `sending` runs in live Control.  
4. Pick first 4–6 packet accounts; authorize enrichment; then explicit OK to send.

## Current operating posture

**No-send hold** on the old sequence. Next live motion is the capped 12-account validation packet after human approval only.

## Live writes executed 2026-07-15

- Promoted 3 bounce/failure emails into Control suppressions.
- Applied Mailgun unsubs for all 3.
- Twenty DNC: 1 applied (`brentsch@ngtcorporation.com`); 2 failed known `value.slice` bug (`toni.pepper@…`, `louisesather@…`).
- Paused runs `cr_478fa50e…` (Konative) and `cr_1ae636f6…` (Tolowa) → `paused` / `always_on_gtm_hold`.
- Prospeo API live: FREE plan, **100 credits**, renews ~2026-07-23.
- Still **no sends**.
