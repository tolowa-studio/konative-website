import { defineArrayMember, defineField, defineType } from "sanity";

const AUDIENCE_SLUG_OPTIONS = [
  { title: "Tribes", value: "tribes" },
  { title: "Advisors", value: "advisors" },
  { title: "Investors", value: "investors" },
  { title: "Landowners", value: "landowners" },
  { title: "Utilities", value: "utilities" },
  { title: "Developers / EPCs", value: "developers-epcs" },
  { title: "Operators", value: "operators" },
];

const ctaVariant = defineField({
  name: "primaryCta",
  title: "Primary CTA",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: r => r.required() }),
    defineField({
      name: "href",
      type: "string",
      description: "Anchor like #cta or a URL. Defaults to the on-page form.",
      initialValue: "#cta",
      validation: r => r.required(),
    }),
  ],
});

const capabilityBand = defineArrayMember({
  type: "object",
  name: "capabilityBand",
  title: "Capability Band",
  fields: [
    defineField({ name: "title", type: "string", validation: r => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});

const engagementStep = defineArrayMember({
  type: "object",
  name: "engagementStep",
  title: "Engagement Step",
  fields: [
    defineField({ name: "label", type: "string", validation: r => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "body" } },
});

const trustItem = defineArrayMember({
  type: "object",
  name: "trustItem",
  title: "Trust Item",
  fields: [
    defineField({ name: "label", type: "string", validation: r => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "body" } },
});

export const audiencePage = defineType({
  name: "audiencePage",
  title: "Audience Page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { maxLength: 64 },
      validation: r =>
        r.required().custom(value => {
          const v = (value as { current?: string } | undefined)?.current;
          if (!v) return "Slug is required";
          const ok = AUDIENCE_SLUG_OPTIONS.some(opt => opt.value === v);
          return ok ? true : `Slug must be one of ${AUDIENCE_SLUG_OPTIONS.map(o => o.value).join(", ")}`;
        }),
    }),
    defineField({ name: "displayName", type: "string", validation: r => r.required() }),
    defineField({ name: "tileDescription", type: "text", rows: 2, validation: r => r.required() }),
    defineField({ name: "metaTitle", type: "string", validation: r => r.required() }),
    defineField({ name: "metaDescription", type: "text", rows: 2, validation: r => r.required() }),
    defineField({
      name: "order",
      type: "number",
      description: "Display order on the /for hub. Lower numbers come first.",
      initialValue: 100,
      validation: r => r.required().min(0),
    }),
    defineField({
      name: "hero",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "eyebrow", type: "string", validation: r => r.required() }),
        defineField({ name: "headline", type: "text", rows: 3, validation: r => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 4, validation: r => r.required() }),
        ctaVariant,
      ],
    }),
    defineField({
      name: "whyNow",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2 }),
        defineField({
          name: "bullets",
          type: "array",
          of: [{ type: "string" }],
          validation: r => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "whatYouAlreadyHave",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2 }),
        defineField({
          name: "bullets",
          type: "array",
          of: [{ type: "string" }],
          validation: r => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "whatKonativeDoes",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({
          name: "bands",
          type: "array",
          of: [capabilityBand],
          validation: r => r.required().min(3),
        }),
      ],
    }),
    defineField({
      name: "firstEngagement",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2 }),
        defineField({
          name: "steps",
          type: "array",
          of: [engagementStep],
          validation: r => r.required().min(1),
        }),
        defineField({ name: "pricingPosture", type: "string", validation: r => r.required() }),
      ],
    }),
    defineField({
      name: "trust",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({
          name: "items",
          type: "array",
          of: [trustItem],
          validation: r => r.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "adjacentAudiences",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "title", type: "string", validation: r => r.required() }),
        defineField({
          name: "pointers",
          type: "array",
          of: [{ type: "string", options: { list: AUDIENCE_SLUG_OPTIONS } }],
          description: "Other audience slugs to link to from the bottom of this page.",
        }),
      ],
    }),
    defineField({
      name: "finalCta",
      type: "object",
      validation: r => r.required(),
      fields: [
        defineField({ name: "headline", type: "text", rows: 2, validation: r => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 3, validation: r => r.required() }),
        ctaVariant,
      ],
    }),
  ],
  preview: {
    select: { title: "displayName", slug: "slug.current", order: "order" },
    prepare({ title, slug, order }: Record<string, unknown>) {
      return {
        title: (title as string) || "Untitled audience",
        subtitle: [slug ? `/for/${slug as string}` : null, order != null ? `order ${order as number}` : null]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
