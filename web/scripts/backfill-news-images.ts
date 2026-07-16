/**
 * One-shot: re-parse active RSS/Atom feeds and patch existing Sanity newsItems
 * that are missing imageUrl, matching by article URL.
 *
 * Usage: npx tsx --env-file=.env.local scripts/backfill-news-images.ts
 */
import { createClient } from "@sanity/client";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: true,
  trimValues: true,
});

const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const isHttpUrl = (value: unknown): value is string =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const looksLikeImageUrl = (url: string) =>
  /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(url) || /\/image\//i.test(url);

const firstImgSrc = (html: unknown): string | undefined => {
  if (typeof html !== "string" || !html.includes("<img")) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const src = match?.[1]?.trim();
  return isHttpUrl(src) ? src : undefined;
};

const mediaUrls = (node: unknown): string[] => {
  const urls: string[] = [];
  for (const entry of asArray(node as Record<string, unknown> | Record<string, unknown>[] | undefined)) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (isHttpUrl(record.url)) urls.push(record.url.trim());
    if (isHttpUrl(record.href)) urls.push(String(record.href).trim());
    urls.push(...mediaUrls(record["media:content"]));
    urls.push(...mediaUrls(record["media:thumbnail"]));
    urls.push(...mediaUrls(record["media:group"]));
  }
  return urls;
};

const enclosureUrl = (enclosure: unknown): string | undefined => {
  for (const entry of asArray(enclosure as Record<string, unknown> | Record<string, unknown>[] | undefined)) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url.trim() : "";
    if (!isHttpUrl(url)) continue;
    const type = typeof record.type === "string" ? record.type : "";
    if (type.startsWith("image/") || looksLikeImageUrl(url) || !type) return url;
  }
  return undefined;
};

const pickImageUrl = (item: any): string | undefined => {
  const htmlBlob = [item?.["content:encoded"], item?.description, item?.content, item?.summary]
    .map((value) => (typeof value === "string" ? value : typeof value?.["#text"] === "string" ? value["#text"] : ""))
    .join(" ");

  const candidates = [
    item?.image?.url,
    enclosureUrl(item?.enclosure),
    ...mediaUrls(item?.["media:content"]),
    ...mediaUrls(item?.["media:thumbnail"]),
    ...mediaUrls(item?.["media:group"]),
    item?.thumbnail?.url,
    item?.["itunes:image"]?.href,
    typeof item?.["itunes:image"] === "string" ? item["itunes:image"] : undefined,
    ...asArray(item?.link)
      .filter((link: any) => {
        const rel = String(link?.rel || "").toLowerCase();
        const type = String(link?.type || "");
        return rel === "enclosure" || rel === "image" || type.startsWith("image/");
      })
      .map((link: any) => link?.href),
    firstImgSrc(htmlBlob),
  ];

  return candidates.find((value) => isHttpUrl(value))?.trim();
};

const normalizeUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) =>
      parsed.searchParams.delete(key),
    );
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
};

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;
  if (!projectId || !token) {
    throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN");
  }

  const sanity = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

  const sources = await sanity.fetch<Array<{ name: string; feedUrl?: string }>>(
    `*[_type == "newsSource" && active == true && defined(feedUrl)]{ name, feedUrl }`,
  );

  const imageByUrl = new Map<string, string>();

  for (const source of sources) {
    if (!source.feedUrl) continue;
    try {
      const response = await fetch(source.feedUrl, {
        headers: { "user-agent": "KonativeNewsBot/1.0 (+https://konative.com)" },
      });
      if (!response.ok) {
        console.log(`[${source.name}] feed HTTP ${response.status}`);
        continue;
      }
      const xml = await response.text();
      const parsed = parser.parse(xml);
      const items = [...asArray(parsed?.rss?.channel?.item), ...asArray(parsed?.feed?.entry)];
      let found = 0;
      for (const item of items) {
        const linkValue =
          typeof item?.link === "string"
            ? item.link
            : item?.link?.href || asArray(item?.link).find((l: any) => l?.href)?.href;
        const articleUrl = String(linkValue || "").trim();
        const imageUrl = pickImageUrl(item);
        if (!articleUrl || !imageUrl) continue;
        imageByUrl.set(normalizeUrl(articleUrl), imageUrl);
        imageByUrl.set(articleUrl, imageUrl);
        found += 1;
      }
      console.log(`[${source.name}] ${found}/${items.length} items with images`);
    } catch (error) {
      console.log(`[${source.name}] error: ${error instanceof Error ? error.message : error}`);
    }
  }

  const missing = await sanity.fetch<Array<{ _id: string; url?: string }>>(
    `*[_type == "newsItem" && status == "published" && defined(url) && (!defined(imageUrl) || imageUrl == "")]{ _id, url }`,
  );

  let patched = 0;
  let ops: Array<{ id: string; imageUrl: string }> = [];

  for (const doc of missing) {
    if (!doc.url) continue;
    const imageUrl = imageByUrl.get(doc.url) || imageByUrl.get(normalizeUrl(doc.url));
    if (!imageUrl) continue;
    ops.push({ id: doc._id, imageUrl });
  }

  for (let i = 0; i < ops.length; i += 80) {
    const chunk = ops.slice(i, i + 80);
    let tx = sanity.transaction();
    for (const op of chunk) {
      tx = tx.patch(op.id, { set: { imageUrl: op.imageUrl } });
    }
    await tx.commit();
    patched += chunk.length;
    console.log(`Patched ${patched}/${ops.length}`);
  }

  console.log(
    JSON.stringify(
      {
        sources: sources.length,
        feedImageKeys: imageByUrl.size,
        missingDocs: missing.length,
        patched,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
