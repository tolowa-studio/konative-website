# Konative Connectivity-First Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make konative.com a complete, coherent, connectivity-first brokerage site — every page dialed and live — that positions Konative as the datacenter + tribal connectivity expert broker, with the map and data infrastructure IP as the visible trust engine.

**Architecture:** Next.js 16 (App Router, `web/` root) deployed to Cloudflare Workers via OpenNext. Content from Sanity + Builder.io CMS; data from Supabase `konative-intel`; map tiles (PMTiles) from Cloudflare R2 `konative-tiles`. The pivot decision (locked 2026-06-22): **connectivity-first, data infra as proof.** Connectivity (datacenter + tribal/rural) is the lead message on every surface; the map, powered-land research, governors/stalled-project data, Canada DC dataset, and award records become the lead/trust engine underneath — not co-equal headline offerings.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind/global CSS, Sanity 4.22, Builder.io 9.3, Supabase, Cloudflare Workers/R2, OpenNext, Cal.com embed, Ghost (newsletter), n8n + Twenty CRM (intake), Sentry.

## Global Constraints

- Canonical repo: `~/repos/konative-website` (the `~/repos/konative` dir is an empty Conductor shell — do not work there).
- App root is `web/`. All paths below are relative to `web/` unless prefixed with `../`.
- Brand line (verbatim, from `content/seo.md`): "Konative is North America's premier tribal connectivity and data center development brokerage. We are vendor-neutral, AI-native, and sovereign-aware." Konative is a DBA of Tolowa Pacific LLC; an **Avant sub-agent** for supplier sourcing.
- Two wedges, in this order on generalist surfaces: **(1) tribal & rural enterprise connectivity, (2) data-center connectivity.** Pivot per `STRATEGY.md` goal (updated 2026-06-18).
- Primary CTA sitewide → `/call` (Cal.com `cal.com/konative/discovery`). Secondary CTA → `/contact`.
- Permission tiers (from `STRATEGY.md`): copy/SEO/JSON-LD/new content pages = commit+push OK. New state-mutating API routes, DB migrations, CRM/n8n wiring, deletions >50 lines = PR + human approval. Secrets/`.env*`, force-push = hard-blocked.
- Verification baseline for every task: `npm run build` must succeed; changed routes must return expected HTTP; visual check via the `browse` skill or `mcp__Claude_Preview__*` on `npm run dev`.
- Do not invent team facts, deal figures, or carrier relationships. Where copy needs a claim not in `content/` or Notion, mark it `<!-- VERIFY: ... -->` and surface at the wave review gate.
- Node 22 (`.nvmrc`). Build command: `npm run build` (uses `next build --webpack`).

---

## File Structure (what changes, by responsibility)

**Positioning spine (Wave 1)**
- `src/app/(frontend)/page.tsx` + `_sections/*` — homepage narrative → connectivity-first.
- `src/components/Header.tsx` — top nav reorder to connectivity pillars.
- footer component (locate in `src/components/`) — entry links → connectivity.
- `src/app/(frontend)/connectivity/page.tsx` (70 lines → full pillar).
- `src/app/(frontend)/data-center-connectivity/page.tsx` (71 lines → full pillar).
- `src/app/(frontend)/tribal/page.tsx` (34 lines → full pillar).
- `src/components/seo/JsonLd.tsx` — `Service`/`knowsAbout`/`Organization` reconciliation.
- `content/seo.md` — already connectivity-positioned; audit per-page meta for the rewritten pages.
- `../STRATEGY.md` — reconcile bets B2–B5 language from "powered land" to connectivity wedge.

**Map + data IP (Wave 2)**
- `src/components/DataCenterMap.tsx`, `MapReadout.tsx`, `MapSearchBar.tsx` — reuse as embeddable.
- `src/app/(frontend)/map/MapPageClient.tsx` — extract a compact embeddable variant.
- `src/app/(frontend)/tribal/index/page.tsx` (CREATE) — Tribal Connectivity Index filterable table.
- `src/app/(frontend)/api/v1/map-data/` — confirm feeds the pillar embeds.
- `data/canada-dc/*`, governors data sources — surface on pillar pages.

**Conversion plumbing (Wave 3)**
- `src/app/(frontend)/call/page.tsx`, `/contact` — confirm Cal.com + form.
- intake API route(s) → n8n → Twenty CRM (PR-gated).
- `/intelligence`, `/deals`→`/intelligence` redirect target — replace `PLACEHOLDER_DEALS`.

**Launch-quality fixes (Wave 4)** — Sentry env, Supabase key rotation, `/admin` 500, `feed_sources` seed, sitemap audit, Google Search Console.

**Content/AEO depth (Wave 5)** — `/answers` refresh, blog/Ghost import, dispatch.

**Verification & sign-off (Wave 6)** — full-site crawl, redirect matrix, JSON-LD validation, State-of-the-Site + STRATEGY ledger update.

---

## Wave 0: Baseline & Hygiene

### Task 0.1: Confirm clean build and capture route baseline

**Files:**
- Read: `web/package.json`, `web/next.config.ts`

- [ ] **Step 1: Install and build**

Run: `cd ~/repos/konative-website/web && nvm use && npm ci && npm run build`
Expected: build completes, route table printed, no errors.

- [ ] **Step 2: Capture current redirect + route inventory**

Run: `node -e "console.log('see next.config.ts redirects')"` then record the live HTTP matrix:
`for p in / /call /answers /connectivity /data-center-connectivity /tribal /map /governors /markets /intelligence /dispatch; do curl -s -o /dev/null -w "%{http_code} $p\n" https://konative.com$p; done`
Expected: baseline saved to `docs/superpowers/plans/_baseline-2026-06-22.md`.

- [ ] **Step 3: Resolve the empty `~/repos/konative` shell**

Decide with human: delete the empty dir, or `git clone` the real repo into it. Do not proceed working there.

- [ ] **Step 4: Commit baseline doc**

`git add docs/superpowers/plans/_baseline-2026-06-22.md && git commit -m "docs: capture pre-pivot route baseline"`

---

## Wave 1: Positioning Spine (connectivity-first)

> Outcome: homepage, nav, footer, and the three pillar pages all tell the connectivity-first story; SEO/JSON-LD agree; STRATEGY.md reconciled. This is the highest-leverage wave.

### Task 1.1: Reconcile site SEO + JSON-LD to connectivity-first

**Files:**
- Modify: `src/components/seo/JsonLd.tsx`
- Read/audit: `content/seo.md`

**Interfaces:**
- Produces: `organizationSchema` with `knowsAbout` ordered tribal-connectivity → datacenter-connectivity terms; `Service` schema naming "Tribal & rural enterprise connectivity brokerage" and "Data-center connectivity brokerage"; `areaServed: ["United States","Canada"]`.

- [ ] **Step 1:** Audit `JsonLd.tsx` `knowsAbout`/`Service` arrays; reorder/replace powered-land-led terms with connectivity-led terms (keep powered-land, interconnection, queue as supporting terms).
- [ ] **Step 2:** Cross-check every per-page meta block in `content/seo.md` against the pages that will exist after this wave; flag any meta referencing retired routes.
- [ ] **Step 3:** `npm run build`; view homepage source in dev, confirm Organization + Service JSON-LD render with new ordering (use `mcp__Claude_Preview__preview_eval` to read `<script type="application/ld+json">`).
- [ ] **Step 4:** Commit: `feat(seo): reorder org/service schema to connectivity-first`.

### Task 1.2: Rewrite homepage hero + WhoWeServe to connectivity-first

**Files:**
- Modify: `src/app/(frontend)/_sections/HeroSection.tsx`, `_sections/WhoWeServe.tsx`, `_sections/ConnectivityPortfolio.tsx`, `_sections/Capabilities.tsx`

**Interfaces:**
- Consumes: brand line + two-wedge order from Global Constraints.

- [ ] **Step 1:** Hero — headline leads with connectivity brokerage (e.g. "We broker the connectivity that powers tribal nations, rural enterprises, and data centers."). Primary CTA → `/call`. Keep deal-ticker/visual if present. `<!-- VERIFY -->` any specific claim.
- [ ] **Step 2:** WhoWeServe — reframe stakeholder cards to connectivity buyers (tribal nations/EDCs, rural enterprises, data-center operators/developers) with each card linking to its pillar.
- [ ] **Step 3:** Capabilities/ConnectivityPortfolio — present the supplier scope (internet, fiber, transport, cloud, voice, security, mobility, colo, interconnection) and the Avant sub-agent model.
- [ ] **Step 4:** `npm run build`; visual check homepage in dev at all breakpoints (`browse` responsive).
- [ ] **Step 5:** Commit: `feat(home): connectivity-first hero + who-we-serve`.

### Task 1.3: Reorder Header nav + footer to connectivity pillars

**Files:**
- Modify: `src/components/Header.tsx`, footer component

- [ ] **Step 1:** Nav order: Connectivity (dropdown: Tribal & rural / Data-center) · Map & Intelligence · Governors/Stalled Projects · Dispatch · Book a call (CTA). Remove/retire land/deals/invest top-level entries (they redirect anyway).
- [ ] **Step 2:** Footer entry links → "I'm a tribal nation / EDC", "I need data-center connectivity", "I'm a landowner/operator" all routing to the right pillar or `/call`.
- [ ] **Step 3:** `npm run build`; click every nav + footer link in dev, confirm no 404/unexpected redirect (`browse`).
- [ ] **Step 4:** Commit: `feat(nav): connectivity-first header + footer`.

### Task 1.4: Build out `/connectivity` pillar (tribal & rural + datacenter overview)

**Files:**
- Modify: `src/app/(frontend)/connectivity/page.tsx` (currently 70 lines)
- Reference: `content/seo.md` `/connectivity` meta (add if missing)

- [ ] **Step 1:** Expand to a full pillar: GEO-optimized 40–60 word lede answering "what is a connectivity broker / what does Konative broker", the supplier scope, the vendor-neutral + Avant model, both wedges with links to `/tribal` and `/data-center-connectivity`, FAQ block.
- [ ] **Step 2:** Add `Service` + `FAQPage` + `BreadcrumbList` JSON-LD via `JsonLd.tsx` factories.
- [ ] **Step 3:** Primary CTA → `/call`; add metadata export matching `seo.md`.
- [ ] **Step 4:** `npm run build`; verify `/connectivity` renders + JSON-LD present (preview_eval).
- [ ] **Step 5:** Commit: `feat(connectivity): full pillar page`.

### Task 1.5: Build out `/data-center-connectivity` pillar

**Files:**
- Modify: `src/app/(frontend)/data-center-connectivity/page.tsx` (currently 71 lines)

> Note: this page is the redirect target for `/powered-land`, `/land/*`, `/capacity/*` — it must absorb that intent.

- [ ] **Step 1:** Expand: cross-connects, interconnection, transport/dark fiber, carrier-neutral colo, and the powered-land → connectivity bridge (land/power buyers also need connectivity). 40–60 word lede for "data center connectivity broker". FAQ covering the absorbed powered-land/land questions so redirected visitors land on-intent.
- [ ] **Step 2:** `Service` + `FAQPage` + `BreadcrumbList` JSON-LD.
- [ ] **Step 3:** Primary CTA → `/call`; metadata per `seo.md`.
- [ ] **Step 4:** `npm run build`; verify `/data-center-connectivity` 200 and `/powered-land`, `/land` still 308 → here.
- [ ] **Step 5:** Commit: `feat(dcc): full data-center connectivity pillar`.

### Task 1.6: Build out `/tribal` pillar

**Files:**
- Modify: `src/app/(frontend)/tribal/page.tsx` (currently 34 lines)
- Reference: existing `/tribal/awards`, `.tribal-outreach-contacts.json`, TBCP context in Notion Signal Log

- [ ] **Step 1:** Expand: tribal/rural connectivity wedge — sovereignty-aware, TBCP/NTIA funding intelligence, EDC/council/broadband-authority audience, link to `/tribal/awards` and (Wave 2) `/tribal/index`. 40–60 word lede for "tribal connectivity broker".
- [ ] **Step 2:** `Service` + `FAQPage` + `BreadcrumbList` JSON-LD; metadata per `seo.md` `/for/tribes` (now canonical at `/tribal`).
- [ ] **Step 3:** `npm run build`; verify `/tribal` 200, `/for/tribes` 308 → `/tribal`.
- [ ] **Step 4:** Commit: `feat(tribal): full tribal connectivity pillar`.

### Task 1.7: Reconcile STRATEGY.md to connectivity-first

**Files:**
- Modify: `../STRATEGY.md`

- [ ] **Step 1:** Update bets B2–B5 language from "powered land"-led to connectivity-led (keep powered-land as a supporting data-center lane, matching the redirects). Do not edit past ledger lines.
- [ ] **Step 2:** Append ledger line: `2026-06-22 | PIVOT | site reconciled to connectivity-first | homepage/nav/3 pillars/SEO | this plan`.
- [ ] **Step 3:** Commit: `docs(strategy): reconcile bets to connectivity-first`.

**WAVE 1 GATE:** Crawl all rewritten pages, confirm consistent connectivity-first message, no broken links, JSON-LD valid (Google Rich Results test), every `<!-- VERIFY -->` resolved with human.

---

## Wave 2: Map + Data IP as Proof

> Outcome: the map and data assets visibly power the pitch, not as a separate feature.

### Task 2.1: Extract embeddable map component

**Files:**
- Modify: `src/components/DataCenterMap.tsx`, `src/app/(frontend)/map/MapPageClient.tsx`
- Create: `src/components/MapEmbed.tsx`

**Interfaces:**
- Produces: `<MapEmbed layers={string[]} height={number} readout?:boolean />` consuming R2 tile URLs already used by `DataCenterMap`.

- [ ] **Step 1:** Factor a compact, prop-driven embed wrapper around `DataCenterMap` (default layers: power, transmission, interconnection, indigenous lands).
- [ ] **Step 2:** Confirm R2 tile fetch 200 from embed; lazy-load to protect LCP.
- [ ] **Step 3:** `npm run build`; verify embed renders on a scratch route in dev.
- [ ] **Step 4:** Commit: `feat(map): embeddable MapEmbed component`.

### Task 2.2: Embed map on pillar pages

**Files:**
- Modify: `connectivity/page.tsx`, `data-center-connectivity/page.tsx`, `tribal/page.tsx`

- [ ] **Step 1:** Add a contextual `MapEmbed` to each pillar (tribal → indigenous lands + broadband; DCC → power + interconnection + DC sites).
- [ ] **Step 2:** `npm run build`; verify maps load + no layout shift (`benchmark`/visual).
- [ ] **Step 3:** Commit: `feat(pillars): embed proof map on connectivity pages`.

### Task 2.3: Publish the Tribal Connectivity Index (`/tribal/index`)

**Files:**
- Create: `src/app/(frontend)/tribal/index/page.tsx`
- Source: TBCP award data (existing `/tribal/awards` data layer / Sanity)

- [ ] **Step 1:** Build a filterable table of TBCP awards (state, tribe, amount, status) — the "free public resource" hook from the 90-day plan. SSR for SEO; `Dataset`/`Table` JSON-LD.
- [ ] **Step 2:** Add sitemap entry + link from `/tribal`.
- [ ] **Step 3:** `npm run build`; verify `/tribal/index` 200, table filters work (`browse`).
- [ ] **Step 4:** Commit: `feat(tribal): publish Tribal Connectivity Index`.

### Task 2.4: Confirm governors/stalled-projects + Canada data surfaced

**Files:**
- Modify: `governors/page.tsx`, link from `/data-center-connectivity` and `/intelligence`
- Read: `data/canada-dc/*`

- [ ] **Step 1:** Ensure `/governors` (stalled/blocked-project tracker) is linked as proof from the DCC pillar and intelligence hub; verify it renders live data not placeholder.
- [ ] **Step 2:** `npm run build`; verify links + data.
- [ ] **Step 3:** Commit: `feat(intel): wire governors + canada data into pillars`.

**WAVE 2 GATE:** All map embeds load from R2, Index page indexable, no Core Web Vitals regression (`benchmark`).

---

## Wave 3: Conversion Plumbing

> Outcome: every visitor can convert and every qualified inquiry reaches Twenty CRM. (PR-gated — state-mutating + CRM wiring.)

### Task 3.1: Confirm `/call` Cal.com + `/contact` form

**Files:**
- Read/modify: `call/page.tsx`, `contact/page.tsx`

- [ ] **Step 1:** Verify Cal.com embed loads `cal.com/konative/discovery` (depends on human completing Cal.com account setup — flag if slug 404s).
- [ ] **Step 2:** Confirm `/contact` form renders with connectivity-relevant fields (audience, project type).
- [ ] **Step 3:** `npm run build`; submit a test booking/form in dev.
- [ ] **Step 4:** Commit: `fix(convert): verify call + contact surfaces`.

### Task 3.2: Route intake forms → n8n → Twenty CRM (PR-gated)

**Files:**
- Modify/create: intake API route(s) under `src/app/(frontend)/api/`
- Config: n8n intake workflow (see `docs/` n8n intake activation notes in git log)

- [ ] **Step 1:** Map each capture form to the Twenty CRM intake webhook (canonical Twenty token; reuse the n8n intake work from commits `4d9bc96`/`87398d3`).
- [ ] **Step 2:** Add qualified-lead rubric + dedupe; never lose an inquiry.
- [ ] **Step 3:** Test end-to-end into a Twenty sandbox/object; verify record created.
- [ ] **Step 4:** Open PR (human approval required), ping for review.

### Task 3.3: Replace PLACEHOLDER_DEALS on `/intelligence`

**Files:**
- Modify: `intelligence/page.tsx` (redirect target for `/deals`, `/invest`)

- [ ] **Step 1:** Replace the hardcoded `PLACEHOLDER_DEALS` constant with a live Supabase query (or remove the deals surface if not part of connectivity-first — confirm at gate).
- [ ] **Step 2:** `npm run build`; verify `/intelligence` renders live/clean data.
- [ ] **Step 3:** Commit: `fix(intel): remove PLACEHOLDER_DEALS`.

**WAVE 3 GATE:** Test inquiry reaches Twenty; no placeholder data live; Cal.com booking confirmed (or blocker logged).

---

## Wave 4: Launch-Quality Fixes (from State of the Site audit)

### Task 4.1: Sentry env + monitoring

- [ ] **Step 1:** Set `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` in Cloudflare Workers env (note: site migrated off Vercel — set on Workers, not Vercel). Human-gated (secrets).
- [ ] **Step 2:** Trigger a test error; confirm it lands in Sentry.

### Task 4.2: Rotate Supabase anon key

- [ ] **Step 1:** Rotate in Supabase dashboard; update Workers env. Human-gated (secrets). Confirm app still reads data.

### Task 4.3: Fix `/admin` HTTP 500

**Files:** locate `admin` route.
- [ ] **Step 1:** Reproduce 500 in dev (`investigate` skill — root cause before fix).
- [ ] **Step 2:** Fix root cause; verify `/admin` 200.
- [ ] **Step 3:** Commit: `fix(admin): resolve 500`.

### Task 4.4: Seed `feed_sources` / health

- [ ] **Step 1:** `npm run seed:feeds` (or equivalent); verify `/api/v1/health` reports feeds > 0.
- [ ] **Step 2:** Commit any seed script changes.

### Task 4.5: Google Search Console + sitemap audit

- [ ] **Step 1:** Audit `src/app/sitemap.ts` — remove retired routes (powered-land/land/deals as canonical entries), confirm pillar pages + `/tribal/index` present with correct priorities.
- [ ] **Step 2:** Set `GOOGLE_SITE_VERIFICATION`; submit sitemap in GSC (human). Request indexing order: `/connectivity`, `/data-center-connectivity`, `/tribal`, `/tribal/index`, `/call`.
- [ ] **Step 3:** Commit: `fix(seo): sitemap reconciled to connectivity-first`.

**WAVE 4 GATE:** All audit findings from State-of-the-Site closed or explicitly deferred with reason.

---

## Wave 5: Content / AEO Depth

### Task 5.1: Refresh `/answers` to connectivity FAQ

**Files:** `answers/page.tsx`
- [ ] **Step 1:** Ensure FAQ blocks lead with connectivity-broker questions (currently tribal-DC framed); keep `faqSchema` JSON-LD. Add datacenter-connectivity + tribal-connectivity Q&A.
- [ ] **Step 2:** `npm run build`; verify JSON-LD. Commit.

### Task 5.2: Blog / Ghost dispatch alignment

- [ ] **Step 1:** Import the 3 ready drafts in `content/blog/` to Ghost (human: needs Ghost activated) OR render via existing Ghost integration; confirm `/blog` + `/dispatch` reflect connectivity-first.
- [ ] **Step 2:** Verify `/dispatch` archive renders.

**WAVE 5 GATE:** AEO surfaces consistent; blog/dispatch on-message.

---

## Wave 6: Full-Site Verification & Sign-off

### Task 6.1: Full crawl + redirect matrix

- [ ] **Step 1:** Crawl every route in `src/app/(frontend)`; record HTTP + final URL. Confirm redirect matrix in `next.config.ts` matches intent (no chains, no loops).
- [ ] **Step 2:** Validate JSON-LD on all key pages (Rich Results test).
- [ ] **Step 3:** Responsive + a11y pass (`design-review`/`browse`) on homepage + 3 pillars + map + index.

### Task 6.2: Update State of the Site + STRATEGY ledger

**Files:** Notion "State of the Site — Konative" page; `../STRATEGY.md`
- [ ] **Step 1:** Append a dated changelog entry to the Notion page summarizing the connectivity-first relaunch.
- [ ] **Step 2:** Append STRATEGY ledger lines per shipped bet.
- [ ] **Step 3:** Final deploy verify on production (Cloudflare Workers); HTTP matrix all-green.

**FINAL GATE:** konative.com tells one connectivity-first story end to end; map/data IP visible as proof; all forms convert to Twenty; audit findings closed; docs synced.

---

## Self-Review Notes

- **Spec coverage:** positioning drift (W1), map/data IP surfacing (W2), conversion to Twenty (W3), open audit findings — Sentry/Supabase/admin/feeds/GSC (W4), AEO/content (W5), verification + doc sync (W6). All user goals covered.
- **Adaptation:** content/IA tasks verified by build + HTTP + visual rather than unit tests; TDD-style steps retained where logic exists (MapEmbed, intake routing, /admin fix, PLACEHOLDER_DEALS).
- **Open dependencies on human:** Cal.com account/slug, Ghost activation, secret rotation, GSC submission, Twenty token confirmation, empty-dir cleanup — all flagged at their tasks.
