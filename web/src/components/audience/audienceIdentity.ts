import type { AudienceSlug } from "@/content/audiences/types";

export type AudienceIdentity = {
  /** Accent color unique to this audience. */
  color: string;
  /** Two-digit display number. */
  mark: string;
  /** "You're in the right place if…" qualifier shown at the top of each landing page. */
  qualifier: string;
};

export const AUDIENCE_IDENTITY: Record<AudienceSlug, AudienceIdentity> = {
  tribes: {
    color: "#E07B39",
    mark: "01",
    qualifier:
      "You represent a tribal nation or Indigenous development corporation evaluating what data center development could mean for your land base and energy assets.",
  },
  advisors: {
    color: "#2DD4BF",
    mark: "02",
    qualifier:
      "You work with tribal nations, investors, or landowners and want a trustworthy, neutral partner you can introduce them to — and earn on closed referrals.",
  },
  investors: {
    color: "#FBBF24",
    mark: "03",
    qualifier:
      "You deploy capital into data center or energy infrastructure and are looking for pre-qualified sites in markets that most capital has overlooked.",
  },
  landowners: {
    color: "#86EFAC",
    mark: "04",
    qualifier:
      "You own land near power infrastructure and want to know whether it qualifies for data center development — and what that would actually look like.",
  },
  utilities: {
    color: "#93C5FD",
    mark: "05",
    qualifier:
      "You work at a utility or grid operator fielding data center interconnect requests and want to understand how to structure and route that demand.",
  },
  "developers-epcs": {
    color: "#C4B5FD",
    mark: "06",
    qualifier:
      "You develop or build data center infrastructure and are looking for pre-qualified sites, landowner relationships, and markets ahead of mainstream capital.",
  },
  operators: {
    color: "#FDA4AF",
    mark: "07",
    qualifier:
      "You operate data centers and are expanding capacity into new markets — particularly indigenous, rural, or jurisdictions where others are not yet competing.",
  },
};

export function getAudienceIdentity(slug: string): AudienceIdentity {
  return (
    AUDIENCE_IDENTITY[slug as AudienceSlug] ?? {
      color: "#E07B39",
      mark: "—",
      qualifier: "",
    }
  );
}
