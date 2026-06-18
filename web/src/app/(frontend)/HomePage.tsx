'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const DataCenterMap = dynamic(() => import('@/components/DataCenterMap'), { ssr: false })

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
  const [, r1] = useCountUp(100)
  const [, r2] = useCountUp(2)
  const statsData = [
    { ref: r1, display: '100+', label: 'Suppliers through Avant' },
    { ref: r2, display: '2', label: 'Core Verticals' },
    { ref: null, display: 'US + CA', label: 'Market Intelligence' },
    { ref: null, display: '$0', label: 'Buyer Advisory Cost' },
  ]

  return (
    <section style={{ position: 'relative', background: '#fff', paddingTop: 66, minHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.9 }}>
        <DataCenterMap backgroundMode />
      </div>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.91) 34%, rgba(255,255,255,0.58) 62%, rgba(255,255,255,0.20) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: 'linear-gradient(to right, rgba(55,65,81,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(55,65,81,0.045) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-30%', width: 4, height: '130%', background: RED, transform: 'rotate(18deg)', opacity: 0.74 }} />
        <div style={{ position: 'absolute', top: '-10%', right: '-22%', width: 1, height: '130%', background: RED, transform: 'rotate(18deg)', opacity: 0.28 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '110px 32px 0' }}>
        <div style={{ maxWidth: 880 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: `1px solid ${DIVIDER}`, background: '#fff', padding: '7px 14px', borderRadius: 2, marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: RED, boxShadow: `0 0 0 3px ${RED}22` }} />
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: STEEL }}>Sovereignty-first connectivity intelligence</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(56px, 8.5vw, 116px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT, letterSpacing: '0.005em', marginBottom: 36 }}>
            TRIBAL + DATA CENTER<br />CONNECTIVITY.{' '}
            <span style={{ color: RED }}>BROKERED.</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: 19, lineHeight: 1.6, color: MUTED, maxWidth: 640, marginBottom: 38 }}>
            Konative is the connectivity intelligence brokerage for Tribal enterprises and the data centers powering AI. We combine sovereignty-aware advisory, Avant&apos;s supplier portfolio, and a live infrastructure map to source fiber, transport, internet, cloud on-ramps, and resilient networks before the market sees the RFP.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 64 }}>
            <PrimaryBtn href="/contact" large>Get Connectivity Options</PrimaryBtn>
            <GhostBtn href="/tribal" large>Explore Tribal Enterprise →</GhostBtn>
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
  { route: 'ENTERPRISE', metric: 'Internet · SD-WAN · Voice', value: 'SOURCE', direction: 'up' },
  { route: 'DATACENTER', metric: 'Dark fiber · Waves · DCI', value: 'DESIGN', direction: 'up' },
  { route: 'TRIBAL', metric: 'Government · Gaming · Health', value: 'ADVISE', direction: 'up' },
  { route: 'CLOUD', metric: 'On-ramps · Colocation · Security', value: 'PROCURE', direction: 'up' },
]

function Ticker() {
  const items = TICKER_FALLBACK
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
          What we broker
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
          Trusted infrastructure for Tribal enterprise and AI data-center connectivity
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {[
            { v: 'Sovereign', l: 'First Advisory' },
            { v: '100+', l: 'Supplier Portfolio' },
            { v: '18–36mo', l: 'Early Signal Window' },
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
  { n: '01', title: 'Tribal Enterprise', body: 'Sovereignty-aware advisory for casinos, government, health, education, broadband authorities, and Tribal EDCs sourcing resilient connectivity.', cta: 'Explore Tribal', href: '/tribal', icon: 'intel' },
  { n: '02', title: 'Brokerage', body: 'A supplier-paid connectivity desk for internet, transport, SD-WAN, voice, cloud on-ramps, dark fiber, wavelengths, and colocation.', cta: 'Start a Transaction', href: '/contact', icon: 'broker' },
  { n: '03', title: 'Map Intelligence', body: 'A live infrastructure map that turns datacenter demand, power, fiber, water, and Tribal-market context into deal-ready signal.', cta: 'View Map', href: '/map', icon: 'globe' },
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
          <Eyebrow>The Brokerage</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
            One brokerage. Two wedges. A live <span style={{ color: RED }}>intelligence</span> layer.
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
  { id: '1', tag: 'Funding', title: 'Tribal broadband awards identify organizations moving from funded infrastructure to operational network needs', meta: 'Award intelligence', time: 'current research', delta: 'TBCP', direction: 'up' },
  { id: '2', tag: 'Datacenters', title: 'New campuses create recurring demand for diverse transport, dark fiber, wavelengths, and cloud access', meta: 'Demand signal', time: 'US + Canada', delta: 'DCI', direction: 'up' },
  { id: '3', tag: 'Rural', title: 'Middle-mile and last-mile builds create enterprise opportunities beyond the original grant-funded network', meta: 'Market development', time: 'Tribal + rural', delta: 'FIBER', direction: 'up' },
  { id: '4', tag: 'Portfolio', title: 'Internet opens the account; managed network, voice, cloud, mobility, and security deepen recurring revenue', meta: 'Avant portfolio', time: 'lifecycle', delta: 'MRC', direction: 'up' },
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
  const signals = SIGNALS_FALLBACK
  return (
    <section style={{ background: SURFACE, padding: '100px 32px', borderTop: `1px solid ${DIVIDER}`, borderBottom: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 72 }}>
        <div>
          <div className="kn-fade-up" style={{ marginBottom: 40 }}>
            <Eyebrow>Live Intelligence</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
              Signals before the <span style={{ color: RED }}>RFP</span> hits the market.
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
            <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, textTransform: 'uppercase', color: '#fff', marginBottom: 14, lineHeight: 1.02 }}>Connectivity demand, in your inbox</h3>
            <p style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', marginBottom: 22 }}>Weekly signals on Tribal enterprise needs, datacenter demand, supplier movement, and infrastructure corridors worth acting on.</p>
            <NewsletterForm />
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>Source-backed research · practical buying guidance</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CoverageMapSection() {
  return (
    <section style={{ background: '#fff', padding: '100px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="kn-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 620 }}>
            <Eyebrow>Coverage</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5vw,66px)', lineHeight: 0.92, textTransform: 'uppercase', color: TEXT }}>
              The map is the <span style={{ color: RED }}>trust</span> artifact.
            </h2>
          </div>
          <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: MUTED, maxWidth: 320 }}>
            Datacenter demand, Tribal and First Nations context, power, fiber, water, and network adjacency in one brokerage-grade intelligence view.
          </p>
        </div>

        <div className="kn-fade-up" style={{ background: '#F8FAFC', border: `1px solid ${DIVIDER}`, height: 540, position: 'relative', overflow: 'hidden' }}>
          <DataCenterMap backgroundMode />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.24))' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 22, zIndex: 3, background: 'rgba(255,255,255,0.88)', border: `1px solid ${DIVIDER}`, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
            {[{ c: RED, l: 'Data-center demand' }, { c: '#2563eb', l: 'Facilities + network' }].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 2, background: x.c, display: 'inline-block' }} />
                <span style={{ fontFamily: BODY, fontSize: 11, color: 'rgba(17,17,17,0.62)' }}>{x.l}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, position: 'absolute', top: 18, right: 22, fontSize: 11, color: 'rgba(17,17,17,0.48)', background: 'rgba(255,255,255,0.86)', border: `1px solid ${DIVIDER}`, padding: '8px 12px', zIndex: 3 }}>US + Canada · infrastructure intelligence</div>
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
          <div style={{ fontFamily: MONO, fontSize: 13, color: MUTED }}>Infrastructure research by market</div>
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
  { n: '01', title: 'Tribal Councils, EDCs & CIOs', body: 'Sovereign enterprises sourcing connectivity for government, gaming, health, education, public safety, and economic development.' },
  { n: '02', title: 'Broadband Authorities & Enterprise IT', body: 'Teams turning funded infrastructure into operating networks with resilient internet, transport, voice, security, and managed services.' },
  { n: '03', title: 'Data Center Developers, Operators & Tenants', body: 'AI and colocation teams matching site demand to fiber, power, cloud access, transport, and interconnection options before constraints harden.' },
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
            Built for the buyers generic advisors <span style={{ color: RED }}>miss</span>.
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
          { v: '100+', l: 'Supplier Portfolio' },
          { v: '2', l: 'Primary Wedges' },
          { v: '18–36mo', l: 'Early Signals' },
          { v: '$0', l: 'Buyer Advisory Cost' },
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
            <Eyebrow>Start with one requirement</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,5.5vw,72px)', lineHeight: 0.9, textTransform: 'uppercase', color: TEXT, marginBottom: 20 }}>
              Bring the tribe, site, or network <span style={{ color: RED }}>requirement</span>.
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: MUTED, maxWidth: 520 }}>
              Konative turns sovereign context, infrastructure signals, supplier options, and transaction execution into a clear path from need to signed connectivity order.
            </p>
          </div>
          <div className="kn-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 40, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: TEXT }}>1</div>
                <div style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginTop: 4 }}>Point of Contact</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: TEXT }}>$0</div>
                <div style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginTop: 4 }}>Cost to Buyers</div>
              </div>
            </div>
            <PrimaryBtn href="/contact" large style={{ width: '100%', textAlign: 'center' }}>Get Connectivity Options</PrimaryBtn>
            <GhostBtn href="/tribal" large style={{ width: '100%', textAlign: 'center' }}>Explore Tribal Enterprise</GhostBtn>
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
      <WhoWeServe />
      <StatsBand />
      <CTASection />
    </>
  )
}
