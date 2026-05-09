import { defineType, defineField } from 'sanity'

/**
 * Tribal / First Nations data center projects across US + Canada.
 *
 * Distinct from `dataCenterProject` because the categorization is different:
 * U.S. tribes are mostly passing moratoria; Canadian First Nations are
 * mostly approving with majority equity; some U.S. tribes have stranded
 * coal infrastructure ripe for adaptive reuse — none of these states fit
 * the operational/construction/announced/stalled enum cleanly.
 *
 * Sourced from the 2026-05-08 "Tribal & First Nations data centers" research
 * pass in Notion (Konative.com Project Hub).
 */
export const tribalProject = defineType({
  name: 'tribalProject',
  title: 'Tribal / First Nations Data Center Project',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Project Name', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'tribe',
      title: 'Tribe / First Nation',
      type: 'string',
      validation: r => r.required(),
      description: 'e.g. "Navajo Nation", "Woodland Cree First Nation", "Seminole Nation of Oklahoma"',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'geopoint',
      validation: r => r.required(),
    }),
    defineField({ name: 'city', title: 'City / Locality', type: 'string' }),
    defineField({ name: 'state', title: 'State / Province', type: 'string', description: '2-letter code (US state or CA province)' }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      options: { list: ['US', 'CA'] },
      validation: r => r.required(),
    }),
    defineField({
      name: 'tribalStatus',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Operating (tribally owned, in service)', value: 'operating' },
          { title: 'Approved / under construction', value: 'approved' },
          { title: 'Feasibility study', value: 'feasibility' },
          { title: 'Active opposition (project at risk)', value: 'opposition' },
          { title: 'Moratorium (project blocked)', value: 'moratorium' },
          { title: 'Stranded coal infrastructure (opportunity)', value: 'stranded-coal' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'partnerStructure',
      title: 'Partner / Equity Structure',
      type: 'string',
      description: 'e.g. "51% First Nation equity", "tribally-owned subsidiary", "Bell + iTel anchor", "moratorium passed"',
    }),
    defineField({
      name: 'landType',
      title: 'Land Type',
      type: 'string',
      options: {
        list: [
          { title: 'On-reservation / trust land', value: 'on-reservation' },
          { title: 'Off-reservation (tribally-owned enterprise)', value: 'off-reservation' },
          { title: 'First Nation reserve', value: 'fn-reserve' },
          { title: 'Traditional / treaty territory', value: 'traditional-territory' },
          { title: 'Stranded coal site (post-closure)', value: 'stranded-coal' },
        ],
      },
    }),
    defineField({
      name: 'opportunityClass',
      title: 'Opportunity Class',
      type: 'string',
      description: 'From the dossier: Class 1 (stranded coal infra), Class 2 (orphaned developer), Class 3 (Canadian under construction).',
      options: {
        list: [
          { title: 'Class 1 — stranded infra', value: 'class-1' },
          { title: 'Class 2 — orphaned developer', value: 'class-2' },
          { title: 'Class 3 — Canada approved', value: 'class-3' },
          { title: 'Context only', value: 'context' },
        ],
      },
    }),
    defineField({ name: 'capacityMw', title: 'Capacity (MW) if known', type: 'number' }),
    defineField({ name: 'partner', title: 'Operator / Partner', type: 'string', description: 'Name of the developer, operator, or anchor (e.g. Innova Capital Partners, Bell Canada, Sovereign Digital Infrastructure).' }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      description: 'Short narrative for the side panel. 1–3 sentences pulled from the dossier.',
    }),
    defineField({
      name: 'contactPath',
      title: 'Contact Path (internal)',
      type: 'text',
      rows: 2,
      description: 'Who to call. Internal-only — not exposed publicly.',
    }),
    defineField({
      name: 'voteOrDate',
      title: 'Vote Result / Decision Date',
      type: 'string',
      description: 'e.g. "24–0 unanimous, March 7 2026", "98–33 (75%) approved", "LOI signed March 5 2025"',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'url' }],
      description: '1–3 source URLs.',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Lower = higher priority. Drives sort/highlight order.',
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tribe', status: 'tribalStatus', country: 'country' },
    prepare({ title, subtitle, status, country }) {
      const tag = status ? ` [${status}]` : ''
      return { title: `${title}${tag}`, subtitle: `${country ?? '?'} — ${subtitle ?? ''}` }
    },
  },
})
