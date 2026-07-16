# Konative GTM Reshape — Campaign Plan

**Date:** 2026-07-15  
**Status:** RESHAPE locked (roast + STORM)  
**Owner:** Jeramey / Konative (AVANT sub-agent)  
**Do not:** send email, mutate Twenty, launch batches without Jeramey approval

---

## Verdict

**RESHAPE (confidence: medium-high)**

Keep the research engine (triggers → verified roles → proof artifact → human approval).  
**Invert the first touch:** warm path first (AVANT / T4DevCo / WestPorch / tribal relationships / associations). Cold email + LinkedIn only when no warm path exists after a real search.

Cold email is not dead. It is demoted from primary acquisition engine to residual channel. The prior 225-delivered / 0-reply failure was not “need Clay” — it was wrong channel × wrong trust × bad roles × wrong offer timing.

---

## Buyer stack (locked 2026-07-15)

| Priority | Buyer | Why they need Konative | Channel bias |
|---|---|---|---|
| **P0** | Data center under construction needing multi-tier connectivity (laterals, waves, DIA, DCI, cloud on-ramps, diversity) | Fiber is schedule-critical; “nearby” ≠ deliverable; 12–24 mo laterals punish late engagement | Warm via AVANT SE / T4 / WestPorch / GC; cold only if site-specific |
| **P1** | Tribal enterprise — gaming/hospitality + tribal government/ops (WAN, DIA, SD-WAN, voice, security, multi-site) | Commercial MRC; renewals; uptime; multi-vendor resilience | Warm / peer / TribalNet; cold only with property-specific fact |
| **P1b** | Prior NTIA TBCP Round 2 awardees who may/may not have procured operational connectivity | Award ≠ circuit shopping; drawdown still low (~6%); need account-level check for enterprise layer beside the build | Research first; warm preferred; grant help stays Tolowa Pacific |
| **P2** | Tribal health / utility / public safety with documented trigger | Same brokerage motion as P1 when trigger is real | Trigger-gated |
| **Out** | TBCP Round 3 applicants in application crunch; grants-only contacts; hyperscalers buying IRUs direct; unverified/scraped personas | Wrong lane, wrong economics, or unreachable via broker residual | Do not put in Konative send queue |

**Positioning sentence:** Konative is the vendor-neutral connectivity broker (AVANT sub-agent) for data centers being built and tribal enterprises that need multi-carrier options without captive AE pressure.

---

## What the data already told us

| Fact | Implication |
|---|---|
| 102 Konative + 123 Tolowa Pacific delivered → **0 human replies** | Channel/offer/list failed; do not scale |
| Only ~31/101 recipients had relevant decision roles | Role fit before enrichment spend |
| ~2,961 tribal emails; almost none `emailVerified`; 1,325 missing titles | Do **not** enrich the whole CRM |
| Round 2 drawdown still early | Round 2 ≠ automatic brokerage pipeline; qualify implementation stage |
| Scanner clicks dominated | Clicks ≠ intent |
| AVANT Jul 8: Chip SE bench, Pathfinder, colo templates, Berkeley channel | Warm path exists — use it |

---

## Campaign architecture (three queues)

### Queue 1 — DC under construction (primary revenue)

**Signal sources (free / near-free):**
- County building permits / large-load interconnection queues
- Public press: powered shell, colo expansion, tenant LOI
- PeeringDB facility adds
- T4DevCo / WestPorch / SiteIQ pipeline (pre-public — highest value)
- AVANT colo/connectivity SE intros (Berkeley, Chip)

**Offer:** Market Connectivity Brief / Carrier–Fiber Path Intake  
Address-specific: on-net vs near-net, lateral risk, diversity questions, Pathfinder shortlist. No meeting required for first artifact.

**Success metric:** Pathfinder opportunity registered + SE engaged, not “email delivered.”

### Queue 2 — Tribal enterprise (gaming + ops)

**Signal sources:**
- Casino expansion / renovation / new property
- Contract renewal windows (when known)
- Multi-site WAN / POS / surveillance / guest Wi-Fi migrations
- Existing relationships (CTUIR, Synergy orbit, peers)

**Offer:** One-Site Carrier + Renewal Snapshot  
Property-named. Sovereignty + economics disclosure. Ask who owns carrier contracts.

### Queue 3 — Round 2 awardees (research-gated)

**Process:**
1. Pull Round 2 list from NTIA award recipients + Konative `tbcp_awards` D1.
2. Score each: infrastructure vs adoption award; drawdown stage; casino/enterprise sites present; known IT/ops contact.
3. Only advance if there is a **named property** and a **commercial connectivity question** (enterprise layer), not “congrats on your grant.”
4. Prefer warm intro; if cold, use award-to-operations copy — never grant-admin pitch.

Grant help / navigator / R3 deadline → **Tolowa Pacific trust lane only.**

---

## Channel mix (post-RESHAPE)

```
For each account:
  1. Warm-path search (AVANT / T4 / WestPorch / tribal peer / association)
  2. If warm path found → first touch via that path + artifact
  3. Else → LinkedIn connect/note + short plain-text email (same artifact offer)
  4. One phone attempt where number is real
  5. Register Pathfinder when address + contact exist
  6. Human approval before any external send
```

**LinkedIn role:** relationship open + title verification (mandatory manual check). Not scraping. Not automation spam.

**Email role:** follow-up and artifact delivery after signal, or cold residual when warm fails.

---

## Clay alternative stack ($0–30)

Do not buy Clay. Orchestrate yourself:

| Layer | Tool | Cost | Use |
|---|---|---|---|
| Account discovery | Public permits, NTIA awards, PeeringDB, press, Konative GIS/D1 | $0 | Build account queue |
| Role / org chart | LinkedIn (manual) + company site | $0 | Title verification |
| Email find (finalists only) | Prospeo free tier (~75/mo) or Hunter free | $0 | After role confirmed |
| Waterfall (if needed) | BetterContact (~$15/mo, pay on hit) or FullEnrich | ≤$30 | Only approved finalists |
| Agent orchestration | Cloudflare Workers + n8n + existing MOTION Control | Existing | Queues, provenance, approval |
| Optional later | Deepline BYOK (CLI) if agent volume grows | Provider cost only | Replace Clay tables |

**Cost order (unchanged):** public/manual → Prospeo free → BetterContact pay-per-result → never bulk enrich Twenty.

---

## 12-account validation (reshaped)

### Mix

- **6 DC under construction** (pre-RFS / dry-utility / design stage preferred)
- **4 tribal enterprise** (gaming property or multi-site ops with trigger)
- **2 Round 2 awardees** with verified enterprise/connectivity question (not grant spray)

### Per-account gates (all required)

- [ ] Authoritative trigger + source URL + date
- [ ] Named site/property/address
- [ ] Warm-path status: found / none (document search)
- [ ] Two role-fit contacts + LinkedIn-verified titles
- [ ] Work email verified **or** documented phone/manual routing
- [ ] No prior-send / suppression conflict
- [ ] Draft artifact outline (snapshot or market brief)
- [ ] Human approval

### Message shape (cold residual only)

**Subject:** `One carrier question for [property / site]`

1. One sourced trigger  
2. One operational consequence  
3. Offer one-page artifact (no meeting required)  
4. Ask if useful / who owns carrier contracts  
5. Identity + AVANT economics footer + opt-out  

### Pass / fail (unchanged bar, warmer path)

| Result | Action |
|---|---|
| ≥3 human routing/conversation replies **and** ≥2 artifact requests | Pass → 30-account buffer, ≤10–15 new recipients/week |
| Warm paths convert, cold residual does not | Keep warm-primary; cold stays residual |
| Zero human responses after warm-first attempt | Stop tribal/DC cold as primary; double down AVANT intros, partners, TribalNet Sept 20–24 |

---

## Autonomy map — what the agent can do vs needs you

| Work | Agent (autonomous) | Needs Jeramey |
|---|---|---|
| CRM quality report design + scoring rules | Yes | — |
| Round 2 / DC signal research briefs | Yes | — |
| 12-account packet drafts + artifact outlines | Yes | Approve |
| Message drafts (email + LinkedIn) | Yes | Approve |
| Suppression / prior-send audit checklist | Yes | — |
| Snapshot / market-brief templates | Yes | — |
| Notion / Stash / repo docs | Yes | — |
| Enrichment API calls (Prospeo etc.) | Only after finalist lock | Approve spend |
| Twenty mutations / Mailgun sends | **Never without approval** | Explicit yes |
| AVANT Pathfinder registration | Prep packet | You / SE |
| Warm intros (Berkeley, Chip, Terry, Synergy, CTUIR) | Draft asks | You send / call |
| TribalNet Dallas registration / travel | Prep materials | You |

---

## 48-hour cheapest test (roast)

1. Lock 12 account names (even if contacts incomplete).  
2. For each: find **one** warm path in ≤20 minutes (AVANT check, T4/WestPorch, existing relationship, association).  
3. First touch through warm path only — zero new tooling spend.  
4. If ≥3/12 respond → warm-first is the motion.  
5. Only then draft cold residual for the remainder.

---

## 30-day operating cadence

| Days | Focus |
|---|---|
| 1–3 | Freeze old sequences; reconcile Mailgun vs MOTION Control; suppress prior recipients; split grant vs brokerage audiences in Twenty |
| 4–7 | Build 30 trigger-backed accounts; warm-path map; 12 packet ready for approval |
| 8–14 | Run 12-account validation (warm-first) |
| 15–21 | Deliver artifacts; register Pathfinder; ask Berkeley/Chip for SE intros on live opps |
| 22–30 | Expand only if pass bar hit; otherwise partner/event mode; prep TribalNet |

**Weekly KPIs:** Pathfinder opps registered, human replies, artifacts delivered, MRC pipeline — not delivered volume.

---

## CRM repair (do not boil the ocean)

Qualify accounts first → roles second → verify email third.

**Send-blocking exclusions:** missing/irrelevant role; vendor sellers; unverified email; generic inbox (unless routing ask); suppression/DNC; no trigger; grants-only used for commercial pitch.

Full field schema: `docs/operations/twenty-connectivity-model.md` + handoff Workstream B.

---

## Storm synthesis (60 seconds)

DC under construction is the best near-term residual wedge if you reach facility/network buyers with site-specific deliverability proof — not hyperscalers. Tribal enterprise gaming/ops is commercial and real. Round 2 is a long implementation funnel, not a spray list. Cold email alone will not create brokerage trust; warm graph + Pathfinder artifacts will. Clay is unnecessary at n=12–50 if public signals + manual LinkedIn + Prospeo/BetterContact finalists are used.

**Assumption this plan rests on:** AVANT SE bench and T4/WestPorch adjacency can be activated for warm intros within two weeks. If that graph is cold, escalate to Jeramey before another cold blast.

**Missing lens (optional v-next):** direct competitor teardown of UPSTACK / Lightyear / local telecom agents in secondary DC markets.

---

## Roast lens scores

Contrarian 4 · Expansionist 7 · First-principles 6 · Deep researcher 7 · Buyer 3  
**Verdict: RESHAPE**

---

## Next actions (ordered)

1. Approve this RESHAPE plan.  
2. Agent continues: 12-account research packet + snapshot templates + CRM quality checklist (no sends).  
3. Jeramey: text/email Berkeley + Chip — “12 validation accounts; need warm SE check / intro path.”  
4. Jeramey: ask Terry/Scott which SiteIQ / T4 sites need connectivity quoting now.  
5. After 12 packets ready → human approval → send.
