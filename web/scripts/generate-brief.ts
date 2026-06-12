/**
 * generate-brief.ts
 *
 * Konative Weekly Connectivity Demand Brief — AI generation + distribution pipeline
 *
 * 1. Pulls new connectivity signals from Supabase (since last brief)
 * 2. Calls Claude to write the brief content
 * 3. Saves to Supabase connectivity_briefs table
 * 4. Sends email via Resend
 * 5. Outputs 5 LinkedIn post drafts to stdout
 *
 * Run: npx tsx scripts/generate-brief.ts
 * Schedule: weekly via GitHub Actions or manual
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''
const RESEND_KEY = process.env.RESEND_API_KEY || ''
const RESEND_FROM = 'Konative Intelligence <intel@konative.com>'
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface Signal {
  id: string
  entity_name: string
  lane: string
  signal_type: string
  location_state: string
  estimated_mrc_band: string
  description: string
  discovered_at: string
  map_permalink: string
}

async function getRecentSignals(limit = 20): Promise<Signal[]> {
  const { data } = await supabase
    .from('connectivity_signals')
    .select('*')
    .eq('status', 'new')
    .order('discovered_at', { ascending: false })
    .limit(limit)

  return (data || []) as Signal[]
}

async function getNextIssueNumber(): Promise<number> {
  const { data } = await supabase
    .from('connectivity_briefs')
    .select('issue_number')
    .order('issue_number', { ascending: false })
    .limit(1)

  return ((data?.[0]?.issue_number as number) || 0) + 1
}

async function generateBriefContent(signals: Signal[], issueNumber: number) {
  if (!ANTHROPIC_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

  const signalSummary = signals.map(s =>
    `- ${s.entity_name} | ${s.lane} lane | ${s.location_state || 'TBD'} | ${s.signal_type} | MRC band: ${s.estimated_mrc_band || 'unknown'}\n  ${s.description}`
  ).join('\n\n')

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const prompt = `You are writing Issue #${issueNumber} of the Konative Weekly Connectivity Demand Brief — a concise intelligence briefing for enterprise connectivity buyers, tribal IT directors, and data center developers.

Konative is an AI-native connectivity intelligence brokerage focused on two lanes:
1. TRIBAL LANE: Tribal nations receiving NTIA broadband grants, building enterprise-grade networks
2. DATACENTER LANE: Hyperscale AI data center developers needing 100G+ transport and colocation

Fresh signals from this week:
${signalSummary}

Write the following sections:

## INTRO (2-3 sentences)
A sharp, specific opening about what this week's signals reveal about connectivity demand trends.

## TOP SIGNALS THIS WEEK (3-5 bullets)
Each bullet: entity name + location + what the signal means + connectivity advisory angle.

## FUNDING ALERT
Any active grant windows, NOFO releases, or RFP deadlines relevant to tribal connectivity. Be specific about amounts and deadlines if known.

## PROVIDER INSIGHT
One insight about carrier/provider behavior, pricing trends, or network investment that affects connectivity buyers this week.

## BRIEF TITLE
A compelling title for this issue (10 words max, no clickbait).

Format each section clearly. Write for a sophisticated B2B audience. No generic corporate speak. Be specific and actionable.`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract title
  const titleMatch = content.match(/## BRIEF TITLE\s*\n([^\n]+)/)
  const title = titleMatch?.[1]?.trim() || `Connectivity Demand Brief — Issue #${issueNumber}`

  // Extract intro
  const introMatch = content.match(/## INTRO[^\n]*\n([\s\S]*?)(?=##|$)/)
  const introText = introMatch?.[1]?.trim() || ''

  // Extract funding alert
  const fundingMatch = content.match(/## FUNDING ALERT[^\n]*\n([\s\S]*?)(?=##|$)/)
  const fundingAlert = fundingMatch?.[1]?.trim() || ''

  // Extract provider insight
  const providerMatch = content.match(/## PROVIDER INSIGHT[^\n]*\n([\s\S]*?)(?=##|$)/)
  const providerInsight = providerMatch?.[1]?.trim() || ''

  return { title, introText, fundingAlert, providerInsight, fullContent: content }
}

async function generateLinkedInPosts(briefContent: string, signals: Signal[]): Promise<string[]> {
  if (!ANTHROPIC_KEY) return []

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Based on this week's connectivity intelligence brief, write 5 distinct LinkedIn posts for Jeramey James (founder, Konative — AI-native connectivity intelligence brokerage).

Brief content:
${briefContent}

Top signals (pick the most compelling 2-3):
${signals.slice(0, 5).map(s => `- ${s.entity_name}: ${s.description}`).join('\n')}

Post formats (one each):
1. DATA INSIGHT: A specific statistic or trend from this week's signals with a counterintuitive take
2. TRIBAL LANE: A post specifically about tribal broadband infrastructure opportunity (for tribal IT leaders)
3. DATACENTER LANE: A post about AI data center connectivity demand signals (for DC developers)
4. ADVISOR ANGLE: A post from the TA/broker perspective about what this week's signals mean for connectivity deals
5. QUESTION/HOOK: A provocative question or hook that gets CIOs, IT directors, or tribal leaders to comment

Rules:
- Each post: 150-250 words
- No hashtag spam (max 3 per post, only if genuinely relevant)
- No "Excited to share" or "I'm thrilled"
- Conversational but authoritative
- End each with a soft CTA (DM, comment, or link to konative.com)

Separate each post with ---POST---`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return text.split('---POST---').map(p => p.trim()).filter(Boolean)
}

async function sendResendNewsletter(
  title: string,
  introText: string,
  fundingAlert: string,
  providerInsight: string,
  issueNumber: number,
  signals: Signal[]
): Promise<string | null> {
  if (!RESEND_KEY) {
    console.log('  No RESEND_API_KEY — skipping email send')
    return null
  }

  const resend = new Resend(RESEND_KEY)

  const topSignals = signals.slice(0, 5).map(s =>
    `<li><strong>${s.entity_name}</strong> (${s.location_state || 'TBD'}) — ${s.description}</li>`
  ).join('\n')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-top: 3px solid #E07B39; padding-top: 16px; margin-bottom: 24px;">
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #E07B39; margin: 0;">KONATIVE INTELLIGENCE · ISSUE #${issueNumber}</p>
    <h1 style="font-size: 28px; font-weight: 800; margin: 8px 0 0;">${title}</h1>
  </div>
  <p style="font-size: 16px; line-height: 1.6; color: #444;">${introText}</p>
  <h2 style="font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: #E07B39; border-bottom: 1px solid #eee; padding-bottom: 8px;">TOP SIGNALS THIS WEEK</h2>
  <ul style="padding-left: 20px; line-height: 1.8;">${topSignals}</ul>
  ${fundingAlert ? `<h2 style="font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: #E07B39; border-bottom: 1px solid #eee; padding-bottom: 8px;">FUNDING ALERT</h2><p style="line-height: 1.6;">${fundingAlert}</p>` : ''}
  ${providerInsight ? `<h2 style="font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: #E07B39; border-bottom: 1px solid #eee; padding-bottom: 8px;">PROVIDER INSIGHT</h2><p style="line-height: 1.6;">${providerInsight}</p>` : ''}
  <div style="margin-top: 32px; padding: 20px; background: #08142D; color: white; text-align: center;">
    <p style="margin: 0 0 12px; font-size: 14px;">Need connectivity advisory for a tribal nation or data center project?</p>
    <a href="https://cal.com/jeramey-james" style="display: inline-block; background: #E07B39; color: white; padding: 12px 28px; text-decoration: none; font-weight: 600; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;">BOOK A CALL</a>
  </div>
  <p style="font-size: 11px; color: #999; margin-top: 24px; text-align: center;">Konative · <a href="https://konative.com">konative.com</a> · jjames@tolowa.net</p>
</body>
</html>`

  try {
    const result = await resend.broadcasts.create({
      audienceId: RESEND_AUDIENCE_ID,
      from: RESEND_FROM,
      subject: `[Issue #${issueNumber}] ${title}`,
      html,
    })
    return result.data?.id || null
  } catch (err) {
    console.error('  Resend error:', err)
    return null
  }
}

async function main() {
  console.log('📡 Konative Brief Generator')
  console.log(`Run time: ${new Date().toISOString()}\n`)

  const signals = await getRecentSignals(20)
  console.log(`✓ Fetched ${signals.length} recent signals`)

  if (signals.length === 0) {
    console.log('No new signals — skipping brief generation')
    return
  }

  const issueNumber = await getNextIssueNumber()
  console.log(`✓ Issue number: #${issueNumber}`)

  console.log('⏳ Generating brief content with Claude...')
  const { title, introText, fundingAlert, providerInsight, fullContent } = await generateBriefContent(signals, issueNumber)
  console.log(`✓ Title: "${title}"`)

  // Generate slug
  const slug = `issue-${String(issueNumber).padStart(3, '0')}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}`

  // Save to Supabase
  const { data: brief, error } = await supabase
    .from('connectivity_briefs')
    .insert({
      issue_number: issueNumber,
      slug,
      title,
      status: 'draft',
      intro_text: introText,
      funding_alert: fundingAlert,
      provider_insight: providerInsight,
      signals: signals.map(s => s.id),
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return
  }
  console.log(`✓ Saved brief to Supabase: ${brief.id}`)

  // Send email newsletter
  console.log('⏳ Sending newsletter via Resend...')
  const broadcastId = await sendResendNewsletter(title, introText, fundingAlert, providerInsight, issueNumber, signals)
  if (broadcastId) {
    await supabase.from('connectivity_briefs').update({ resend_broadcast_id: broadcastId }).eq('id', brief.id)
    console.log(`✓ Resend broadcast created: ${broadcastId}`)
  }

  // Generate LinkedIn posts
  console.log('⏳ Generating LinkedIn posts...')
  const linkedinPosts = await generateLinkedInPosts(fullContent, signals)
  console.log(`\n✅ Issue #${issueNumber} complete — "${title}"`)
  console.log('\n📱 LINKEDIN POSTS (copy to buffer.com or post manually):\n')
  linkedinPosts.forEach((post, i) => {
    console.log(`\n─── POST ${i + 1} ───`)
    console.log(post)
  })

  // Mark signals as reviewed
  await supabase
    .from('connectivity_signals')
    .update({ status: 'reviewed' })
    .in('id', signals.map(s => s.id))
  console.log(`\n✓ Marked ${signals.length} signals as reviewed`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
