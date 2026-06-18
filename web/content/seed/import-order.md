# Konative Seed Import Order

This repository now treats the in-code Next.js pages as the production source for the main website. Use seed files only when syncing supporting CMS content.

## Recommended Order
1. Site globals from `site-content.yaml`
2. Service descriptions from `services.yaml`
3. Page summaries from `pages.yaml`
4. Testimonials only after approved client references exist

## Guardrails
- Do not reintroduce legacy manufacturer-representation positioning.
- Do not route warm-intent booking to Calendly, HubSpot Meetings, or Microsoft Bookings.
- Use `/contact` for connectivity requirements and qualified buyer intake.
- Use `https://cal.com/jeramey-james` for direct booking.
