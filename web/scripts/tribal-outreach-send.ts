/**
 * tribal-outreach-send.ts
 *
 * Phase 2: Send personalized tribal outreach emails via Resend.
 * Reads the matched contacts JSON from tribal-outreach-match.ts.
 *
 * Modes:
 *   --dry-run   Print emails to stdout, do not send
 *   --segment A Send only Segment A (TBCP award matched) — recommended first
 *   --segment B Send only Segment B (tribal, no award match)
 *   --segment C Send only Segment C (casino/gaming)
 *   --live      Required for any real send
 *   --limit N   Send max N emails (default 50 for safety)
 *   --from-idx  Start from index N (for batching)
 *   --force     Allow more than 10 live sends in one run
 *
 * Run: npx tsx scripts/tribal-outreach-send.ts --dry-run --segment A --limit 5
 * Send: ALLOW_TRIBAL_OUTREACH_LIVE=true npx tsx scripts/tribal-outreach-send.ts --live --segment A --limit 1
 *
 * FROM address: jjames@tolowa.net (Resend verified sender)
 * NOTE: Cloudflare Email Sending REST API returns 404 for /sending/domains —
 *       product not provisioned on this account. Using Resend as sender.
 */

import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'

config({ path: path.join(__dirname, '../.env.local') })

import type { OutreachContact } from './tribal-outreach-match'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const FROM_EMAIL = 'jjames@tolowa.net'
const REPLY_TO = 'jjames@konative.com'

// Parse CLI args
const args = process.argv.slice(2)
const isLive = args.includes('--live')
const isDryRun = args.includes('--dry-run') || !isLive
const segmentArg = args[args.indexOf('--segment') + 1] as 'A' | 'B' | 'C' | undefined
const limitArg = parseInt(args[args.indexOf('--limit') + 1]) || 50
const fromIdxArg = parseInt(args[args.indexOf('--from-idx') + 1]) || 0
const forceArg = args.includes('--force')
const liveGate = process.env.ALLOW_TRIBAL_OUTREACH_LIVE === 'true'

interface EmailContent {
  subject: string
  html: string
  text: string
}

interface ResendEmailResponse {
  id?: string
  error?: { message: string; name: string }
}

async function sendResendEmail(contact: OutreachContact, email: EmailContent): Promise<string> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required for --live mode')
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [contact.email],
      reply_to: REPLY_TO,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  })

  const data = (await response.json().catch(() => null)) as ResendEmailResponse | null

  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || `Resend HTTP ${response.status}`)
  }

  return data?.id || 'accepted'
}

function fmtAward(usd: number | null): string {
  if (!usd) return 'a TBCP broadband grant'
  if (usd >= 1_000_000) return `a $${(usd / 1_000_000).toFixed(1)}M TBCP broadband grant`
  return `a $${Math.round(usd).toLocaleString()} TBCP broadband grant`
}

function projectTypeLabel(code: string | null): string {
  const map: Record<string, string> = { I: 'infrastructure build-out', P: 'planning grant', A: 'adoption program' }
  return code ? (map[code] || 'broadband program') : 'broadband program'
}

// Generate personalized email for Segment A (award-matched)
function resolveFirstName(contact: OutreachContact): string {
  const fn = contact.firstName?.trim()
  // Reject if it looks like a full email address or a generic inbox name
  if (!fn) return 'there'
  if (fn.includes('@')) return 'there'
  if (fn.toLowerCase() === contact.email.toLowerCase()) return 'there'
  // Reject if it looks like a single-word all-lowercase email prefix (e.g. "mthopkins@")
  if (/^[a-z]{6,}$/.test(fn) && !fn.match(/^[A-Z]/)) return 'there'
  return fn
}

function buildSegmentAEmail(contact: OutreachContact): EmailContent {
  const firstName = resolveFirstName(contact)
  const award = contact.award!
  const awardAmt = fmtAward(award.award_amount_usd)
  const projectDesc = projectTypeLabel(award.project_type)
  const nationName = award.grantee_name

  const subject = `Connectivity brokerage for ${nationName}'s TBCP award`

  const text = `${firstName},

Congratulations to ${nationName} on receiving ${awardAmt} from NTIA's Tribal Broadband Connectivity Program for your ${projectDesc}.

My name is Jeramey James. I'm the founder of Konative — we're a connectivity intelligence brokerage focused exclusively on tribal nations and AI data center developers.

Here's what we do for tribal IT teams: we broker enterprise connectivity, SD-WAN, managed security, and voice services across 40+ carriers — at no cost to the nation. We're compensated by the carriers, not you.

What that means for ${nationName}'s TBCP project:
• Vendor-neutral carrier comparison — we don't push one provider
• BGP-redundant designs that actually fit reservation geography
• Grant-aligned procurement timelines
• Ongoing rate auditing to ensure you're not overpaying post-build

We've built tooling that maps NTIA TBCP award data, BIA region fiber paths, and carrier availability for every tribal nation in the US. Your grant is already in our system.

Would a 20-minute call make sense? I can show you what carriers are available in your area and walk through what we'd recommend for the ${projectDesc}.

Reply here or book directly: https://cal.com/jeramey-james

Jeramey James
Founder, Konative
Tolowa Pacific — Tribal Connectivity Intelligence
jjames@tolowa.net
`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family: -apple-system, 'Inter', sans-serif; color: #1a1a1a; max-width: 580px; margin: 0 auto; padding: 32px 20px; line-height: 1.6;">

<p style="margin: 0 0 20px">${firstName},</p>

<p style="margin: 0 0 20px">Congratulations to <strong>${nationName}</strong> on receiving <strong>${awardAmt}</strong> from NTIA's Tribal Broadband Connectivity Program for your ${projectDesc}.</p>

<p style="margin: 0 0 20px">My name is Jeramey James. I'm the founder of <strong>Konative</strong> — a connectivity intelligence brokerage focused exclusively on tribal nations and AI data center developers.</p>

<p style="margin: 0 0 12px"><strong>Here's what we do for tribal IT teams:</strong> we broker enterprise connectivity, SD-WAN, managed security, and voice services across 40+ carriers — at <strong>no cost to the nation</strong>. We're compensated by carriers, not you.</p>

<p style="margin: 0 0 8px">What that means for ${nationName}'s TBCP project:</p>
<ul style="margin: 0 0 20px; padding-left: 20px;">
  <li>Vendor-neutral carrier comparison — we don't push one provider</li>
  <li>BGP-redundant designs that fit reservation geography</li>
  <li>Grant-aligned procurement timelines</li>
  <li>Ongoing rate auditing so you're not overpaying post-build</li>
</ul>

<p style="margin: 0 0 20px">We've built tooling that maps NTIA TBCP award data, BIA region fiber paths, and carrier availability for every tribal nation in the US. <strong>Your grant is already in our system.</strong></p>

<p style="margin: 0 0 20px">Would a 20-minute call make sense? I can walk through what carriers serve your area and what we'd recommend for the ${projectDesc}.</p>

<p style="margin: 0 0 28px">Reply here or book directly: <a href="https://cal.com/jeramey-james" style="color: #C8001F; text-decoration: none; font-weight: 600">cal.com/jeramey-james</a></p>

<p style="margin: 0 0 4px">Jeramey James</p>
<p style="margin: 0 0 4px; color: #555">Founder, Konative</p>
<p style="margin: 0 0 4px; color: #555">Tolowa Pacific — Tribal Connectivity Intelligence</p>
<p style="margin: 0; color: #555"><a href="mailto:jjames@tolowa.net" style="color: #555">jjames@tolowa.net</a></p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
  You received this because ${nationName} is listed as an NTIA TBCP award recipient. Reply to opt out.
</div>

</body>
</html>`

  return { subject, html, text }
}

// Segment B: NSN/tribal domain, no award match
function buildSegmentBEmail(contact: OutreachContact): EmailContent {
  const firstName = resolveFirstName(contact)
  const nation = contact.nationName || contact.companyName || 'your nation'
  const subject = `Tribal connectivity brokerage — no cost to the nation`

  const text = `${firstName},

My name is Jeramey James, founder of Konative — a connectivity intelligence brokerage focused exclusively on tribal nations.

We broker enterprise connectivity, SD-WAN, managed security, and voice services for tribal IT teams across 40+ carriers at no cost to the nation. Carriers pay us; you don't.

What tribal IT teams typically use us for:
• Replacing single-homed internet connections with BGP-redundant paths
• SD-WAN across casino, government, health, and education facilities
• Competitive carrier bids for new NTIA/TBCP-funded infrastructure
• Rate audits on existing telecom contracts

We track NTIA TBCP award data for all 252 funded tribal nations and build connectivity architectures aligned to each grant's infrastructure scope.

If ${nation} has any upcoming connectivity decisions — new circuits, SD-WAN refresh, NTIA-funded builds — I'd welcome a conversation.

20 minutes: https://cal.com/jeramey-james

Jeramey James
Founder, Konative
jjames@tolowa.net
`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family: -apple-system, 'Inter', sans-serif; color: #1a1a1a; max-width: 580px; margin: 0 auto; padding: 32px 20px; line-height: 1.6;">

<p style="margin: 0 0 20px">${firstName},</p>

<p style="margin: 0 0 20px">My name is Jeramey James, founder of <strong>Konative</strong> — a connectivity intelligence brokerage focused exclusively on tribal nations.</p>

<p style="margin: 0 0 20px">We broker enterprise connectivity, SD-WAN, managed security, and voice services for tribal IT teams across 40+ carriers at <strong>no cost to the nation</strong>. Carriers pay us; you don't.</p>

<p style="margin: 0 0 8px"><strong>What tribal IT teams use us for:</strong></p>
<ul style="margin: 0 0 20px; padding-left: 20px;">
  <li>Replacing single-homed connections with BGP-redundant paths</li>
  <li>SD-WAN across casino, government, health, and education facilities</li>
  <li>Competitive carrier bids for NTIA/TBCP-funded infrastructure</li>
  <li>Rate audits on existing telecom contracts</li>
</ul>

<p style="margin: 0 0 20px">We track NTIA TBCP award data for all 252 funded tribal nations and build connectivity architectures aligned to each grant's infrastructure scope.</p>

<p style="margin: 0 0 20px">If ${nation} has any upcoming connectivity decisions, I'd welcome a conversation.</p>

<p style="margin: 0 0 28px">20 minutes: <a href="https://cal.com/jeramey-james" style="color: #C8001F; text-decoration: none; font-weight: 600">cal.com/jeramey-james</a></p>

<p style="margin: 0 0 4px">Jeramey James</p>
<p style="margin: 0 0 4px; color: #555">Founder, Konative</p>
<p style="margin: 0; color: #555"><a href="mailto:jjames@tolowa.net" style="color: #555">jjames@tolowa.net</a></p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
  Reply to opt out.
</div>

</body>
</html>`

  return { subject, html, text }
}

// Segment C: Casino/gaming tribal
function buildSegmentCEmail(contact: OutreachContact): EmailContent {
  const firstName = resolveFirstName(contact)
  const company = contact.companyName || 'your property'
  const subject = `Managed connectivity for tribal gaming — vendor-neutral`

  const text = `${firstName},

My name is Jeramey James, founder of Konative — a connectivity brokerage focused on tribal gaming and enterprise operations.

Tribal casino and gaming operations have some of the most demanding connectivity requirements in any vertical: PCI-DSS compliance, redundant WAN for gaming floor systems, QoS for surveillance and POS, plus government and health facilities on the same tribal network.

We broker managed SD-WAN, dedicated fiber, and security services across 40+ carriers at no cost to the operation. We're compensated by carriers — your IT team gets a vendor-neutral advisor with no agenda.

We currently track connectivity infrastructure for tribal gaming operations across 28 states and can provide a carrier availability and pricing analysis for ${company} in about a week.

Worth a call? https://cal.com/jeramey-james

Jeramey James
Founder, Konative
jjames@tolowa.net
`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family: -apple-system, 'Inter', sans-serif; color: #1a1a1a; max-width: 580px; margin: 0 auto; padding: 32px 20px; line-height: 1.6;">

<p style="margin: 0 0 20px">${firstName},</p>

<p style="margin: 0 0 20px">My name is Jeramey James, founder of <strong>Konative</strong> — a connectivity brokerage focused on tribal gaming and enterprise operations.</p>

<p style="margin: 0 0 20px">Tribal casino and gaming operations have some of the most demanding connectivity requirements in any vertical: PCI-DSS compliance, redundant WAN for gaming floor systems, QoS for surveillance and POS, plus government and health facilities on the same tribal network.</p>

<p style="margin: 0 0 20px">We broker managed SD-WAN, dedicated fiber, and security services across 40+ carriers at <strong>no cost to the operation</strong>. We're compensated by carriers — your IT team gets a vendor-neutral advisor.</p>

<p style="margin: 0 0 20px">We track connectivity infrastructure for tribal gaming operations across 28 states and can provide a carrier availability and pricing analysis for ${company} in about a week.</p>

<p style="margin: 0 0 28px">Worth a call? <a href="https://cal.com/jeramey-james" style="color: #C8001F; text-decoration: none; font-weight: 600">cal.com/jeramey-james</a></p>

<p style="margin: 0 0 4px">Jeramey James</p>
<p style="margin: 0 0 4px; color: #555">Founder, Konative</p>
<p style="margin: 0; color: #555"><a href="mailto:jjames@tolowa.net" style="color: #555">jjames@tolowa.net</a></p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
  Reply to opt out.
</div>

</body>
</html>`

  return { subject, html, text }
}

function buildEmail(contact: OutreachContact): EmailContent {
  if (contact.segment === 'A') return buildSegmentAEmail(contact)
  if (contact.segment === 'C') return buildSegmentCEmail(contact)
  return buildSegmentBEmail(contact)
}

async function main() {
  console.log('📧 Konative Tribal Outreach Sender')
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : '⚡ LIVE SEND'}`)
  console.log(`Segment filter: ${segmentArg || 'ALL'}`)
  console.log(`Limit: ${limitArg} | From index: ${fromIdxArg}\n`)

  if (isLive && !RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is required for --live mode')
    process.exit(1)
  }

  if (isLive && !liveGate) {
    console.error('❌ Set ALLOW_TRIBAL_OUTREACH_LIVE=true to enable live sends after CRM approval review.')
    process.exit(1)
  }

  if (isLive && !segmentArg) {
    console.error('❌ --segment A, B, or C is required for live sends.')
    process.exit(1)
  }

  if (isLive && limitArg > 10 && !forceArg) {
    console.error('❌ Live sends are capped at --limit 10 unless --force is provided after approval review.')
    process.exit(1)
  }

  // Load contacts
  const contactsPath = path.join(__dirname, '../.tribal-outreach-contacts.json')
  if (!fs.existsSync(contactsPath)) {
    console.error('❌ Contacts file not found. Run tribal-outreach-match.ts first.')
    process.exit(1)
  }

  let contacts: OutreachContact[] = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'))

  // Filter by segment
  if (segmentArg) {
    contacts = contacts.filter(c => c.segment === segmentArg)
    console.log(`Filtered to segment ${segmentArg}: ${contacts.length} contacts`)
  }

  // Apply index and limit
  contacts = contacts.slice(fromIdxArg, fromIdxArg + limitArg)
  console.log(`Sending to: ${contacts.length} contacts\n`)

  if (contacts.length === 0) {
    console.log('No contacts to send to.')
    return
  }

  let sent = 0
  let errors = 0
  const results: Array<{ email: string; status: string; id?: string }> = []

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]
    const email = buildEmail(contact)

    if (isDryRun) {
      console.log(`\n─── [${i + 1}/${contacts.length}] DRY RUN — ${contact.email} ───`)
      console.log(`Segment: ${contact.segment}`)
      if (contact.award) {
        const amt = contact.award.award_amount_usd
          ? `$${(contact.award.award_amount_usd / 1_000_000).toFixed(1)}M`
          : 'unknown'
        console.log(`Award: ${contact.award.grantee_name} — ${amt} (NOFO ${contact.award.nofo_round})`)
      }
      console.log(`Subject: ${email.subject}`)
      console.log(`\n${email.text.slice(0, 400)}...`)
      continue
    }

    try {
      const sendStatus = await sendResendEmail(contact, email)

      sent++
      results.push({ email: contact.email, status: 'sent', id: sendStatus })
      console.log(`  ✓ [${contact.segment}] ${contact.email} → ${sendStatus}`)

      // Rate limit buffer (Resend free tier: 2 req/s)
      await new Promise(r => setTimeout(r, 600))

    } catch (err) {
      errors++
      const msg = (err as Error).message
      results.push({ email: contact.email, status: 'error: ' + msg })
      console.error(`  ✗ ${contact.email}: ${msg}`)
    }
  }

  if (!isDryRun) {
    const marker = errors > 0 ? '⚠️ Partial' : '✅ Complete'
    console.log(`\n${marker}: ${sent} sent, ${errors} errors`)

    // Save results log
    const logPath = path.join(__dirname, `../outreach-log-${Date.now()}.json`)
    fs.writeFileSync(logPath, JSON.stringify({ contacts: results, sentAt: new Date().toISOString() }, null, 2))
    console.log(`Log saved: ${logPath}`)

    if (errors > 0) {
      process.exitCode = 1
    }
  } else {
    console.log(`\n✅ Dry run complete — ${contacts.length} emails previewed`)
    console.log('\nTo send for real:')
    console.log(`  npx tsx scripts/tribal-outreach-send.ts --live --segment A --limit 1`)
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
