# B13 — NTIA TBCP Round 3 Connectivity Partner Campaign

**Status:** Rebuilt under always-on GTM repair (2026-07-14) · no broad sends  
**Owner:** Konative (AVANT sub-agent)  
**Landing assets:** `/tribal/funding-navigator` (grant lane), `/ntia` + `/tribal` (commercial lane)  
**Hard deadline:** Application window closes **September 17, 2026**  
**Award horizon:** Rolling awards begin **Spring 2027**

---

## 1. Objective

Keep **two lanes clear**:

1. **Grant help** — free Funding Navigator / Tolowa Pacific trust path through Sept 17.
2. **Commercial brokerage** — Konative One-Site Carrier + Renewal Snapshot for operating
   tribal enterprise properties (casino, health, utility, public safety, multi-site).

Do **not** claim TBCP “does not fund the connectivity / operational layer.” The current
NOFO permits infrastructure, backhaul/middle/last mile, leases/IRUs, engineering, network
design, consulting, and related costs — confirm with NTIA. Do not disguise grant outreach
as immediate brokerage demand.

**One-line thesis:** *Grant help and commercial carrier procurement are separate doors.
Konative’s door starts with a cited One-Site Snapshot — suppliers may compensate us; you own the contracts.*

---

## 2. ICP — who we're targeting

Primary commercial ICP: **Tribal enterprise sites with an operational trigger** (renewal,
expansion, resilience, prior-award implementation) — not grants-only applicants.

| Segment | Buying role / first contact | Why they need Konative |
| --- | --- | --- |
| Tribal gaming / hospitality | IT/ops, facilities, procurement, GM | Payments, surveillance, guest Wi-Fi, multi-service uptime |
| Tribal health | CIO / facilities / network | Clinic and multi-site resilience |
| Utilities / public safety | Network/ops leads | Critical communications |
| Multi-site gov / enterprise | IT director, procurement | Carrier portfolio + renewals |
| Prior-award implementers | Broadband + enterprise IT | Implementation-phase commercial circuits |

Grants-only contacts → Tolowa Pacific / Funding Navigator, not Konative commercial sequence.

**Disqualifiers / lower priority:** entities with no intent to apply this round,
or that already have a locked-in incumbent connectivity contract with no renewal
in the R3 execution window (revisit at renewal, don't force it now).

**Trust signal to lead with in every touch:** *vendor-neutral.* Konative is not a
carrier. That neutrality — plus sovereignty awareness and $0 cost — is the whole
pitch.

---

## 3. The offer / value prop to a grantee

What a Tribal applicant gets, at **$0 cost** (suppliers pay Konative's
commission):

1. **Connectivity architecture review** — map the operational connectivity the
   proposed build will require, so it's specified into the proposal instead of
   discovered after award.
2. **Vendor-neutral sourcing** across Avant's 100+ suppliers — the whole market,
   including fixed wireless and satellite where fiber doesn't reach.
3. **Pre-negotiated carrier terms** staged during pre-award, ready to execute the
   moment funding lands.
4. **Sovereignty-aware advisory** — works with the enterprise and grant team, not
   around them; understands the line between an infrastructure grant and the
   operational layer.
5. **Lifecycle management** — one point of contact for every carrier, for the life
   of the account.

The offer is **not** "we'll write your grant." It's "we'll make sure the
connectivity that grant depends on is designed right, sourced neutrally, and
ready to run."

---

## 4. The three-phase motion (against the calendar)

### Phase 1 — Pre-award · NOW → Sept 17, 2026
**Goal:** get specified into as many R3 proposals as possible; build the pipeline.

Concrete actions:
- Build/refresh the target list from the `tbcp_awards` table (see §6) — prioritize
  entities flagged `nofo_round = 'R3'` (or prospective R3) with `outreach_status`
  of `not_started`.
- First-touch outreach (see §5) framed entirely around the **Sept 17 deadline**
  and the infrastructure-vs-operational gap.
- Offer a free **connectivity architecture review** as the meeting hook.
- For engaged applicants: produce a connectivity design brief they can reference
  or attach in their proposal; begin pre-negotiating carrier terms.
- Cadence urgency ramps as the deadline approaches: heaviest push **June–early
  Sept 2026**; final-call sequence in the **two weeks before Sept 17**.

**Exit criterion for a prospect:** connectivity specified into their proposal, or
a signed intent to work together post-award.

### Phase 2 — Award · Spring 2027 (rolling)
**Goal:** convert specified applicants into executed connectivity contracts.

Concrete actions:
- Monitor rolling award announcements; update `outreach_status` and
  `award_amount` on the `tbcp_awards` row as winners are named.
- For winners we engaged pre-award: move pre-negotiated terms from plan to order.
- For winners we did **not** reach pre-award: fast-follow — they now have funding
  and an infrastructure build with no operational connectivity plan.
- Sequence congratulatory + execution outreach the week each award posts.

### Phase 3 — Operations · 2027 and beyond
**Goal:** evergreen residual commission for the life of each account.

Concrete actions:
- Manage the connectivity contracts: billing disputes, moves/adds/changes,
  escalations, renewals.
- Expand within the account (add sites, add services — SD-WAN, voice, security,
  cloud on-ramps).
- Feed operational learnings back into the target model (which entity types,
  which enterprises — casino / clinic / gov / school — convert and expand best).

---

## 5. Outreach sequence outline

Channel mix: **email primary**, LinkedIn for warm-up on named contacts, phone for
engaged prospects. Warm intros through existing Tribal/Avant relationships beat
cold every time — prioritize them.

First-touch email (skeleton — personalize per entity):

> **Subject:** The connectivity TBCP Round 3 won't fund — before Sept 17
>
> Subject: One carrier question for [Property]
>
> [Name] — I saw [sourced trigger]. That usually surfaces a concrete question about
> carrier options, renewals, or redundancy that needs engineering confirmation.
>
> Konative is a vendor-neutral connectivity brokerage and AVANT sub-agent. We can
> prepare a One-Site Carrier + Renewal Snapshot for [property] — no meeting
> required — with public options, renewal questions, and a short next-step tree,
> sources cited. Suppliers may compensate us when you select a provider; you own
> the contracts.
>
> Grant strategy for TBCP Round 3 (closes September 17, 2026) stays on the
> Funding Navigator / Tolowa Pacific path — this note is commercial only.
>
> Would the one-pager be useful, or who owns carrier contracts for [property]?
>
> [link → /tribal] · [snapshot request → /contact#request]

Follow-up cadence (validation campaign only; human-approved):
1. **Day 0** — first touch (above).
2. **Day 4** — restate the trigger + offer snapshot; ask for the contract owner.
3. **Day 9** — one phone attempt where appropriate.
4. **Stop** after two consecutive zero-response batches on a cohort.

Do not restart the old broad architecture-review sequence.

---

## 6. How `tbcp_awards` feeds the campaign

Supabase table `tbcp_awards` is the operational spine of the campaign — it is
both the target list (pre-award) and the conversion tracker (award/ops).

| Field | Campaign use |
| --- | --- |
| `grantee_name` | Primary entity record / dedupe key. |
| `tribe_name` | Segment + personalization; warm-intro routing. |
| `state` | Territory prioritization; regional outreach batching. |
| `award_amount` | Populated at award; sizes the operational-connectivity opportunity (bigger build → bigger recurring layer). |
| `nofo_round` | **Primary filter.** Target `R3` / prospective-R3 rows in Phase 1; historical rounds inform which entities are repeat applicants. |
| `datacenter_potential` | Cross-sell flag — bridges into the data-center connectivity wedge. |
| `casino_present` | High-value enterprise signal — gaming floors need carrier-grade redundancy/security; strongest first-touch example. |
| `edc_present` | Economic development corp present → multi-entity, multi-site expansion potential. |
| `outreach_status` | Campaign state machine: `not_started → contacted → engaged → specified → won → managing` (or `disqualified`). Drives the daily work queue and the follow-up cadence in §5. |

**Working queries (conceptual):**
- Phase 1 queue: `nofo_round = 'R3' AND outreach_status = 'not_started'`, ordered
  by `casino_present DESC, state`.
- Priority tier: rows where `casino_present` **or** `edc_present` is true — larger
  operational footprint, faster payback.
- Cross-sell watchlist: `datacenter_potential = true` → hand to the data-center
  wedge in parallel.
- Award tracking: as winners post, set `award_amount` + advance `outreach_status`;
  Phase 2 fast-follow list = `nofo_round = 'R3' AND outreach_status IN ('contacted','specified') AND award_amount IS NOT NULL`.

Keep `outreach_status` current — it is the single source of truth for what to do
next and for reporting.

---

## 7. Success metrics & hypotheses

Leading indicators (pre-award):
- # R3 targets loaded and contacted (coverage of the eligible universe).
- Meeting/consult rate (connectivity architecture reviews booked).
- # proposals we're **specified into** (the real pre-award KPI).
- # applicants with pre-negotiated carrier terms staged.

Lagging indicators (award → ops):
- Win-attach rate: of applicants we specified into, % that win **and** execute
  connectivity with Konative.
- # connectivity contracts executed post-award.
- Monthly recurring commission (residual) under management.
- Expansion rate: additional sites/services added per account over 12 months.

Hypotheses to test:
- **H1** — Applicants engaged **pre-award** convert to executed connectivity at a
  materially higher rate than winners reached only post-award. (If true, front-load
  spend before Sept 17.)
- **H2** — `casino_present` entities convert fastest and expand most (gaming floors
  have the sharpest need for redundancy/security). (If true, weight the queue on it.)
- **H3** — Vendor-neutral + $0-cost framing out-performs any capability-led message
  in first-touch reply rate. (A/B the first email.)
- **H4** — Warm intros (existing Tribal/Avant relationships) beat cold outreach by
  a wide enough margin to justify prioritizing relationship-sourced targets first.

---

## 8. Risks & watch-items

- **Deadline is fixed.** The pre-award window is the whole game; miss it on a given
  entity and the next real entry point is post-award fast-follow (weaker position).
- **Program details evolve.** The ~$790M figure and the Sept 17, 2026 / Spring 2027
  dates are the current program facts used across the site — verify against the
  latest NTIA guidance before external claims; keep the landing page and this doc in
  sync.
- **Sovereignty sensitivity.** Every touch must respect Tribal jurisdiction and
  governance. Konative advises the enterprise; it does not insert itself into the
  grant application or Tribal decision-making.
- **Neutrality must stay real.** The pitch collapses if Konative is perceived as
  fronting for one carrier. Sourcing must genuinely run the whole Avant portfolio.
