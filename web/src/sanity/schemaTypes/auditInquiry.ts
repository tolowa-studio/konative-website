import { defineField, defineType } from "sanity";

/**
 * R4 Readiness Audit inquiry — feeds the /readiness-audit landing page.
 * Fields mirror `auditInquirySchema` in src/lib/forms/schemas/audit.ts.
 */
export const auditInquiry = defineType({
  name: "auditInquiry",
  title: "Readiness Audit Inquiry",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "organization", type: "string", validation: r => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "phone", type: "string" }),
    defineField({
      name: "audience",
      type: "string",
      title: "Audience",
      options: {
        list: [
          { title: "Landowner", value: "landowner" },
          { title: "Developer", value: "developer" },
          { title: "Investor", value: "investor" },
          { title: "Operator", value: "operator" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({ name: "state", type: "string" }),
    defineField({ name: "country", type: "string" }),
    defineField({ name: "acreage", type: "string" }),
    defineField({ name: "power_context", title: "Power context", type: "text" }),
    defineField({
      name: "timeline",
      type: "string",
      options: {
        list: [
          { title: "This quarter", value: "this_quarter" },
          { title: "This year", value: "this_year" },
          { title: "12 months+", value: "12_months_plus" },
          { title: "Exploratory", value: "exploratory" },
        ],
      },
    }),
    defineField({ name: "notes", type: "text" }),
    defineField({ name: "source", type: "string" }),
    // Triage (patched server-side by submitForm)
    defineField({ name: "triageScore", title: "Triage Score", type: "number", readOnly: true }),
    defineField({ name: "triageTier", title: "Triage Tier", type: "string", readOnly: true, options: { list: ["hot", "warm", "cold"] } }),
    defineField({ name: "lane", title: "Lane", type: "string", readOnly: true, options: { list: ["tribal", "datacenter", "general"] } }),
    defineField({ name: "routeTo", title: "Route To", type: "string", readOnly: true }),
    defineField({ name: "slaHours", title: "SLA (hours)", type: "number", readOnly: true }),
    // Meta
    defineField({ name: "status", type: "string", options: { list: ["new", "contacted", "qualified", "dead"] }, initialValue: "new" }),
    defineField({ name: "utmSource", type: "string" }),
    defineField({ name: "utmMedium", type: "string" }),
    defineField({ name: "submittedAt", type: "datetime" }),
  ],
  preview: {
    select: { name: "name", org: "organization", tier: "triageTier", status: "status" },
    prepare({ name, org, tier, status }: Record<string, string>) {
      const tail = [tier ? tier.toUpperCase() : null, org || null, status || "new"]
        .filter(Boolean)
        .join(" · ");
      return { title: name || "Unknown", subtitle: tail };
    },
  },
});
