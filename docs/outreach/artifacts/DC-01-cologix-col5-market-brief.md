# Market Connectivity Brief — Cologix COL5

**Status:** Draft · public facts only · ready for warm delivery after AVANT name-check  
**Prepared by:** Konative (AVANT sub-agent) — Jeramey James  
**Date:** 2026-07-15  
**Confidence labels:** Verified = primary source · Probable = secondary · Unverified = needs engineering

---

## Header

| Field | Value |
|---|---|
| Project / facility | Cologix **COL5** |
| Market / metro | Columbus OH — Orange Township / Lewis Center |
| Address | **6787 Green Meadows Drive, Columbus, Ohio** (Orange Twp / Lewis Center) |
| COD / RFS | Phase 1 **RFS Q3 2026** (Verified — Cologix) |
| Campus scale | Full build **120 MW**; Phase 1 **25 MW / ~60K sqft** (Verified — Cologix) |
| Recipient | Cologix interconnection / Central Ohio carrier sales · Construction / campus PM |

---

## 1. Why this brief

COL5 is in the pre-COD window. Fiber entrances, MPOE diversity, ring connectivity to existing Cologix Columbus sites, and cloud on-ramps harden before Phase 1 turns up — not after. This brief maps **publicly stated design intent** and the engineering questions that still require LOA / carrier confirmation. It is not a price quote and does not claim physical path diversity.

---

## 2. Known carrier / fiber / colo signals

| Asset | Observation | Source | Confidence |
|---|---|---|---|
| Facility | 5th Cologix Columbus site; AI-ready colo / interconnection campus | [Cologix COL5](https://cologix.com/data-centers/columbus/col5/) | Verified |
| Fiber entrances | **3 diverse fiber entrances / 3 MPOEs** (design claim) | Cologix COL5 | Verified (design claim — not LOA-confirmed) |
| Campus ring | Ring connectivity to existing **COL1–4** | Cologix COL5 | Verified (design claim) |
| Networks | **50+ networks** marketed | Cologix COL5 | Probable (marketing count) |
| IX | **Ohio IX** | Cologix COL5 | Verified (presence claim) |
| Cloud on-ramps | **AWS Direct Connect** + **Google Cloud** | Cologix COL5 | Verified (presence claim) |
| Power | AEP redundant loop (public marketing) | Cologix COL5 / local press | Probable |
| Construction | Site prep / construction from mid-June 2025; ~$1B campus narrative | [Columbus Construction Trades](https://columbusconstruction.org/cologix-breaks-ground-on-1-billion-datacenter-in-central-ohio/) | Verified (timing) / Probable ($ figure) |

**Caveat:** Public carrier / IX / cloud names ≠ confirmed diverse physical paths into *this* parcel. Diversity requires carrier engineering and LOA confirmation.

---

## 3. Missing facts / engineering questions

1. Which carriers already hold duct / LOA into COL5 vs marketing “50+ networks” on the campus ecosystem?
2. Do the three MPOEs use **physically diverse laterals and rights-of-way**, or shared conduit segments?
3. Is Phase 1 pre-leased as wholesale blocks with tenant-owned fiber, or multi-tenant colo with open MMR?
4. Lateral lead-time band for any off-net carrier (**estimate only** — often 12–24 months for new laterals in secondary markets; confirm with engineering).
5. Soft-landing / temporary connectivity needed for commissioning before permanent diverse paths are live?
6. COL6 / JEDD naming — same campus corridor or separate project?

---

## 4. Candidate supplier categories + procurement sequence

**Categories:** DIA · lit fiber · dark / IRU · waves · DCI to COL1–4 · cloud on-ramp · cross-connect / MMR population · SD-WAN/SASE (tenant overlay)

**Sequence:**
1. Pathfinder conflict / registration for COL5 address  
2. Serviceability / CoNav-style multi-carrier check  
3. Normalize 3+ carrier matrix (terms, NRC/MRC, SLA, diversity language)  
4. AVANT SE technical call with Cologix interconnection  
5. LOA / CFA / order for selected paths  

---

## 5. Estimates vs custom quote

| Item | Label |
|---|---|
| Phase 1 RFS Q3 2026 | Public schedule (Cologix) — subject to change |
| 120 MW / 25 MW figures | Public Cologix specs |
| Lateral lead times | **Estimate** until carrier engineering |
| Any $ MRC/NRC | **Custom quote only** — none stated here |

---

## 6. Economics disclosure

Konative operates as an AVANT sub-agent. When a supplier is selected through this process, Konative may be compensated by that supplier via residual commissions. You own the contracts, data, and relationship. No obligation to proceed after this brief. AVANT SE bench available for technical calls.

---

## 7. Next step

Useful as a working brief for interconnection / campus delivery? If yes, we register the opportunity in Pathfinder and run a multi-carrier serviceability pass against **6787 Green Meadows Drive** — meeting optional until engineering questions need a call.

---

## 8. Sources (retrieved 2026-07-15)

1. https://cologix.com/data-centers/columbus/col5/  
2. https://cologix.com/resources/spec-sheets/col5-data-center-spec-sheet/  
3. https://columbusconstruction.org/cologix-breaks-ground-on-1-billion-datacenter-in-central-ohio/  
