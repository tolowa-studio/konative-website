'use client'

import { useState } from 'react'

const capabilities = [
  {
    num: '01 — Source',
    title: 'Powered Land Identification',
    body: 'We find and qualify parcels near substations and transmission corridors before they hit the market. GIS analysis, transmission queue review, and direct outreach to landowners — we do the legwork.',
  },
  {
    num: '02 — Connect',
    title: 'Buyer & Investor Matchmaking',
    body: 'Our network spans hyperscalers, colo operators, infrastructure funds, and family offices. We match your site or capital to the right counterparty and run a competitive process to maximize your outcome.',
  },
  {
    num: '03 — Structure',
    title: 'Deal Structure & Negotiation',
    body: 'Sale, ground lease, or joint venture — we advise on structure and negotiate on your behalf. We\'ve seen enough term sheets to know what\'s market and where to push.',
  },
  {
    num: '04 — Analyze',
    title: 'Power & Grid Strategy',
    body: 'Interconnection queue analysis, substation capacity review, transmission voltage assessment, and utility coordination. We tell you what a site is actually worth before anyone signs anything.',
  },
  {
    num: '05 — Transact',
    title: 'Due Diligence & Close',
    body: 'We stay in the deal through environmental review, title, and closing. Most brokers hand off after the LOI — we stay on to keep the timeline moving and protect your interests.',
  },
  {
    num: '06 — Manage',
    title: 'Project Oversight',
    body: 'For clients who want it, we provide ongoing project management through permitting, construction milestones, and delivery. One team, one accountability, start to finish.',
  },
]

export default function Capabilities() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="capabilities" style={{ background: '#08142D', padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 64 }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: '#E07B39', marginBottom: 20,
            }}>
              <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
              How We Work
            </div>
            <h2 style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
              fontSize: 'clamp(44px, 5.5vw, 80px)', lineHeight: 0.9,
              textTransform: 'uppercase', letterSpacing: '0.01em', color: '#fff',
            }}>
              PLAN. SOURCE.<br /><span style={{ color: '#E07B39' }}>RUN THE DEAL.</span>
            </h2>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.75,
            color: 'rgba(255,255,255,0.45)', maxWidth: 480,
          }}>
            Most brokers hand you off the moment ink hits paper. We stay in the deal — from the first site analysis
            through closing and beyond. Six capabilities, one team, full accountability.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.08)',
        }}>
          {capabilities.map((cap, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#08142D',
                padding: '40px 36px',
                borderLeft: hovered === i ? '2px solid #E07B39' : '2px solid transparent',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 13, letterSpacing: '0.2em', color: '#E07B39', marginBottom: 16,
              }}>
                {cap.num}
              </div>
              <h3 style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 26, textTransform: 'uppercase', color: '#fff',
                lineHeight: 1, marginBottom: 12,
              }}>
                {cap.title}
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
              }}>
                {cap.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
