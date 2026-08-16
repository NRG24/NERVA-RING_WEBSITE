import { useEffect, useRef, useState, type FormEvent, type JSX, type ReactNode } from 'react'
import ringGraphite from './assets/ring-graphite.jpg'
import ringGold from './assets/ring-gold2.jpg'
import ringChrome from './assets/ring-chrome.jpg'
import blueprint from './assets/blueprint.jpg'

/* ---------- scroll reveal ---------- */
function Reveal({ children, as: Tag = 'div', className = '', delay = 0 }: {
  children: ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShown(true); return }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); io.disconnect() }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const Comp = Tag as any
  return (
    <Comp
      ref={ref as any}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Comp>
  )
}

/* ---------- EDA / skin-conductance waveform ---------- */
function EdaWave() {
  const d =
    'M0 30 L60 30 L90 29 L120 31 ' +
    'C150 31 160 12 185 12 C210 12 214 30 245 30 ' +
    'L320 30 L360 28 ' +
    'C395 28 402 18 425 18 C450 18 452 30 490 30 ' +
    'L560 30 L600 31 ' +
    'C640 31 648 8 675 8 C702 8 706 30 745 30 ' +
    'L820 30 L870 29 L920 30 L1000 30'
  return (
    <svg className="wavebar__svg" viewBox="0 0 1000 46" preserveAspectRatio="none" aria-hidden="true">
      <path className="wave-path" d={d} />
      <path className="wave-path wave-dash" d={d} opacity="0.5" />
    </svg>
  )
}

/* ---------- dual-signal instrument readout ---------- */
function ppgPath() {
  let d = 'M0 40'
  for (let x = 0; x < 1000; x += 125) {
    d +=
      ` L${x + 34} 40` +
      ` C${x + 42} 40 ${x + 46} 9 ${x + 54} 10` +   // systolic upstroke
      ` C${x + 62} 11 ${x + 66} 52 ${x + 74} 50` +  // dip below baseline
      ` C${x + 82} 49 ${x + 88} 33 ${x + 96} 35` +  // dicrotic bump
      ` C${x + 104} 37 ${x + 110} 40 ${x + 125} 40` // back to baseline
  }
  return d
}
const HR_D = ppgPath()
const EDA_D =
  'M0 42 L140 42 C210 42 232 23 300 23 C360 23 382 42 460 42 ' +
  'L560 42 C620 42 642 15 710 15 C762 15 784 42 862 42 L1000 40'

function Trace({ d, kind }: { d: string; kind: 'hr' | 'eda' }) {
  return (
    <svg className="inst__trace" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
      <path className="trace-base" d={d} />
      <path className={`trace-live trace-live--${kind}`} d={d} />
    </svg>
  )
}

function SignalInstrument() {
  return (
    <div className="instrument" role="img" aria-label="A live-style readout showing a fast pulsatile heart-rate trace above a slow-drifting skin-conductance trace.">
      <div className="inst__head">
        <span className="inst__live">Dual-signal readout</span>
        <span className="inst__cap">Illustrative traces</span>
      </div>
      <div className="inst__row">
        <div className="inst__name">Heart rate<span className="inst__sub">Optical PPG · SpO₂</span></div>
        <Trace d={HR_D} kind="hr" />
        <div className="inst__val">72<small>bpm</small></div>
      </div>
      <div className="inst__div" />
      <div className="inst__row">
        <div className="inst__name">Skin conductance<span className="inst__sub">EDA · GSR</span></div>
        <Trace d={EDA_D} kind="eda" />
        <div className="inst__val">4.6<small>µS</small></div>
      </div>
    </div>
  )
}

/* ---------- scroll-scrubbed cinematic sensor film ---------- */
function FilmScroll() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [scrub, setScrub] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    const canScrub = fine && !reduce
    setScrub(canScrub)
    video.muted = true

    /* --- Reduced motion: poster only. Never download the film. --- */
    if (reduce) {
      video.preload = 'none'
      return
    }

    /* Hold back the ~13MB download until (a) the page has finished loading, so it
       never competes with the hero images, and (b) the film is near the viewport. */
    const warm = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return
        video.preload = 'auto'
        if (video.readyState < 2) video.load()
        warm.disconnect()
      }),
      { rootMargin: '120% 0px' },
    )
    const startWarm = () => warm.observe(section)
    if (document.readyState === 'complete') startWarm()
    else window.addEventListener('load', startWarm, { once: true })

    /* --- Touch fallback: autoplay loop while in view --- */
    if (!canScrub) {
      video.loop = true
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) video.play().catch(() => {})
          else video.pause()
        }),
        { threshold: 0.25 },
      )
      io.observe(video)
      return () => { io.disconnect(); warm.disconnect() }
    }

    /* --- Desktop: scrub video currentTime directly to scroll position --- */
    video.loop = false
    let lastP = -1

    const update = () => {
      const rect = section.getBoundingClientRect()
      const travel = section.offsetHeight - window.innerHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0
      if (Math.abs(p - lastP) < 0.0012) return
      lastP = p
      setProgress(p)
      const dur = video.duration || 0
      if (dur && video.readyState >= 1) video.currentTime = p * (dur - 0.05)
    }

    if (video.readyState >= 1) update()
    else video.addEventListener('loadedmetadata', update, { once: true })

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      warm.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef as any} className={`film ${scrub ? 'film--scrub' : ''}`} aria-label="NERVA sensor architecture film">
      <div className="film__sticky">
        <video
          ref={videoRef}
          className="film__video"
          src="/nerva-sensors.mp4"
          poster="/nerva-sensors-poster.jpg"
          muted
          playsInline
          preload="metadata"
        />
        <div className="film__grade" aria-hidden="true" />
        <div className="film__ui">
          <span className="film__tag">Sensor architecture · rendered from the working model</span>
          <span className="film__hint" style={scrub ? { opacity: Math.max(0, 1 - progress * 4) } : undefined}>
            {scrub ? 'Scroll to explore' : 'Every reading begins inside the band'}
          </span>
        </div>
        {scrub && (
          <div className="film__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- email capture ----------
   Point VITE_SIGNUP_ENDPOINT at whatever list you use (Buttondown, ConvertKit,
   Formspree, a Cloudflare Worker, etc.). It just POSTs { email } as JSON.
   With no endpoint set the form fails honestly instead of faking success. */
const SIGNUP_ENDPOINT = import.meta.env.VITE_SIGNUP_ENDPOINT as string | undefined
const CONTACT_EMAIL = 'hello@nervaring.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Signup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const trapRef = useRef<HTMLInputElement>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (state === 'sending') return

    if (trapRef.current?.value) { setState('done'); return } // bot fell in the honeypot

    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setState('error')
      setMsg('That email address doesn’t look right.')
      return
    }

    if (!SIGNUP_ENDPOINT) {
      setState('error')
      setMsg(`Signup isn’t connected yet. Email ${CONTACT_EMAIL} and I’ll add you by hand.`)
      return
    }

    setState('sending')
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: value }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setState('done')
    } catch {
      setState('error')
      setMsg(`Something went wrong on our end. Try again, or email ${CONTACT_EMAIL}.`)
    }
  }

  if (state === 'done') {
    return (
      <p className="signup__ok" role="status">
        You’re on the list. Talk soon.
      </p>
    )
  }

  return (
    <form className="signup-wrap" onSubmit={onSubmit} noValidate>
      <div className="signup">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          aria-invalid={state === 'error'}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
        />
        {/* honeypot: hidden from people, catnip for bots */}
        <input
          ref={trapRef}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="signup__trap"
        />
        <button className="btn btn--accent btn--lg" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Notify me'}
        </button>
      </div>
      {state === 'error' && <p className="signup__err" role="alert">{msg}</p>}
    </form>
  )
}

const NAV = [
  { href: '#signals', label: 'Sensing' },
  { href: '#inside', label: 'Inside the ring' },
  { href: '#design', label: 'Design' },
  { href: '#spec', label: 'Hardware' },
  { href: '#status', label: 'Build status' },
]

const FINISHES = [
  { id: 'graphite', label: 'Graphite', sub: 'Polished PVD-style', img: ringGraphite, swatch: 'linear-gradient(140deg,#3a3d42,#0d0e10 70%)' },
  { id: 'gold', label: 'Champagne Gold', sub: 'Warm brushed finish', img: ringGold, swatch: 'linear-gradient(140deg,#e6cf9b,#8f7636 72%)' },
] as const

/* the ring, read inside-out */
const INSIDE = [
  {
    k: 'Optical',
    title: 'Heart rate & SpO₂',
    body: 'A MAX30102-class PPG sensor reads pulse and blood oxygen straight from the finger, one of the most vascularized, signal-rich sites on the body.',
  },
  {
    k: 'Electrodermal',
    title: 'Continuous stress (GSR)',
    body: 'Two dry gold-plated electrodes built into the flex PCB read galvanic skin response continuously. It is the same signal used in clinical stress research.',
  },
  {
    k: 'Connectivity',
    title: 'Bluetooth LE 5',
    body: 'A u-blox ANNA-B402 module with an antenna tuned to the ring’s form factor keeps the companion app in sync without draining the cell.',
  },
  {
    k: 'Charging',
    title: '2-pin pogo dock',
    body: 'Charges on a standard 2-pin dock, with circuit protection against sweat bridging the contacts. It is the approach used across the smart-ring industry.',
  },
]

/* three editorial pillars over the dark render */
const PILLARS = [
  {
    k: 'Battery',
    title: 'Weeks, not days',
    body: 'A wake-on-finger architecture keeps the ring asleep between checks and only spins up full sensing once a finger is on it, targeting roughly a month of standby from a 22 mAh cell.',
  },
  {
    k: 'Build',
    title: 'Sealed & waterproof',
    body: 'The internal flex assembly is fully potted in clear resin inside the housing. No seams, no gaps, and safe for hand-washing and showering.',
  },
  {
    k: 'Engineering',
    title: 'Solo, full-stack',
    body: 'Mechanical, electrical, and firmware designed in-house from first principles, not assembled from an off-the-shelf reference design.',
  },
]

const SPECS = [
  { k: 'Power management', sub: 'PMIC', v: <>One <b>BQ25120A</b> IC handles the 1.8 V rail for the MCU, a switched 3.3 V rail for sensors, plus battery charging, monitoring, and load-switching.</> },
  { k: 'Stress sensing', sub: 'GSR AFE', v: <>Custom transimpedance-amplifier circuit on a dual op-amp, tuned for the low-current, low-noise range of skin conductance.</> },
  { k: 'Optical sensor', sub: 'HR / SpO₂', v: <><b>MAX30102-class</b> sensor run in a custom low-power polling mode instead of its stock always-on mode, to stretch battery life.</> },
  { k: 'LED drive', sub: 'Boost', v: <>A boost converter (evaluating TI <b>TPS61240</b>) steps up to ~5 V for the green LED, which needs more headroom than the red / IR channels.</> },
  { k: 'Microcontroller', sub: 'MCU', v: <>Low-power, BLE-capable MCU. Final part still TBD, with leading candidates in the <b>nRF52-class</b> family.</> },
  { k: 'Mechanical', sub: 'Housing', v: <>Custom Fusion 360 housing with the flex PCB wrapped to the inner circumference. Cast-resin prototype shell; production material not yet finalized.</> },
  { k: 'Battery', sub: 'Cell', v: <><b>22 mAh</b> cell, sized to fit within the ring band.</> },
]

const LEDGER = [
  { s: 'done', label: 'Power architecture finalized (BQ25120A-based)', tag: 'Done' },
  { s: 'done', label: 'GSR analog front end designed and tuned', tag: 'Done' },
  { s: 'done', label: 'BLE module and antenna layout complete', tag: 'Done' },
  { s: 'done', label: 'Housing & flex-PCB wrap modeled in Fusion 360', tag: 'Done' },
  { s: 'done', label: 'Resin-potting and waterproofing process defined', tag: 'Done' },
  { s: 'wip', label: 'Boost converter for LED drive', tag: 'In progress' },
  { s: 'wip', label: 'Final PCB layout & prototype assembly', tag: 'In progress' },
  { s: 'todo', label: 'Firmware implementation of full sensing pipeline', tag: 'Planned' },
  { s: 'todo', label: 'Functional prototype testing', tag: 'Planned' },
  { s: 'todo', label: 'Small-batch hand-assembled production run', tag: 'Planned' },
  { s: 'todo', label: 'Beta testing / crowdfunding phase', tag: 'Planned' },
] as const

/* counted off the ledger above, so the tally can never drift from the list */
const TALLY = {
  done: LEDGER.filter((r) => r.s === 'done').length,
  wip: LEDGER.filter((r) => r.s === 'wip').length,
  todo: LEDGER.filter((r) => r.s === 'todo').length,
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [finish, setFinish] = useState<(typeof FINISHES)[number]['id']>('graphite')
  const active = FINISHES.find((f) => f.id === finish)!

  return (
    <>
      {/* ---------------- STATUS STRIP ---------------- */}
      <div className="strip">
        In functional prototyping · solo-built hardware · not yet for sale
      </div>

      {/* ---------------- NAV ---------------- */}
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="NERVA home">
            <span className="brand__mark" aria-hidden="true" />
            NERVA
          </a>
          <nav className="nav__links" aria-label="Primary">
            {NAV.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
          <div className="nav__right">
            <a className="btn btn--dark" href="#follow">Follow the build</a>
            <button
              className="nav__toggle"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
                {menuOpen ? (
                  <path d="M6 6l10 10M16 6L6 16" strokeLinecap="round" />
                ) : (
                  <><path d="M4 8h14" strokeLinecap="round" /><path d="M4 14h14" strokeLinecap="round" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {NAV.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a className="btn btn--dark btn--block" href="#follow" onClick={() => setMenuOpen(false)}>
            Follow the build
          </a>
        </div>
      </header>

      <main id="top">
        {/* ---------------- HERO ---------------- */}
        <section className="hero">
          <div className="hero__grid">
            <div className="hero__stage">
              <img
                key={active.id}
                className="hero__ring"
                src={active.img}
                width={1400}
                height={1270}
                alt={`The NERVA smart ring in ${active.label.toLowerCase()}, showing the internal flex PCB and its green and red optical sensor LEDs on the inner band.`}
              />
            </div>

            <div className="hero__copy">
              <span className="eyebrow">Smart ring · nervous-system sensing</span>
              <h1 className="hero__title">
                The ring that reads your nervous system.
              </h1>
              <p className="hero__lede">
                Most wearables measure your heart. NERVA also reads your nervous system:
                heart rate and blood oxygen paired with continuous skin-conductance sensing,
                for a live view of stress, recovery, and arousal. All from a single ring no
                bigger than a normal one.
              </p>

              <div className="finish">
                <div className="finish__label">
                  Finish. <span>{active.label}</span>
                </div>
                <div className="finish__swatches" role="radiogroup" aria-label="Ring finish">
                  {FINISHES.map((f) => (
                    <button
                      key={f.id}
                      role="radio"
                      aria-checked={finish === f.id}
                      aria-label={f.label}
                      className={`swatch ${finish === f.id ? 'is-active' : ''}`}
                      style={{ background: f.swatch }}
                      onClick={() => setFinish(f.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="hero__cta">
                <a className="btn btn--accent btn--lg" href="#follow">Follow the build</a>
                <a className="btn btn--ghost btn--lg" href="#inside">See what’s inside</a>
              </div>

              <dl className="hero__meta">
                <div><dt>Signals</dt><dd>HR · SpO₂ · EDA</dd></div>
                <div><dt>Standby target</dt><dd>~1 month</dd></div>
                <div><dt>Stage</dt><dd>Prototype</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* ---------------- EDA STRIP ---------------- */}
        <div className="wavebar" aria-hidden="true">
          <div className="wavebar__inner">
            <span className="wavebar__label">EDA · skin conductance</span>
            <EdaWave />
            <span className="wavebar__val">live µS</span>
          </div>
        </div>

        {/* ---------------- CINEMATIC SENSOR FILM ---------------- */}
        <FilmScroll />

        {/* ---------------- TWO SIGNALS ---------------- */}
        <section className="section" id="signals">
          <div className="wrap">
            <Reveal className="lead">
              <h2 className="display">
                Your heart tells half the story.
                <br className="br-lg" /> Your skin tells the rest.
              </h2>
            </Reveal>

            <Reveal>
              <SignalInstrument />
            </Reveal>

            <div className="sig-notes">
              <Reveal className="sig-note sig-note--hr">
                <h3>The heart</h3>
                <p>
                  Optical PPG reads pulse and blood oxygen from the finger, a dense, well-perfused
                  site that gives clean signal. It is what most rings already measure, and NERVA
                  measures it too.
                </p>
              </Reveal>
              <Reveal className="sig-note sig-note--eda" delay={80}>
                <h3>The nerves</h3>
                <p>
                  Two dry gold electrodes read skin conductance straight off the inner band, the
                  sympathetic arousal signal clinical stress research relies on. This is the read
                  most rings leave on the table, and where <b>NERVA</b> earns its name.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- INSIDE OUT (dark) ---------------- */}
        <section className="inside" id="inside">
          <div className="wrap">
            <Reveal className="inside__head">
              <h2 className="display display--light">Inside the band</h2>
            </Reveal>
            <div className="inside__grid">
              <Reveal className="inside__stage">
                <img
                  className="inside__ring"
                  src={ringChrome}
                  width={1100}
                  height={1100}
                  loading="lazy"
                  alt="Close view inside the NERVA ring band, exposing the flex PCB, gold electrodes, and the green and red optical sensor LEDs."
                />
              </Reveal>
              <div className="inside__list">
                {INSIDE.map((item, i) => (
                  <Reveal key={item.title} className="feat" delay={i * 60}>
                    <span className="feat__k">{item.k}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- PILLARS (dark, continues) ---------------- */}
        <section className="pillars">
          <div className="wrap">
            <div className="pillars__grid">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} className="pillar" delay={i * 60}>
                  <span className="pillar__k">{p.k}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- BLUEPRINT ---------------- */}
        <section className="section section--tint blueprint" id="design">
          <div className="wrap">
            <Reveal className="lead lead--split">
              <h2 className="display">Designed down to the last line.</h2>
              <p className="lead__sub">
                The housing, the flex-PCB wrap, the sensor placement: every millimeter modeled
                from first principles in Fusion 360, down to how the flex folds around the
                inner wall.
              </p>
            </Reveal>

            <Reveal className="bp">
              <div className="bp__frame">
                <img
                  src={blueprint}
                  width={2600}
                  height={1838}
                  loading="lazy"
                  alt="Engineering drawing of the NERVA ring housing and internal flex PCB, shown from three isometric views plus a face-on section, with title block."
                />
              </div>
              <div className="bp__meta">
                <span>NERVA Ring · housing + flex-PCB assembly</span>
                <span className="bp__rev">Sketch · Rev 5 · Sheet 1/1</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- DATASHEET ---------------- */}
        <section className="section" id="spec">
          <div className="wrap">
            <Reveal className="lead lead--tight">
              <h2 className="display">A ring-sized system, spec by spec.</h2>
            </Reveal>

            <Reveal>
              <div className="datasheet">
                <div className="datasheet__bar">
                  <span>NERVA · rev. prototype</span>
                  <span className="ds-mono">flex-PCB / resin-potted</span>
                </div>
                {SPECS.map((s) => (
                  <div className="drow" key={s.k}>
                    <div className="drow__k">
                      {s.k}
                      <small>{s.sub}</small>
                    </div>
                    <div className="drow__v">{s.v}</div>
                  </div>
                ))}
              </div>
              <p className="datasheet__foot">
                Part choices reflect where the design stands today. Anything still marked TBD is
                open, and this table will drift as the boards come back.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- BUILD STATUS ---------------- */}
        <section className="section section--tint" id="status">
          <div className="wrap">
            <Reveal className="lead">
              <h2 className="display">An honest build log, not a launch page.</h2>
              <p className="lead__sub">
                NERVA is an early-stage, solo-built hardware project in functional prototyping.
                Here is exactly what is done and what isn’t.
              </p>
              <div className="tally">
                <div className="tally__bar" aria-hidden="true">
                  {LEDGER.map((row) => (
                    <span key={row.label} className={`tally__seg tally__seg--${row.s}`} />
                  ))}
                </div>
                <p className="tally__read">
                  {TALLY.done} done · {TALLY.wip} in progress · {TALLY.todo} still ahead
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="ledger">
                {LEDGER.map((row) => (
                  <div className={`lrow lrow--${row.s}`} key={row.label}>
                    <span className="lrow__mark" aria-hidden="true" />
                    <span className="lrow__label">{row.label}</span>
                    <span className="lrow__tag">{row.tag}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="cta" id="follow">
          <div className="wrap cta__inner">
            <Reveal>
              <h2 className="display display--light">
                Follow it from schematic to first working prototype.
              </h2>
              <p className="cta__lede">
                No countdown, no pre-order. Just an occasional note when a milestone lands:
                first firmware, first clean EDA trace, first hand-assembled batch.
              </p>
              <Signup />
              <p className="cta__fine">One builder · occasional updates · no spam, ever.</p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER (drawing title block) ---------------- */}
      <footer className="colophon">
        <div className="wrap">
          <div className="colophon__head">
            <a className="brand" href="#top">
              <span className="brand__mark" aria-hidden="true" />
              NERVA
            </a>
            <p className="colophon__line">
              One person, one soldering iron, and a nervous system worth measuring.
            </p>
          </div>

          <div className="titleblock">
            <div className="tb tb--w4">
              <span className="tb__k">Drawing</span>
              <b className="tb__v">NERVA Ring · housing + flex-PCB assembly</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Stage</span>
              <b className="tb__v">Functional prototyping</b>
            </div>
            <div className="tb tb--w3">
              <span className="tb__k">Built by</span>
              <b className="tb__v">Ryan Schreiber, solo</b>
            </div>
            <div className="tb tb--w3">
              <span className="tb__k">Contact</span>
              <b className="tb__v">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </b>
            </div>
            <div className="tb tb--w6">
              <span className="tb__k">On this sheet</span>
              <nav className="tb__index" aria-label="Footer">
                {NAV.map((l) => (
                  <a key={l.href} href={l.href}>{l.label}</a>
                ))}
                <a href="#follow">Updates</a>
              </nav>
            </div>
          </div>

          <p className="colophon__fine">
            Renders and drawings on this page come from the working Fusion model. Nothing here is
            for sale, and the specs move as the design does. © 2026 NERVA.
          </p>
        </div>
      </footer>

      {/* ---------------- STICKY BAR ---------------- */}
      <div className="dockbar">
        <div className="dockbar__inner">
          <div className="dockbar__meta">
            <span className="dockbar__mark" aria-hidden="true" />
            <b>NERVA</b>
            <span className="dockbar__desc">nervous-system sensing ring</span>
            <span className="dockbar__stage">Prototype</span>
          </div>
          <a className="btn btn--accent" href="#follow">Follow the build</a>
        </div>
      </div>
    </>
  )
}

export default App
