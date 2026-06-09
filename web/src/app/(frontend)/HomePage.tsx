"use client";

import { useEffect, useState } from "react";
import HeroSection from "./_sections/HeroSection";
import ConnectivityPortfolio from "./_sections/ConnectivityPortfolio";
import WhoWeServe from "./_sections/WhoWeServe";
import Capabilities from "./_sections/Capabilities";
import TeamSection from "./_sections/TeamSection";
import MarketIntel from "./_sections/MarketIntel";
import StartNowCTA from "./_sections/StartNowCTA";
import type { HomeConnectivityContent } from "@/content/homeConnectivity";

interface ApiDeal {
  id: string;
  entity_name: string | null;
  deal_type: string | null;
  deal_value_usd: number | null;
  status: string | null;
  partner_companies: string[] | null;
  us_locations: string[] | null;
  summary: string | null;
  category: string | null;
}

interface Deal {
  id: string;
  name: string;
  entity: string;
  size: string;
  status: "ACTIVE" | "ANNOUNCED" | "CLOSED";
  geography: string;
}

interface Article {
  id: string;
  title: string;
  summary?: string;
  category: string;
  source?: string;
  published_at: string;
  url?: string;
  image_url?: string | null;
}

interface HealthStats {
  articleCount: number;
  feedCount: number;
  dealCount: number;
  facilitiesScored?: number;
  generatorsTracked?: number;
  waterSitesIndexed?: number;
  networkNodesIndexed?: number;
}

function formatUsd(v: number | null): string {
  if (!v) return "—";
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

function mapDeal(d: ApiDeal): Deal {
  const statusRaw = (d.status || "ACTIVE").toUpperCase();
  const status: Deal["status"] =
    statusRaw === "ANNOUNCED" ? "ANNOUNCED" : statusRaw === "CLOSED" ? "CLOSED" : "ACTIVE";

  return {
    id: d.id,
    name: d.entity_name || "Unnamed deal",
    entity: d.partner_companies?.join(" / ") || d.entity_name || "—",
    size: formatUsd(d.deal_value_usd),
    status,
    geography: d.us_locations?.join(", ") || "North America",
  };
}

/**
 * Production homepage: composed in-code sections (hero, capabilities, team, etc.).
 * Builder.io is not used for `/` — use `/builder/[[...path]]` for visual experiments.
 */
export default function HomePage({ content }: { content: HomeConnectivityContent }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<HealthStats>({ articleCount: 61, feedCount: 16, dealCount: 5 });

  useEffect(() => {
    fetch("/api/v1/deals")
      .then((r) => r.json())
      .then((d) => {
        const rows: ApiDeal[] = d.deals || d.data || d || [];
        setDeals(rows.map(mapDeal));
      })
      .catch(() => {});

    fetch("/api/v1/content?limit=6")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || d.data || []))
      .catch(() => {});

    fetch("/api/v1/health")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <>
      <HeroSection deals={deals} stats={stats} content={content} />
      <ConnectivityPortfolio content={content} />
      <WhoWeServe content={content} />
      <Capabilities content={content} />
      <TeamSection />
      <MarketIntel articles={articles} />
      <StartNowCTA />
    </>
  );
}
