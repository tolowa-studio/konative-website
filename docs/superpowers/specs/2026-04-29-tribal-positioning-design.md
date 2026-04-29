# Konative Audience Positioning, Monetization, and GTM — Design Spec

**Date:** 2026-04-29
**Owner:** Jeramey James
**Trigger:** Jerry Borland (Workday, tribal practice) needs a clear, shareable artifact that explains *why* a tribal nation should care about Konative. Broader insight: every audience type (tribes, investors, landowners, utilities, EPCs, operators, advisors) needs the same clarity in their own language. Konative's monetization story also needs to move from "commission on big deals" to a layered, recurring revenue base.

## Goals

1. Give Jerry — and ambassadors like him — a single URL on konative.com that explains the tribal value proposition at a glance, with no PDF required.
2. Build a repeatable architecture so the same treatment can be cloned for every other audience without re-architecting the site.
3. Establish a public-facing partner/platform page that pitches sponsors, members, and partners on plugging into Konative.
4. Capture the internal monetization strategy in Notion so the founder has one source of truth on how the business actually compounds.
5. Sketch a GTM motion that turns ambassadors into a distribution channel.

## Non-Goals

- Redesigning the homepage or changing the existing Project Readiness Review CTA. The audience pages funnel *into* that CTA; they do not replace it.
- Building a paywall, login, or data-subscription product in this spec. Those are downstream of the monetization strategy and get their own specs later.
- Writing final marketing copy. This spec defines structure, content blocks, and the canonical message per audience. Copy polish happens during implementation.
- Producing PDF assets. Each audience page *is* the doc; print-stylesheet/export-to-PDF is a future enhancement.

## Strategic Spine

The lead value proposition (decided during brainstorming):

> **Land + power monetization.** "You already have the two scarcest assets in the AI buildout — land and interconnect rights. Konative is how you turn them into a credible, financeable data center project, fast."

Supporting notes per audience:

- **Sovereignty / self-determination** is the implicit foundation for tribal audiences — assumed, not sold.
- **Economic development / non-gaming revenue** educates audiences who don't yet know what building a data center means or costs.
- **Clearinghouse / one front door** is the *verb* — the action of using Konative across all audiences.

## Part 1 — Audience Router (`/for/<audience>`)

### Architecture

A new top-level route `/for` acts as an audience hub. Each audience has its own page at `/for/<slug>`. All pages share the same skeleton; only copy, imagery, and numbers vary.

```
/for                         → audience hub, tile grid
/for/tribes                  → ships first (Jerry's deliverable)
/for/advisors                → for ambassadors like Jerry himself
/for/investors
/for/landowners
/for/utilities
/for/developers-epcs
/for/operators               → hyperscalers, colos
```

Coverage, not weight, drives launch order. Every audience page must be solid before any audience page is promoted publicly. Tribes ships first because Jerry has an active need.

### Page Skeleton (shared template)

Every `/for/<audience>` page contains exactly these sections, in this order:

1. **Hero** — audience-specific headline that names the audience and the outcome. Subhead anchors on land + power monetization, reframed for that audience. Single primary CTA (audience-appropriate variant of "Request a Project Readiness Review").
2. **Why Now** — the urgency, framed in that audience's language (capital, demand, power constraints, supply chain windows).
3. **What You Already Have** — names the audience's existing assets/leverage and how Konative converts them into project momentum. This is where the C-lead value prop lands hardest.
4. **What Konative Does For You** — 4–6 capability bands rewritten for the audience (e.g., for tribes: site path, power path, capital + structure, sovereignty-preserving deal terms, IDC governance fit, indigenous procurement; for utilities: interconnect prequalification, load forecasting, anchor offtake, regulatory packaging).
5. **First Engagement** — what the first 60–90 days look like for that audience. Concrete deliverables. Engagement-based pricing posture (no fixed dollar figures on public pages).
6. **Trust Layer** — credentials, geography, anonymized example, indigenous + Canadian + rural specialization where relevant.
7. **Adjacent Audiences** — small footer-style block: "Are you actually a [investor / landowner / utility]? See the page for you." Encourages self-selection.
8. **Final CTA** — repeated CTA band.

### Tribal Page (`/for/tribes`) — the lead deliverable

Specific content commitments beyond the shared skeleton:

- **Hero:** Headline leads with land + power conversion; subhead names sovereignty and IDC fit explicitly.
- **Why Now:** Three beats — AI infrastructure demand, power constraint, the closing window for tribes to participate as principals rather than lessees.
- **What You Already Have:** Land base, treaty/jurisdictional standing, energy rights, existing utility relationships, IDC structures, federal program alignment (US: NCAI, Treasury CDFI, DOE Loan Programs Office; Canada: CCAB, ISC, Indigenous Loan Guarantee).
- **What Konative Does For You:** Site path, power + interconnect path, modular DC strategy, capital structuring that preserves sovereignty, IDC governance integration, indigenous procurement, partner curation, US/Canada cross-border literacy.
- **First Engagement:** Project Readiness Review tailored to tribal council and IDC review cycles; includes a sovereignty-preservation review and a phased decision framework.
- **Trust Layer:** Geography (Canada + rural + indigenous specialization), founder credentials, anonymized engagement example, alignment with tribal procurement norms.
- **Adjacent CTA:** Pointer to `/for/advisors` for Jerry-style introducers.
- **Future content (post-launch, not blocking):** anonymized opportunity index ("Tribal DC Opportunity Index"), partner directory filtered to indigenous-friendly vendors, a tribal membership signup form.

### Advisors Page (`/for/advisors`) — the Jerry persona

Critical to GTM. This is where someone like Jerry self-identifies and signs up to introduce clients. Beyond the shared skeleton:

- **Hero:** "You know who needs this. We make it easy to introduce them."
- **What You Already Have:** Trust, relationships, credibility inside a community Konative does not have.
- **What Konative Does For You:** Co-branded one-pager link, intro deck, tracked referral link, referral fee or commission share, occasional briefings, a private Slack/email list.
- **First Engagement:** A 30-minute onboarding call + ambassador kit.
- **Trust Layer:** Founder access; the ambassador is treated as a partner, not a tipster.

**Advisors and monetization.** At launch, advisors are a *distribution cost*, not a revenue line — Konative pays them on closed referrals (fee on Readiness Reviews, share on commissioned deals). The economics are simple: ambassadors unlock buyer relationships paid acquisition cannot reach. A paid **Konative Certified Advisor** tier (badge, training, directory profile, priority lead routing) is a year-2 monetization layer, only added once deal flow makes certification worth paying for. The launch program is invite-only and free to the advisor.

### Implementation notes for the router

- Pages live under `web/src/app/(frontend)/for/[audience]/page.tsx` (dynamic) or as static MDX-driven pages, depending on whether we want non-engineers to edit copy. Recommend Sanity-backed structured content (headline, sections, partner logos) so copy can be tuned without a deploy. Decide during the implementation plan, not here.
- The shared skeleton becomes a single React component (`<AudienceLanding />`) that takes the audience config as props. Copy, images, capability bands, and CTAs come from the CMS or a typed config object.
- `/for` hub is a simple grid of audience tiles linking into each page.
- Every audience page must include audience-appropriate JSON-LD and a unique `<title>` / OG image so each URL is independently shareable.
- A small "I'm actually a ___" selector at the top of each page lets visitors switch context without going home.

## Part 2 — Public Partner / Platform Page (`/platform`)

A single new page that pitches non-client audiences on plugging into Konative. This is the *public* face of the monetization story.

Sections:

1. **Hero:** "Konative is the front door to North American data center development. Plug in." Audience-neutral, but the page makes it obvious within one screen who should keep reading.
2. **Who Plugs In:** Sponsor partners (EPCs, modular DC vendors, cooling/power, law, finance), data subscribers (investors, brokers, consultants), verified-site listers (landowners, tribes), members (tribal IDCs and similar), media + research subscribers.
3. **How It Works:** A short explainer of the directory, the data product, verified site listings, membership, and reports — each with a short pitch and a "Request access" or "Apply to list" CTA. Pricing posture is "tiered, contact for details" at launch; published pricing comes later.
4. **Why Konative:** Audience size, geographic specialization, founder credibility, and the credibility halo of being the neutral clearinghouse rather than a developer with a vested interest.
5. **CTA:** "Talk to us about partnering."

This page does *not* expose the internal P&L thinking. It exposes the surface area where outsiders can transact with the platform.

**Minimum credible footprint at launch.** `/platform` cannot ship empty. Each surface listed in "Who Plugs In" must meet at least one of these bars before the page goes live:

- A real intake form that routes to a real human and sets expectations on response time, *and*
- At least one named launch sponsor, design partner, or pilot listing per bucket — even if anonymized ("Founding sponsor — modular DC manufacturer, name on request").

If a bucket cannot meet that bar at launch, it is removed from the page, not shown as "coming soon." The page expands as each bucket earns its slot. The launch version may be only two buckets (e.g., Sponsor Directory + Verified Site Listings) and that is acceptable; an empty page that promises future products is not.

## Part 3 — Internal Monetization Strategy (Notion)

Lives in Notion under the existing Konative project hub, not in the public site. One page titled "Konative Monetization Architecture" with these sections:

1. **The Thesis.** Konative is a trade-clearinghouse with a media layer on top. Free content (map, news, reports) builds audience → audience attracts sponsors and members → sponsors fund the platform → platform makes Konative the default front door for deals → deals pay commission on top. The site is both the lead funnel for Jeramey's services and a standalone media + marketplace business.
2. **Revenue Streams (ranked).** The seven streams identified in brainstorming, with for each: who pays, recurrence quality, effort to launch, dependencies, and a 12-month revenue target.
   - Sponsored Partner Directory (annual listings, tiered)
   - Konative Intelligence (data subscription)
   - Verified Site Listings (per-site, recurring on renewal)
   - Quarterly Market Reports (per-report or annual sub)
   - Tribal Membership / Konative for Nations (annual)
   - Annual Tribal Data Center Summit (year-2)
   - Lead-gen / referral fees (passive)
3. **Phased Launch Plan.**
   - **Phase 1 (first 90 days) — Sponsor Directory + Quarterly Reports.** Sponsor Directory is the simplest recurring stream to stand up and produces immediate proof that the platform has commercial gravity. Quarterly Reports — leading with the *Tribal Data Center Opportunity Index* — drive earned media and feed the audience pages with credibility. Tribal Membership is *not* launched yet; the value prop must be reviewed and validated against real tribal feedback first, and at least one anchor pilot should be in motion before charging for membership.
   - **Phase 2 (months 4–9) — Tribal Membership + Verified Site Listings.** Once anchor pilots exist and the membership value prop has been pressure-tested with tribal econ dev leaders, launch membership and verified site listings together. Membership becomes the on-ramp Jerry sells; verified listings become the inventory investors and operators come to Konative for.
   - **Phase 3 (year 2) — Konative Intelligence subscription, Certified Advisor tier, Annual Summit.** Each requires Phase 1 + 2 traction to be credible.
4. **Big-Bang Layer.** Project Readiness Review fees + commissions on closed deals. These remain the largest revenue lines and benefit from the recurring layer's demand-generation effect.
5. **KPIs and Cadence.** Audience growth, sponsor count, member count, report sales, qualified inbounds per audience page, conversions to readiness review, closed commission revenue. Reviewed monthly.
6. **Risks and Counters.** Conflicts of interest (neutral clearinghouse vs. commissioned developer), pricing discipline, content cadence (reports require real research bandwidth), tribal trust (membership must be earned, not sold).
7. **Decision Log.** Append-only record of pivots and pricing changes.

## Part 4 — GTM Motion

1. **Ambassador program.** Formalize the Jerry role. `/for/advisors` is the recruiting funnel. Ship a one-page ambassador kit (the page itself plus a tracked referral link generator and a short intro deck). Compensation: referral fee on closed Readiness Reviews and a share of commission on closed deals.
2. **Anchor accounts.** Close 2–3 tribal/IDC pilots in the first 6 months that are nameable with permission. At least one US, one Canadian.
3. **Earned media.** Quarterly reports are the PR engine. The first one — *Tribal Data Center Opportunity Index* — is also Jerry's biggest tailwind. Pitch tribal media (Indian Country Today, APTN), trade press (DCD, Bisnow), and Canadian indigenous business networks (CCAB).
4. **Events.** Year 1: Jerry-led roundtables at RES, NIGA, NCAI (US) and CCAB events (Canada). Year 2: host the Konative Tribal Data Center Summit.
5. **Paid acquisition.** Not in V1. The audience pages must convert organically and via ambassador traffic before paid is justified.

## Success Criteria

- Jerry can send `https://konative.com/for/tribes` to a tribal contact and the page answers "what is this and why should I care" within 30 seconds, ending in a CTA.
- A second audience page (e.g., `/for/investors` or `/for/advisors`) ships using the same skeleton with no new components built.
- `/platform` exists publicly and accepts inbound interest from at least three distinct partner types within 60 days of launch.
- Notion monetization doc is the founder's working source of truth and is updated at least monthly.
- The audience router does not regress homepage conversion to Project Readiness Review.

## Tribal Membership — value prop review (gate before Phase 2)

Membership is deferred until its value prop survives contact with real tribal econ dev leaders. Before any launch, draft and pressure-test the following against at least three tribal/IDC contacts (Jerry can help source):

- **What a member gets:** access to playbooks (site eval, power request, IDC governance fit, sovereignty-preserving deal structures), a private peer benchmarking forum across IDCs, quarterly briefings with the Konative team, discounted Project Readiness Review, early access to verified site listings, ambassador-rate referral fees on intros, and inclusion in the *Tribal Data Center Opportunity Index*.
- **What it costs and who signs the check:** annual fee paid by the IDC or tribal enterprise, not the council. Tier on enterprise size, not nation size.
- **What kills it:** if it feels like a paid newsletter or a sales pipe disguised as a club, it dies. The bar is "would a tribal econ dev director defend this line item to their CEO." If three out of three tribal leaders cannot articulate the value back unprompted, do not launch.

This review and decision belongs in the Notion monetization doc, not on the public site.

## Open Questions for the Implementation Plan

- Is the audience-page content authored in Sanity (recommended for non-engineer editing) or in MDX/typed config?
- Does `/platform` use the existing form provider (Resend / `/api/inquiry`) for inbound or get a dedicated partner-intake form with a different routing rule?
- Print/PDF export per audience page — V1 or V2?
- Tribal membership signup flow — placeholder waitlist form in V1, or a real Stripe-backed signup?
- Do we need an ambassador-link tracking system at launch (utm-coded links and a simple dashboard) or is a manual referral spreadsheet acceptable for the first 6 months?

## Deliverables Checklist

- [ ] `/for` audience hub
- [ ] `/for/tribes` page (Jerry's deliverable, lead)
- [ ] `/for/advisors` page (ambassador funnel)
- [ ] `/for/investors`, `/for/landowners`, `/for/utilities`, `/for/developers-epcs`, `/for/operators` pages
- [ ] Shared `<AudienceLanding />` component + content schema
- [ ] `/platform` public partner page
- [ ] Notion: "Konative Monetization Architecture" doc (with phased plan + tribal membership value-prop review)
- [ ] Ambassador kit (page + tracked link + 1-page intro deck)
- [ ] Site nav update — top-level "For" entry; `/platform` reachable from footer or "Partner" footer link
- [ ] Analytics events on each audience page CTA, segmented by audience
