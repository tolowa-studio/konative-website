import { defineField, defineType } from "sanity";

export const contactInquiry = defineType({
  name: "contactInquiry",
  title: "Contact Inquiry",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "email", type: "string", validation: r => r.required().email() }),
    defineField({ name: "organization", type: "string", validation: r => r.required() }),
    defineField({ name: "role", type: "string" }),
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
    defineField({ name: "status", type: "string", options: { list: ["new", "contacted", "qualified", "dead"] }, initialValue: "new" }),
    defineField({ name: "utmSource", type: "string" }),
    defineField({ name: "submittedAt", type: "datetime" }),
  ],
  preview: {
    select: { name: "name", org: "organization", audience: "audience", status: "status" },
    prepare({ name, org, audience, status }: Record<string, string>) {
      const tail = [audience ? `[${audience}]` : null, org || null, status || "new"].filter(Boolean).join(" · ");
      return { title: name || "Unknown", subtitle: tail };
    },
  },
});
