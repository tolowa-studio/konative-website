# Pending manual actions

Updated 2026-07-06 (second pass). The first version of this doc declared 4 things "blocked, needs
Jeramey" without properly exhausting the credential probe checklist first — Stash, the Notion AI
Router, GCP under the real account, and Railway/Cloudflare secrets directly. Real, working
credentials existed for 3 of the 4. Corrected below; only what's genuinely dashboard/interactive-
login-only remains blocked.

## ✅ Done and proven this pass (not just "coded and waiting")

### Twenty CRM intake — fully working, verified end-to-end in production
Found `motion-twenty-crm-api-token` (GCP) and `KONATIVE_INTAKE_TOKEN` (Railway, `n8n` service env —
not GCP). Set `TWENTY_INTAKE_WEBHOOK_URL=https://n8n.tolowastudio.com/webhook/konative-intake` and
`TWENTY_INTAKE_WEBHOOK_TOKEN` as real Cloudflare Worker secrets on `konative`.

**Also found and fixed a second, more important bug the credentials alone wouldn't have solved:**
Cloudflare Workers can terminate a Worker's execution the instant its Response is returned — an
un-awaited `fetch().catch()` (the "fire and forget" pattern `submit.ts` used for both the Resend
email and the Twenty webhook) has no guarantee of completing. Proved this with a real production
canary: the `await`ed triage Sanity patch persisted, the un-awaited CRM webhook never reached n8n
even with correct secrets set. Fixed by wrapping both in Next.js's `after()` (from `next/server`,
which OpenNext maps to Cloudflare's `ctx.waitUntil()`). Re-tested end-to-end after the fix: real
Person/Company/Opportunity created in Twenty CRM, confirmed via direct GraphQL query, then cleaned
up (test data deleted from Twenty, test docs discarded from Sanity).

**This also means the Resend transactional email notification had the exact same silent-failure
bug** — same fire-and-forget pattern, same fix. Not independently re-verified by receiving a real
email (no inbox access in this session), but the code path and root cause are identical.

### Cloudflare Email Sending token — found and proven to work (domain onboarding still needed)
Found `tolowastudio-cf-email-sending-token` (GCP). Proved it works with a real send (200, real
`message_id`) from an already-onboarded `tolowastudio.com` address. Tried the same from a
`konative.com` address: fails (Cloudflare's `internal_server` error, its response for a
non-onboarded domain). Confirmed via Cloudflare's own docs that domain onboarding for Email Sending
is dashboard-only ("Compute → Email Service → Email Sending → Onboard Domain") — no API endpoint
exists for it, so this genuinely isn't a probing gap.

**Next step (needs you, ~2 minutes):** in the Cloudflare dashboard, onboard `konative.com` for
Email Sending (adds `cf-bounce` MX/SPF/DKIM/DMARC records automatically — DNS is already
Cloudflare-managed for this zone, so this should be near-instant, not the up-to-24h general case).
Once done, tell me — I can cherry-pick the migration code (`resend-to-cloudflare` worktree commit
`d30e818`), set `tolowastudio-cf-email-sending-token` as the Worker's `CLOUDFLARE_EMAIL_API_TOKEN`
secret, and prove a real canary send myself, no further access needed from you.

## ⛔ Genuinely blocked — confirmed dashboard/interactive-only, not a probing miss

### 1. `/studio` (Sanity Studio) 500 error in production
Confirmed pre-existing (only one commit has ever touched `src/app/studio/*`), works fine locally,
fails only on Cloudflare Workers — a known `next-sanity` + Next.js 16 + `@opennextjs/cloudflare`
compatibility gap (see
[cloudflare/workers-sdk#13755](https://github.com/cloudflare/workers-sdk/issues/13755)). Tried
`force-static` — made it worse (baked the crash into a permanently-cached static response),
reverted immediately.

Tried the clean workaround (a decoupled Sanity-hosted Studio via `npx sanity deploy`, which would
bypass the Workers/OpenNext problem entirely) — blocked: the Sanity CLI needs its own interactive
browser login (`npx sanity login`), and the existing content-API `SANITY_API_TOKEN` is not accepted
for CLI/deploy auth. Re-confirmed via the Notion AI Router's Canonical Tool Stack table: there is no
tracked Sanity CI-deploy token anywhere in the org — this really is a one-time interactive step,
not a secret I failed to find.

**Next step (needs you):** either (a) run `npx sanity login` once from `web/` on a machine with
browser access, then `npx sanity deploy` to stand up the decoupled Studio (fastest real fix), or
(b) run `wrangler login` / open the Cloudflare dashboard's real-time Worker logs and hit `/studio`
to get the actual stack trace for a proper in-place fix.

### 2. Mailgun bulk outreach
Confirmed genuinely absent — no row in the Notion AI Router's Canonical Tool Stack, no GCP secret,
no Railway/Cloudflare variable anywhere. Only ever provisioned ad-hoc for SpokaneWire, never a
tracked org-wide tool. `web/scripts/ntia-outreach-send.ts` (dry-run by default) is built and
unit-tested but has two real blockers regardless of the API key: no Konative Mailgun domain exists,
and `tbcp_awards` (Supabase) has no `email` column — the script detects this and refuses to run
rather than silently sending to nobody.

**Next step (needs you):** provision a Konative Mailgun sending domain + DKIM/SPF, set
`MAILGUN_API_KEY`/`MAILGUN_DOMAIN` as Worker secrets; separately, decide the `tbcp_awards`
email-enrichment source (Apollo is already in the stack) and run it before the first real send.

## Optional housekeeping (not urgent, doesn't affect the live site)

- ~20 old remote branches (`feat/*`, `fix-*`, `cursor/*`, etc.) from earlier work eras — not
  individually audited; likely all superseded, but not verified. Low priority.
- `claude/charming-mestorf-44eee1` branch — 2-month-stale, unmerged `/governors` "50-state failure
  heatmap" work from 2026-05-08. Confirmed NOT safe to merge as-is (231 files diverged from current
  main — would regress much newer work). Kept as a historical branch ref only, worktree removed.
