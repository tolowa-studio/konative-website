# Twenty CRM quality checklist — Konative send readiness

**Purpose:** Stop another 0-reply blast. Use before any account enters `Approved for outreach`.

## Principle

Account signals first → role fit second → email verification third.  
Never enrich all ~3k tribal records. Never treat scanner clicks as intent.

## Account must have

- [ ] Canonical organization name + domain
- [ ] Lane tagged: DC / Tribal gaming / Tribal enterprise / Round 2 / Partner / Grants-only
- [ ] Named site/property + geography
- [ ] Active trigger type + date + source URL + confidence
- [ ] Warm-path status recorded
- [ ] AVANT conflict / registration status known or marked unknown
- [ ] Last researched date + researcher name

## Contact must have

- [ ] Exact job title
- [ ] Normalized function: technical | operations | procurement | finance | executive
- [ ] Seniority appropriate to decision (director+ preferred; property-level owner OK)
- [ ] LinkedIn title checked within 14 days (or documented phone routing)
- [ ] Work email + verification provider + result + timestamp **or** phone path
- [ ] Not vendor salesperson / consultant selling into same account / irrelevant scrape
- [ ] Not grants-only if this is a Konative commercial queue

## Hard exclusions (any one blocks send)

- Missing or irrelevant role
- `emailVerified=false` with no alternate routing path
- Generic inbox used as primary (unless explicit routing request)
- Suppression / DNC / unsubscribe / hard bounce / complaint
- Duplicate-send conflict (prior Konative or Tolowa Pacific campaign)
- No account trigger / no reason this person should care
- Grants-only contact used for brokerage pitch

## Quality score (quick)

| Score | Meaning | Action |
|---|---|---|
| A | Trigger + site + 2 verified roles + warm path | Prefer send |
| B | Trigger + site + 1–2 roles, email verified, no warm path | Cold residual OK |
| C | Trigger weak or title unverified | Research more |
| F | Any hard exclusion | Do not contact |

## CRM hygiene batch jobs (agent can prep; human approves mutations)

1. Tag all prior campaign recipients with `prior_send=true` + campaign ID  
2. Split `lane=grants_help` vs `lane=brokerage`  
3. Flag missing title / missing company / unverified email  
4. Do **not** mass-delete; quarantine into `hold` / `do_not_contact`  
5. Reconcile MOTION Control run states stuck in `sending`

## Sources of truth

- Twenty CRM: contacts / companies / opportunities  
- MOTION Control: campaign ledger + Mailgun telemetry  
- This repo: `docs/operations/twenty-connectivity-model.md`  
- Plan: `docs/2026-07-15-konative-gtm-reshape-campaign-plan.md`
