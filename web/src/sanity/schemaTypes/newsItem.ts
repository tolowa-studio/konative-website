import { defineField, defineType } from "sanity";

export const newsItem = defineType({
  name: "newsItem",
  title: "News item",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
        ],
        layout: "radio",
      },
      initialValue: "published",
      validation: (r) => r.required(),
    }),
    defineField({ name: "url", type: "url", validation: (r) => r.required() }),
    defineField({ name: "imageUrl", type: "url" }),
    defineField({ name: "summary", type: "text" }),
    defineField({
      name: "contentType",
      type: "string",
      options: {
        list: [
          { title: "News", value: "news" },
          { title: "Regulatory Update", value: "regulation" },
          { title: "Investment Announcement", value: "investment" },
          { title: "Project Permitting", value: "permit" },
          { title: "Policy Analysis", value: "analysis" },
        ],
      },
      initialValue: "news",
    }),
    defineField({
      name: "source",
      type: "reference",
      to: [{ type: "newsSource" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "sourceName", type: "string", validation: (r) => r.required() }),
    defineField({ name: "publishedAt", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "discoveredAt", type: "datetime" }),
    defineField({ name: "countries", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "topics", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "ingestFingerprint",
      type: "string",
      validation: (r) => r.required(),
      description: "Stable dedupe key (hash).",
    }),
  ],
  preview: {
    select: { title: "title", source: "sourceName", date: "publishedAt" },
    prepare({ title, source, date }) {
      return { title, subtitle: `${source || ""} · ${date ? String(date).slice(0, 10) : ""}` };
    },
  },
});
