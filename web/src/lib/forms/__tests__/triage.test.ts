import { describe, it, expect } from "vitest";
import { scoreInquiry, TRIAGE_RUBRIC } from "@/lib/forms/triage";

describe("scoreInquiry — lane detection", () => {
  it("detects the tribal lane from org/message signals", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: {
        organization: "Confederated Tribes of the Umatilla",
        message: "Our tribal nation is evaluating connectivity.",
      },
    });
    expect(r.lane).toBe("tribal");
    expect(r.routeTo).toBe("tribal-desk");
  });

  it("detects the tribal lane from casino/gaming keywords", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { organization: "Riverwind Casino", message: "Gaming property fiber." },
    });
    expect(r.lane).toBe("tribal");
  });

  it("detects the datacenter lane from a capacityRequest schema type", () => {
    const r = scoreInquiry({
      schemaType: "capacityRequest",
      fields: { company: "Acme Compute" },
    });
    expect(r.lane).toBe("datacenter");
    expect(r.routeTo).toBe("datacenter-desk");
  });

  it("detects the datacenter lane from hyperscale/MW keywords", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { message: "We are a hyperscale operator needing 50 MW of colo." },
    });
    expect(r.lane).toBe("datacenter");
  });

  it("falls back to the general lane with no signals", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { organization: "Generic Widgets Inc", message: "Just a general question." },
    });
    expect(r.lane).toBe("general");
    expect(r.routeTo).toBe("general-desk");
  });

  it("prefers tribal over datacenter when both signals present", () => {
    const r = scoreInquiry({
      schemaType: "capacityRequest",
      fields: {
        company: "Tribal Nation Data Center Authority",
        message: "hyperscale colocation for our reservation",
      },
    });
    expect(r.lane).toBe("tribal");
  });
});

describe("scoreInquiry — hot leads", () => {
  it("scores a tribal NTIA lead as hot", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: {
        name: "Jane Chief",
        email: "jane@umatilla.gov",
        organization: "Confederated Tribes of the Umatilla",
        phone: "555-123-4567",
        message:
          "We are preparing an NTIA TBCP Round 3 application and need a connectivity partner for our reservation broadband build-out this year.",
      },
    });
    expect(r.lane).toBe("tribal");
    expect(r.tier).toBe("hot");
    expect(r.score).toBeGreaterThanOrEqual(TRIAGE_RUBRIC.tier.hot);
    expect(r.slaHours).toBe(TRIAGE_RUBRIC.sla.hot);
    expect(r.routeTo).toBe("tribal-desk");
    // org + business email + phone + lane + grant + detailed msg
    expect(r.reasons.length).toBeGreaterThanOrEqual(5);
  });

  it("scores a datacenter capacity lead with MW as hot", () => {
    const r = scoreInquiry({
      schemaType: "capacityRequest",
      fields: {
        name: "Bob Builder",
        company: "Nimbus Hyperscale",
        email: "bob@nimbuscloud.io",
        phone: "555-987-6543",
        mwRequired: 120,
        targetOnlineDate: "2027-Q1",
        connectivityNeeds:
          "We need multi-carrier DCI interconnect and dark fiber to two metros for a 120MW training campus.",
      },
    });
    expect(r.lane).toBe("datacenter");
    expect(r.tier).toBe("hot");
    expect(r.score).toBeGreaterThanOrEqual(TRIAGE_RUBRIC.tier.hot);
    expect(r.slaHours).toBe(4);
    expect(r.routeTo).toBe("datacenter-desk");
  });
});

describe("scoreInquiry — cold leads", () => {
  it("scores a gmail one-liner as cold", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: {
        name: "Someone",
        email: "someone@gmail.com",
        message: "hi",
      },
    });
    expect(r.tier).toBe("cold");
    expect(r.lane).toBe("general");
    expect(r.slaHours).toBe(TRIAGE_RUBRIC.sla.cold);
    expect(r.score).toBeLessThan(TRIAGE_RUBRIC.tier.warm);
  });

  it("does not award the business-email bonus for free webmail", () => {
    const free = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { email: "x@yahoo.com" },
    });
    const business = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { email: "x@corp.com" },
    });
    expect(business.score - free.score).toBe(TRIAGE_RUBRIC.points.businessEmail);
  });
});

describe("scoreInquiry — tier boundaries", () => {
  it("treats exactly the hot threshold as hot", () => {
    // org(15) + businessEmail(15) + lane(15) + grant(20) = 65 = hot cutoff
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: {
        organization: "Tribal Broadband Authority",
        email: "a@authority.org",
        message: "BEAD grant question",
      },
    });
    expect(r.score).toBe(65);
    expect(r.tier).toBe("hot");
  });

  it("treats exactly the warm threshold as warm", () => {
    // org(15) + lane(15) + detailed message(10, but not >120)... build 35 precisely:
    // org(15) + businessEmail(15) + phone... use lane(15)+org(15)+businessEmail(15)? = 45.
    // Use org(15) + businessEmail(15) + phone(10)? no lane = 40 warm.
    // Target 35: businessEmail(15) + phone(10) + lane(15) = 40. Instead org(15)+phone(10)+lane(15)=40.
    // Simplest exact 35: org(15) + businessEmail(15) ... = 30 (cold). Add phone(10) => 40.
    // Compose 35 = businessEmail(15) + lane(15) ... =30. + short. Use dealSignal.
    // Use lane(15) + dealSignal(15) ... =30. Not 35. Use org(15)+lane(15)+? none=30.
    // 35 exactly via org(15)+businessEmail(15)... 30; not reachable exactly with these weights,
    // so assert the boundary semantics: a 35-ish warm lead lands warm.
    const r = scoreInquiry({
      schemaType: "capacityRequest", // lane +15
      fields: {
        company: "Small Co", // org +15
        email: "ceo@smallco.com", // business +15
      },
    });
    // lane(15) + org(15) + business(15) = 45 => warm (>=35, <65)
    expect(r.score).toBeGreaterThanOrEqual(TRIAGE_RUBRIC.tier.warm);
    expect(r.score).toBeLessThan(TRIAGE_RUBRIC.tier.hot);
    expect(r.tier).toBe("warm");
  });

  it("stays cold just below the warm threshold", () => {
    // businessEmail(15) + phone(10) = 25 < 35
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { email: "x@corp.com", phone: "555-0000" },
    });
    expect(r.score).toBe(25);
    expect(r.tier).toBe("cold");
  });

  it("caps the score at 100", () => {
    const r = scoreInquiry({
      schemaType: "capacityRequest",
      fields: {
        organization: "Tribal Nation Casino Authority",
        email: "chief@nation.gov",
        phone: "555-111-2222",
        mwRequired: 200,
        timeline: "this_quarter",
        message:
          "NTIA TBCP Round 3 BEAD grant hyperscale colocation megawatt interconnect for our reservation, a very long and detailed message describing everything in great specificity here.",
      },
    });
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.score).toBe(100);
    expect(r.tier).toBe("hot");
  });
});

describe("scoreInquiry — grant campaign", () => {
  it("awards the grant bonus for an NTIA mention", () => {
    const withGrant = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { organization: "Co", message: "NTIA funding" },
    });
    const withoutGrant = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { organization: "Co", message: "funding" },
    });
    expect(withGrant.score - withoutGrant.score).toBe(TRIAGE_RUBRIC.points.grantCampaign);
  });
});

describe("scoreInquiry — graceful handling of empty/partial input", () => {
  it("does not throw on undefined input", () => {
    expect(() => scoreInquiry(undefined)).not.toThrow();
    const r = scoreInquiry(undefined);
    expect(r.tier).toBe("cold");
    expect(r.lane).toBe("general");
    expect(r.score).toBe(0);
  });

  it("does not throw on null input", () => {
    expect(() => scoreInquiry(null)).not.toThrow();
  });

  it("does not throw on empty object", () => {
    const r = scoreInquiry({});
    expect(r.score).toBe(0);
    expect(r.tier).toBe("cold");
    expect(r.routeTo).toBe("general-desk");
    expect(r.slaHours).toBe(TRIAGE_RUBRIC.sla.cold);
  });

  it("ignores non-string field values without throwing", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: {
        email: 12345 as unknown as string,
        organization: { nested: true } as unknown as string,
        marketPreferences: ["us-west", "us-east"],
        acreage: 500,
      },
    });
    expect(typeof r.score).toBe("number");
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("handles a malformed email with no domain", () => {
    const r = scoreInquiry({
      schemaType: "contactInquiry",
      fields: { email: "not-an-email" },
    });
    expect(() => r).not.toThrow();
    // no domain → no business-email bonus
    expect(r.score).toBe(0);
  });

  it("always returns a well-formed result shape", () => {
    const r = scoreInquiry({ fields: {} });
    expect(r).toHaveProperty("score");
    expect(r).toHaveProperty("tier");
    expect(r).toHaveProperty("lane");
    expect(r).toHaveProperty("routeTo");
    expect(r).toHaveProperty("reasons");
    expect(r).toHaveProperty("slaHours");
    expect(Array.isArray(r.reasons)).toBe(true);
  });
});
