import type { Metadata } from "next";
import Link from "next/link";

import {
  NEWS_SOURCE_COUNTRY_OPTIONS,
  NEWS_TOPIC_OPTIONS,
  TRIBAL_NEWS_TOPIC_VALUES,
  isNewsTopicValue,
} from "../../../lib/newsConstants";

export const metadata: Metadata = {
  title: "News — Konative",
  description:
    "Curated news on tribal data centers, tribal energy, broadband grants, and connectivity infrastructure across North America.",
};

export const revalidate = 3600;
import { getSanityReadClient } from "../../../sanity/readClient";

export const dynamic = "force-dynamic";

const THUMBNAIL_PLACEHOLDER =
  "linear-gradient(135deg, rgba(200,0,31,0.72), rgba(17,17,17,0.92)), " +
  "repeating-linear-gradient(-35deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 18px)";

type NewsDoc = {
  id: string;
  title?: string;
  url?: string;
  imageUrl?: string;
  summary?: string;
  sourceName?: string;
  publishedAt?: string;
  countries?: string[];
  topics?: string[];
};

type NewsPageProps = {
  searchParams: Promise<{
    country?: string;
    topic?: string;
    page?: string;
  }>;
};

const ITEMS_PER_PAGE = 24;

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;

  const country = params.country === "us" || params.country === "ca" ? params.country : "all";
  const topic = params.topic && isNewsTopicValue(params.topic) ? params.topic : "all";
  const page = Number.parseInt(params.page || "1", 10);
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;

  let isDataUnavailable = false;
  let news: {
    docs: NewsDoc[];
    featured?: NewsDoc[];
    page?: number;
    totalPages?: number;
  } = {
    docs: [],
    featured: [],
    page: currentPage,
    totalPages: 1,
  };

  const filter =
    `_type == "newsItem" && status == "published"` +
    (country !== "all" ? ` && "${country}" in coalesce(countries, [])` : "") +
    (topic !== "all" ? ` && "${topic}" in coalesce(topics, [])` : "");

  const featuredFilter =
    `_type == "newsItem" && status == "published" && (` +
    TRIBAL_NEWS_TOPIC_VALUES.map((t) => `"${t}" in coalesce(topics, [])`).join(" || ") +
    `)` +
    (country !== "all" ? ` && "${country}" in coalesce(countries, [])` : "");

  try {
    const client = getSanityReadClient();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const total = await client.fetch<number>(`count(*[${filter}])`, {});
    const docs = await client.fetch<NewsDoc[]>(
      `*[${filter}] | order(publishedAt desc)[${start}...${end}]{
        "id": _id,
        title,
        url,
        imageUrl,
        summary,
        sourceName,
        publishedAt,
        countries,
        topics
      }`,
      {},
    );
    const featured =
      topic === "all" && currentPage === 1
        ? await client.fetch<NewsDoc[]>(
            `*[${featuredFilter}] | order(publishedAt desc)[0...6]{
              "id": _id,
              title,
              url,
              imageUrl,
              summary,
              sourceName,
              publishedAt,
              countries,
              topics
            }`,
            {},
          )
        : [];
    news = {
      docs,
      page: currentPage,
      totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
      featured,
    };
  } catch (_error) {
    isDataUnavailable = true;
  }

  const activeFilterCount = (country !== "all" ? 1 : 0) + (topic !== "all" ? 1 : 0);

  const chipActiveStyle: React.CSSProperties = {
    background: "#C8001F",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    padding: "6px 14px",
    textDecoration: "none",
    display: "inline-block",
  };

  const chipInactiveStyle: React.CSSProperties = {
    background: "#F9FAFB",
    color: "#374151",
    border: "1px solid #E5E7EB",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    padding: "6px 14px",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <main className="news-page" style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Page Header */}
      <section style={{ position: "relative", overflow: "hidden", background: "#fff", padding: "118px 32px 72px", borderBottom: "1px solid #E5E7EB" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(55,65,81,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(55,65,81,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="news-page__hero-grid" style={{ position: "relative", maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)", gap: 48, alignItems: "end" }}>
          <div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#C8001F",
              marginBottom: 16,
              margin: "0 0 16px 0",
            }}
          >
            INTELLIGENCE FEED
          </p>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(48px, 7vw, 88px)",
              lineHeight: 0.92,
              textTransform: "uppercase",
              color: "#111111",
              letterSpacing: "0.01em",
              margin: 0,
            }}
          >
            TRIBAL & <span style={{ color: "#C8001F" }}>INFRASTRUCTURE</span> NEWS
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: "#6B7280",
              maxWidth: 640,
              marginTop: 16,
              marginBottom: 0,
            }}
          >
            Curated coverage of tribal data centers, energy sovereignty, broadband grants, and connectivity
            infrastructure across the US and Canada — from DOE and NTIA program updates to on-the-ground project news.
          </p>
          </div>
          <div
            aria-hidden="true"
            style={{
              borderLeft: "4px solid #C8001F",
              background: "#111111",
              color: "#fff",
              padding: 28,
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 22px 60px rgba(17,17,17,0.16)",
            }}
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.58)" }}>
              North America Desk
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase" }}>
              Policy, Power, Fiber, Capital
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.72)" }}>
              Signals for tribal, rural, and indigenous infrastructure markets.
            </span>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          padding: "24px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap" as const,
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          {/* Country filter */}
          <div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 10,
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
                color: "#666",
                marginBottom: 10,
                display: "block",
              }}
            >
              COUNTRY
            </span>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {["all", ...NEWS_SOURCE_COUNTRY_OPTIONS.map((option) => option.value)].map((value) => {
                const label =
                  value === "all"
                    ? "All"
                    : NEWS_SOURCE_COUNTRY_OPTIONS.find((option) => option.value === value)?.label || value;
                const isActive = country === value;
                const query = buildQueryString({
                  country: value === "all" ? undefined : value,
                  topic: topic === "all" ? undefined : topic,
                });

                return (
                  <Link
                    key={value}
                    href={query ? `/news?${query}` : "/news"}
                    style={isActive ? chipActiveStyle : chipInactiveStyle}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Topic filter */}
          <div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 10,
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
                color: "#666",
                marginBottom: 10,
                display: "block",
              }}
            >
              TOPIC
            </span>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {["all", ...NEWS_TOPIC_OPTIONS.map((option) => option.value)].map((value) => {
                const label =
                  value === "all"
                    ? "All"
                    : NEWS_TOPIC_OPTIONS.find((option) => option.value === value)?.label || value;
                const isActive = topic === value;
                const query = buildQueryString({
                  country: country === "all" ? undefined : country,
                  topic: value === "all" ? undefined : value,
                });

                return (
                  <Link
                    key={value}
                    href={query ? `/news?${query}` : "/news"}
                    style={isActive ? chipActiveStyle : chipInactiveStyle}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Meta Bar */}
      <div
        style={{
          background: "#F9FAFB",
          padding: "12px 32px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: "#888",
              margin: 0,
            }}
          >
            {isDataUnavailable
              ? "Live feed is temporarily unavailable while the CMS data connection is recovering. Please refresh in a few minutes."
              : `Showing ${news.docs.length} items on page ${news.page ?? 1} of ${news.totalPages ?? 1}${activeFilterCount > 0 ? " with active filters." : "."}`}
          </p>
        </div>
      </div>

      {/* Featured tribal coverage */}
      {(news.featured?.length ?? 0) > 0 && topic === "all" && currentPage === 1 && (
        <section style={{ padding: "32px 32px 0", background: "#fff" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 10,
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
                color: "#C8001F",
                marginBottom: 16,
              }}
            >
              Featured — Tribal & Infrastructure
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
                marginBottom: 8,
              }}
            >
              {news.featured!.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    textDecoration: "none",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "block",
                      height: 150,
                      background: item.imageUrl ? `url('${item.imageUrl}') center/cover no-repeat` : THUMBNAIL_PLACEHOLDER,
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  />
                  <span style={{ display: "block", padding: 20 }}>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: 10,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.1em",
                      color: "#888",
                    }}
                  >
                    {item.sourceName} · {formatDate(item.publishedAt)}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      textTransform: "uppercase" as const,
                      color: "#111",
                      marginTop: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </span>
                  {item.summary && (
                    <span
                      style={{
                        display: "block",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "#555",
                        marginTop: 8,
                      }}
                    >
                      {item.summary.slice(0, 140)}
                      {item.summary.length > 140 ? "…" : ""}
                    </span>
                  )}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Article List */}
      <section style={{ padding: "40px 32px 120px", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {news.docs.length === 0 ? (
            <div>
              <h2
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 32,
                  textTransform: "uppercase" as const,
                  color: "#111",
                  marginBottom: 12,
                  margin: "0 0 12px 0",
                }}
              >
                {isDataUnavailable ? "Feed unavailable" : "No news items match these filters yet."}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#555",
                  margin: 0,
                }}
              >
                {isDataUnavailable
                  ? "Our ingestion and CMS services are reconnecting."
                  : "Try broadening your country/topic filters or run ingestion to populate fresh stories."}
              </p>
            </div>
          ) : (
            <div
              className="news-page__article-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {news.docs.map((item, index) => (
              <article
                key={item.id}
                className={index === 0 ? "news-page__article-card news-page__article-card--lead" : "news-page__article-card"}
                style={{
                  border: "1px solid #E5E7EB",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column" as const,
                  minHeight: index === 0 ? 470 : 390,
                  gridColumn: index === 0 ? "span 2" : undefined,
                  boxShadow: index === 0 ? "0 18px 48px rgba(17,17,17,0.08)" : "none",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "100%",
                    minHeight: index === 0 ? 260 : 170,
                    background: item.imageUrl
                      ? `url('${item.imageUrl}') center/cover no-repeat`
                      : THUMBNAIL_PLACEHOLDER,
                  }}
                />

                {/* Article content */}
                <div style={{ flex: 1, padding: index === 0 ? 28 : 22, display: "flex", flexDirection: "column" }}>
                  {/* Meta row */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 8,
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 10,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.12em",
                        background: "#C8001F",
                        color: "#fff",
                        padding: "2px 8px",
                      }}
                    >
                      {item.sourceName}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "#888",
                      }}
                    >
                      {formatDate(item.publishedAt)}
                    </span>
                    {Array.isArray(item.countries) && item.countries.length > 0 && (
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "#888",
                        }}
                      >
                        {item.countries.map((entry: string) => entry.toUpperCase()).join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: index === 0 ? 34 : 24,
                      lineHeight: 1.02,
                      textTransform: "uppercase" as const,
                      color: "#111",
                      letterSpacing: "0.01em",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {item.title}
                  </a>

                  {/* Summary */}
                  {item.summary && (
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "#555",
                        marginTop: 8,
                        marginBottom: 18,
                      }}
                    >
                      {index === 0 ? item.summary : item.summary.slice(0, 180)}
                      {index !== 0 && item.summary.length > 180 ? "…" : ""}
                    </p>
                  )}
                  <span style={{ marginTop: "auto", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C8001F" }}>
                    Read source
                  </span>
                </div>
              </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {(news.totalPages ?? 1) > 1 && (
        <nav aria-label="Pagination" style={{ padding: "0 32px 80px", background: "#fff" }}>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              flexDirection: "row" as const,
              gap: 8,
            }}
          >
            {Array.from({ length: news.totalPages ?? 1 }).map((_, index) => {
              const targetPage = index + 1;
              const query = buildQueryString({
                country: country === "all" ? undefined : country,
                topic: topic === "all" ? undefined : topic,
                page: targetPage === 1 ? undefined : targetPage,
              });
              const isCurrentPage = targetPage === currentPage;
              return (
                <Link
                  key={targetPage}
                  href={query ? `/news?${query}` : "/news"}
                  style={
                    isCurrentPage
                      ? {
                          background: "#C8001F",
                          color: "#fff",
                          padding: "8px 14px",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          textDecoration: "none",
                          display: "inline-block",
                        }
                      : {
                          background: "#F9FAFB",
                          color: "#374151",
                          border: "1px solid #E5E7EB",
                          padding: "8px 14px",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          textDecoration: "none",
                          display: "inline-block",
                        }
                  }
                >
                  {targetPage}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </main>
  );
}
