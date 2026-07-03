import { defineField, defineType } from "sanity";

export const investorProfile = defineType({
  name: "investorProfile",
  title: "Investor Profile",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "firm", type: "string" }),
    defineField({ name: "email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "aumBand", title: "AUM Band", type: "string", options: { list: ["<$100M", "$100M-$500M", "$500M-$2B", "$2B-$10B", "$10B+"] } }),
    defineField({ name: "checkSize", title: "Check Size", type: "string", options: { list: ["<$10M", "$10M-$50M", "$50M-$200M", "$200M-$1B", "$1B+"] } }),
    defineField({ name: "assetPreferences", title: "Asset Preferences", type: "array", of: [{ type: "string" }], options: { list: ["powered-land", "stabilized-colo", "development-jv", "platform"] } }),
    defineField({ name: "geographyPreferences", title: "Geography", type: "text" }),
    defineField({ name: "status", type: "string", options: { list: ["new", "contacted", "qualified", "dead"] }, initialValue: "new" }),
    defineField({ name: "utmSource", type: "string" }),
    defineField({ name: "utmMedium", type: "string" }),
    defineField({ name: "submittedAt", type: "datetime" }),
    defineField({ name: "triageScore", type: "number", title: "Triage score (0-100)", readOnly: true }),
    defineField({ name: "triageTier", type: "string", title: "Triage tier", options: { list: ["hot", "warm", "cold"] }, readOnly: true }),
    defineField({ name: "lane", type: "string", title: "Triage lane", options: { list: ["tribal", "datacenter", "general"] }, readOnly: true }),
    defineField({ name: "routeTo", type: "string", title: "Route to desk", readOnly: true }),
    defineField({ name: "slaHours", type: "number", title: "Response SLA (hours)", readOnly: true }),
  ],
  preview: {
    select: { name: "name", firm: "firm", status: "status" },
    prepare({ name, firm, status }: Record<string, string>) {
      return { title: name || "Unknown", subtitle: `${firm || ""} · ${status || "new"}` };
    },
  },
});
