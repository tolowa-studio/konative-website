import HomePage from "./HomePage";
import { HOME_CONNECTIVITY_DEFAULT, type HomeConnectivityContent } from "@/content/homeConnectivity";
import { getSanityReadClient } from "@/sanity/readClient";

export const dynamic = "force-dynamic";

const homeQuery = `*[_type == "homeConnectivity"][0]{
  heroEyebrow, heroHeadline, heroSubhead, heroPrimaryCta, heroSecondaryCtas, heroStats,
  portfolioEyebrow, portfolioHeadingTop, portfolioHeadingBottom, portfolioIntro, portfolioItems,
  wedgeEyebrow, wedgeHeadingTop, wedgeHeadingBottom, wedges,
  howEyebrow, howHeadingTop, howHeadingBottom, howIntro, capabilities
}`;

/** Use the Sanity value when it's a non-empty array/string, else the default. */
function pick<T>(value: T | undefined | null, fallback: T): T {
  if (value == null) return fallback;
  if (Array.isArray(value) && value.length === 0) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return value;
}

async function getContent(): Promise<HomeConnectivityContent> {
  const d = HOME_CONNECTIVITY_DEFAULT;
  try {
    const doc = await getSanityReadClient().fetch<Partial<HomeConnectivityContent> | null>(homeQuery);
    if (!doc) return d;
    return {
      heroEyebrow: pick(doc.heroEyebrow, d.heroEyebrow),
      heroHeadline: pick(doc.heroHeadline, d.heroHeadline),
      heroSubhead: pick(doc.heroSubhead, d.heroSubhead),
      heroPrimaryCta: pick(doc.heroPrimaryCta, d.heroPrimaryCta),
      heroSecondaryCtas: pick(doc.heroSecondaryCtas, d.heroSecondaryCtas),
      heroStats: pick(doc.heroStats, d.heroStats),
      portfolioEyebrow: pick(doc.portfolioEyebrow, d.portfolioEyebrow),
      portfolioHeadingTop: pick(doc.portfolioHeadingTop, d.portfolioHeadingTop),
      portfolioHeadingBottom: pick(doc.portfolioHeadingBottom, d.portfolioHeadingBottom),
      portfolioIntro: pick(doc.portfolioIntro, d.portfolioIntro),
      portfolioItems: pick(doc.portfolioItems, d.portfolioItems),
      wedgeEyebrow: pick(doc.wedgeEyebrow, d.wedgeEyebrow),
      wedgeHeadingTop: pick(doc.wedgeHeadingTop, d.wedgeHeadingTop),
      wedgeHeadingBottom: pick(doc.wedgeHeadingBottom, d.wedgeHeadingBottom),
      wedges: pick(doc.wedges, d.wedges),
      howEyebrow: pick(doc.howEyebrow, d.howEyebrow),
      howHeadingTop: pick(doc.howHeadingTop, d.howHeadingTop),
      howHeadingBottom: pick(doc.howHeadingBottom, d.howHeadingBottom),
      howIntro: pick(doc.howIntro, d.howIntro),
      capabilities: pick(doc.capabilities, d.capabilities),
    };
  } catch {
    return d;
  }
}

export default async function Page() {
  const content = await getContent();
  return <HomePage content={content} />;
}
