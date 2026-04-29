import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AudiencePage } from "@/content/audiences/types";

const fetchMock = vi.fn();

vi.mock("@/sanity/readClient", () => ({
  getSanityReadClient: () => ({ fetch: fetchMock }),
}));

const sample: AudiencePage = {
  slug: "tribes",
  displayName: "Tribal Nations",
  tileDescription: "tile",
  metaTitle: "title",
  metaDescription: "meta",
  order: 10,
  hero: {
    eyebrow: "eyebrow",
    headline: "Headline",
    subhead: "Subhead",
    primaryCta: { label: "CTA", href: "#cta" },
  },
  whyNow: { title: "Why", bullets: ["a"] },
  whatYouAlreadyHave: { title: "Have", bullets: ["b"] },
  whatKonativeDoes: {
    title: "Does",
    bands: [
      { title: "Path", body: "x" },
      { title: "Power", body: "y" },
      { title: "Cap", body: "z" },
    ],
  },
  firstEngagement: {
    title: "First",
    steps: [{ label: "Discovery", body: "x" }],
    pricingPosture: "Engagement-based.",
  },
  trust: { title: "Why us", items: [{ label: "Geo", body: "x" }] },
  adjacentAudiences: { title: "Other?", pointers: ["advisors"] },
  finalCta: { headline: "Final", subhead: "Sub", primaryCta: { label: "Submit", href: "#cta" } },
};

describe("getAudiencePage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns the matching audience page when found", async () => {
    fetchMock.mockResolvedValue(sample);
    const { getAudiencePage } = await import("../fetch");
    const result = await getAudiencePage("tribes");
    expect(result).toEqual(sample);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [query, params] = fetchMock.mock.calls[0];
    expect(typeof query).toBe("string");
    expect(query).toContain('_type == "audiencePage"');
    expect(params).toEqual({ slug: "tribes" });
  });

  it("returns null when no document exists for the slug", async () => {
    fetchMock.mockResolvedValue(null);
    const { getAudiencePage } = await import("../fetch");
    const result = await getAudiencePage("does-not-exist");
    expect(result).toBeNull();
  });
});

describe("listAudiencePages", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("calls a query that orders by order asc, displayName asc", async () => {
    fetchMock.mockResolvedValue([sample]);
    const { listAudiencePages } = await import("../fetch");
    const all = await listAudiencePages();
    expect(all).toHaveLength(1);
    const [query] = fetchMock.mock.calls[0];
    expect(query).toContain("order(order asc, displayName asc)");
  });

  it("returns an empty array when Sanity returns null", async () => {
    fetchMock.mockResolvedValue(null);
    const { listAudiencePages } = await import("../fetch");
    const all = await listAudiencePages();
    expect(all).toEqual([]);
  });
});
