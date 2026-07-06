# Pending manual actions

Updated 2026-07-06 (third pass). The first version of this doc declared 4 things "blocked, needs
Jeramey" without properly exhausting the credential probe checklist first. Real, working
credentials existed for 3 of the 4. This pass closes out Cloudflare Email fully: domain onboarding
was completed by Jeramey directly in the Cloudflare dashboard, and a real production bug found
during end-to-end verification (not just "credentials wired up") is now fixed and proven.

## ✅ Done and proven (not just "coded and waiting")

### Twenty CRM intake — fully working, verified end-to-end in production
Found `motion-twenty-crm-api-token` (GCP) and `KONATIVE_INTAKE_TOKEN` (Railway, `n8n` service env —
not GCP). Set `TWENTY_INTAKE_WEBHOOK_URL=https://n8n.tolowastudio.com/webhook/konative-intake` and
`TWENTY_INTAKE_WEBHOOK_TOKEN` as real Cloudflare Worker secrets on `konative`.

**Also found and fixed a second, more important bug the credentials alone wouldn't have solved:**
Cloudflare Workers can terminate a Worker's execution the instant its Response is returned — an
un-awaited `fetch().catch()` (the "fire and forget" pattern `submit.ts` used for both the email
notification and the Twenty webhook) has no guarantee of completing. Proved this with a real
production canary: the `await`ed triage Sanity patch persisted, the un-awaited CRM webhook never
reached n8n even with correct secrets set. Fixed by wrapping both in Next.js's `after()` (from
`next/server`, which OpenNext maps to Cloudflare's `ctx.waitUntil()`).

### Cloudflare Email transactional migration — fully working, verified end-to-end in production
Domain onboarding for `konative.com` was completed by Jeramey directly in the Cloudflare dashboard
2026-07-06. Code switched from Resend to the Cloudflare Email Sending API
(`CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_EMAIL_API_TOKEN`, found via `tolowastudio-cf-email-sending-token`
in GCP). A direct API test send succeeded immediately, but the real `/api/contact` form path kept
returning `{"success":true}` while no email ever arrived — the response only proves the Sanity write
succeeded, not that the fire-and-forget email step ran.

**Root-caused via `wrangler tail` with temporary trace logging, not guessing:** the `RESEND_TO`
Worker secret held a literal trailing newline (`"deals@konative.com\n"`), because it had been set
with `echo` piped into `wrangler secret put` instead of `printf`. Cloudflare Email's validation
rejects a `\n`-containing address outright (`400 email.sending.error.email.invalid`, a sane
anti-header-injection check) rather than silently trimming it — so every real submission failed
loudly in the API response but that failure was only visible in Worker logs, which the "coded and
deployed" state never surfaced. Fixed by re-setting `RESEND_TO`/`RESEND_FROM` with `printf` and
adding `.trim()` in `submit.ts` as defense-in-depth against the same mistake recurring. Re-verified
end-to-end: real triage-tagged notification emails (`[COLD · tribal] New Konative Contact: ...`)
arrived in the inbox, confirmed via direct Gmail search, not just an API response. All test
Sanity docs, Twenty CRM people/companies/opportunities/tasks created during verification were
cleaned up afterward, and the dead `RESEND_API_KEY` secret (Resend is no longer called anywhere in
the code) was removed from the Worker.

**Also corrected a documentation bug found while diagnosing this:** `CLAUDE.md` claimed Cloudflare
Workers Builds native git integration was the deploy mechanism for this repo. It wasn't (or stopped
being) — `.github/workflows/deploy.yml` (added 2026-06-22) is the actual live pipeline; every
deployment timestamp in Cloudflare's API lines up 1-for-1 with a GitHub Actions run completion.
Corrected in `CLAUDE.md` so a future session doesn't delete the only working deploy path on the
mistaken belief it's redundant.

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
