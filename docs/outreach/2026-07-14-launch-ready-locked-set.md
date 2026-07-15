# Launch-ready locked set (recommendation applied)

**Status:** READY FOR SEND APPROVAL · **NOT SENT**  
**Decision:** Jeramey — “go with your recommendation” (2026-07-14)  
**MOTION run:** `cr_1f2d92db3d3c46c98509` · campaign `konative-one-site-snapshot-validation-2026` · **paused** / `launch_ready_awaiting_send_approval` · `do_not_send=true`

## Locked to send (when you say OK)

| ID | Account | Primary contact | Email | NeverBounce | Suppression |
| --- | --- | --- | --- | --- | --- |
| **A1** | Ho-Chunk Gaming Beloit | Lael Hall, CITO | lael.hall@ho-chunk.com | **valid** | clear |
| **A3** | Chumash Casino Resort | Mark Badal, Exec Dir IT | mark.badal@chumashcasino.com | unknown* | clear |
| **B1** | Shoshone-Bannock | Rodney Te’O, IT Director | rodney.teo@sbtribes.com | *(checked in session)* | clear |
| **B2** | Cologix Columbus | **Josh Beck**, Dir IT Infra | josh.beck@cologix.com | **valid** | clear |
| **B3** | Lightpath CHI–CMH | **Tim Haverkate**, EVP Major Infra | tim.haverkate@lightpathfiber.com | **valid** | clear |

\*Prospeo verified; NeverBounce `unknown` + `connect_fails` — acceptable for small validation if mailbox pattern trusted; watch bounce.

### Backups (use if primary bounces / wrong inbox)

| ID | Backup | Email | NeverBounce |
| --- | --- | --- | --- |
| B2 | Troy Peter | troy.peter@cologix.com | catchall (prefer Josh) |
| B3 | Ting Liu | ting.liu@lightpathfiber.com | valid |

### Explicitly held / skipped

| ID | Why |
| --- | --- |
| **A2** Kewadin / Hollowell | Title conflict — hold until confirmed |
| CEO/Chairman routing | Skip unless Director path fails |

## Gate checklist (locked set)

- [x] Named property + public trigger  
- [x] Role-fit contact (Director/CITO/EVP infra)  
- [x] Work email found + Prospeo reveal  
- [x] NeverBounce pass or noted caveat  
- [x] Not on Control suppressions  
- [x] Draft message ready (Snapshot / Brief)  
- [x] Old campaigns paused (`konative-connectivity-review-2026`, `tolowa-tbcp-round-3-2026`)  
- [ ] **Jeramey: explicit “OK to send A1 A3 B1 B2 B3”** ← only remaining gate for Mailgun  
- [ ] Snapshot/Brief one-pagers delivered after any positive reply  

## What “complete” means from here

| Remaining | Owner |
| --- | --- |
| Say **OK to send** the locked five (or smaller subset) | Jeramey |
| Optional: confirm A2 title → add later | Jeramey / research |
| Site PR to `main` if not yet opened | Jeramey ask / agent |
| Deploy MOTION FSM statuses to prod (run fell back to `intake` then `paused`) | MOTION PR |

## Drafts

Use personalized drafts in `2026-07-14-director-contacts-and-routing-drafts.md` for A1/A3/B2/B3; B1 draft:

> **Subject:** One carrier question for Shoshone-Bannock clinic / ops network  
>  
> Hi Rodney,  
>  
> Public reporting on Shoshone-Bannock broadband implementation notes fiber construction underway and telehealth needs for on-reservation care.  
>  
> As implementation progresses, clinic and government ops sites often still need a clear view of commercial carrier options and renewals alongside the funded build.  
>  
> Konative can prepare a One-Site Carrier + Renewal Snapshot — no meeting required. AVANT sub-agent; suppliers may compensate us; the Tribes own the contracts.  
>  
> Would that help for the clinic/ops side, or who owns those carrier contracts?  
>  
> Jeramey James · Konative

**Do not send until Jeramey explicitly approves.**
