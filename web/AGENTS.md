# AGENTS.md

## Mission
This repository is the **konative.com** web app: a Next.js site for connectivity intelligence, carrier-neutral brokerage, datacenter connectivity, market coverage, and qualified buyer intake.

The immediate objective is to keep the public site consistent with the current Konative positioning: AI-native connectivity intelligence and brokerage, using the black/steel/velocity-red visual system now established on the homepage.

## Core principles
1. **Consistency over one-off customization.** Shared surfaces should use the current brokerage brand system.
2. **Phase-based delivery.** Work only on the current approved milestone.
3. **No chaos architecture.** Do not add pages, blocks, patterns, or schema complexity without a clear reason.
4. **Konative is the product surface.** It should feel premium, specific, data-rich, and credible to infrastructure buyers.
5. **Notion is the system of record.** When creating or updating work, sync relevant outcomes to the AI OS workspace via Desktop Commander / Notion access.
6. **Prefer small safe iterations.** Show plans, then implement in batches.
7. **Use real content structure, not placeholders.** Temporary filler is acceptable only when clearly marked and easy to replace.

## Current project context
- Domain: `konative.com`
- Business: AI-native connectivity intelligence and carrier-neutral brokerage
- Primary goal: generate qualified connectivity, datacenter, market-intelligence, and partnership inquiries
- Design direction: bright corporate brokerage aesthetic using white, black/steel, and velocity red `#C8001F`
- Stack: Next.js 16, Sanity, Builder.io surfaces, Supabase-backed intelligence/data products

## Current primary page scope
- Home
- Connectivity
- Datacenters / Data Center Connectivity
- Intelligence
- Markets
- Map / coverage
- News / market intel
- Contact / platform access

## Execution behavior
- Always begin major work by restating the milestone and listing files expected to change.
- Prefer editing existing files over generating parallel alternatives.
- Keep folder structure clean and predictable.
- Use TypeScript throughout.
- Favor server components unless interactivity requires client components.
- Use design tokens and consistent naming.
- Keep content modeling generic enough for future reuse.
- If a change affects the shared architecture, data model, or deploy workflow, document it in `docs/decisions.md`.

## Notion behavior
Because this environment has Notion + filesystem access, the agent may:
- create/update project notes in the AI OS workspace,
- seed task status updates,
- create a Konative project page if missing,
- add records to the Block Library and Site Registry,
provided the action is clearly logged in the response.

Do not invent database IDs. Discover them from the workspace or ask for confirmation if ambiguous.

## Definition of done for current site work
- `npm run build` passes from `web/`.
- Primary pages render with the current black/steel/red brokerage design language.
- CTAs route to `/contact` or the canonical Cal.com booking link where warm-intent booking is intended.
- No current content surface describes Konative as an outdoor living/manufacturer representation business.
