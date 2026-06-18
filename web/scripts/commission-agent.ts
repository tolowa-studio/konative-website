/**
 * commission-agent.ts
 *
 * Konative Commission Intelligence Engine
 *
 * Scrapes Pathfinder (login.gopathfinder.net) commission statements,
 * compares to expected rate tables, detects variances, saves to Supabase,
 * and sends Resend alerts for under-payment or contract expiry.
 *
 * Run: npx tsx scripts/commission-agent.ts
 * Dependencies: playwright, @supabase/supabase-js, resend
 * Install playwright: cd web && npx playwright install chromium
 */

import { chromium } from 'playwright'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.join(__dirname, '../.env.local') })
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const RESEND_KEY = process.env.RESEND_API_KEY || ''
const PATHFINDER_USER = process.env.PATHFINDER_USER || ''
const PATHFINDER_PASS = process.env.PATHFINDER_PASS || ''
const ALERT_EMAIL = 'jjames@tolowa.net'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Known expected commission rates by provider (decimal)
// Update these as you negotiate new rate agreements
const EXPECTED_RATES: Record<string, number> = {
  'Zayo': 0.20,
  'Lumen': 0.18,
  'AT&T': 0.15,
  'Arelion': 0.20,
  'Comcast': 0.12,
  'Spectrum': 0.12,
  'Cox': 0.12,
  'CenturyLink': 0.18,
  'Windstream': 0.18,
  'Frontier': 0.15,
  'Crown Castle': 0.15,
}

interface StatementLine {
  provider: string
  customer_name: string
  service_description: string
  net_billed_usd: number
  commission_amount_usd: number
  commission_rate: number
  spiff_amount_usd: number
  evergreen_status: boolean
  contract_end_date: string | null
  pathfinder_line_id: string
}

async function scrapePathfinder(statementMonth: string): Promise<StatementLine[]> {
  if (!PATHFINDER_USER || !PATHFINDER_PASS) {
    console.warn('  ⚠️  PATHFINDER_USER / PATHFINDER_PASS not set — returning empty')
    return []
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' })
  const page = await context.newPage()
  const lines: StatementLine[] = []

  try {
    console.log('  Navigating to Pathfinder...')
    await page.goto('https://login.gopathfinder.net', { waitUntil: 'networkidle', timeout: 30000 })

    // Login
    await page.fill('input[type="email"], input[name="email"], input[name="username"]', PATHFINDER_USER)
    await page.fill('input[type="password"]', PATHFINDER_PASS)
    await page.click('button[type="submit"], input[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 })
    console.log('  ✓ Logged in')

    // Navigate to commissions / statements
    // Pathfinder typically has a "Commissions" or "Statements" section in the sidebar
    const commissionsLink = page.locator('a:has-text("Commission"), a:has-text("Statement"), a:has-text("Earning")')
    if (await commissionsLink.count() > 0) {
      await commissionsLink.first().click()
      await page.waitForLoadState('networkidle')
    }

    // Look for a month filter or date selector
    const monthFilter = page.locator('select[name*="month"], select[name*="period"], input[type="month"]')
    if (await monthFilter.count() > 0) {
      await monthFilter.first().fill(statementMonth)
      await page.keyboard.press('Enter')
      await page.waitForLoadState('networkidle')
    }

    // Scrape the table rows
    const rows = page.locator('table tbody tr, .commission-row, [data-testid*="commission"]')
    const rowCount = await rows.count()
    console.log(`  Found ${rowCount} statement rows`)

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const cells = row.locator('td')
      const cellCount = await cells.count()
      if (cellCount < 4) continue

      const texts = await Promise.all(Array.from({ length: cellCount }, (_, j) => cells.nth(j).innerText()))

      // Attempt to parse a typical Pathfinder row layout
      // Actual column positions may vary — adjust to match real Pathfinder layout
      const rawProvider = texts[0]?.trim() || ''
      const rawCustomer = texts[1]?.trim() || ''
      const rawService = texts[2]?.trim() || ''
      const rawNetBilled = texts[3]?.replace(/[^0-9.]/g, '') || '0'
      const rawCommission = texts[4]?.replace(/[^0-9.]/g, '') || '0'
      const rawRate = texts[5]?.replace(/[^0-9.]/g, '') || '0'
      const rawSpiff = texts[6]?.replace(/[^0-9.]/g, '') || '0'
      const rawContractEnd = texts[7]?.trim() || null

      if (!rawProvider) continue

      lines.push({
        provider: rawProvider,
        customer_name: rawCustomer,
        service_description: rawService,
        net_billed_usd: parseFloat(rawNetBilled) || 0,
        commission_amount_usd: parseFloat(rawCommission) || 0,
        commission_rate: parseFloat(rawRate) / 100 || 0,
        spiff_amount_usd: parseFloat(rawSpiff) || 0,
        evergreen_status: false,
        contract_end_date: rawContractEnd,
        pathfinder_line_id: `${rawProvider}-${rawCustomer}-${statementMonth}-${i}`.toLowerCase().replace(/\s+/g, '-'),
      })
    }

    // Also try CSV/Excel export if table scraping yields nothing
    if (lines.length === 0) {
      const exportBtn = page.locator('button:has-text("Export"), a:has-text("Download"), button:has-text("CSV")')
      if (await exportBtn.count() > 0) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportBtn.first().click(),
        ])
        const path = await download.path()
        console.log(`  ✓ Downloaded statement file: ${path}`)
        // Parse CSV here if needed — left as extension point
      }
    }

  } catch (err) {
    console.error('  Pathfinder scrape error:', err)
  } finally {
    await browser.close()
  }

  return lines
}

function detectVariance(line: StatementLine): { flag: boolean; reason: string | null; variance: number; variancePct: number } {
  const expected = EXPECTED_RATES[line.provider]
  if (!expected || line.net_billed_usd === 0) {
    return { flag: false, reason: null, variance: 0, variancePct: 0 }
  }

  const expectedAmount = line.net_billed_usd * expected
  const variance = line.commission_amount_usd - expectedAmount
  const variancePct = (variance / expectedAmount) * 100

  // Flag if more than 10% under expected
  if (variancePct < -10) {
    return {
      flag: true,
      reason: `Commission ${Math.abs(variancePct).toFixed(1)}% below expected rate (expected ${(expected * 100).toFixed(0)}%, received ${(line.commission_rate * 100).toFixed(2)}%)`,
      variance,
      variancePct,
    }
  }

  // Flag if contract end date within 90 days
  if (line.contract_end_date) {
    const endDate = new Date(line.contract_end_date)
    const daysUntilExpiry = (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysUntilExpiry > 0 && daysUntilExpiry < 90) {
      return {
        flag: true,
        reason: `Contract expires in ${Math.round(daysUntilExpiry)} days (${line.contract_end_date})`,
        variance,
        variancePct,
      }
    }
  }

  return { flag: false, reason: null, variance, variancePct }
}

async function sendAlertEmail(alerts: Array<StatementLine & { alert_reason: string }>, statementMonth: string) {
  if (!RESEND_KEY || alerts.length === 0) return

  const resend = new Resend(RESEND_KEY)
  const totalVariance = alerts.reduce((sum, a) => {
    const expected = (EXPECTED_RATES[a.provider] || 0) * a.net_billed_usd
    return sum + (a.commission_amount_usd - expected)
  }, 0)

  const rows = alerts.map(a => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${a.provider}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${a.customer_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">$${a.commission_amount_usd.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; color: #dc2626;">${a.alert_reason}</td>
    </tr>`).join('')

  await resend.emails.send({
    from: 'Konative Commission Alert <intel@konative.com>',
    to: ALERT_EMAIL,
    subject: `⚠️ Commission Alert — ${statementMonth} — ${alerts.length} issue(s) detected`,
    html: `<html><body style="font-family: Inter, sans-serif; max-width: 700px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #dc2626;">Commission Variance Alert — ${statementMonth}</h2>
      <p>${alerts.length} line item(s) require review. Total variance: <strong style="color: ${totalVariance < 0 ? '#dc2626' : '#16a34a'}">$${totalVariance.toFixed(2)}</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; text-align: left;">Provider</th>
            <th style="padding: 8px; text-align: left;">Customer</th>
            <th style="padding: 8px; text-align: left;">Commission</th>
            <th style="padding: 8px; text-align: left;">Issue</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">
        Review at <a href="https://login.gopathfinder.net">gopathfinder.net</a> · Konative Commission Intelligence
      </p>
    </body></html>`,
  })

  console.log(`  ✓ Alert email sent to ${ALERT_EMAIL}`)
}

async function main() {
  const statementMonth = process.env.STATEMENT_MONTH ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7) // prior month YYYY-MM

  console.log('💰 Konative Commission Agent')
  console.log(`Statement month: ${statementMonth}`)
  console.log(`Run time: ${new Date().toISOString()}\n`)

  const lines = await scrapePathfinder(statementMonth)
  console.log(`✓ Scraped ${lines.length} commission lines`)

  if (lines.length === 0) {
    console.log('No data — exiting')
    return
  }

  const alerts: Array<StatementLine & { alert_reason: string }> = []
  const records = lines.map(line => {
    const { flag, reason, variance, variancePct } = detectVariance(line)
    if (flag && reason) alerts.push({ ...line, alert_reason: reason })

    return {
      statement_month: statementMonth,
      provider: line.provider,
      customer_name: line.customer_name,
      service_description: line.service_description,
      net_billed_usd: line.net_billed_usd,
      commission_rate: line.commission_rate,
      commission_amount_usd: line.commission_amount_usd,
      spiff_amount_usd: line.spiff_amount_usd,
      expected_rate: EXPECTED_RATES[line.provider] || null,
      variance_amount_usd: variance,
      variance_pct: variancePct,
      evergreen_status: line.evergreen_status,
      contract_end_date: line.contract_end_date,
      alert_flag: flag,
      alert_reason: reason,
      pathfinder_line_id: line.pathfinder_line_id,
      raw_data: line as unknown as Record<string, unknown>,
    }
  })

  // Upsert to Supabase (dedup by month+provider+customer+service)
  const { error } = await supabase
    .from('commission_statements')
    .upsert(records, {
      onConflict: 'statement_month,provider,customer_name,service_description',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('Supabase upsert error:', error)
  } else {
    console.log(`✓ Saved ${records.length} commission records to Supabase`)
  }

  console.log(`\n⚠️  Alerts detected: ${alerts.length}`)
  alerts.forEach(a => console.log(`  - ${a.provider} / ${a.customer_name}: ${a.alert_reason}`))

  if (alerts.length > 0) {
    await sendAlertEmail(alerts, statementMonth)
  }

  // Summary
  const totalCommission = records.reduce((s, r) => s + (r.commission_amount_usd || 0), 0)
  const totalSpiff = records.reduce((s, r) => s + (r.spiff_amount_usd || 0), 0)
  console.log(`\n📊 Summary — ${statementMonth}`)
  console.log(`  Total commission: $${totalCommission.toFixed(2)}`)
  console.log(`  Total SPIFF:      $${totalSpiff.toFixed(2)}`)
  console.log(`  Combined:         $${(totalCommission + totalSpiff).toFixed(2)}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
