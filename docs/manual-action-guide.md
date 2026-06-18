# Konative.com Manual Action Guide
### Go-Live Distribution & Indexing Playbook

---

## 1. Cal.com Setup *(~45 minutes)*

### Create Your Account

1. Go to **https://cal.com**
2. Click "Get Started" — sign up with your Google account (jeramey.james@gmail.com) for fastest setup
3. During onboarding, set your username to **konative** — this locks in `cal.com/konative/...` URLs
4. Set timezone to **America/Chicago** (or your local timezone — this matters for booking accuracy)

### Create the Discovery Call Event Type

From your Cal.com dashboard:

1. Click **"+ New Event Type"**
2. Select **"One-on-One"**

**Fill in the following settings exactly:**

| Field | Value |
|---|---|
| Event name | 15-Minute Discovery Call |
| URL slug | `discovery` |
| Description | A focused 15-minute call to explore how Konative can help your tribe or organization develop broadband infrastructure, data centers, or connectivity strategy. Come with questions. |
| Duration | 15 minutes |
| Location | **Whereby** or **Google Meet** (select "Video conferencing" and connect your preferred tool) |
| Before buffer | 5 minutes |
| After buffer | 10 minutes |
| Minimum notice | 24 hours (prevents same-day scramble bookings) |
| Future limit | 60 days out |

**Availability:** Under "Availability," set to **Monday–Thursday, 9:00 AM – 4:00 PM** (your timezone). Leave Fridays open — keeps your week clean.

**Confirmation message (copy-paste this exactly):**

> Thanks for booking a discovery call with Jeramey James at Konative. I'll be ready at the scheduled time — no agenda required. If anything changes, use the reschedule link in your confirmation email. Looking forward to the conversation.

**Intake questions — add all four in order:**

Go to **"Advanced" → "Questions"** and add:

1. **Question:** "What is your tribal nation or organization name?"
   - Type: Short text
   - Required: Yes

2. **Question:** "What's the primary challenge or opportunity you're hoping to address?"
   - Type: Long text
   - Required: Yes

3. **Question:** "What's your role in this initiative?"
   - Type: Short text
   - Required: No

4. **Question:** "How did you hear about Konative?"
   - Type: Short text
   - Required: No

### Your Booking Link

After saving, your link will be:

```
https://cal.com/konative/discovery
```

### Embed Code for the Next.js /call Page

Install the Cal.com embed package first:

```bash
cd /Users/jerameyjames/repos/konative-website/web
npm install @calcom/embed-react
```

Create `/Users/jerameyjames/repos/konative-website/web/src/app/(frontend)/call/page.tsx` with this embed:

```tsx
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function CallPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "discovery" });
      cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <main>
      <Cal
        namespace="discovery"
        calLink="konative/discovery"
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view" }}
      />
    </main>
  );
}
```

If you prefer the inline iframe (no npm package), use this instead anywhere in the page:

```html
<iframe
  src="https://cal.com/konative/discovery?embed=true"
  style="width:100%;height:700px;border:none;"
  title="Book a Discovery Call"
/>
```

---

## 2. NCAI Directory Submission *(~30 minutes)*

### URL

**https://www.ncai.org**

NCAI does not maintain a traditional "partner directory" with a public submission form. The correct path is:

1. Navigate to **https://www.ncai.org/about/partnerships** and review current partnership structures
2. The primary submission route is **direct email to NCAI's Policy and Communications team**

**VERIFY:** Go to https://www.ncai.org/contact and confirm the current email for partnership or resource inquiries. As of mid-2025 the listed contact address was **ncai@ncai.org** — confirm this has not changed.

### What to Submit

**Email subject line:**
```
Partnership Inquiry — Konative Tribal Connectivity Brokerage
```

**Organization name:** Konative

**Exact 75-word description (copy-paste ready):**

> Konative is North America's premier tribal connectivity and data center development brokerage. We exclusively serve tribal nations and Indigenous-led organizations, translating complex broadband, fiber, and data center infrastructure deals into economic assets for Indian Country. From federal program navigation (BEAD, ReConnect, NTIA) to carrier negotiations and site development strategy, Konative operates as the tribe's advocate — not the vendor's. We exist to make sure the AI infrastructure boom creates lasting wealth in tribal communities.

**Category to select:** Economic Development / Technology Infrastructure (use whichever category is closest to this on the form)

**Contact info format:**
- Organization: Konative
- Contact name: Jeramey James, Founder
- Email: jeramey.james@gmail.com (or your konative.com email once configured)
- Website: https://konative.com
- Phone: (your direct number)

### Timeline

NCAI partnership inquiries typically take **4–8 weeks** for an initial response. This is not a fast channel — it is a credibility channel.

### Follow-up Cadence

- **Week 2:** Send one follow-up email referencing the original
- **Week 6:** If no response, try the phone line listed on the contact page
- **Month 3:** Re-engage after you have a published article or case study to attach

---

## 3. CCAB Directory Submission *(~45 minutes)*

### URL

**https://www.ccab.com**

The specific directory and certification program page:
**https://www.ccab.com/programs/par/**

### PAR Certification vs. Simple Listing

**For Konative right now: pursue the simple Business Directory listing, not PAR certification.**

PAR (Progressive Aboriginal Relations) certification is designed for large corporations demonstrating their commitment to Indigenous economic reconciliation. It involves a formal audit process, fees (starting around $5,000 CAD for smaller organizations), and a multi-month review. As a brokerage that *serves* Indigenous communities rather than a corporation seeking to demonstrate Indigenous relations credibility, PAR certification is not the right fit at this stage.

The **CCAB Business Directory** is the correct entry point. It lists Indigenous businesses and businesses that work with Indigenous communities in Canada.

**VERIFY:** Go to https://www.ccab.com/membership/ to confirm current membership tiers and whether a business directory listing is included at the base membership level or requires a separate submission. As of 2025, a basic membership starts around $250–$500 CAD annually.

### What to Submit

**Organization name:** Konative

**Exact 75-word description in Canadian English (copy-paste ready):**

> Konative is a North American brokerage specialising in connectivity infrastructure and data centre development for tribal nations and Indigenous-led organisations. We help First Nations communities across Canada and the United States navigate broadband funding programmes, negotiate with carriers, and structure data centre development opportunities that generate lasting economic benefit. Konative operates exclusively as the community's advocate — not the vendor's — ensuring Indigenous nations capture value from the AI and digital infrastructure economy.

**Category:** Indigenous Business / Technology Infrastructure / Economic Development

**Contact info:**
- Organization: Konative
- Contact: Jeramey James, Founder
- Website: https://konative.com
- Email: jeramey.james@gmail.com
- Country: United States (note: you serve Canadian First Nations but are US-based — this is fine, CCAB lists cross-border partners)

### Timeline

Directory listings are typically live within **2–3 weeks** of membership approval and payment.

---

## 4. Data Center Dynamics (DCD) Contributed Article Pitch *(~30 minutes)*

### Editorial Contact

**VERIFY:** Go to **https://www.datacenterdynamics.com/en/about/contact/** and look for the editorial or contributed content email. The editorial team has historically been reachable at:

- General editorial: **editorial@datacenterdynamics.com**
- VERIFY this is current — DCD reorganized their editorial team in 2024

Also check: **https://www.datacenterdynamics.com/en/write-for-us/** — DCD has had a contributor guidelines page that lists the correct submission address.

### Subject Line

```
Contributed Article Pitch: Why Tribal Nations Are the Most Overlooked Players in the AI Infrastructure Race
```

### Pitch Email (150 words, copy-paste ready)

```
Subject: Contributed Article Pitch: Why Tribal Nations Are the Most Overlooked Players in the AI Infrastructure Race

Hi [Editor name or "DCD Editorial Team"],

I'm Jeramey James, founder of Konative — North America's only brokerage focused exclusively on data center and connectivity infrastructure development for tribal nations.

I'd like to contribute a piece for Data Center Dynamics titled:

"Why Tribal Nations Are the Most Overlooked Players in the AI Infrastructure Race"

The angle: tribal lands hold a structurally underpriced combination of available land, favorable permitting, renewable energy proximity, and federal development incentives that hyperscalers and colocation operators are only beginning to recognize. Meanwhile, tribes lack the brokerage infrastructure to capture that value — and most deals that do happen leave the nation as the landlord, not the owner.

I'd cover the market dynamics, specific deal structures that work, and what the next 18 months look like for tribal data center development.

Approximately 900–1,200 words. Happy to provide an outline first.

Jeramey James
Founder, Konative
https://konative.com
jeramey.james@gmail.com
```

### What to Attach / Link

- **Do not attach a full draft** on the first pitch — editors prefer to commission rather than receive unsolicited complete pieces
- Include your LinkedIn URL and a link to one published piece if you have one, or link to konative.com/answers as a credibility signal
- After they respond with interest, offer a 300-word outline for approval before writing the full piece

### Expected Response Timeline

DCD editorial: **2–4 weeks** for initial response. If no reply in 3 weeks, one follow-up is appropriate. Subject line for follow-up: `Following up: Tribal Nations + AI Infrastructure pitch (sent [date])`

---

## 5. Indian Country Today / ICT Media Pitch *(~25 minutes)*

### Submission Contact

**VERIFY:** Indian Country Today relaunched as a nonprofit in 2022 and has updated its editorial contacts. Check:

- **https://ictnews.org/contact**
- The editorial pitch email as of recent reporting has been **editor@ictnews.org** — verify this is current
- ICT also accepts pitches via their contact form at the URL above

### Subject Line

```
Story Pitch: The Tribal Data Center Opportunity Index — Which Nations Are Positioned to Win the AI Infrastructure Boom
```

### Pitch Email (150 words, copy-paste ready)

```
Subject: Story Pitch: The Tribal Data Center Opportunity Index — Which Nations Are Positioned to Win the AI Infrastructure Boom

Hi ICT Editorial Team,

I'm Jeramey James, founder of Konative, a brokerage that works exclusively with tribal nations on broadband, fiber, and data center infrastructure deals.

I'd like to pitch a reported piece on tribal nations' positioning in the AI data center buildout — specifically, which nations have structural advantages (land, power, permitting, federal incentives) and which are at risk of becoming passive landlords rather than active owners in the deals coming their way.

This matters to ICT's readership because the AI infrastructure investment cycle is moving fast, and tribes that don't have the right advisors and deal structures in place in the next 12–18 months will repeat the extractive patterns of past development waves. This is an economic sovereignty story.

I can write the full piece (800–1,000 words) or be a source for a staff-reported story — whichever is more useful.

Jeramey James
Founder, Konative
https://konative.com
jeramey.james@gmail.com
```

### Why This Fits ICT's Readership

ICT covers tribal economic development, sovereignty, and technology directly. Their audience includes tribal council members, economic development directors, and tribal citizens — exactly the people who need to understand this opportunity before it passes. Frame it as a sovereignty story with economic mechanics, not a tech story.

---

## 6. Perplexity Pages Indexing *(~20 minutes)*

### How Perplexity Pages Works

Perplexity Pages (https://www.perplexity.ai/pages) is a user-generated content platform — you write content directly in Perplexity's interface and it publishes under a perplexity.ai URL. It is **not** a submission system for external websites.

**The right strategy for Konative is not to submit to Perplexity Pages — it is to ensure your own /answers page is crawled and cited by Perplexity's search index.**

### How to Ensure /answers Gets Crawled by Perplexity

Perplexity uses its own crawler called **PerplexityBot**. Steps to ensure it crawls your site:

**Step 1: Check your robots.txt**

Open `/Users/jerameyjames/repos/konative-website/web/public/robots.txt` and confirm it contains:

```
User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /
```

Do NOT block PerplexityBot. If robots.txt doesn't exist, create it with the above content.

**Step 2: Ensure your /answers page has clean, structured HTML**

Perplexity indexes FAQ content best when it is:
- Written in clear question-and-answer format
- Questions are in `<h2>` or `<h3>` tags
- Answers are in `<p>` tags directly following the question
- Page has a descriptive `<title>` and `<meta description>`

**Step 3: Add FAQ schema markup to /answers**

In your `/answers` page component, add this JSON-LD:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is tribal connectivity brokerage?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Your answer text here..."
          }
        }
        // repeat for each FAQ
      ]
    })
  }}
/>
```

**Step 4: Create a Perplexity Pages post manually (optional but high-value)**

If you want a presence directly on perplexity.ai:
1. Go to **https://www.perplexity.ai**
2. Sign in with your Google account
3. Click your profile → **"Create Page"**
4. Write a 400-word explainer titled "What is tribal data center development?" and publish it
5. Include your konative.com URL in the content — this creates a citation link

This is free and takes about 20 minutes. Perplexity Pages rank well in Perplexity's own search results.

---

## 7. Google Search Console Setup *(~30 minutes)*

### Step 1: Add Your Property

1. Go to **https://search.google.com/search-console**
2. Sign in with jeramey.james@gmail.com
3. Click **"+ Add property"**
4. Select **"Domain"** type (not URL prefix) — enter `konative.com`
5. Google will give you a TXT record to add to your DNS

### Step 2: Verify via DNS TXT Record

1. Copy the TXT record value from Google (looks like `google-site-verification=xxxxxxxxxxxxxx`)
2. Go to your DNS provider (GoDaddy, Cloudflare, or wherever konative.com DNS is managed)
3. Add a new TXT record:
   - **Host/Name:** `@`
   - **Value:** paste the full verification string
   - **TTL:** 600 (or default)
4. Return to Search Console and click **"Verify"**
5. DNS propagation takes 5–60 minutes — if it fails immediately, wait 15 minutes and retry

### Step 3: Submit Your Sitemap

After verification:
1. In the left sidebar, click **"Sitemaps"**
2. In the "Add a new sitemap" field, enter: `sitemap.xml`
3. Full URL it submits: `https://konative.com/sitemap.xml`
4. Click **"Submit"**

**Verify your sitemap exists first:**
```bash
curl https://konative.com/sitemap.xml
```
Next.js 13+ with the App Router generates `/sitemap.xml` automatically if you create `/web/src/app/sitemap.ts`. If it returns 404, create that file — see Next.js sitemap docs.

### Step 4: Request Indexing — Priority Pages in Order

In Search Console, go to the URL inspection tool (top search bar) and paste each URL, then click **"Request Indexing"**:

1. `https://konative.com/` — homepage
2. `https://konative.com/answers` — FAQ / AI-indexed content
3. `https://konative.com/call` — booking page (conversion page)
4. `https://konative.com/tribal` — tribal focus landing page
5. `https://konative.com/datacenters` — data center lane
6. `https://konative.com/markets` — markets page
7. `https://konative.com/tribal/awards` — awards page (if live)
8. `https://konative.com/api/v1/coverage` — VERIFY: if this is a public-facing page, index it; if it's an API endpoint, skip it

Do 3–4 per day — Google rate-limits indexing requests.

---

## 8. LinkedIn Company Page Setup *(~45 minutes)*

### Does Konative Need One?

**Yes.** A LinkedIn Company Page is essential for Konative because:
- Tribal economic development directors and council members are active on LinkedIn
- Data center operators and carriers vet vendors on LinkedIn before calls
- DCD, ICT, and other media outlets check LinkedIn before running contributed pieces
- It separates your personal profile from the company brand

### Setup Steps

1. Go to **https://www.linkedin.com/company/setup/new/**
2. Sign in with your personal LinkedIn account
3. Fill in:
   - **Company name:** Konative
   - **LinkedIn public URL:** `linkedin.com/company/konative` (grab this before someone else does)
   - **Website:** https://konative.com
   - **Industry:** "Internet" or "Telecommunications" — use **Telecommunications** as it fits brokerage work
   - **Company size:** 1–10 employees
   - **Company type:** Privately Held
4. Upload a logo (use the Konative logo from your brand assets)
5. Write the tagline: **"Tribal Connectivity & Data Center Brokerage"**
6. Write the About section (copy-paste):

> Konative is North America's premier tribal connectivity and data center development brokerage. We work exclusively with tribal nations and Indigenous-led organizations to develop broadband infrastructure, negotiate carrier agreements, and structure data center deals that create lasting economic assets — not just lease revenue. Konative operates as the tribe's advocate in a market where everyone else is the vendor.

### First 3 Posts to Publish

Publish these in the first two weeks after the page goes live, spaced 3–4 days apart.

**Post 1 — Founder story**
- **Title concept:** "Why I started Konative" (no formal title, LinkedIn posts don't have titles — lead with the hook)
- **Opening line:** "Tribal lands sit on some of the most valuable infrastructure real estate in North America. Most of that value is going to someone else."
- **50-word outline:** Tell the origin story — the gap you saw between tribal nations' infrastructure assets and the deals they were getting. Name the problem: no one in the room representing the tribe. End with what Konative does differently. Personal tone, not press release.

**Post 2 — Market education**
- **Opening line:** "The AI data center buildout will spend $1 trillion in the next five years. Here's why tribal nations should capture more of it than they think."
- **50-word outline:** Explain the three structural advantages tribal lands have (permitting speed, land availability, renewable energy proximity). Keep it concrete with one or two real examples or public data points. End with a call to conversation, not a sales pitch.

**Post 3 — Credibility / insight**
- **Opening line:** "BEAD is a $42.45 billion program. Most tribes will get a fraction of what they're entitled to — not because they don't qualify, but because the applications are brutal."
- **50-word outline:** Break down one specific, common mistake tribes make in BEAD or ReConnect applications (overly broad coverage maps, missing matching fund documentation, etc.). Offer one actionable fix. Establish Konative as the expert who knows this from experience.

---

## 9. Google Business Profile *(~20 minutes)*

### Does Konative Need One?

**Yes — with a caveat.**

A Google Business Profile is worth creating because it populates the knowledge panel on the right side of Google search results when someone searches "Konative" directly. This is pure credibility infrastructure — it makes you look like a real company immediately.

The caveat: Google Business Profile is optimized for businesses with a physical storefront or service area. Konative is a remote-first brokerage. You can still create a profile using a **service area business** format (which hides your home address but still shows up in search).

### Setup Steps

1. Go to **https://business.google.com**
2. Sign in with jeramey.james@gmail.com
3. Click **"Add your business to Google"**
4. **Business name:** Konative
5. **Business category:** Type "Management Consulting" — select it as primary. This is the closest available category to brokerage/advisory. You can add **"Telecommunications contractor"** as a secondary category.
6. When asked "Do you have a location customers can visit?" — select **No**
7. **Service area:** Add the United States and Canada as service areas
8. **Contact info:**
   - Phone: your direct number
   - Website: https://konative.com
9. **Business description (copy-paste):**

> Konative is North America's premier tribal connectivity and data center development brokerage. We help tribal nations and Indigenous-led organizations develop broadband infrastructure, negotiate carrier agreements, and structure data center deals that generate lasting economic assets. Serving tribal communities across the US and Canada.

10. Verify your business — Google will offer verification by phone call or email to your domain email. Use domain email verification if available (requires you have a konative.com email set up).

**After verification is complete:**
- Upload your logo as the profile photo
- Add your hours as "By appointment"
- Add the service areas: "United States" and "Canada"
- Request your first review from a trusted contact who knows your work

---

## Quick Reference: Time Summary

| Task | Estimated Time |
|---|---|
| Cal.com setup | 45 min |
| NCAI submission | 30 min |
| CCAB submission | 45 min |
| DCD pitch email | 30 min |
| ICT pitch email | 25 min |
| Perplexity indexing | 20 min |
| Google Search Console | 30 min |
| LinkedIn Company Page | 45 min |
| Google Business Profile | 20 min |
| **Total** | **~5 hours** |

Run tasks 4, 5 in one sitting (both are pitch emails — draft them back to back while in the same headspace). Run tasks 7, 8, 9 in sequence since they are all platform setup work with similar login/verify flows.
