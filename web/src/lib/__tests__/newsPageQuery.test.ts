import { describe, expect, it } from "vitest";

import {
  buildFeaturedNewsFilter,
  buildNewsListFilter,
  formatNewsDeskStatusLine,
  fetchNewsPageData,
  type NewsDoc,
} from "../newsPageQuery";

describe("buildNewsListFilter", () => {
  it("includes the curation window by default", () => {
    const filter = buildNewsListFilter({ country: "all", topic: "all", withWindow: true });
    expect(filter).toContain('status == "published"');
    expect(filter).toContain("defined(publishedAt)");
    expect(filter).toContain("publishedAt >= $since");
  });

  it("omits the curation window for latest-published fallback", () => {
    const filter = buildNewsListFilter({ country: "all", topic: "all", withWindow: false });
    expect(filter).not.toContain("publishedAt >= $since");
    expect(filter).toContain('status == "published"');
    expect(filter).toContain("defined(publishedAt)");
  });

  it("keeps country and topic filters in fallback mode", () => {
    const filter = buildNewsListFilter({
      country: "us",
      topic: "tribal-broadband",
      withWindow: false,
    });
    expect(filter).toContain('"us" in coalesce(countries, [])');
    expect(filter).toContain('"tribal-broadband" in coalesce(topics, [])');
  });
});

describe("buildFeaturedNewsFilter", () => {
  it("matches tribal topics and optional window", () => {
    const withWindow = buildFeaturedNewsFilter({ country: "all", withWindow: true });
    expect(withWindow).toContain("tribal-data-center");
    expect(withWindow).toContain("publishedAt >= $since");

    const withoutWindow = buildFeaturedNewsFilter({ country: "ca", withWindow: false });
    expect(withoutWindow).not.toContain("publishedAt >= $since");
    expect(withoutWindow).toContain('"ca" in coalesce(countries, [])');
  });
});

describe("formatNewsDeskStatusLine", () => {
  it("describes the normal curation window", () => {
    expect(
      formatNewsDeskStatusLine({
        isDataUnavailable: false,
        isShowingLatestFallback: false,
        docsCount: 12,
        page: 1,
        totalPages: 2,
        activeFilterCount: 0,
      }),
    ).toBe("Last 10 days · 12 on page 1 of 2");
  });

  it("describes latest-published fallback without claiming recency", () => {
    expect(
      formatNewsDeskStatusLine({
        isDataUnavailable: false,
        isShowingLatestFallback: true,
        docsCount: 24,
        page: 1,
        totalPages: 6,
        activeFilterCount: 0,
        newestPublishedAt: "2026-07-16T12:00:00.000Z",
      }),
    ).toBe(
      "No stories in the last 10 days — showing the latest published instead (newest: Jul 16, 2026) · 24 on page 1 of 6",
    );
  });
});

describe("fetchNewsPageData", () => {
  it("falls back to latest published when the window is empty", async () => {
    const fallbackDocs: NewsDoc[] = [
      {
        id: "news-1",
        title: "Older story",
        publishedAt: "2026-07-16T12:00:00.000Z",
      },
    ];

    const client = {
      fetch: async <T>(query: string): Promise<T> => {
        if (query.startsWith("count")) {
          return 0 as T;
        }
        if (query.includes("[0...8]")) {
          return [] as T;
        }
        return fallbackDocs as T;
      },
    };

    const result = await fetchNewsPageData(client, {
      country: "all",
      topic: "all",
      currentPage: 1,
      since: "2026-08-09T00:00:00.000Z",
    });

    expect(result.isShowingLatestFallback).toBe(true);
    expect(result.docs).toEqual(fallbackDocs);
    expect(result.newestPublishedAt).toBe("2026-07-16T12:00:00.000Z");
  });

  it("keeps the empty state when fallback filters also match nothing", async () => {
    const client = {
      fetch: async <T>(query: string): Promise<T> => {
        if (query.startsWith("count")) {
          return 0 as T;
        }
        return [] as T;
      },
    };

    const result = await fetchNewsPageData(client, {
      country: "ca",
      topic: "tax",
      currentPage: 1,
      since: "2026-08-09T00:00:00.000Z",
    });

    expect(result.isShowingLatestFallback).toBe(false);
    expect(result.docs).toEqual([]);
  });

  it("uses the curation window when it has matches", async () => {
    const windowDocs: NewsDoc[] = [{ id: "news-fresh", title: "Fresh story" }];
    const calls: string[] = [];

    const client = {
      fetch: async <T>(query: string): Promise<T> => {
        calls.push(query);
        if (query.startsWith("count")) {
          return 1 as T;
        }
        if (query.includes("[0...8]")) {
          return [] as T;
        }
        return windowDocs as T;
      },
    };

    const result = await fetchNewsPageData(client, {
      country: "all",
      topic: "all",
      currentPage: 1,
      since: "2026-08-09T00:00:00.000Z",
    });

    expect(result.isShowingLatestFallback).toBe(false);
    expect(result.docs).toEqual(windowDocs);
    expect(calls.some((query) => query.includes("publishedAt >= $since"))).toBe(true);
  });
});
