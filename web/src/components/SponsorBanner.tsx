"use client";

import React, { useState, useEffect, useRef } from "react";

interface Placement {
  id: string;
  sponsor_name: string;
  logo_url: string | null;
  tagline: string;
  cta_url: string;
  cta_text: string;
  placement_type: string;
}

interface SponsorBannerProps {
  variant: "banner" | "card";
}

export default function SponsorBanner({ variant }: SponsorBannerProps) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    async function fetchPlacement() {
      try {
        const res = await fetch(
          `/api/v1/sponsors/placement?variant=${encodeURIComponent(variant)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.placement) setPlacement(data.placement);
        }
      } catch {
        // Silently fail — sponsors are non-critical
      }
    }
    fetchPlacement();
  }, [variant]);

  useEffect(() => {
    if (placement && !tracked.current) {
      tracked.current = true;
      try {
        const payload = JSON.stringify({
          event_type: "sponsor_impression",
          entity_type: "sponsorship_placement",
          entity_id: placement.id,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/v1/analytics/track", payload);
        } else {
          fetch("/api/v1/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          });
        }
      } catch {
        // ignore tracking errors
      }
    }
  }, [placement]);

  if (!placement) return null;

  const handleClick = () => {
    try {
      const payload = JSON.stringify({
        event_type: "sponsor_click",
        entity_type: "sponsorship_placement",
        entity_id: placement.id,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/v1/analytics/track", payload);
      } else {
        fetch("/api/v1/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    } catch {
      // ignore
    }
  };

  if (variant === "card") {
    return (
      <div className="sponsor-banner sponsor-banner--card">
        <span className="sponsor-banner__label">
          Sponsored by {placement.sponsor_name}
        </span>
        {placement.logo_url && (
          <img
            src={placement.logo_url}
            alt={placement.sponsor_name}
            className="sponsor-banner__logo"
          />
        )}
        <p className="sponsor-banner__tagline">{placement.tagline}</p>
        <a
          href={placement.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="sponsor-banner__cta"
          onClick={handleClick}
        >
          {placement.cta_text || "Learn More"}
        </a>
      </div>
    );
  }

  return (
    <div className="sponsor-banner sponsor-banner--banner">
      <div className="sponsor-banner__inner">
        <span className="sponsor-banner__label">
          Sponsored by {placement.sponsor_name}
        </span>
        <div className="sponsor-banner__content">
          {placement.logo_url && (
            <img
              src={placement.logo_url}
              alt={placement.sponsor_name}
              className="sponsor-banner__logo"
            />
          )}
          <div>
            <p className="sponsor-banner__tagline">{placement.tagline}</p>
            <a
              href={placement.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-banner__cta"
              onClick={handleClick}
            >
              {placement.cta_text || "Learn More"} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
