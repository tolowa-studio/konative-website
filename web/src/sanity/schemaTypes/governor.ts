import { defineType, defineField } from 'sanity'

export const governor = defineType({
  name: 'governor',
  title: 'Governor (US State)',
  type: 'document',
  fields: [
    defineField({
      name: 'state',
      title: 'State (2-letter code)',
      type: 'string',
      validation: r => r.required().length(2).uppercase(),
    }),
    defineField({ name: 'stateName', title: 'State Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'name', title: 'Governor Name', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'party',
      title: 'Party',
      type: 'string',
      options: { list: ['Democratic', 'Republican', 'Independent'] },
    }),
    defineField({ name: 'termEnds', title: 'Term Ends', type: 'string', description: 'e.g. "Jan 2027"' }),
    defineField({ name: 'capitalCity', title: 'Capital City', type: 'string' }),
    defineField({
      name: 'capitalLocation',
      title: 'Capital Coordinates',
      type: 'geopoint',
      validation: r => r.required(),
    }),
    defineField({
      name: 'ngaRole',
      title: 'NGA Role',
      type: 'string',
      description: 'e.g. "Chair 2025–2026", "Vice Chair", or blank.',
    }),
    defineField({
      name: 'ngaInitiative',
      title: 'NGA Chair Initiative',
      type: 'string',
      description: 'Headline pillar (e.g. "Reigniting the American Dream — powering America\'s AI future").',
    }),
    defineField({
      name: 'accessNotes',
      title: 'Access Notes (internal)',
      type: 'text',
      rows: 3,
      description: 'Who on the Konative team has the relationship and how to reach the governor. Internal only — never expose publicly.',
    }),
    defineField({
      name: 'dcPolicyNotes',
      title: 'DC Policy Notes (public)',
      type: 'text',
      rows: 4,
      description: 'Public-facing summary of DC-relevant state policy (e.g. WV HB 2014, FL SB 484).',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Lower number = higher priority. Drives sort order on the Governors page.',
      initialValue: 100,
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'url' }],
      description: '1–3 source URLs (NGA press, governor press release, news coverage).',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'stateName', state: 'state', party: 'party' },
    prepare({ title, subtitle, state, party }) {
      const partyTag = party ? ` (${party[0]})` : ''
      return { title: `${title}${partyTag}`, subtitle: `${state} — ${subtitle}` }
    },
  },
})
