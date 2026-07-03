# Transactional email setup for form submissions

## Current provider: Resend (transactional email is transitioning to Cloudflare Email)

`web/src/lib/forms/submit.ts` currently sends transactional notifications (form submission alerts)
via **Resend**. Per the current email-routing model for this org: **Cloudflare Email is the target
default for transactional email**, replacing Resend; **Mailgun is for bulk/campaign email only**
(newsletters, outreach blasts — see `web/src/lib/outreach/mailgun.ts` and
`web/scripts/ntia-outreach-send.ts`). The Resend→Cloudflare Email migration for this repo has real,
tested-shape code in the `resend-to-cloudflare` git branch/worktree but is **not yet live** — it
needs the `konative.com` domain onboarded for Cloudflare Email Sending, real
`CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_EMAIL_API_TOKEN` values set, and a canary send proven before
`submit.ts` is switched over.

## Setup steps (current, Resend)

1. Create or log into a Resend account: [https://resend.com](https://resend.com).
2. Add sending domain (`konative.com` or subdomain like `mail.konative.com`).
3. Add DNS records Resend provides (SPF, DKIM, optional DMARC) — via the Cloudflare DNS API for this
   zone, not a registrar (see `docs/dns-setup.md`).
4. Verify the domain in Resend.
5. Create an API key scoped to production mail sending.
6. Set as Cloudflare Worker secrets (Worker → Settings → Variables, or `wrangler secret put`) and in
   `.env.local` for local dev — **not Vercel**, which this repo no longer uses:
   - `RESEND_API_KEY`
   - `RESEND_FROM` (example: `Konative <team@konative.com>`)
   - `RESEND_TO` (notification recipient)

## Next step (not yet done)

Complete and verify the Cloudflare Email Sending migration for `konative.com`, then update
`submit.ts` and this doc together so they never drift again.
