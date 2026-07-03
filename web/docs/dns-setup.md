# DNS setup for konative.com on Cloudflare

**Superseded 2026-07-03.** This repo's platform is Cloudflare Workers (via OpenNext), not Vercel —
see `CLAUDE.md` → Deploy Configuration. The Vercel nameserver/A-record instructions previously in
this file are actively wrong: following them would point DNS away from the working Cloudflare setup.

## Current status (verified against the live Cloudflare API, 2026-07-03)

- `konative.com` and `www.konative.com` are both bound as Cloudflare Workers **Custom Domains** on
  the `konative` Worker (account **Tolowa Studio**, `e2b6ede12b96c7be2fe252c4b1e74bcf`), production
  environment, both `enabled: true`.
- DNS for the `konative.com` zone (`zone_id 328a243ea23865d1113a519464970c89`) and TLS certificates
  for both hostnames are fully managed by Cloudflare as part of the Custom Domain binding — there
  are no manual A/CNAME records to create or maintain at an external registrar.
- No action is needed here. If `konative.com` ever stops resolving, check (in order): the zone's
  nameservers are still pointed at Cloudflare at the registrar, the Custom Domain bindings still show
  `enabled: true` (Cloudflare dashboard → Workers & Pages → `konative` → Settings → Domains &
  Routes, or `GET /accounts/{account_id}/workers/domains?service=konative` via the API), and the
  Worker itself is deploying successfully (see Deploy Configuration in `CLAUDE.md`).

## Verification

```bash
curl -sI https://konative.com | grep -i "^server:"   # expect: server: cloudflare
curl -sL https://konative.com/ | head -c 400          # expect real app HTML, not a parked page
```
