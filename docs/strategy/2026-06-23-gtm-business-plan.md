# Konative GTM Business Plan

**Date:** 2026-06-23  
**Status:** Active launch plan  
**Primary system:** konative.com -> Sanity intake -> n8n -> Twenty CRM -> human-approved outreach  
**Notion source checked:** `Konative.com - Project Hub`, fetched 2026-06-23.

## 1. Business thesis

Konative is an Indigenous-owned, vendor-neutral connectivity brokerage focused
on two launch markets:

1. Tribal and rural enterprise connectivity.
2. Data-center connectivity across the United States and Canada.

The company does not need to look like a generic telecom agent. The site,
content, and CRM should make Konative feel like an AI-native subagent built for
real infrastructure deals: it uses maps, award records, public funding signals,
data-center project intelligence, and CRM discipline to identify buyers before
they are already shopping a carrier quote.

## 2. Positioning

**One-line promise**

Konative brokers the connectivity that tribal nations, rural enterprises, and
data centers need to operate across North America.

**Trust posture**

- Indigenous-owned and sovereignty-aware.
- Vendor-neutral and supplier-competitive.
- Built to operate in the United States and Canada.
- Looking for Canadian First Nations, Indigenous economic development, carrier,
  engineering, and capital partners.
- Backed by public-data intelligence, not generic lead lists.

**What we do not claim**

- Konative does not administer NTIA, NEGP, BEAD, CRTC, or Canadian broadband
  grants.
- Konative does not promise serviceability from a map view.
- Konative does not send automated outbound until a record is reviewed and
  approved in Twenty.

## 3. Offers

### Offer A - Award-to-operations connectivity review

Audience: TBCP/NEGP award recipients, tribal broadband authorities, tribal IT,
EDCs, gaming, health, education, and public safety teams.

Problem: Grant-funded broadband work creates an operational layer that still
needs enterprise internet, transport, redundancy, voice, cloud, cybersecurity,
mobility, and managed networks.

CTA: 20-minute award-to-operations review.

CRM campaign: `Award-to-operations`

### Offer B - Tribal enterprise resilience review

Audience: Tribal governments, casinos, clinics, schools, utilities, EDCs, and
multi-site enterprises without an obvious award trigger.

Problem: One provider, one physical path, unmanaged failover, renewal drift, or
legacy voice/security exposure can create operational risk.

CTA: Carrier-neutral portfolio review.

CRM campaign: `Tribal enterprise resilience`

### Offer C - Gaming and hospitality uptime review

Audience: Tribal casinos, hospitality groups, resorts, venues, and payment-heavy
properties.

Problem: Payments, surveillance, guest Wi-Fi, hotel systems, voice, security,
and back-office operations often depend on fragile WAN assumptions.

CTA: Gaming connectivity resilience review.

CRM campaign: `Gaming and hospitality uptime`

### Offer D - Data-center connectivity review

Audience: Data-center developers, operators, tenants, powered-land teams,
investors, and construction/development partners.

Problem: Land and power do not make a campus operational without transport,
dark fiber, wavelengths, cross-connects, cloud on-ramps, internet diversity,
and install sequencing.

CTA: Preliminary carrier and fiber-path review.

CRM campaign: `DC build signal`

### Offer E - Canada partner call

Audience: First Nations development corporations, Indigenous connectivity
organizations, Canadian carriers, engineering firms, capital partners,
provincial ecosystem partners, and data-center developers.

Problem: Konative wants a credible Canada operating lane and should not enter
First Nations or provincial markets as a US-only outsider.

CTA: Canada partnership conversation.

CRM campaign: `Canada partner`

## 4. Data assets as the lead engine

The public site should make these assets visible:

- Tribal Connectivity Index: searchable TBCP award records.
- TBCP/NEGP 2026 window: NTIA opened TBCP Round 3 and NEGP on 2026-06-17, with
  applications due 2026-09-17 and rolling awards expected beginning Spring 2027.
- Canada data-center and First Nations market context.
- Map layers: data centers, power, transmission, interconnection, Indigenous
  lands, and market signals.
- Stalled and blocked project tracker for data-center connectivity demand.

Primary external sources to keep current:

- NTIA TBCP page: https://www.ntia.gov/funding-programs/internet-all/tribal-broadband-connectivity-program
- BroadbandUSA NEGP page: https://broadbandusa.ntia.gov/funding-programs/native-entities-grant-program
- TBCP3 NOFO primer: https://broadbandusa.ntia.gov/sites/default/files/2026-06/TBCP3_NOFO_Primer.pdf
- Indigenous Services Canada connectivity programs: https://www.sac-isc.gc.ca/eng/1343229993175/1533643807551
- Assembly of First Nations digital connectivity gap: https://afn.ca/economy-infrastructure/infrastructure/closing-the-infrastructure-gap/digital-connectivity/

## 5. Funnel architecture

1. LinkedIn, search, partner referral, or public data page.
2. Visitor lands on one of five surfaces:
   - `/tribal`
   - `/tribal/index`
   - `/data-center-connectivity`
   - `/connectivity`
   - `/contact`
3. Visitor chooses lane and campaign-aware form inputs.
4. Submission persists to Sanity first.
5. Submission forwards to n8n when `TWENTY_INTAKE_WEBHOOK_URL` and token are set.
6. n8n normalizes and upserts person, company, opportunity, and task in Twenty.
7. Human reviews the record and sets approval status.
8. Outreach begins only when approval status is `Approved for outreach`.

## 6. Twenty CRM campaign fields

The contact form and n8n payload should preserve:

- `lane`
- `campaign`
- `country`
- `provinceState`
- `organizationType`
- `projectType`
- `serviceAddresses`
- `bandwidth`
- `readyForService`
- `fundingProgram`
- `partnerIntent`
- `source`
- `utmSource`
- `referralSource`
- `approvalStatus`

Recommended default mappings:

| Website input | Twenty field |
|---|---|
| lane = tribal | Konative lane = Tribal |
| lane = gaming | Konative lane = Gaming/Hospitality |
| lane = datacenter | Konative lane = Data center |
| lane = canada_partner | Konative lane = Enterprise or partner lane until custom field exists |
| campaign | Campaign |
| fundingProgram | Award/program |
| serviceAddresses | Sites/context note |
| readyForService | Install target |
| message | Next action / qualification notes |

## 7. Outreach controls

- Drafts can be generated from public records, but sending requires Jeramey
  approval.
- Award amounts and program status must be verified against primary sources
  before they appear in copy.
- Canadian partnership outreach should lead with partnership and learning, not
  extraction or US-market assumptions.
- Contractor callers qualify needs and route to a Konative advisor. They do not
  quote, design, promise savings, or interpret grant eligibility.

## 8. Current known campaign base

From the Konative Notion project hub, the June 2026 tribal outreach base is:

- 164 tribal contacts reviewed.
- 17 TBCP award-matched contacts.
- 87 additional tribal-government contacts.
- 60 gaming/casino contacts.
- No outbound campaign has been sent.

These contacts should become the first reviewed Twenty campaign queues, with no
automated send until Jeramey approves the exact campaign, sender, recipient
rules, and copy.

## 9. First 30 days

- Verify `/call` Cal.com slug and contact form submission path.
- Set Workers production env for `SUPABASE_SERVICE_ROLE_KEY` so `/tribal/index`
  can read server-side data.
- Confirm n8n workflow is live and Twenty receives a test record from `/contact`.
- Build approved Twenty views for the five campaigns, starting with the 164
  reviewed tribal contacts already identified in Notion.
- Clean the seed pipeline so sample/fake Twenty deals cannot be mistaken for
  externally verified opportunities.
- Publish one LinkedIn post per week for each wedge:
  - award-to-operations
  - gaming uptime
  - data-center connectivity
  - Canada partner search

## 10. First 60 days

- Convert the existing 164 reviewed tribal contacts into clean Twenty queues
  with owner, source, consent/source note, next action, and approval status.
- Build a reviewed list of 30 data-center connectivity targets from the map,
  governors tracker, and Canada dataset.
- Build a Canada partner target list of 25 organizations.
- Run manual outreach only to approved records.
- Track CTA response rate by campaign, not just total form fills.

## 11. First 90 days

Targets:

- 100 reviewed tribal/rural records in Twenty.
- 50 reviewed data-center connectivity records in Twenty.
- 25 Canada partnership records in Twenty.
- 20 qualified conversations.
- 5 active sourcing opportunities.
- 1 closed or in-flight recurring connectivity order.

Decision gate:

If tribal award-to-operations produces more replies than data-center
connectivity, bias LinkedIn and public data pages toward Tribal Connectivity
Index and award-to-operations. If data-center connectivity produces more
qualified project conversations, bias the map and governors tracker toward
carrier/fiber-path reviews.

## 12. Site changes implied by this plan

- Homepage should show the two go-to-market lanes immediately.
- Homepage should show the map/data layer as proof, not a separate product.
- Contact form should ask for lane, campaign, country, project type, service
  addresses, funding context, partner intent, and timing.
- `/tribal` should surface TBCP/NEGP Round 3 and the Canada partnership lane.
- `/data-center-connectivity` should make the data-center review offer concrete.
- `/call` should position the meeting around a real requirement, partner lane, or
  campaign, not a generic intro.
