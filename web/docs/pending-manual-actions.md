# Pending manual actions

Everything in this doc is genuinely blocked on a credential, an interactive login, or a business
decision — not something that can be pushed further by an autonomous session. Written 2026-07-06
after a full site QA sweep and cleanup pass. Each item has the exact next step.

## 1. Fix `/studio` (Sanity Studio) 500 error — needs live log access

**Symptom:** `https://konative.com/studio` (and any `/studio/*` path) returns HTTP 500 in
production. Confirmed working (200) in local dev — this is a Cloudflare Workers/OpenNext runtime
issue, not a code bug. Confirmed pre-existing (only one commit has ever touched `src/app/studio/*`,
predating any work in this session).

**Root cause (researched, not yet confirmed with a live stack trace):** a known compatibility gap
between Sanity Studio's heavy client bundle, `next-sanity`, and `@opennextjs/cloudflare`'s
translation of Next.js 16's server behavior onto the Workers edge runtime. See
[cloudflare/workers-sdk#13755](https://github.com/cloudflare/workers-sdk/issues/13755) and related
OpenNext/Sanity GitHub threads for the general pattern.

**What was tried:**
- `dynamic = "force-static"` — made it worse (baked the crash into a permanently-cached static 500
  instead of a per-request one). Reverted immediately; live behavior is back to the original
  per-request 500 (not worse than before).
- Standing up a decoupled Sanity-hosted Studio (`npx sanity deploy`) as a workaround — blocked, see
  #2 below.

**Next step (needs you):**
1. Run `wrangler login` interactively (or open the Cloudflare dashboard → Workers & Pages →
   `konative` → Logs → **Real-time Logs**) and hit `/studio` to capture the actual runtime
   exception/stack trace. Build logs don't show this — only live request logs do.
2. With the real stack trace, the fix is likely either (a) an `@opennextjs/cloudflare` version bump
   (currently `^1.19.11`) or Next.js pin adjustment once the upstream issue is identified, or
   (b) moving to option #2 below instead of fighting the Workers runtime.

## 2. Sanity CLI needs an interactive login

**Blocks:** deploying a decoupled, Sanity-hosted Studio (`npx sanity deploy`) as a clean workaround
for #1 — this would host Studio at `<project>.sanity.studio`, completely bypassing the Cloudflare
Workers/OpenNext bundling problem, since it isn't served through this repo's Worker at all.

**What was tried:** `SANITY_AUTH_TOKEN=<the content-API SANITY_API_TOKEN> npx sanity deploy` — fails
with `Unauthorized - Session not found`. The content-API token (used for reads/writes via
`@sanity/client`) is not accepted for CLI/deploy auth; the Sanity CLI needs its own browser-based
session login.

**Next step (needs you):** run `npx sanity login` from `web/` once, interactively, on a machine
with browser access. After that, `npx sanity deploy` should work from that machine (or you can
generate a CI-deploy token from sanity.io/manage → API → Tokens with the right scope, then set
`SANITY_AUTH_TOKEN` from that, if you want this to be scriptable going forward).

## 3. Twenty CRM webhook — needs a live canary

**Status:** `submit.ts` forwards every form submission (with the new triage score/tier/lane
attached) to `TWENTY_INTAKE_WEBHOOK_URL` if set, which should point at the n8n workflow
`Konative website intake → Twenty CRM` (production-verified live 2026-06-18 per
`docs/operations/n8n/runtime-notes.md`).

**Next step (needs you):** confirm `TWENTY_INTAKE_WEBHOOK_URL` and `TWENTY_INTAKE_WEBHOOK_TOKEN`
are set as Cloudflare Worker secrets (they were **not** in the bindings list confirmed live as of
2026-07-06 — see below). Then submit a real test inquiry via `/contact` and confirm a
Person/Company/Opportunity/Task appears in Twenty within ~30 seconds.

**Confirmed Worker bindings as of 2026-07-06 (missing `TWENTY_INTAKE_WEBHOOK_URL`):**
`ANTHROPIC_API_KEY`, `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `BEEHIIV_WEBHOOK_SECRET`,
`CRON_SECRET`, `NEWS_INGEST_TOKEN`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`RESEND_API_KEY`, `RESEND_TO`, `SANITY_API_TOKEN`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. **Without `TWENTY_INTAKE_WEBHOOK_URL`, form leads currently land in
Sanity + email only — the CRM forward silently no-ops** (by design, so a missing webhook never
breaks a user's form submission — but it means leads aren't reaching Twenty right now).

## 4. Mailgun bulk outreach — needs API key + a data gap fixed

**Status:** `web/scripts/ntia-outreach-send.ts` (NTIA Round 3 campaign, dry-run by default) is built
and unit-tested but cannot send anything real yet:
- `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` are not set anywhere (Mailgun is currently only wired for
  SpokaneWire, not Konative).
- `tbcp_awards` (Supabase) has no `email` column — the script detects this and refuses to run
  rather than silently sending to nobody.

**Next step (needs you):** (a) provision a Konative Mailgun sending domain + DKIM/SPF (same pattern
as `docs/email-setup.md`'s Resend section, via the Cloudflare DNS API), set `MAILGUN_API_KEY`/
`MAILGUN_DOMAIN` as Worker secrets; (b) decide the `tbcp_awards` email-enrichment source (Apollo is
already in the stack per global config) and run that enrichment before the first real send. Then:
`npx tsx --env-file=.env.local scripts/ntia-outreach-send.ts --dry-run` to review the batch, then
`--send` once it looks right.

## 5. Cloudflare Email transactional migration — real code exists, not live

**Status:** `submit.ts` still sends transactional notifications via Resend. A tested-shape
Cloudflare Email migration already exists in the `resend-to-cloudflare` git branch/worktree
(commit `d30e818`) — posts to `https://api.cloudflare.com/client/v4/accounts/{id}/email/sending/send`,
env-gated on `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_EMAIL_API_TOKEN`.

**Next step (needs you):** onboard `konative.com` for Cloudflare Email Sending in the dashboard,
set the two env vars as Worker secrets, cherry-pick commit `d30e818` forward onto `main`, prove one
real canary send, then retire the worktree.

## 6. Optional housekeeping (not urgent, doesn't affect the live site)

- ~20 old remote branches (`feat/*`, `fix-*`, `cursor/*`, etc.) from earlier work eras — not
  individually audited this pass; likely all superseded, but not verified. Low priority.
- `claude/charming-mestorf-44eee1` branch — 2-month-stale, unmerged `/governors` "50-state failure
  heatmap" work from 2026-05-08. Confirmed NOT safe to merge as-is (231 files diverged from current
  main — would regress much newer work). Kept as a historical branch ref only, worktree removed.
  If the heatmap idea is still wanted, it needs a fresh implementation against current main, not a
  merge of this branch.
