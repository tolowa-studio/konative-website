import { defineField, defineType } from "sanity";

export const landSubmission = defineType({
  name: "landSubmission",
  title: "Land Submission",
  type: "document",
  fields: [
    // Step 1 — Property
    defineField({ name: "county", title: "County", type: "string", validation: r => r.required() }),
    defineField({ name: "state", title: "State", type: "string", validation: r => r.required() }),
    defineField({ name: "apn", title: "Parcel APN", type: "string" }),
    defineField({ name: "acreage", title: "Acreage", type: "number", validation: r => r.required().positive() }),
    defineField({ name: "ownershipType", title: "Ownership Type", type: "string", options: { list: ["sole", "partnership", "trust", "llc", "other"] } }),
    defineField({ name: "hasTalkedToBrokers", title: "Talked to other brokers?", type: "boolean" }),
    // Step 2 — Power & Infrastructure
    defineField({ name: "substationDistanceMiles", title: "Distance to substation (miles)", type: "number" }),
    defineField({ name: "transmissionVoltage", title: "Transmission voltage", type: "string", options: { list: ["<115kV", "115-230kV", "230-500kV", "500+kV", "unknown"] } }),
    defineField({ name: "fiberDistanceMiles", title: "Distance to fiber (miles)", type: "number" }),
    defineField({ name: "waterAccess", title: "Water access", type: "string", options: { list: ["yes", "no", "unknown"] } }),
    defineField({ name: "zoning", title: "Zoning", type: "string", options: { list: ["agricultural", "industrial", "mixed", "unknown"] } }),
    // Step 3 — Intent
    defineField({ name: "timeline", title: "Timeline", type: "string", options: { list: ["now", "6months", "12months", "exploring"] } }),
    defineField({ name: "priceExpectation", title: "Price expectation", type: "string" }),
    defineField({ name: "preferredStructure", title: "Preferred structure", type: "string", options: { list: ["sell", "ground-lease", "jv", "open"] } }),
    // Step 4 — Contact
    defineField({ name: "name", title: "Name", type: "string", validation: r => r.required() }),
    defineField({ name: "email", title: "Email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string", options: { list: ["owner", "agent", "family-rep", "other"] } }),
    defineField({ name: "referralSource", title: "Referral source", type: "string" }),
    // Meta
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["new", "contacted", "qualified", "dead"] }, initialValue: "new" }),
    defineField({ name: "utmSource", type: "string", title: "UTM Source" }),
    defineField({ name: "utmMedium", type: "string", title: "UTM Medium" }),
    defineField({ name: "submittedAt", type: "datetime", title: "Submitted At" }),
    defineField({ name: "triageScore", type: "number", title: "Triage score (0-100)", readOnly: true }),
    defineField({ name: "triageTier", type: "string", title: "Triage tier", options: { list: ["hot", "warm", "cold"] }, readOnly: true }),
    defineField({ name: "lane", type: "string", title: "Triage lane", options: { list: ["tribal", "datacenter", "general"] }, readOnly: true }),
    defineField({ name: "routeTo", type: "string", title: "Route to desk", readOnly: true }),
    defineField({ name: "slaHours", type: "number", title: "Response SLA (hours)", readOnly: true }),
  ],
  preview: {
    select: { name: "name", county: "county", state: "state", status: "status" },
    prepare({ name, county, state, status }: Record<string, string>) {
      return { title: name || "Unknown", subtitle: `${county || ""}, ${state || ""} · ${status || "new"}` };
    },
  },
});
