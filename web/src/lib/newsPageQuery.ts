import {
  NEWS_CURATION_WINDOW_DAYS,
  NEWS_TOPIC_OPTIONS,
  TRIBAL_NEWS_TOPIC_VALUES,
  type NewsTopicValue,
} from "./newsConstants";

export const NEWS_ITEMS_PER_PAGE = 24;

export type NewsDoc = {
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

export type NewsPageFilters = {
  country: "all" | "us" | "ca";
  topic: "all" | NewsTopicValue;
  currentPage: number;
  since: string;
};

export type NewsPageData = {
  docs: NewsDoc[];
  featured: NewsDoc[];
  page: number;
  totalPages: number;
  isShowingLatestFallback: boolean;
  newestPublishedAt?: string;
};

type SanityFetchClient = {
  fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>;
};

const newsDocProjection = `{
  "id": _id,
  title,
  url,
  imageUrl,
  summary,
  sourceName,
  publishedAt,
  countries,
  topics
}`;

/** GROQ filter for the paginated news list (optional curation window). */
export function buildNewsListFilter(params: {
  country: NewsPageFilters["country"];
  topic: NewsPageFilters["topic"];
  withWindow: boolean;
}): string {
  let filter =
    `_type == "newsItem" && status == "published" && defined(publishedAt)` +
    (params.withWindow ? ` && publishedAt >= $since` : "");

  if (params.country !== "all") {
    filter += ` && "${params.country}" in coalesce(countries, [])`;
  }
  if (params.topic !== "all") {
    filter += ` && "${params.topic}" in coalesce(topics, [])`;
  }

  return filter;
}

/** GROQ filter for the tribal featured shelf (optional curation window). */
export function buildFeaturedNewsFilter(params: {
  country: NewsPageFilters["country"];
  withWindow: boolean;
}): string {
  let filter =
    `_type == "newsItem" && status == "published" && defined(publishedAt)` +
    (params.withWindow ? ` && publishedAt >= $since` : "") +
    ` && (` +
    TRIBAL_NEWS_TOPIC_VALUES.map((topic) => `"${topic}" in coalesce(topics, [])`).join(" || ") +
    `)`;

  if (params.country !== "all") {
    filter += ` && "${params.country}" in coalesce(countries, [])`;
  }

  return filter;
}

export function formatNewsDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatNewsDeskStatusLine(params: {
  isDataUnavailable: boolean;
  isShowingLatestFallback: boolean;
  docsCount: number;
  page: number;
  totalPages: number;
  activeFilterCount: number;
  newestPublishedAt?: string;
}): string {
  if (params.isDataUnavailable) {
    return "Live feed is temporarily unavailable while the CMS data connection is recovering.";
  }

  const pageSuffix = ` · ${params.docsCount} on page ${params.page} of ${params.totalPages}${
    params.activeFilterCount > 0 ? " with filters" : ""
  }`;

  if (params.isShowingLatestFallback) {
    const newest = formatNewsDate(params.newestPublishedAt);
    const newestSuffix = newest ? ` (newest: ${newest})` : "";
    return `No stories in the last ${NEWS_CURATION_WINDOW_DAYS} days — showing the latest published instead${newestSuffix}${pageSuffix}`;
  }

  return `Last ${NEWS_CURATION_WINDOW_DAYS} days${pageSuffix}`;
}

export function topicLabel(topics?: string[]): string {
  const first = topics?.[0];
  if (!first) return "Infrastructure";
  return NEWS_TOPIC_OPTIONS.find((option) => option.value === first)?.label || first;
}

export async function fetchNewsPageData(
  client: SanityFetchClient,
  filters: NewsPageFilters,
): Promise<NewsPageData> {
  const windowFilter = buildNewsListFilter({
    country: filters.country,
    topic: filters.topic,
    withWindow: true,
  });

  const windowTotal = await client.fetch<number>(`count(*[${windowFilter}])`, {
    since: filters.since,
  });

  const useFallback = windowTotal === 0;
  const listFilter = useFallback
    ? buildNewsListFilter({ country: filters.country, topic: filters.topic, withWindow: false })
    : windowFilter;

  const queryParams = useFallback ? {} : { since: filters.since };
  const total = useFallback
    ? await client.fetch<number>(`count(*[${listFilter}])`, queryParams)
    : windowTotal;

  const totalPages = Math.max(1, Math.ceil(total / NEWS_ITEMS_PER_PAGE));
  const safePage = Math.min(filters.currentPage, totalPages);
  const safeStart = (safePage - 1) * NEWS_ITEMS_PER_PAGE;
  const safeEnd = safeStart + NEWS_ITEMS_PER_PAGE;

  const docs = await client.fetch<NewsDoc[]>(
    `*[${listFilter}] | order(publishedAt desc)[${safeStart}...${safeEnd}]${newsDocProjection}`,
    queryParams,
  );

  const featured =
    filters.topic === "all" && safePage === 1 && docs.length > 0
      ? await client.fetch<NewsDoc[]>(
          `*[${buildFeaturedNewsFilter({ country: filters.country, withWindow: !useFallback })}] | order(publishedAt desc)[0...8]${newsDocProjection}`,
          useFallback ? {} : { since: filters.since },
        )
      : [];

  return {
    docs,
    featured,
    page: safePage,
    totalPages,
    isShowingLatestFallback: useFallback && docs.length > 0,
    newestPublishedAt: useFallback ? docs[0]?.publishedAt : undefined,
  };
}
