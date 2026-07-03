import { defineField, defineType } from "sanity";

export const capacityRequest = defineType({
  name: "capacityRequest",
  title: "Capacity Request",
  type: "document",
  fields: [
    defineField({ name: "company", type: "string", validation: r => r.required() }),
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "mwRequired", title: "MW Required", type: "number" }),
    defineField({ name: "targetOnlineDate", type: "string" }),
    defineField({ name: "marketPreferences", title: "Target Markets", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "workloadType", title: "Workload Type", type: "string", options: { list: ["training", "inference", "general-compute", "colocation"] } }),
    defineField({ name: "connectivityNeeds", type: "text" }),
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
    select: { company: "company", name: "name", mw: "mwRequired", status: "status" },
    prepare({ company, name, mw, status }: { company?: string; name?: string; mw?: number; status?: string }) {
      return { title: company || name || "Unknown", subtitle: `${mw ? mw + "MW" : ""} · ${status || "new"}` };
    },
  },
});
