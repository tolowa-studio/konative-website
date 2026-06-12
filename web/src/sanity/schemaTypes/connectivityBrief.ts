import { defineField, defineType } from 'sanity'

export const connectivityBrief = defineType({
  name: 'connectivityBrief',
  title: 'Connectivity Demand Brief',
  type: 'document',
  fields: [
    defineField({ name: 'issueNumber', title: 'Issue Number', type: 'number', validation: Rule => Rule.required().integer().positive() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['draft', 'published'], layout: 'radio' },
      initialValue: 'draft',
    }),
    defineField({ name: 'introText', title: 'Intro Text', type: 'text', rows: 4 }),
    defineField({ name: 'fundingAlert', title: 'Funding Alert', type: 'text', rows: 3, description: 'Active grant windows or RFP deadlines' }),
    defineField({ name: 'providerInsight', title: 'Provider Insight', type: 'text', rows: 3, description: 'Carrier/provider intelligence note' }),
    defineField({
      name: 'mapSpotlight',
      title: 'Map Spotlight',
      type: 'object',
      fields: [
        defineField({ name: 'lat', type: 'number' }),
        defineField({ name: 'lng', type: 'number' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'signalIds',
      title: 'Signal IDs',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Supabase connectivity_signals UUIDs included in this brief',
    }),
    defineField({
      name: 'linkedinPosts',
      title: 'LinkedIn Posts',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'postText', type: 'text', rows: 5 }),
          defineField({ name: 'publishedId', type: 'string', description: 'LinkedIn post URN after publishing' }),
        ],
      }],
    }),
    defineField({ name: 'resendBroadcastId', title: 'Resend Broadcast ID', type: 'string' }),
    defineField({ name: 'emailOpens', title: 'Email Opens', type: 'number' }),
    defineField({ name: 'emailClicks', title: 'Email Clicks', type: 'number' }),
    defineField({ name: 'linkedinImpressions', title: 'LinkedIn Impressions', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'issueNumber' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : 'Draft' }
    },
  },
})
