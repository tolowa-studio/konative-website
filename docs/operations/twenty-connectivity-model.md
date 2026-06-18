# Twenty CRM model for Konative connectivity brokerage

## Required opportunity fields

| Field | Type | Purpose |
|---|---|---|
| Konative lane | Select | Tribal, gaming/hospitality, data center, enterprise, travel |
| Campaign | Select | Award-to-operations, resilience, gaming uptime, DC build signal, inbound |
| Approval status | Select | Researching, ready for review, approved for outreach, hold, do not contact |
| Connectivity products | Multi-select | DIA, broadband, lit fiber, dark fiber, waves, SD-WAN/SASE, UCaaS, CCaaS, mobility, security, cloud, colo, DCI |
| Current providers | Text | Existing supplier context |
| Contract renewal date | Date | Primary timing trigger |
| Sites | Number | Location count |
| Expected MRC | Currency | Recurring-revenue forecast |
| Expected NRC | Currency | One-time revenue forecast |
| Pathfinder request ID | Text | Quote correlation |
| Install target | Date | Delivery timing |
| Residual start date | Date | Commission activation |
| Next action | Text | Required action |
| Next action date | Date | SLA and follow-up |
| Award/program | Text | TBCP/BEAD/public funding context |
| Award source URL | URL | Evidence |
| Research confidence | Select | Verified, probable, unverified |

## Opportunity stages

1. Target
2. Researched
3. Approved for outreach
4. Contacted
5. Qualified
6. Requirements received
7. Quoting
8. Proposal delivered
9. Verbal commit
10. Ordered
11. Installed
12. Residual active
13. Renewal
14. Closed lost

## Automation rules

- New website inquiry creates or updates the person and company, creates an
  opportunity, assigns an owner, and creates a next-day task.
- A record cannot enter an outbound automation unless approval status is
  **Approved for outreach**.
- Requirements received creates a Pathfinder sourcing task.
- Proposal delivered creates a three-business-day follow-up.
- Ordered creates installation checkpoints.
- Installed creates residual verification and renewal records.
- Do not contact suppresses every outbound workflow.
- Every inbound or outbound touch records source, campaign, timestamp, owner,
  disposition, and next action.

## Website webhook mapping

The site sends:

- `source`
- `schemaType`
- `sanityDocumentId`
- `submittedAt`
- validated form `data`

The n8n workflow should:

1. Validate the bearer token.
2. Normalize email, organization, phone, geography, audience, and requirement.
3. Upsert person and company in Twenty.
4. Create or update the opportunity.
5. Link the Sanity intake ID.
6. Assign the correct campaign and owner.
7. Create a follow-up task.
8. Return a success response with the Twenty record IDs.

