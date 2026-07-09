# Konative (repo)

**Canonical local clone on every machine:** `~/repos/konative-website` (`/Users/jerameyjames/repos/konative-website`). The local folder name must match the GitHub repository name — the repo now lives at `tolowa-studio/konative-website` (transferred from the `jerameyjames` personal account; GitHub keeps the old URL as a redirect, but the git remote and all references below use the canonical org). Run all `git` commands here. The OneDrive path `_AI_projects/konative/konative-site`, if retained for an older workspace, must be a **symlink** to this folder — never create another Git checkout under OneDrive or under `~/repos/konative`.

Agent context for the monorepo: app code lives in **`web/`** (Next.js 16 + Sanity + Builder.io). See `web/AGENTS.md` for site-specific rules.

## Data architecture (2026-07-09 — operator approved)

**Konative intelligence data is Cloudflare-native.** Do not recommend Supabase or Railway Postgres for site data.

| Layer | Store |
|-------|-------|
| Curated CMS | Sanity |
| Tabular ingest | Cloudflare D1 (`konative-intel`) |
| PMTiles / snapshots | Cloudflare R2 |
| Cache | Cloudflare KV |
| Metrics | Cloudflare Analytics Engine |
| Newsletter | Ghost (Railway) |

Supabase project `tcbworxmlmxoyzcvdjhh` is **deprecated** — decommission after D1 migration. Full spec: `.context/konative-api-platform-architecture.md` rev 3. Stash: `/tools` + `/projects/konative`.

## Local development

- From `web/`: `npm ci` then **`npm run dev`** — app URL **`http://localhost:3005`** (port **3005** is the repo default so it does not collide with common bindings on **3000** / **3010** / **3011**, e.g. Docker).
- Override when needed: `npx next dev -p <port>` from `web/`.

## Deploy Configuration

**Platform is Cloudflare Workers (via OpenNext) — NOT Vercel.** Vercel was decommissioned;
`konative-site` was among the Vercel projects deleted 2026-07-01 with zero downtime because the
real site had already cut over to Cloudflare. Any doc/script that still says "Vercel" for this repo
is stale — fix it, don't work around it.

- **Worker:** `konative` (account **Tolowa Studio**, `e2b6ede12b96c7be2fe252c4b1e74bcf`). Build config
  lives in `web/wrangler.jsonc` (`"name": "konative"`, OpenNext `.open-next/worker.js` + assets).
- **Git integration:** **GitHub Actions** (`.github/workflows/deploy.yml`) is the actual live deploy
  pipeline, confirmed 2026-07-06 — this corrects an earlier (2026-07-03) claim in this file that
  Cloudflare Workers Builds native git integration was the deploy mechanism. That claim was wrong (or
  became wrong): the workflow was added 2026-06-22 and every single deployment in the Cloudflare API's
  `/workers/scripts/konative/deployments` list (`source: "wrangler"`) lines up 1-for-1 in timestamp
  with a GH Actions run completion, with zero unexplained extras — there is no separate/parallel
  Workers Builds trigger actually firing. Push to `main` → GitHub Actions runs `npx
  opennextjs-cloudflare build && npx opennextjs-cloudflare deploy` using the `CLOUDFLARE_API_TOKEN`
  repo secret. **Do not delete `deploy.yml` assuming it's redundant** — it is the only working deploy
  path. Typical push-to-live latency is ~2–2.5 minutes (npm ci + build + deploy); don't conclude a
  deploy failed until you've waited that long and checked `gh run list --workflow=deploy.yml`.
- **Custom domains:** `konative.com` and `www.konative.com` are both bound as Cloudflare Workers
  **Custom Domains** on the `konative` Worker (production environment, TLS auto-managed by
  Cloudflare) — confirmed via the Cloudflare API 2026-07-03. DNS is fully Cloudflare-managed for this
  zone; there are no external registrar A/CNAME records to maintain (unlike the old Vercel setup).
- **Production URL:** https://konative.com
- **Git remote:** https://github.com/tolowa-studio/konative-website (`main`) — **use this URL, not
  the old `jerameyjames/konative-website`.** GitHub keeps the old URL as a redirect after the repo was
  transferred to the `tolowa-studio` org, but relying on the redirect is exactly the kind of residue to
  fix, not leave: update `git remote set-url origin git@github.com:tolowa-studio/konative-website.git`
  on every local clone/worktree you touch.
- **Node.js version:** Use **Node 22** everywhere: `web/.nvmrc` and `web/package.json` `engines.node`
  must both be **`22`** (not `22.x` in one and `22` in the other). Forcing Node 24+ has broken
  `isolated-vm` (Builder.io) native-module installs — if your local `node` is newer, install Node 22
  via Homebrew (`brew install node@22`) and prepend `/usr/local/opt/node@22/bin` to `PATH` for
  `npm ci`/build rather than fighting the global default.
- **Deploy status:** Cloudflare dashboard → Workers & Pages → `konative` → Deployments/Builds tab, or
  `gh run list --repo tolowa-studio/konative-website --branch main` for the other CI (signal agent,
  tile refresh — see `.github/workflows/`).
- **Merge method:** Per repo preference (GitHub default or team convention).
- **Project type:** Web app (marketing site + brokerage forms + `/api/*`).
- **Post-deploy health check:** `curl -sf https://konative.com -o /dev/null -w "%{http_code}\n"`
  (expect `200`), and `curl -sL https://konative.com/ | head -c 400` to confirm real app HTML.

### Environment variables (Cloudflare Worker secrets/bindings)

Set via the Cloudflare dashboard (Worker → Settings → Variables) or `wrangler secret put`, not
Vercel env vars. Confirmed bindings on the live `konative` Worker (2026-07-06): `ANTHROPIC_API_KEY`,
`BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `BEEHIIV_WEBHOOK_SECRET`, `CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_EMAIL_API_TOKEN`, `CRON_SECRET`, `NEWS_INGEST_TOKEN`, `NEXT_PUBLIC_SANITY_DATASET`,
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `RESEND_FROM`, `RESEND_TO`, `SANITY_API_TOKEN`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `TWENTY_INTAKE_WEBHOOK_TOKEN`, `TWENTY_INTAKE_WEBHOOK_URL`. Transactional
email is Cloudflare Email Sending (`CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_EMAIL_API_TOKEN`); `RESEND_FROM`/
`RESEND_TO` are legacy-named env vars that now just hold the from/to addresses for that Cloudflare
call (Resend itself was retired for this path 2026-07-06) — set them with `printf` into `wrangler
secret put`, never `echo`, which appends a trailing `\n` that Cloudflare Email's validation rejects
outright (`email.sending.error.email.invalid`) rather than silently trimming; the app also `.trim()`s
both as defense-in-depth. For local dev, copy from `web/.env.local.example`.

### Notion

- **Project hub (canonical):** [Konative.com — Project Hub](https://www.notion.so/34232e0a547481b39bc1e081765d6df6) (legacy hub: [konative.com Founder OS HUB](https://www.notion.so/34132e0a547481489537d232018bbbb0)). See `docs/notion-setup.md`.
