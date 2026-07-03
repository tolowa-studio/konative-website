# Konative

| What | URL |
|------|-----|
| **Production** | [https://konative.com](https://konative.com) |
| **Git repository** | [github.com/tolowa-studio/konative-website](https://github.com/tolowa-studio/konative-website) (`main`) |

Founder OS structure and PRD live in **`docs/`**. Notion hub (live): [konative.com](https://www.notion.so/konative-com-34132e0a547481489537d232018bbbb0).

## Public site (Next.js + Payload CMS)

The live site and CMS live in **`web/`** (Next.js 16 + Payload 3 + Postgres). Editor workflow, blocks, and collections are defined there.

```bash
cd web
npm ci
npm run dev
```

Dev server: **http://localhost:3005** (see root `CLAUDE.md`).

- Production build: `npm run build` then `npm run start`
- Vercel: link from **repository root** with **Root Directory = `web`** (see root **`CLAUDE.md`**). **Single deploy config:** `web/vercel.json` (Next.js + `npm ci` + `npm run build`); do **not** add a second `vercel.json` at the monorepo root or dashboard overrides will fight the repo. In the dashboard, clear any custom “Install/Build” overrides to match, or set them identical to that file. Default project in `scripts/vercel-bootstrap.sh` is **`konative-site`**. If GitHub shows a new commit but Vercel looks stale, open the deployment → **Redeploy** (optionally “Clear cache and redeploy”) and confirm the production branch is `main` and the **connected GitHub repo** is the one you push to. **Builder.io** preview URLs and env are separate from the live site: `https://konative.com` `/` is built from this repo, not from Builder (Builder remains available under `/builder/…` when the public API key is set).
- Environment: copy `web/.env.example` to `web/.env.local` and set `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL` (see `web/docs/database-setup.md`).

- [`docs/founder-os-konative.md`](docs/founder-os-konative.md) — operating model (vision → workstreams → rhythm)
- [`docs/requirements-prd.md`](docs/requirements-prd.md) — konative.com requirements and backlog epics
- [`docs/DESIGN-DOC.md`](docs/DESIGN-DOC.md) — credibility-first strategy and launch direction
- [`docs/phase-one-offer.md`](docs/phase-one-offer.md) — draft paid offer, CTA, pricing, timeline, and deliverables
- [`docs/homepage-outline.md`](docs/homepage-outline.md) — homepage IA, section order, and supporting page map
- [`docs/launch-copy-outline.md`](docs/launch-copy-outline.md) — first-pass launch messaging and homepage copy structure
- [`docs/trust-legal-proof-assets.md`](docs/trust-legal-proof-assets.md) — v1 trust layer, anonymized proof options, and legal/privacy asset list
- [`docs/v1-ship-checklist.md`](docs/v1-ship-checklist.md) — ASAP launch definition of done and launch gate checklist
- [`docs/implementation-plan.md`](docs/implementation-plan.md) — greenfield build plan, task order, and PRD traceability for the public site
- [`docs/project-plan.md`](docs/project-plan.md) — ordered execution plan from offer lock through launch
- [`docs/notion-setup.md`](docs/notion-setup.md) — Notion links + task board setup
