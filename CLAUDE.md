# Konative (repo)

**Canonical local clone on every machine:** `~/repos/konative-website` (`/Users/jerameyjames/repos/konative-website`). The local folder name must match the GitHub repository name `jerameyjames/konative-website`. Run all `git` commands here. The OneDrive path `_AI_projects/konative/konative-site`, if retained for an older workspace, must be a **symlink** to this folder — never create another Git checkout under OneDrive or under `~/repos/konative`.

Agent context for the monorepo: app code lives in **`web/`** (Next.js 16 + Sanity + Builder.io). See `web/AGENTS.md` for site-specific rules.

## Local development

- From `web/`: `npm ci` then **`npm run dev`** — app URL **`http://localhost:3005`** (port **3005** is the repo default so it does not collide with common bindings on **3000** / **3010** / **3011**, e.g. Docker).
- Override when needed: `npx next dev -p <port>` from `web/`.

## Deploy Configuration (configured by /setup-deploy)

- **Platform:** Vercel (Next.js 16 app in `web/`)
- **Vercel project:** `tolowastudioincubator/konative-site` — link and run **`vercel deploy`** from the **repository root** (`.vercel/` lives at root). **Root Directory must be `web`** (Vercel Dashboard → Project → Settings → General → Root Directory). If it is left as `.`, builds fail with “No Next.js version detected” or missing `vercel-build`. Do **not** run `vercel link` only inside `web/` or builds resolve to `web/web` and break.
- **Framework:** Project should use the **Next.js** preset on Vercel. If `*.vercel.app` returns **NOT_FOUND** despite a successful build, set **Framework Preset** to Next.js (or redeploy after it is set).
- **Production URL:** https://konative.com (preview: https://konative-site.vercel.app until custom domain is attached to this project)
- **Git remote:** https://github.com/jerameyjames/konative-website (`main`)
- **Vercel project root:** set **Root Directory** to `web` in the Vercel project settings (this repo is not only the Next app at the filesystem root).
- **Node.js version on Vercel:** Use **Node 22** everywhere so the UI does not show an override: `web/.nvmrc` and `web/package.json` `engines.node` must be the **same** string (both are **`22`**). Do not set `22.x` in one file and `22` in the other — that triggers Vercel’s “Node.js version is being overridden” message. In the dashboard, use **Build & Deployment → Node.js Version → 22.x** (same major) or the option that **follows `package.json` / `.nvmrc`**, not a pinned major like **20** or **24** unless you have re-verified the full install. Forcing **24.x** has previously broken **`isolated-vm`** (Builder.io) installs.
- **No Vercel project yet:** Run **`./scripts/vercel-bootstrap.sh`** from the repo root (after `npm i -g vercel` and `vercel login`). It builds `web/`, creates the project if needed, **`vercel link`** at **repo root**, **`vercel git connect`**, and optional **`--deploy`**. Until Git is connected, **pushing to GitHub does not deploy**.
- **Deploy workflow:** After the project exists and **Git is connected** with **Root Directory = `web`**, auto-deploy on push to `main`; preview deployments on PRs (default Vercel Git integration).
- **Deploy status command:** `vercel ls --prod` (from `web/` after `vercel link`), or use the Vercel dashboard **Deployments** tab.
- **Merge method:** Per repo preference (GitHub default or team convention).
- **Project type:** Web app (marketing site + `/api/inquiry`).
- **Post-deploy health check:** `curl -sf https://konative.com -o /dev/null -w "%{http_code}\n"` (expect `200`). Note: `curl -I` (HEAD) may return `405` on some hosts; use GET without `-I` or open the URL in a browser. **HTTP 200 alone is not enough:** if DNS still points at parking or forwarding, the body will not be this Next.js app (see **Registrar DNS** below).

### Registrar DNS (external — required for konative.com)

Pushing to **Git** updates the Vercel deployment. **DNS at the registrar** is what makes **konative.com** hit that deployment. This step is part of shipping to production, not optional polish.

1. **Add domains in Vercel:** Project → **Settings → Domains** → add `konative.com` and `www.konative.com` (or `vercel domains add` from `web/` after `vercel link`).
2. **Read the exact records Vercel expects** (authoritative; IPs/CNAME targets can be project-specific):

   ```bash
   cd web && vercel domains inspect konative.com
   ```

3. **General-purpose defaults** from [Vercel: Setting up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain) — **always reconcile with `inspect` output**:

   | Host | Type | Value |
   |------|------|--------|
   | `@` | **A** | `76.76.21.21` |
   | `www` | **CNAME** | `cname.vercel-dns-0.com` |

4. **At the registrar (e.g. GoDaddy):** create or update those records. **Remove** domain **forwarding**, **masking**, **parking**, and any conflicting **A** records. Those produce `/lander`, syndicated placeholder pages, or non-Konative content even when Git and Vercel are correct.

5. **CAA:** If the zone has CAA records, allow Let’s Encrypt per [Vercel: A record and CAA](https://vercel.com/kb/guide/a-record-and-caa-with-vercel) (e.g. `0 issue "letsencrypt.org"`).

6. **Verify before calling deploy “done”:**

   - `vercel domains inspect konative.com` shows **Valid** configuration.
   - `curl -sL https://konative.com/ | head -c 400` shows real **HTML from this app**, not a one-line `window.location` to `/lander` or a parked domain shell.

### Custom deploy hooks

- **Pre-merge:** `cd web && npm ci && npm run build`
- **Deploy trigger:** Automatic on merge to `main` (Vercel).
- **Deploy status:** Vercel deployment list / dashboard, or poll `https://konative.com` until the new revision is live.
- **Health check:** https://konative.com (homepage loads; API routes return expected status).

### Environment variables (Vercel)

- Copy from `web/.env.local.example`. Production needs at least `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`, `NEXT_PUBLIC_SITE_URL`, and optional `NEXT_PUBLIC_BUILDER_API_KEY` (for `/builder/*` only; production `/` is composed in the Next app). See that file for optional keys (Resend, Supabase, news ingest, etc.).

### Notion

- **Project hub (canonical):** [Konative.com — Project Hub](https://www.notion.so/34232e0a547481b39bc1e081765d6df6) (legacy hub: [konative.com Founder OS HUB](https://www.notion.so/34132e0a547481489537d232018bbbb0)). See `docs/notion-setup.md`.
