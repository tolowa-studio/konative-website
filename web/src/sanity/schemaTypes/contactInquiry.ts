import { defineField, defineType } from "sanity";

export const contactInquiry = defineType({
  name: "contactInquiry",
  title: "Contact Inquiry",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "organization", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "serviceAddresses", type: "text" }),
    defineField({ name: "bandwidth", type: "string" }),
    defineField({ name: "readyForService", type: "string" }),
    defineField({ name: "fundingProgram", type: "string" }),
    defineField({ name: "projectType", type: "string" }),
    defineField({ name: "projectStage", type: "string" }),
    defineField({ name: "message", type: "text" }),
    defineField({ name: "referralSource", type: "string" }),
    defineField({
      name: "audience",
      type: "string",
      title: "Source audience page",
      description: "Set when the inquiry came from a /for/<slug> page. Empty for the generic /contact form.",
      options: {
        list: [
          { title: "Tribes", value: "tribes" },
          { title: "Advisors", value: "advisors" },
          { title: "Investors", value: "investors" },
          { title: "Landowners", value: "landowners" },
          { title: "Utilities", value: "utilities" },
          { title: "Developers / EPCs", value: "developers-epcs" },
          { title: "Operators", value: "operators" },
        ],
      },
    }),
    defineField({ name: "context", type: "string", title: "Submission context", description: "e.g. 'Voice intake' for homepage voice widget submissions; empty for the generic /contact form." }),
    defineField({ name: "voiceMarkdown", type: "text", title: "Voice intake summary (Markdown)" }),
    defineField({
      name: "voiceAnswers",
      title: "Voice intake answers",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "id", type: "string" }),
          defineField({ name: "label", type: "string" }),
          defineField({ name: "value", type: "text" }),
        ],
      }],
    }),
    defineField({ name: "status", type: "string", options: { list: ["new", "contacted", "qualified", "dead"] }, initialValue: "new" }),
    defineField({ name: "utmSource", type: "string" }),
    defineField({ name: "submittedAt", type: "datetime" }),
    defineField({ name: "triageScore", type: "number", title: "Triage score (0-100)", readOnly: true }),
    defineField({ name: "triageTier", type: "string", title: "Triage tier", options: { list: ["hot", "warm", "cold"] }, readOnly: true }),
    defineField({ name: "lane", type: "string", title: "Triage lane", options: { list: ["tribal", "datacenter", "general"] }, readOnly: true }),
    defineField({ name: "routeTo", type: "string", title: "Route to desk", readOnly: true }),
    defineField({ name: "slaHours", type: "number", title: "Response SLA (hours)", readOnly: true }),
  ],
  preview: {
    select: { name: "name", org: "organization", audience: "audience", status: "status" },
    prepare({ name, org, audience, status }: Record<string, string>) {
      const tail = [audience ? `[${audience}]` : null, org || null, status || "new"].filter(Boolean).join(" · ");
      return { title: name || "Unknown", subtitle: tail };
    },
  },
});
