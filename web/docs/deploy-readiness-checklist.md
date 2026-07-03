# Konative deploy readiness checklist

**Superseded 2026-07-03.** This checklist described a Payload CMS + Vercel Postgres/Neon + Vercel
Blob architecture that no longer exists in this repo — the CMS is Sanity, the data layer is
Supabase, and the deploy platform is Cloudflare Workers (via OpenNext), not Vercel. None of the
action items below apply to the current stack; keeping them here as "remaining actions" would send
someone down a completely wrong path.

**Current state (verified 2026-07-03):** the site is already live and deploying successfully —
Cloudflare Workers Builds is connected to `tolowa-studio/konative-website` on `main` and has been
since 2026-05-17. There is no "remaining infrastructure" gap of this shape today.

For the accurate, current deploy configuration (platform, git integration, custom domains, env
vars/secrets, Node version), see **`CLAUDE.md` → Deploy Configuration** at the repo root. For DNS,
see the rewritten `docs/dns-setup.md` in this same directory.
