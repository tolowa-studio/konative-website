'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
const RED = '#C8001F'
const RED_HOVER = '#A8001A'
const RED_TINT = '#FFF0F2'
const STEEL = '#374151'
const TEXT = '#111111'
const MUTED = '#6B7280'
const DIVIDER = '#E5E7EB'
const SURFACE = '#F9FAFB'
const DARK = '#0A0F1E'
const MONO = "'JetBrains Mono', 'Fira Mono', monospace"
const DISPLAY = "'Barlow Condensed', sans-serif"
const BODY = "'Inter', sans-serif"

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('kn-visible'); io.unobserve(e.target) }
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.kn-fade-up:not(.kn-visible)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  })
}

function useCountUp(target: number, duration = 1100) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        setVal(Math.floor(ease * target))
        if (t < 1) requestAnimationFrame(tick)
        else setVal(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])
  return [val, ref] as const
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: RED, marginBottom: 18,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 24, height: 2, background: RED, display: 'inline-block', flexShrink: 0 }} />
      {children}
    </div>
  )
}

function PrimaryBtn({ children, href = '#', large, style: sx = {} }: {
  children: React.ReactNode; href?: string; large?: boolean; style?: React.CSSProperties
}) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href} style={{
      fontFamily: BODY, fontWeight: 600, fontSize: large ? 13 : 12,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      background: hov ? RED_HOVER : RED, color: '#fff',
      padding: large ? '17px 40px' : '14px 30px',
      textDecoration: 'none', display: 'inline-block', borderRadius: 2,
      transition: 'background 0.18s', ...sx,
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </Link>
  )
}

function GhostBtn({ children, href = '#', large, dark, style: sx = {} }: {
  children: React.ReactNode; href?: string; large?: boolean; dark?: boolean; style?: React.CSSProperties
}) {
  const [hov, setHov] = useState(false)
  const bc = dark ? (hov ? '#fff' : 'rgba(255,255,255,0.35)') : (hov ? STEEL : '#D1D5DB')
  const tc = dark ? '#fff' : STEEL
  return (
    <Link href={href} style={{
      fontFamily: BODY, fontWeight: 600, fontSize: large ? 13 : 12,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      background: 'transparent', color: tc,
      padding: large ? '16px 38px' : '13px 28px',
      textDecoration: 'none', display: 'inline-block',
      border: `1px solid ${bc}`, borderRadius: 2,
      transition: 'border-color 0.18s', ...sx,
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </Link>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [health, setHealth] = useState<{ routeCount: number; marketCount: number; capacityBrokered: string; latency: string } | null>(null)
  useEffect(() => {
    fetch('/api/v1/health').then(r => r.ok ? r.json() : null).then(d => d && setHealth(d)).catch(() => {})
  }, [])

  const routeCount = health?.routeCount ?? 847
  const marketCount = health?.marketCount ?? 12
  const [, r1] = useCountUp(routeCount)
  const [, r2] = useCountUp(marketCount)
  const statsData = [
    { ref: r1, display: String(routeCount), label: 'Routes Analyzed' },
    { ref: r2, display: String(marketCount), label: 'Active Markets' },
    { ref: null, display: health?.capacityBrokered ?? '$2.4B', label: 'Capacity Brokered' },
    { ref: null, display: health?.latency ?? '38ms', label: 'Median Quote Latency' },
  ]

  return (
    <section style={{ position: 'relative', background: '#fff', paddingTop: 66 }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(to right, rgba(55,65,81,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(55,65,81,0.05) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-30%', width: 4, height: '130%', background: RED, transform: 'rotate(18deg)', opacity: 0.9 }} />
        <div style={{ position: 'absolute', top: '-10%', right: '-22%', width: 1, height: '130%', background: RED, transform: 'rotate(18deg)', opacity: 0.4 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '110px 32px 0' }}>
        <div style={{ maxWidth: 880 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: `1px solid ${DIVIDER}`, background: '#fff', padding: '7px 14px', borderRadius: 2, marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: RED, boxShadow: `0 0 0 3px ${RED}22` }} />
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: STEEL }}>Velocity Intelligence for Connectivity Markets</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(56px, 8.5vw, 116px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT, letterSpacing: '0.005em', marginBottom: 36 }}>
            CONNECTIVITY<br />INTELLIGENCE.{' '}
            <span style={{ color: RED }}>BROKERED.</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: 19, lineHeight: 1.6, color: MUTED, maxWidth: 640, marginBottom: 38 }}>
            Konative is the AI-native brokerage for large-scale connectivity. Find, price, and transact on fiber, dark fiber, wireless backhaul, and colocation across North America — with the intelligence layer enterprise buyers actually trust.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 64 }}>
            <PrimaryBtn href="/contact" large>Request Platform Access</PrimaryBtn>
            <GhostBtn href="/markets" large>Explore Live Markets →</GhostBtn>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, borderTop: `1px solid ${DIVIDER}`, background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
          {statsData.map((s, i) => (
            <div key={i} ref={s.ref ?? undefined} style={{ padding: '32px', borderRight: i < 3 ? `1px solid ${DIVIDER}` : 'none', borderTop: `2px solid ${RED}` }}>
              <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 40, color: TEXT, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.display}</div>
              <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Ticker />
    </section>
  )
}

// ─── TICKER ───────────────────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  { route: 'ASH→NYC', metric: 'Dark fiber', value: '+2 routes', direction: 'up' },
  { route: 'DAL→ATL', metric: 'Wavelength 400G', value: '−6.2%', direction: 'down' },
  { route: 'SJC→SEA', metric: 'Colocation', value: '3 quotes', direction: 'up' },
  { route: 'CHI→TOR', metric: 'Cross-border IP', value: 'Live', direction: 'up' },
  { route: 'LAX→PHX', metric: 'Backhaul', value: '+1.8%', direction: 'up' },
  { route: 'YYZ→MTL', metric: 'Dark fiber', value: '−4.0%', direction: 'down' },
  { route: 'MIA→ATL', metric: 'Wavelength 100G', value: '5 quotes', direction: 'up' },
  { route: 'DEN→SLC', metric: 'Colocation', value: 'New', direction: 'up' },
]

function Ticker() {
  const [items, setItems] = useState(TICKER_FALLBACK)
  useEffect(() => {
    fetch('/api/v1/market/ticker').then(r => r.ok ? r.json() : null).then(d => d?.length && setItems(d)).catch(() => {})
  }, [])
  const row = [...items, ...items]
  return (
    <div style={{ position: 'relative', zIndex: 2, background: DARK, borderTop: `1px solid ${RED}`, overflow: 'hidden', maxWidth: '100vw', contain: 'paint layout' }}>
      <style>{`
        @keyframes kn-ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .kn-ticker-track{display:inline-flex;white-space:nowrap;animation:kn-ticker 38s linear infinite;}
        .kn-ticker-track:hover{animation-play-state:paused}
        .kn-fade-up{opacity:0;transform:translateY(20px);transition:opacity 0.45s ease,transform 0.45s ease;}
        .kn-fade-up.kn-visible{opacity:1;transform:translateY(0);}
        @media(prefers-reduced-motion:reduce){.kn-fade-up{opacity:1;transform:none;transition:none;}}
      `}</style>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ background: RED, color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '0 18px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', marginRight: 8, display: 'inline-block' }} />
          Live Market
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="kn-ticker-track">
            {row.map((it, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 26px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 12, color: '#fff' }}>{it.route}</span>
                <span style={{ fontFamily: BODY, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>{it.metric}</span>
                <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: it.direction === 'up' ? '#34D399' : '#F87171' }}>{it.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TRUST STRIP ──────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <section style={{ background: '#fff', borderBottom: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 32px', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', maxWidth: 180, lineHeight: 1.5 }}>
          Trusted infrastructure for connectivity buyers
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {[
            { v: '99.99%', l: 'Quote Accuracy SLA' },
            { v: '14 Tier-1', l: 'Carrier Networks Indexed' },
            { v: '<48h', l: 'Median Time to Term Sheet' },
            { v: '$0', l: 'Cost to Buyers' },
          ].map((m, i) => (
            <div key={i} style={{ padding: '0 36px', borderLeft: i > 0 ? `1px solid ${DIVIDER}` : 'none' }}>
              <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, color: TEXT }}>{m.v}</div>
              <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginTop: 5 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FEATURE CARDS ────────────────────────────────────────────────────────────
const CARDS = [
  { n: '01', title: 'Intelligence', body: 'Real-time route availability, capacity, and pricing intelligence across 14 Tier-1 carrier networks. Know the market before you negotiate it.', cta: 'Explore Intelligence', href: '/intelligence', icon: 'intel' },
  { n: '02', title: 'Brokerage', body: 'Source, price, and transact fiber, dark fiber, wavelengths, backhaul, and colocation. From RFQ to executed term sheet in under 48 hours.', cta: 'Start a Transaction', href: '/contact', icon: 'broker' },
  { n: '03', title: 'Coverage', body: 'Continental visibility across 12 active metro markets in the US and Canada — with route-level mapping and cross-border interconnection.', cta: 'View Coverage Map', href: '/map', icon: 'globe' },
]

function CardIcon({ type }: { type: string }) {
  const p: React.SVGProps<SVGSVGElement> = { viewBox: '0 0 24 24', width: 28, height: 28, fill: 'none', stroke: RED, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'intel') return <svg {...p}><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg>
  if (type === 'broker') return <svg {...p}><path d="M4 7h16M4 7l3-3M4 7l3 3" /><path d="M20 17H4m16 0l-3-3m3 3l-3 3" /></svg>
  return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>
}

function FeatureCard({ card }: { card: typeof CARDS[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="kn-fade-up" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? '#fff' : SURFACE, border: `1px solid ${DIVIDER}`, borderLeft: `3px solid ${RED}`, padding: '36px 32px 32px', transition: 'box-shadow 0.18s, transform 0.18s', boxShadow: hov ? '0 8px 28px rgba(17,17,17,0.08)' : 'none', transform: hov ? 'translateY(-3px)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <CardIcon type={card.icon} />
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>{card.n}</span>
      </div>
      <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, textTransform: 'uppercase', color: TEXT, marginBottom: 14, lineHeight: 1 }}>{card.title}</h3>
      <p style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.65, color: MUTED, marginBottom: 28 }}>{card.body}</p>
      <Link href={card.href} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 12.5, letterSpacing: '0.04em', color: RED, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {card.cta}
        <span style={{ transform: hov ? 'translateX(4px)' : 'none', transition: 'transform 0.18s', display: 'inline-block' }}>→</span>
      </Link>
    </div>
  )
}

function FeatureCards() {
  return (
    <section style={{ background: '#fff', padding: '100px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="kn-fade-up" style={{ marginBottom: 56, maxWidth: 720 }}>
          <Eyebrow>The Platform</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
            One platform. The entire <span style={{ color: RED }}>connectivity</span> stack.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
          {CARDS.map((c, i) => <FeatureCard key={i} card={c} />)}
        </div>
      </div>
    </section>
  )
}

// ─── MARKET INTEL ─────────────────────────────────────────────────────────────
type Signal = { id: string; tag: string; title: string; meta: string; time: string; delta: string; direction: 'up' | 'down' }
const SIGNALS_FALLBACK: Signal[] = [
  { id: '1', tag: 'Pricing', title: '400G wavelength rates compress 6.2% on the Dallas–Atlanta corridor', meta: 'Market Signal', time: '14m ago', delta: '−6.2%', direction: 'down' },
  { id: '2', tag: 'Capacity', title: 'Two new dark fiber routes light between Ashburn and metro NYC', meta: 'Inventory', time: '1h ago', delta: '+2', direction: 'up' },
  { id: '3', tag: 'Cross-Border', title: 'Chicago–Toronto IP transit inventory returns to market after 9-month gap', meta: 'Coverage', time: '3h ago', delta: 'Live', direction: 'up' },
  { id: '4', tag: 'Colocation', title: 'Phoenix colo absorption accelerates as AI tenants pre-lease 2027 capacity', meta: 'Demand', time: '5h ago', delta: '+18%', direction: 'up' },
]

function SignalRow({ s, last }: { s: Signal; last: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 20, alignItems: 'center', padding: '22px 26px', borderBottom: last ? 'none' : `1px solid ${DIVIDER}`, borderLeft: hov ? `3px solid ${RED}` : '3px solid transparent', background: hov ? '#FAFAFA' : '#fff', transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer' }}>
      <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: RED, border: `1px solid ${RED}33`, background: RED_TINT, padding: '4px 8px', borderRadius: 2 }}>{s.tag}</span>
      <div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15.5, color: TEXT, lineHeight: 1.4, marginBottom: 5 }}>{s.title}</div>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: '#9CA3AF' }}>{s.meta} · {s.time}</div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: s.direction === 'up' ? '#059669' : '#DC2626', textAlign: 'right', whiteSpace: 'nowrap' }}>{s.delta}</div>
    </div>
  )
}

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'homepage_rail' }) })
      setState(res.ok ? 'done' : 'error')
    } catch { setState('error') }
  }
  if (state === 'done') return <div style={{ fontFamily: BODY, fontSize: 13, color: '#34D399', padding: '16px 0' }}>✓ You&apos;re on the list.</div>
  return (
    <form onSubmit={submit}>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email"
        style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontFamily: BODY, fontSize: 14, marginBottom: 10, outline: 'none', borderRadius: 2, boxSizing: 'border-box' }} />
      <button type="submit" disabled={state === 'loading'}
        style={{ width: '100%', padding: 13, background: RED, color: '#fff', border: 'none', fontFamily: BODY, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, opacity: state === 'loading' ? 0.7 : 1 }}>
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {state === 'error' && <div style={{ fontFamily: BODY, fontSize: 12, color: '#F87171', marginTop: 8 }}>Something went wrong — try again.</div>}
    </form>
  )
}

function MarketIntel() {
  const [signals, setSignals] = useState<Signal[]>(SIGNALS_FALLBACK)
  useEffect(() => {
    fetch('/api/v1/content?limit=4').then(r => r.ok ? r.json() : null).then(d => d?.length && setSignals(d)).catch(() => {})
  }, [])
  return (
    <section style={{ background: SURFACE, padding: '100px 32px', borderTop: `1px solid ${DIVIDER}`, borderBottom: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 72 }}>
        <div>
          <div className="kn-fade-up" style={{ marginBottom: 40 }}>
            <Eyebrow>Live Intelligence</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
              What&apos;s moving the <span style={{ color: RED }}>market</span> right now.
            </h2>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${DIVIDER}` }}>
            {signals.map((s, i) => <SignalRow key={s.id} s={s} last={i === signals.length - 1} />)}
          </div>
          <div style={{ marginTop: 28 }}><GhostBtn href="/intelligence">View All Intelligence →</GhostBtn></div>
        </div>
        <div className="kn-fade-up">
          <div style={{ background: DARK, padding: '34px 30px', position: 'sticky', top: 90 }}>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: RED, marginBottom: 16 }}>The Konative Brief</div>
            <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, textTransform: 'uppercase', color: '#fff', marginBottom: 14, lineHeight: 1.02 }}>Connectivity intelligence, in your inbox</h3>
            <p style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', marginBottom: 22 }}>Weekly market signals, pricing movements, and route intelligence for connectivity buyers.</p>
            <NewsletterForm />
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>12 markets · 14 carriers · updated live</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── COVERAGE MAP ─────────────────────────────────────────────────────────────
const NODES = [
  { x: 16, y: 64, l: 'SJC', major: true }, { x: 12, y: 44, l: 'SEA' },
  { x: 22, y: 78, l: 'LAX', major: true }, { x: 30, y: 70, l: 'PHX' },
  { x: 40, y: 80, l: 'DAL', major: true }, { x: 34, y: 50, l: 'DEN' },
  { x: 56, y: 58, l: 'CHI', major: true }, { x: 62, y: 80, l: 'ATL', major: true },
  { x: 74, y: 86, l: 'MIA' }, { x: 82, y: 50, l: 'NYC', major: true },
  { x: 86, y: 42, l: 'BOS' }, { x: 78, y: 36, l: 'TOR' },
  { x: 70, y: 30, l: 'YYZ' }, { x: 88, y: 60, l: 'ASH', major: true },
]
const ROUTES = [[0,1],[0,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[7,9],[9,10],[9,13],[6,9],[6,12],[12,11],[4,7],[3,5],[9,11],[8,9]]
const LIT = new Set(['6-9','4-7','9-13','6-7'])

function CoverageMapSection() {
  return (
    <section style={{ background: '#fff', padding: '100px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="kn-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 620 }}>
            <Eyebrow>Coverage</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
              The continent, <span style={{ color: RED }}>mapped</span> route by route.
            </h2>
          </div>
          <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: MUTED, maxWidth: 320 }}>
            12 active metro markets. 14 Tier-1 networks. Cross-border interconnection across the US and Canada.
          </p>
        </div>

        <div className="kn-fade-up" style={{ background: DARK, border: `1px solid ${DIVIDER}`, height: 540, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {ROUTES.map((r, i) => {
              const a = NODES[r[0]], b = NODES[r[1]]
              const lit = LIT.has(r.join('-'))
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lit ? RED : 'rgba(255,255,255,0.16)'} strokeWidth={lit ? 0.5 : 0.3} vectorEffect="non-scaling-stroke" />
            })}
          </svg>
          {NODES.map((n, i) => (
            <div key={i} style={{ position: 'absolute', left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)', zIndex: 2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: n.major ? 10 : 6, height: n.major ? 10 : 6, borderRadius: '50%', background: n.major ? RED : '#fff', boxShadow: n.major ? `0 0 0 4px ${RED}33` : '0 0 0 3px rgba(255,255,255,0.12)' }} />
                <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, color: n.major ? '#fff' : 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>{n.l}</span>
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 22, zIndex: 3 }}>
            {[{ c: RED, l: 'Active routes' }, { c: 'rgba(255,255,255,0.2)', l: 'Indexed inventory' }].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 2, background: x.c, display: 'inline-block' }} />
                <span style={{ fontFamily: BODY, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{x.l}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, position: 'absolute', top: 18, right: 22, fontSize: 11, color: 'rgba(255,255,255,0.4)', zIndex: 3 }}>847 routes · 12 metros · live</div>
          <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 3 }}>
            <Link href="/map" style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(200,0,31,0.85)', color: '#fff', padding: '10px 18px', textDecoration: 'none', display: 'inline-block', borderRadius: 2 }}>
              Open Full Map →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── MARKETS TABLE ────────────────────────────────────────────────────────────
type MarketRowData = { code: string; market: string; routes: number; inventoryType: string; index7d: string; status: string }
const MARKET_ROWS_FALLBACK: MarketRowData[] = [
  { code: 'ASH', market: 'Ashburn, VA', routes: 142, inventoryType: 'Dark Fiber · Colo', index7d: '+4.2%', status: 'ACTIVE' },
  { code: 'NYC', market: 'New York, NY', routes: 118, inventoryType: 'Wavelength · IP', index7d: '−1.8%', status: 'ACTIVE' },
  { code: 'DAL', market: 'Dallas, TX', routes: 96, inventoryType: 'Dark Fiber · Backhaul', index7d: '+6.1%', status: 'ACTIVE' },
  { code: 'CHI', market: 'Chicago, IL', routes: 88, inventoryType: 'Wavelength · Colo', index7d: '+2.4%', status: 'ACTIVE' },
  { code: 'YYZ', market: 'Toronto, ON', routes: 64, inventoryType: 'Cross-Border IP', index7d: 'NEW', status: 'OPENING' },
]

function MarketRow({ r, last }: { r: MarketRowData; last: boolean }) {
  const [hov, setHov] = useState(false)
  const sc = r.status === 'ACTIVE' ? '#059669' : '#D97706'
  const isUp = r.index7d.startsWith('+') || r.index7d === 'NEW'
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 135px), 1fr))', gap: 12, padding: '20px 28px', borderBottom: last ? 'none' : `1px solid ${DIVIDER}`, alignItems: 'center', borderLeft: hov ? `3px solid ${RED}` : '3px solid transparent', background: hov ? '#FAFAFA' : '#fff', transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: RED, background: RED_TINT, padding: '4px 7px', borderRadius: 2 }}>{r.code}</span>
        <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: TEXT }}>{r.market}</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: TEXT }}>{r.routes}</div>
      <div style={{ fontFamily: BODY, fontSize: 13.5, color: MUTED }}>{r.inventoryType}</div>
      <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: r.index7d === 'NEW' ? RED : (isUp ? '#059669' : '#DC2626') }}>{r.index7d}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc }} />
        <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', color: sc }}>{r.status}</span>
      </div>
    </div>
  )
}

function MarketsTable() {
  const [rows, setRows] = useState<MarketRowData[]>(MARKET_ROWS_FALLBACK)
  useEffect(() => {
    fetch('/api/v1/markets').then(r => r.ok ? r.json() : null).then(d => d?.length && setRows(d)).catch(() => {})
  }, [])
  return (
    <section style={{ background: SURFACE, padding: '100px 32px', borderTop: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="kn-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Eyebrow>Markets</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
              Live across <span style={{ color: RED }}>12 metro</span> markets.
            </h2>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: MUTED }}>508 active routes · updated 14m ago</div>
        </div>
        <div className="kn-fade-up" style={{ background: '#fff', border: `1px solid ${DIVIDER}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 135px), 1fr))', gap: 12, padding: '14px 28px', borderBottom: `1px solid ${DIVIDER}`, background: SURFACE }}>
            {['Market', 'Routes', 'Inventory Type', 'Index 7d', 'Status'].map(h => (
              <div key={h} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED }}>{h}</div>
            ))}
          </div>
          {rows.map((r, i) => <MarketRow key={r.code} r={r} last={i === rows.length - 1} />)}
        </div>
        <div style={{ marginTop: 28 }}><GhostBtn href="/markets">Open Full Market View →</GhostBtn></div>
      </div>
    </section>
  )
}

// ─── WHO WE SERVE ─────────────────────────────────────────────────────────────
const SEGMENTS = [
  { n: '01', title: 'Enterprises', body: 'Multi-site enterprises sourcing connectivity at scale — procurement teams who need price discovery, not a sales rep.' },
  { n: '02', title: 'Carriers & ISPs', body: 'Networks monetizing spare capacity and acquiring routes to fill coverage gaps without months of bilateral negotiation.' },
  { n: '03', title: 'Data Center Operators', body: 'Colocation and hyperscale operators matching tenant demand to interconnection and cross-connect inventory in real time.' },
]

function SegmentPanel({ s, last }: { s: typeof SEGMENTS[0]; last: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="kn-fade-up" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '44px 38px', borderRight: last ? 'none' : `1px solid ${DIVIDER}`, background: hov ? SURFACE : '#fff', transition: 'background 0.18s', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: hov ? '100%' : 0, height: 3, background: RED, transition: 'width 0.3s ease' }} />
      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: RED, marginBottom: 22 }}>{s.n}</div>
      <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, textTransform: 'uppercase', color: TEXT, marginBottom: 14, lineHeight: 1 }}>{s.title}</h3>
      <p style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.65, color: MUTED }}>{s.body}</p>
    </div>
  )
}

function WhoWeServe() {
  return (
    <section style={{ background: '#fff', padding: '100px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="kn-fade-up" style={{ marginBottom: 52, maxWidth: 760 }}>
          <Eyebrow>Who We Serve</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
            Built for both sides of the <span style={{ color: RED }}>transaction</span>.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', border: `1px solid ${DIVIDER}` }}>
          {SEGMENTS.map((s, i) => <SegmentPanel key={i} s={s} last={i === SEGMENTS.length - 1} />)}
        </div>
      </div>
    </section>
  )
}

// ─── STATS BAND ───────────────────────────────────────────────────────────────
function StatsBand() {
  return (
    <section style={{ background: SURFACE, borderTop: `1px solid ${DIVIDER}`, borderBottom: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
        {[
          { v: '847', l: 'Routes Indexed' },
          { v: '$2.4B', l: 'Capacity Brokered' },
          { v: '<48h', l: 'RFQ to Term Sheet' },
          { v: '14', l: 'Tier-1 Networks' },
        ].map((s, i) => (
          <div key={i} className="kn-fade-up" style={{ padding: '52px 32px', borderRight: i < 3 ? `1px solid ${DIVIDER}` : 'none', textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 52, color: RED, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginTop: 12 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ background: '#fff', padding: '110px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', border: `1px solid ${DIVIDER}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(55,65,81,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(55,65,81,0.04) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: RED }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 60, alignItems: 'center', padding: '64px 56px' }}>
          <div className="kn-fade-up">
            <Eyebrow>Request Access</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5.5vw,72px)', lineHeight: 0.9, textTransform: 'uppercase', color: TEXT, marginBottom: 20 }}>
              Stop negotiating blind. Start with the <span style={{ color: RED }}>market</span>.
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: MUTED, maxWidth: 520 }}>
              Get platform access to live route intelligence, transparent pricing, and a brokerage desk that moves at the speed of your business.
            </p>
          </div>
          <div className="kn-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 40, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: TEXT }}>24h</div>
                <div style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginTop: 4 }}>Onboarding</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: TEXT }}>$0</div>
                <div style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginTop: 4 }}>Cost to Buyers</div>
              </div>
            </div>
            <PrimaryBtn href="/contact" large style={{ width: '100%', textAlign: 'center' }}>Request Platform Access</PrimaryBtn>
            <GhostBtn href="/contact" large style={{ width: '100%', textAlign: 'center' }}>Talk to the Brokerage Desk</GhostBtn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function ScrollReveal() {
  useScrollReveal()
  return null
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <TrustStrip />
      <FeatureCards />
      <MarketIntel />
      <CoverageMapSection />
      <MarketsTable />
      <WhoWeServe />
      <StatsBand />
      <CTASection />
    </>
  )
}
