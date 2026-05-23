import type { Metadata } from "next";
import Link from "next/link";

import { getGhostAdminUrl, getIntegrationHealth } from "@/lib/system-tools";

export const metadata: Metadata = {
  title: "Systems | Konative",
  description: "CMS and publishing tools — Sanity, Builder.io, Ghost.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Tone = "ok" | "warn" | "setup";

function Badge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`cms-hub__badge cms-hub__badge--${tone === "setup" ? "muted" : tone}`}
    >
      {label}
    </span>
  );
}

function SetupStep({
  num,
  children,
}: {
  num: number;
  children: React.ReactNode;
}) {
  return (
    <li className="cms-hub__setup-step">
      <span className="cms-hub__setup-num">{num}</span>
      <span className="cms-hub__setup-text">{children}</span>
    </li>
  );
}

function EnvVar({ name }: { name: string }) {
  return <code className="cms-hub__code">{name}</code>;
}

export default async function CmsSystemPage() {
  const health = await getIntegrationHealth();
  const ghostAdmin = getGhostAdminUrl();

  const allConfigured =
    health.sanity.configured &&
    health.builder.configured &&
    health.ghost.configured;

  return (
    <main className="cms-hub">
      <div className="cms-hub__inner">
        <header className="cms-hub__header">
          <h1 className="cms-hub__title">System &amp; content tools</h1>
          <p className="cms-hub__lede">
            Internal admin shortcuts for the Konative platform. Status reflects
            environment variables on this deployment.
          </p>
          {!allConfigured && (
            <div className="cms-hub__alert">
              <strong>Setup required</strong> — one or more integrations are
              missing API keys. Add the environment variables below in the{" "}
              <a
                href="https://vercel.com/tolowastudioincubator/konative-site/settings/environment-variables"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel dashboard
              </a>{" "}
              then redeploy.
            </div>
          )}
        </header>

        <div className="cms-hub__grid cms-hub__grid--four">
          {/* ── Sanity ── */}
          <div className="cms-hub__card">
            <div className="cms-hub__card-top">
              <h2 className="cms-hub__card-title">Sanity Studio</h2>
              <Badge
                tone={
                  health.sanity.configured && health.sanity.reachable
                    ? "ok"
                    : health.sanity.configured
                      ? "warn"
                      : "setup"
                }
                label={
                  health.sanity.configured && health.sanity.reachable
                    ? "Connected"
                    : health.sanity.configured
                      ? "Configured"
                      : "Not configured"
                }
              />
            </div>
            <p className="cms-hub__card-desc">
              Structured content, pages, blog posts, and site settings.
            </p>

            {health.sanity.configured ? (
              <Link href="/studio" className="cms-hub__card-cta">
                Open Studio →
              </Link>
            ) : (
              <ol className="cms-hub__setup-list">
                <SetupStep num={1}>
                  Go to{" "}
                  <a href="https://sanity.io/manage" target="_blank" rel="noopener noreferrer">
                    sanity.io/manage
                  </a>{" "}
                  → create or select project
                </SetupStep>
                <SetupStep num={2}>
                  Copy your <strong>Project ID</strong> → set{" "}
                  <EnvVar name="NEXT_PUBLIC_SANITY_PROJECT_ID" />
                </SetupStep>
                <SetupStep num={3}>
                  Set <EnvVar name="NEXT_PUBLIC_SANITY_DATASET" /> (usually{" "}
                  <code className="cms-hub__code">production</code>)
                </SetupStep>
                <SetupStep num={4}>
                  API → Tokens → create <strong>Editor</strong> token → set{" "}
                  <EnvVar name="SANITY_API_TOKEN" />
                </SetupStep>
              </ol>
            )}
          </div>

          {/* ── Builder.io ── */}
          <div className="cms-hub__card">
            <div className="cms-hub__card-top">
              <h2 className="cms-hub__card-title">Builder.io</h2>
              <Badge
                tone={!health.builder.configured ? "setup" : "ok"}
                label={
                  !health.builder.configured
                    ? "Not configured"
                    : health.builder.privateKey
                      ? "Public + private key"
                      : "Public key set"
                }
              />
            </div>
            <p className="cms-hub__card-desc">
              Optional visual editor for <code className="cms-hub__code">/builder/*</code> routes. The live site
              homepage (<code className="cms-hub__code">/</code>) is built in this Next.js app — hero and sections live
              in code, not in Builder.
            </p>

            {health.builder.configured ? (
              <>
                <a
                  href="https://builder.io/content"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cms-hub__card-cta"
                >
                  Open Builder.io ↗
                </a>
                <ol className="cms-hub__setup-list" style={{ marginTop: "1rem" }}>
                  <SetupStep num={1}>
                    In Builder → Models → <strong>page</strong> → set <strong>Preview URL</strong> to your deployment
                    (e.g. <code className="cms-hub__code">https://konative.com</code> or a Vercel preview URL). Open{" "}
                    <code className="cms-hub__code">/builder</code> on the site to edit — not the root URL.
                  </SetupStep>
                  {!health.builder.privateKey ? (
                    <SetupStep num={2}>
                      Optional: set <EnvVar name="BUILDER_PRIVATE_API_KEY" /> (server-only) so the app can fetch{" "}
                      <strong>draft</strong> content when previewing.
                    </SetupStep>
                  ) : null}
                  <SetupStep num={health.builder.privateKey ? 2 : 3}>
                    Content for model <code className="cms-hub__code">page</code> must be <strong>published</strong> to
                    render on <code className="cms-hub__code">/builder/…</code>. If you see the “no content” message,
                    check URL targeting and publish state, then redeploy after env changes (
                    <EnvVar name="NEXT_PUBLIC_*" /> is baked at build time).
                  </SetupStep>
                </ol>
              </>
            ) : (
              <ol className="cms-hub__setup-list">
                <SetupStep num={1}>
                  Go to{" "}
                  <a href="https://builder.io" target="_blank" rel="noopener noreferrer">
                    builder.io
                  </a>{" "}
                  → create account or sign in
                </SetupStep>
                <SetupStep num={2}>
                  Settings → Space → copy <strong>Public API Key</strong>
                </SetupStep>
                <SetupStep num={3}>
                  Set <EnvVar name="NEXT_PUBLIC_BUILDER_API_KEY" /> in Vercel
                </SetupStep>
              </ol>
            )}
          </div>

          {/* ── Ghost ── */}
          <div className="cms-hub__card">
            <div className="cms-hub__card-top">
              <h2 className="cms-hub__card-title">Ghost</h2>
              <Badge
                tone={
                  health.ghost.configured && health.ghost.reachable
                    ? "ok"
                    : health.ghost.configured
                      ? "warn"
                      : "setup"
                }
                label={
                  health.ghost.configured && health.ghost.reachable
                    ? "Connected"
                    : health.ghost.configured
                      ? "Check URL / key"
                      : "Not configured"
                }
              />
            </div>
            <p className="cms-hub__card-desc">
              Shared Tolowa Studio Ghost — powers the{" "}
              <Link href="/dispatch">Konative Dispatch</Link> newsletter and{" "}
              <Link href="/blog">/blog</Link> via Content API.
            </p>

            {health.ghost.configured && ghostAdmin ? (
              <a
                href={ghostAdmin}
                target="_blank"
                rel="noopener noreferrer"
                className="cms-hub__card-cta"
              >
                Open Ghost Admin ↗
              </a>
            ) : (
              <ol className="cms-hub__setup-list">
                <SetupStep num={1}>
                  Sign up at{" "}
                  <a href="https://ghost.org/pricing/" target="_blank" rel="noopener noreferrer">
                    Ghost.io
                  </a>{" "}
                  or use your self-hosted URL
                </SetupStep>
                <SetupStep num={2}>
                  Set <EnvVar name="NEXT_PUBLIC_GHOST_URL" /> (e.g.{" "}
                  <code className="cms-hub__code">https://konative.ghost.io</code>)
                </SetupStep>
                <SetupStep num={3}>
                  Ghost Admin → Settings → Integrations → Custom Integration →
                  copy <strong>Content API key</strong> → set{" "}
                  <EnvVar name="NEXT_PUBLIC_GHOST_CONTENT_API_KEY" />
                </SetupStep>
              </ol>
            )}
          </div>
        </div>

        {/* Quick links */}
        <section className="cms-hub__links-section">
          <h2 className="cms-hub__section-title">Quick links</h2>
          <ul className="cms-hub__links">
            <li>
              <Link href="/news">Market Intelligence →</Link>
            </li>
            <li>
              <Link href="/blog">Blog →</Link>
            </li>
            <li>
              <Link href="/dashboard">Dashboard →</Link>
            </li>
            <li>
              <a
                href="https://vercel.com/tolowastudioincubator/konative-site"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel project ↗
              </a>
            </li>
            <li>
              <a
                href="https://github.com/jerameyjames/konative-website"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repo ↗
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
