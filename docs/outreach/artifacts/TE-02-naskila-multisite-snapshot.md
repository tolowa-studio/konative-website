# One-Site Carrier + Renewal Snapshot — Naskila (Livingston + Leggett)

**Status:** Draft · multi-site · public facts only · ready for warm delivery  
**Prepared by:** Konative (AVANT sub-agent) — Jeramey James  
**Date:** 2026-07-15  
**Lane:** Tribal gaming multi-site · Class II

---

## Header

| Field | Value |
|---|---|
| Organization | Alabama-Coushatta Tribe of Texas / Naskila |
| Site A (existing) | **Naskila Casino** — 540 State Park Road 56, Livingston, TX 77351 |
| Site B (temporary) | **Naskila Casino Leggett** — 10314 US 59 N, Livingston, TX 77351 |
| Site C (permanent) | **Naskila Casino Resort** — ~10450 U.S. Highway 59, Leggett, TX (~95 acres) |
| Triggers | Temp open **Summer 2026**; resort **groundbreaking 2026-06-18**; resort phase 1 ~**late 2028** |
| Named public contact | **Keith Sherer** — General Manager, Naskila Casino (local PR) |

---

## 1. Business context

Naskila is expanding from a single Livingston Class II property into a **multi-site footprint**: keep Livingston live, stand up a Leggett temporary floor (~300 e-bingo machines, 24/7), and build a permanent resort (~685K sq ft, 366 rooms, ~3,400 machines in phase 1). Connectivity must cover guest Wi-Fi, POS, players club, surveillance, secure gaming LAN, and **construction-to-production cutovers** without treating this as a grant project.

Sources: [Tribe blog](https://www.alabama-coushatta.com/blog/post/the-alabama-coushatta-tribe-of-texas-is-scheduled-to-open-its-new-temporary-casino-facility-in-the-summer-of-2026-in-leggett-tx) · [KFDM](https://kfdm.com/news/local/betting-big-tribe-breaks-ground-on-east-texas-casino-resort)

---

## 2. Publicly visible carrier / market options

| Carrier / network | Signal type | Source | Confidence | Notes |
|---|---|---|---|---|
| Incumbent at Livingston | Unknown | — | Unverified | Needs property disclosure |
| US 59 corridor providers | Near-net / unknown | Geography | Unverified | Engineering required |
| LTE / 5G backup | Option class for temp floor | Industry pattern | Probable | Bridge during build |

**Caveat:** No public path diversity map. Dual-site failover claims require engineering.

---

## 3. Contract and renewal questions

1. Who owns circuits today at Livingston — property IT, tribe, or MSP?
2. Will Leggett temp use new contracts or extend Livingston carriers?
3. Renewal dates on primary / backup before dual-site MRC stacks?
4. Single NOC / escalation path across sites?
5. Does permanent resort replace or add to Livingston long-term? (Press notes uncertainty — do not assume)

---

## 4. Resilience / path questions (require engineering)

1. Diverse laterals at Livingston and Leggett — or single corridor risk on US 59?
2. Livingston ↔ Leggett WAN latency / failover design?
3. Same physical path labeled as two providers?
4. Surveillance / gaming VLAN separation on temp floor?
5. Yates Construction / JCJ Architecture — temp contractor Wi-Fi vs production cutover?

---

## 5. Site-by-site checklist

| Site | Focus |
|---|---|
| Livingston primary | Baseline DIA/MPLS/SD-WAN, guest Wi-Fi, POS, surveillance since 2016 ops |
| Leggett temporary | Rapid-deploy circuits, LTE backup, 24/7 floor, players club, ~300 machines |
| Permanent resort (late 2028) | Hotel PMS, event Wi-Fi (~35K sq ft conference), high density (~3,400 machines), VIP |

---

## 6. Relevant AVANT supplier categories

DIA · lit fiber · SD-WAN/SASE · multi-site WAN · mobility / LTE · UCaaS · security · guest Wi-Fi underlay

---

## 7. Next-step decision tree

```
Need multi-site carrier comparison now (temp + Livingston) → Pathfinder
Need permanent resort headroom plan → same motion, phased
Need grant / residential broadband help → Tolowa Pacific (separate)
Not circuit owner → route to tribe IT / procurement
```

---

## 8. Economics disclosure

Konative operates as an AVANT sub-agent. Supplier-compensated residuals may apply if a carrier is selected through this process. You own contracts, data, and relationship. No obligation after this snapshot.

---

## 9. Sources (retrieved 2026-07-15)

1. https://www.alabama-coushatta.com/blog/post/the-alabama-coushatta-tribe-of-texas-is-scheduled-to-open-its-new-temporary-casino-facility-in-the-summer-of-2026-in-leggett-tx  
2. https://kfdm.com/news/local/betting-big-tribe-breaks-ground-on-east-texas-casino-resort  
3. https://www.naskila.com/  
4. https://www.naskila.com/contact/  
5. https://www.naskila.com/leggett/  
