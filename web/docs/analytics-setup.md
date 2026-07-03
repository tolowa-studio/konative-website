# Analytics setup

**Superseded 2026-07-03.** This repo no longer uses Vercel or Payload CMS — "Vercel Analytics" and
"Payload admin" below don't exist for this stack anymore. `@vercel/analytics` has been removed from
`web/package.json` and `web/src/app/(frontend)/layout.tsx`.

## Current state

- No first-party analytics wired in-app today. Sentry (`@sentry/nextjs`) covers error monitoring only.
- Google Tag Manager remains a valid, platform-agnostic option if marketing needs GTM/GA4 — the
  approach below still applies, just with the env var set as a Cloudflare Worker secret instead of a
  Vercel environment variable, and the "SEO Defaults global" reference removed (that was a Payload
  CMS admin field; the equivalent in the current Sanity schema, if one is added, would live under
  `web/src/sanity/schemaTypes/seoDefaults.ts`).

## Optional: Google Tag Manager (GTM)

If marketing needs GTM and GA4:
1. Create a GTM container for `konative.com`.
2. Keep the container ID (`GTM-XXXXXXX`).
3. Set `NEXT_PUBLIC_GTM_ID` in `.env.local` (local dev) and as a Cloudflare Worker secret/variable
   (production) — see `CLAUDE.md` → Deploy Configuration for how Worker env vars are managed now.

## Tracking governance

- Keep one source of truth for IDs in environment variables.
- Avoid hardcoding analytics IDs in source code.
- Use GTM for future tags to avoid repeated code deployments.
