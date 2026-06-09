import { defineField, defineType } from "sanity";

const toneList = [
  { title: "White", value: "white" },
  { title: "Rust accent", value: "rust" },
  { title: "Dim", value: "dim" },
];

/**
 * Singleton driving the connectivity-brokerage homepage. The home route falls
 * back to HOME_CONNECTIVITY_DEFAULT (src/content/homeConnectivity.ts) when this
 * document is absent, so editing here is optional but always wins when present.
 */
export const homeConnectivity = defineType({
  name: "homeConnectivity",
  title: "Homepage — Connectivity",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "portfolio", title: "What We Broker" },
    { name: "wedges", title: "Verticals" },
    { name: "how", title: "Why a Broker" },
  ],
  fields: [
    // ---- Hero ----
    defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string", group: "hero" }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline lines",
      type: "array",
      group: "hero",
      of: [
        {
          type: "object",
          fields: [
            { name: "text", type: "string" },
            { name: "tone", type: "string", options: { list: toneList, layout: "radio" }, initialValue: "white" },
          ],
          preview: { select: { title: "text", subtitle: "tone" } },
        },
      ],
    }),
    defineField({ name: "heroSubhead", title: "Hero subhead", type: "text", rows: 4, group: "hero" }),
    defineField({
      name: "heroPrimaryCta",
      title: "Primary CTA",
      type: "object",
      group: "hero",
      fields: [
        { name: "label", type: "string" },
        { name: "href", type: "string" },
      ],
    }),
    defineField({
      name: "heroSecondaryCtas",
      title: "Secondary CTAs",
      type: "array",
      group: "hero",
      of: [{ type: "object", fields: [{ name: "label", type: "string" }, { name: "href", type: "string" }] }],
    }),
    defineField({
      name: "heroStats",
      title: "Hero stat tiles",
      type: "array",
      group: "hero",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string" },
            { name: "label", type: "string" },
            { name: "rust", type: "boolean", title: "Rust value" },
            { name: "highlight", type: "boolean", title: "Highlight tile" },
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),

    // ---- What We Broker ----
    defineField({ name: "portfolioEyebrow", type: "string", group: "portfolio" }),
    defineField({ name: "portfolioHeadingTop", type: "string", group: "portfolio" }),
    defineField({ name: "portfolioHeadingBottom", title: "Heading (rust line)", type: "string", group: "portfolio" }),
    defineField({ name: "portfolioIntro", type: "text", rows: 3, group: "portfolio" }),
    defineField({
      name: "portfolioItems",
      type: "array",
      group: "portfolio",
      of: [{ type: "object", fields: [{ name: "name", type: "string" }, { name: "blurb", type: "text", rows: 2 }], preview: { select: { title: "name", subtitle: "blurb" } } }],
    }),

    // ---- Verticals ----
    defineField({ name: "wedgeEyebrow", type: "string", group: "wedges" }),
    defineField({ name: "wedgeHeadingTop", type: "string", group: "wedges" }),
    defineField({ name: "wedgeHeadingBottom", title: "Heading (rust line)", type: "string", group: "wedges" }),
    defineField({
      name: "wedges",
      type: "array",
      group: "wedges",
      of: [
        {
          type: "object",
          fields: [
            { name: "num", type: "string" },
            { name: "eyebrow", type: "string" },
            { name: "title", type: "string", description: "Use \\n for a line break" },
            { name: "desc", type: "text", rows: 4 },
            { name: "cta", type: "string" },
            { name: "href", type: "string" },
            { name: "primary", type: "boolean" },
          ],
          preview: { select: { title: "eyebrow", subtitle: "title" } },
        },
      ],
    }),

    // ---- Why a Broker ----
    defineField({ name: "howEyebrow", type: "string", group: "how" }),
    defineField({ name: "howHeadingTop", type: "string", group: "how" }),
    defineField({ name: "howHeadingBottom", title: "Heading (rust line)", type: "string", group: "how" }),
    defineField({ name: "howIntro", type: "text", rows: 3, group: "how" }),
    defineField({
      name: "capabilities",
      type: "array",
      group: "how",
      of: [{ type: "object", fields: [{ name: "num", type: "string" }, { name: "title", type: "string" }, { name: "body", type: "text", rows: 3 }], preview: { select: { title: "title", subtitle: "num" } } }],
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage — Connectivity" }) },
});
