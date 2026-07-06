# Konative website blueprint — best-in-show standard (2026-07-06)

Grounded in the STORM briefing + competitive lens. The bar: every agency
competitor is brochureware with zero public tools and zero AEO execution. The
site wins by being the most *useful* location in either category, wrapped in the
existing bright-black/steel/velocity-red design system.

## Design principles

1. **Two doors in five seconds.** A visitor must know within one screen: this is
   a vendor-neutral connectivity brokerage; door one Tribal, door two Data
   Center; suppliers pay, the buyer doesn't.
2. **Tool UI above brochure copy.** Lightyear proves data-density-as-aesthetic;
   Cloudscene proves data-as-destination. Show the map, the countdown, the
   benchmark table — not stock handshake photos.
3. **Sovereignty in writing.** Lane 1 trust is textual and structural, not a vibe.
4. **One honest number beats ten adjectives.** Published benchmarks with candid
   caveats are the differentiator nobody else will match.
5. **Full AEO discipline** (llms.txt, llms-full.txt, FAQPage, Speakable,
   per-page metadata) — absent from every competitor checked; table stakes here.

## Information architecture (target)

- `/` — two-door hero (existing, sharpen later against Sanity singleton)
- `/tribal` — lane hub (exists) → add prominent links to the two new pages
- **`/tribal/funding-navigator` (NEW — the September tool)** — TBCP R3 ($540M)
  vs NEGP ($250M): live countdown to Sept 17, 2026 11:59 p.m. ET; eligibility
  walkthrough; eligible-uses explainer; application checklist; primary-source
  links (NTIA NOFOs); FAQPage + Speakable schema; CTA = free application-window
  working session (cal.com/jeramey-james/15min).
- **`/tribal/sovereignty` (NEW — the trust page)** — the written commitment:
  tribe owns contracts/data/relationship; Konative = agent-of-record for the
  tribe, not the carrier; transparent economics (suppliers pay 15–20% of MRC);
  no lock-ins; data sovereignty terms; partner-first posture (AMERIND, Tribal
  Ready, MuralNet, NTUA named as the ecosystem Konative feeds, not fights).
- `/data-center-connectivity` — lane hub (exists) → **add 2026 market + pricing
  intelligence section**: secondary-market fiber briefs (Columbus, SLC, San
  Antonio, Reno, Alberta), benchmark table (underground $18/ft vs aerial $8/ft
  median, DIA MRC ranges, honest "IRUs are custom-quoted" caveats), fiber
  supply-crunch facts (lead times, 2.3x fiber miles by 2029).
- `/map` — existing proprietary map; the long-term parcel-level lookup tool
  grows here (v-next: "which carriers can reach this site").
- llms.txt / llms-full.txt / sitemap.ts updated for all of the above.

## v-next backlog (not this ship)

1. Parcel-level near-net/lateral estimator on /map (the #1 DC buyer ask).
2. Tribal carrier-availability check by reservation.
3. Programmatic market pages (Megaport pattern): "Data center connectivity in
   [market]" fed by the Sanity dataCenterProject dataset.
4. Homepage hero copy sharpening via the Sanity homeConnectivity singleton
   (live copy is Sanity-controlled; edit there, not just the fallback).
5. Named tribal partner endorsement + first case study ("12-carrier RFP in N
   days") when real.
6. Benchmark data program: quarterly published tribal DIA/transport benchmarks —
   the Funds For Learning flywheel.
