# Konative.com — Visual Design Brief v2.0
## "Connectivity Intelligence Brokerage — Corporate Modern"

---

## What Konative Is

Konative is an AI-native connectivity intelligence brokerage. It helps enterprises find and transact on large-scale connectivity (fiber, dark fiber, wireless backhaul, data center colocation) across North America. Think Bloomberg Terminal meets a modern SaaS marketplace — serious data, fast decisions, trusted platform. The tagline direction is "Velocity intelligence for connectivity markets."

**Comparable companies to reference (feel, not copy):**
- **Lumen Technologies** (lumen.com) — enterprise connectivity, clean corporate, data-forward
- **Zayo** (zayo.com) — fiber brokerage, professional, map-centric
- **Cloudflare** (cloudflare.com) — fast, modern, data/trust signals everywhere
- **Bloomberg Terminal web presence** — authoritative, dense data, red accent on dark
- **Stripe** (stripe.com) — clean, bright, engineering-grade, editorial use of type
- **Linear.app** — modern SaaS, ultra-crisp, tool feel

The new Konative should feel like the app a sophisticated enterprise buyer just discovered and immediately trusted — not a startup landing page, not an old telco site.

---

## Brand Identity

**Wordmark:** `KO` + `NATIVE` — Barlow Condensed, weight 800, uppercase
- `KO` → Steel Gray `#374151`
- `NATIVE` → Velocity Red `#C8001F`

**Color palette:**
| Token | Hex | Use |
|-------|-----|-----|
| Velocity Red | `#C8001F` | Primary CTA, accent, "native" wordmark half |
| Red Hover | `#A8001A` | Hover/pressed state |
| Red Tint | `#FFF0F2` | Subtle surface tints |
| Steel Gray | `#374151` | "KO" wordmark, secondary labels |
| Text | `#111111` | Body copy, headings |
| Muted | `#6B7280` | Captions, metadata |
| Divider | `#E5E7EB` | Borders, rules |
| Surface | `#F3F4F6` | Card backgrounds |
| Page Tint | `#F9FAFB` | Section alternating background |
| White | `#FFFFFF` | Primary background |

**Typography:**
- Display / headlines: **Barlow Condensed** (800 weight, uppercase, tight tracking)
- Body / UI: **Inter** (400/500/600)
- Keep these fonts — do not change them.

---

## The Redesign Direction

### From → To

| Old | New |
|-----|-----|
| Dark navy hero backgrounds | **Bright white** hero with red/gray accent elements |
| Orange/rust accent (#E07B39) | **Velocity Red** (#C8001F) |
| Moody editorial feel | **Corporate modern** — data platform, transactional |
| Image-heavy, atmospheric | **Data-forward** — stats, numbers, live market signals |
| Startup-edgy | **Trusted infrastructure brand** — stable, fast, expert |

### Mood words
`crisp` · `decisive` · `fast` · `authoritative` · `data-rich` · `trusted` · `modern` · `transactional`

---

## Key Pages to Redesign

### 1. Homepage (`/`)

**Hero section:**
- White background (not dark navy)
- Large Barlow Condensed headline — something like: `CONNECTIVITY INTELLIGENCE. BROKERED.` or `THE MARKET FOR CONNECTIVITY`
- Sub-headline in Inter 18px, muted gray
- Two CTAs: primary (red, filled) + secondary (gray border)
- **Data ticker or stats bar** below the headline: live-feeling metrics (e.g., "847 routes analyzed", "12 active markets", "CA + US coverage") — this signals "platform" not "brochure"
- Optional: a subtle red diagonal slash or grid line motif (think Bloomberg/financial terminal aesthetic on white)

**Social proof / trust strip:**
- Logos or metrics bar just below hero fold
- Clean, white background, logos in grayscale

**Feature/value sections:**
- Clean 2- or 3-column cards on white or light gray (#F3F4F6)
- Cards have a thin red left-border accent (like a Bloomberg metric card)
- Icon style: minimal line icons, not filled/colorful
- Section headers: Barlow Condensed uppercase, large

**Map / coverage section:**
- Dark map (this is appropriate for data viz) with red route highlights
- Framed in a white section so it feels like an embedded tool, not the whole page aesthetic

### 2. Header / Nav

Current: Dark navy scroll-to-solid header
New:
- **Unscrolled** (over dark heroes/map): transparent, white text (existing dark heroes can persist on data-heavy pages like /map)
- **Scrolled**: pure white `rgba(255,255,255,0.98)`, dark text nav, subtle border `#E5E7EB`
- KO = `#374151`, NATIVE = `#C8001F` (already implemented)
- Nav hover: red underline or red text
- CTA button: solid red, white text, no border radius (sharp corporate edge)

### 3. Markets / Intelligence pages

- Light background primary
- Heavy use of data tables, sortable, crisp borders
- Red used for "live" / "active" indicators
- Barlow Condensed for section headers

### 4. Footer

- Dark background (`#0A0F1E`) is appropriate for the footer — provides contrast bookend
- Red accent in footer logo
- Clean link columns, no clutter

---

## Design System Rules

1. **No warm colors** — remove all orange/amber/rust from UI elements. Red is the only hot color.
2. **No decorative gradients** — gradients only in data viz (maps, charts). UI is flat.
3. **Border radius: 0–4px max** — sharp, not rounded. This is transactional/financial, not consumer.
4. **Red use: surgical** — red on CTA buttons, active states, the "NATIVE" wordmark, and live/urgent data signals. Not decorative fills or large backgrounds.
5. **Typography hierarchy is tight:** Display (Barlow Condensed) for big moments only; everything else is Inter. No mixing within the same block.
6. **Whitespace is generous** — brokerage platforms breathe. Sections should have 80–120px vertical padding.
7. **Data density on data pages** — Intelligence, Markets, Map pages can be dense. Homepage and landing pages should be spacious.

---

## Reference Aesthetic: "Bloomberg on White"

Imagine taking Bloomberg Terminal's visual language (red accents, monospaced confidence, data authority) and building it on a crisp white background with a modern SaaS layout system. The result should feel like a startup that decided to play seriously in enterprise from day one.

Key visual cues to borrow:
- Thin horizontal rules between data rows
- Red left-border accent on metric cards
- Monospaced or condensed font for numbers/tickers
- High contrast: near-black text on white, red for action only
- Subtle gray backgrounds to separate sections (not blue-tinted, not warm)

---

## What NOT to Do

- Don't make it look like a telecom company from 2015 (AT&T, Verizon vibes)
- Don't overuse red — it loses urgency if used everywhere
- Don't round the CTA buttons (sharp edges = transactional confidence)
- Don't remove the Barlow Condensed font — it's a strong brand asset
- Don't use stock photos of office people or handshakes — use maps, data, infrastructure imagery only
- Don't add drop shadows that look soft/consumer — keep shadows minimal and sharp

---

## Deliverables Requested from Claude Design

1. **Homepage hero mockup** — above-the-fold on desktop and mobile
2. **Header states** — unscrolled (over dark), scrolled (white bg), mobile drawer
3. **Feature card component** — with red left-border accent, stat display
4. **CTA button system** — primary (red), secondary (gray outline), tertiary (text link)
5. **Section template** — alternating white / gray-50 sections with proper spacing
6. **Color palette swatch sheet** — all tokens with use examples

---

## Implementation Notes

The codebase is Next.js 16 + Tailwind (or CSS custom properties in `globals.css`). The CSS token layer has already been updated:
- `--color-primary: #C8001F` (was orange)
- `--gray-700: #374151` for KO wordmark
- All `--rust-*` tokens now alias to red
- Header component (`web/src/components/Header.tsx`) already updated

The design comp just needs to show the visual target for the page-level layouts and component styles that haven't been touched yet (hero sections, cards, feature blocks, etc.).
