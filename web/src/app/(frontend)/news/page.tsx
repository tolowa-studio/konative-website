import Link from "next/link";

import {
  NEWS_SOURCE_COUNTRY_OPTIONS,
  NEWS_TOPIC_OPTIONS,
  isNewsTopicValue,
} from "../../../lib/newsConstants";

export const revalidate = 3600;
import { getSanityReadClient } from "../../../sanity/readClient";

export const dynamic = "force-dynamic";

const THUMBNAIL_PLACEHOLDER =
  "repeating-linear-gradient(-55deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 18px), " +
  "linear-gradient(160deg, #111111 0%, #374151 100%)";

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
    docs: any[];
    page?: number;
    totalPages?: number;
  } = {
    docs: [],
    page: currentPage,
    totalPages: 1,
  };

  const filter =
    `_type == "newsItem" && status == "published"` +
    (country !== "all" ? ` && "${country}" in coalesce(countries, [])` : "") +
    (topic !== "all" ? ` && "${topic}" in coalesce(topics, [])` : "");

  try {
    const client = getSanityReadClient();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const total = await client.fetch<number>(`count(*[${filter}])`, {});
    const docs = await client.fetch<any[]>(
      `*[${filter}] | order(publishedAt desc)[${start}...${end}]{
        "id": _id,
        title,
        url,
        summary,
        sourceName,
        publishedAt,
        countries,
        topics
      }`,
      {},
    );
    news = {
      docs,
      page: currentPage,
      totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
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
    <main style={{ background: "#fff", minHeight: "100vh" }}>
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
        <div aria-hidden="true" style={{ position: "absolute", top: -80, right: "10%", width: 4, height: 420, background: "#C8001F", transform: "rotate(18deg)", opacity: 0.9 }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
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
            MARKET <span style={{ color: "#C8001F" }}>INTELLIGENCE</span> FEED
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: "#6B7280",
              maxWidth: 560,
              marginTop: 16,
              marginBottom: 0,
            }}
          >
            US and Canada coverage for datacenter construction, permitting, regulations, and capital announcements.
          </p>
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
            news.docs.map((item: any) => (
              <article
                key={item.id}
                style={{
                  padding: "24px 0",
                  borderBottom: "1px solid #E5E7EB",
                  display: "flex",
                  flexDirection: "row" as const,
                  gap: 32,
                  alignItems: "flex-start",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 120,
                    height: 80,
                    flexShrink: 0,
                    background: item.imageUrl
                      ? `url('${item.imageUrl}') center/cover no-repeat`
                      : THUMBNAIL_PLACEHOLDER,
                  }}
                />

                {/* Article content */}
                <div style={{ flex: 1 }}>
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
                      fontSize: 20,
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
                        marginBottom: 0,
                      }}
                    >
                      {item.summary}
                    </p>
                  )}
                </div>
              </article>
            ))
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
