/**
 * run-migration.ts
 * Runs the Konative intelligence tables migration against Supabase.
 *
 * Connection options (tries in order):
 *   1. DATABASE_URL_DIRECT env var (plain postgres:// string)
 *   2. SUPABASE_DB_PASSWORD + project ref → constructs connection string
 *   3. Falls back to printing the SQL and instructions
 *
 * Usage:
 *   DATABASE_URL_DIRECT="postgres://postgres:[password]@db.tcbworxmlmxoyzcvdjhh.supabase.co:5432/postgres" \
 *     npx tsx scripts/run-migration.ts
 *
 * OR just paste the SQL from scripts/migrations/001_konative_intelligence_tables.sql
 * into the Supabase SQL Editor:
 *   https://supabase.com/dashboard/project/tcbworxmlmxoyzcvdjhh/sql
 */

import fs from 'fs'
import path from 'path'

const MIGRATION_FILE = path.join(__dirname, 'migrations', '001_konative_intelligence_tables.sql')
const PROJECT_REF = 'tcbworxmlmxoyzcvdjhh'

async function tryPgConnection(connectionString: string) {
  try {
    // Dynamic import to avoid hard failure if pg isn't installed
    const { Client } = await import('pg')
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
    await client.connect()
    console.log('✓ Connected to Supabase postgres')

    const sql = fs.readFileSync(MIGRATION_FILE, 'utf8')

    // Split on statement-terminating semicolons (rough but works for DDL)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`Running ${statements.length} statements...\n`)

    let ok = 0, skip = 0, fail = 0
    for (const stmt of statements) {
      const label = stmt.slice(0, 80).replace(/\n/g, ' ')
      try {
        await client.query(stmt)
        ok++
        console.log(`  ✓ ${label}`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('already exists')) {
          skip++
          console.log(`  ~ ${label}  (already exists, skipped)`)
        } else {
          fail++
          console.error(`  ✗ ${label}\n    ${msg}`)
        }
      }
    }

    await client.end()
    console.log(`\n✅ Migration complete — ${ok} ok, ${skip} skipped, ${fail} failed`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Cannot find module')) {
      console.error('pg module not installed. Run: npm install --save-dev pg')
    } else {
      throw err
    }
  }
}

async function main() {
  const directUrl = process.env.DATABASE_URL_DIRECT
  const dbPassword = process.env.SUPABASE_DB_PASSWORD

  if (directUrl && !directUrl.startsWith('eyJ')) {
    console.log('Using DATABASE_URL_DIRECT...')
    await tryPgConnection(directUrl)
    return
  }

  if (dbPassword) {
    const url = `postgres://postgres.${PROJECT_REF}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    console.log('Using SUPABASE_DB_PASSWORD...')
    await tryPgConnection(url)
    return
  }

  // Fallback: print instructions
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  No direct postgres credentials found.

  To run this migration, choose one of:

  A) Supabase SQL Editor (easiest):
     https://supabase.com/dashboard/project/${PROJECT_REF}/sql
     → Paste the contents of: scripts/migrations/001_konative_intelligence_tables.sql

  B) Provide the database password:
     SUPABASE_DB_PASSWORD="[your-db-password]" npx tsx scripts/run-migration.ts

     (Find it at: Project Settings → Database → Connection string → Password)

  C) Provide a direct connection string:
     DATABASE_URL_DIRECT="postgres://postgres.[ref]:[pass]@..." npx tsx scripts/run-migration.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

  // Verify current tables via REST API
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  if (SERVICE_KEY && SUPABASE_URL) {
    console.log('Checking existing tables via REST API...')
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const tables = ['tbcp_awards', 'connectivity_signals', 'connectivity_briefs', 'commission_statements']
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error?.code === '42P01') {
        console.log(`  ✗ ${table} — DOES NOT EXIST (needs migration)`)
      } else if (error) {
        console.log(`  ? ${table} — ${error.message}`)
      } else {
        console.log(`  ✓ ${table} — exists`)
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
