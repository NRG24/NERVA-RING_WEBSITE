import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import ringBlue from './assets/ring-blue.jpg'
import ringCoffee from './assets/ring-coffee.jpg'
import ringPink from './assets/ring-pink.jpg'
import ringCeramicBlack from './assets/ring-ceramic-black.jpg'
import ringMacro from './assets/ring-macro.jpg'
import blueprint from './assets/blueprint.jpg'

/* ---------- scroll reveal ---------- */
function Reveal({ children, className = '', delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }),
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

/* ---------- EDA / skin-conductance waveform (hero bezel) ---------- */
const WAVE_D =
  'M0 30 L60 30 L90 29 L120 31 ' +
  'C150 31 160 12 185 12 C210 12 214 30 245 30 ' +
  'L320 30 L360 28 ' +
  'C395 28 402 18 425 18 C450 18 452 30 490 30 ' +
  'L560 30 L600 31 ' +
  'C640 31 648 8 675 8 C702 8 706 30 745 30 ' +
  'L820 30 L870 29 L920 30 L1000 30'

function EdaWave() {
  return (
    <svg className="hero__wave" viewBox="0 0 1000 46" preserveAspectRatio="none" aria-hidden="true">
      <path className="wave-path" d={WAVE_D} />
      <path className="wave-path wave-dash" d={WAVE_D} />
    </svg>
  )
}

/* ---------- chart-recorder strip ----------
   Both traces are generated rather than drawn by hand, because the thing
   that makes a real recording look real is that it never repeats. Seeded,
   so every render is the same sheet. */
const SPAN = 1000        // svg user units across the strip
const WINDOW_S = 14      // seconds of record the strip holds

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* PPG pulse. The beat-to-beat interval moves a few percent either way,
   which is not decoration: that variation IS the HRV the ring reports. */
function pulsePath(mid = 60) {
  const r = rng(7)
  const beat = (SPAN / WINDOW_S) * (60 / 72)   // 72 bpm at this paper speed
  let d = `M0 ${mid}`
  let x = 0
  while (x < SPAN) {
    const rr = beat * (0.88 + r() * 0.24)
    const a = 0.86 + r() * 0.28                // and no two beats are the same height
    const foot = x + rr * 0.24
    const peak = x + rr * 0.36
    const dip = x + rr * 0.53
    const notch = x + rr * 0.69
    const end = x + rr
    const yUp = mid - 40 * a
    const yDip = mid + 13 * a
    const yNotch = mid - 11 * a
    const f = (n: number) => n.toFixed(1)
    d +=
      ` L${f(foot)} ${mid}` +
      ` C${f(foot + rr * 0.04)} ${mid} ${f(peak - rr * 0.04)} ${f(yUp)} ${f(peak)} ${f(yUp)}` +
      ` C${f(peak + rr * 0.05)} ${f(yUp)} ${f(dip - rr * 0.05)} ${f(yDip)} ${f(dip)} ${f(yDip)}` +
      ` C${f(dip + rr * 0.05)} ${f(yDip)} ${f(notch - rr * 0.05)} ${f(yNotch)} ${f(notch)} ${f(yNotch)}` +
      ` C${f(notch + rr * 0.06)} ${f(yNotch)} ${f(end - rr * 0.1)} ${mid} ${f(end)} ${mid}`
    x = end
  }
  return d
}

/* Skin conductance: a slow tonic climb with phasic responses on top. Each
   response rises fast and decays slowly, which is the asymmetry that makes
   an EDA trace look like EDA and not like a sine wave. */
function edaTrace(rest = 110) {
  const r = rng(23)
  const bursts: { at: number; amp: number }[] = []
  let x = 70
  while (x < SPAN - 130) {
    bursts.push({ at: x, amp: 22 + r() * 42 })
    x += 115 + r() * 175
  }
  const pts: string[] = []
  for (let px = 0; px <= SPAN; px += 4) {
    let y = rest - 5 * Math.sin(px / 240) - px * 0.013   // tonic drift
    for (const b of bursts) {
      const t = px - b.at
      if (t < 0) continue
      y -= b.amp * (1 - Math.exp(-t / 13)) * Math.exp(-t / 72) * 1.72
    }
    pts.push(`${px} ${Math.max(16, y).toFixed(1)}`)
  }
  const biggest = bursts.reduce((m, b) => (b.amp > m.amp ? b : m), bursts[0])
  return {
    d: 'M' + pts.join(' L'),
    markPct: ((biggest.at + 26) / SPAN) * 100,
  }
}

const PULSE_D = pulsePath()
const EDA = edaTrace()

/* a tick per second, labelled every fifth */
const TICKS = Array.from({ length: WINDOW_S + 1 }, (_, s) => ({
  s,
  pct: (s / WINDOW_S) * 100,
  major: s % 5 === 0,
}))

function HeartIcon() {
  return (
    <svg className="sig-note__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.2C12 20.2 3.8 15.1 3.8 9.1C3.8 6.1 6.1 3.8 9 3.8C10.5 3.8 11.7 4.5 12 5.4C12.3 4.5 13.5 3.8 15 3.8C17.9 3.8 20.2 6.1 20.2 9.1C20.2 15.1 12 20.2 12 20.2Z" />
    </svg>
  )
}
function NerveIcon() {
  return (
    <svg className="sig-note__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12h4l2.5 7L13 4l2.5 8H22" />
    </svg>
  )
}

function SignalInstrument() {
  return (
    <figure
      className="strip-chart"
      role="img"
      aria-label="A paper chart recording of two channels. The upper channel is a pulse trace at about 72 beats per minute, with the interval between beats varying slightly. The lower channel is skin conductance around 4.6 microsiemens, drifting slowly upward with several sharp rises that decay away, the largest of them marked as a spontaneous skin-conductance response."
    >
      <div className="strip-chart__sheet">
        <div className="strip-chart__margin" aria-hidden="true" />

        <div className="strip-chart__body">
          <div className="strip-chart__head">
            <span>Continuous strip · pulse + skin conductance</span>
            <span className="strip-chart__speed">25 mm/s</span>
          </div>

          <div className="lane lane--pulse">
            <div className="lane__key">
              <span className="lane__name">Pulse</span>
              <span className="lane__meta">PPG · 530 + 660 nm</span>
              <div className="lane__val">72<small>bpm</small></div>
            </div>
            <div className="lane__field">
              <svg className="lane__trace" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
                <path className="chart-rest" d="M0 60 L1000 60" />
                <path className="chart-ink chart-ink--pulse" pathLength={1} d={PULSE_D} />
              </svg>
            </div>
          </div>

          <div className="lane lane--eda">
            <div className="lane__key">
              <span className="lane__name">Electrodermal activity</span>
              <span className="lane__meta">GSR · 2 gold electrodes</span>
              <div className="lane__val">4.6<small>µS</small></div>
            </div>
            <div className="lane__field">
              <span className="lane__mark" style={{ left: `${EDA.markPct}%` }}>
                spontaneous SCR
              </span>
              <svg className="lane__trace" viewBox="0 0 1000 130" preserveAspectRatio="none" aria-hidden="true">
                <path className="chart-rest" d="M0 110 L1000 110" />
                <path className="chart-ink chart-ink--eda" pathLength={1} d={EDA.d} />
              </svg>
            </div>
          </div>

          <div className="strip-chart__foot" aria-hidden="true">
            <div />
            <div className="strip-chart__time">
              {TICKS.map((t) => (
                <span
                  key={t.s}
                  className={`tick ${t.major ? 'tick--major' : ''}`}
                  style={{ left: `${t.pct}%` }}
                >
                  {t.major && <i>{t.s}s</i>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}

/* ---------- HERO ----------
   The film plays once, fades to black, holds, then fades up into the
   black-glass still. No loop: the reveal happens once and then the page
   settles onto a product shot. Video and still share identical framing
   (object-fit + object-position + scale) so the cross-fade does not jump. */
const HERO_FILM = '/ring_void_0001-0400.mp4'
const HERO_STILL = '/ring_03_black_glass_web.png'
const BLACK_HOLD_MS = 1700

function Hero() {
  const [faded, setFaded] = useState(false)
  const [stillShown, setStillShown] = useState(false)

  useEffect(() => {
    if (!faded) return
    const t = window.setTimeout(() => setStillShown(true), BLACK_HOLD_MS)
    return () => window.clearTimeout(t)
  }, [faded])

  return (
    <section className="hero">
      <video
        className="hero__film"
        src={HERO_FILM}
        poster={HERO_STILL}
        onEnded={() => setFaded(true)}
        autoPlay
        muted
        playsInline
        preload="auto"
        // @ts-expect-error -- fetchPriority landed in the DOM types after this React version
        fetchPriority="high"
      />
      <img
        className="hero__still"
        src={HERO_STILL}
        alt="The NERVA Ring in black glass finish, showing the internal flex PCB and its green and red optical sensor LEDs."
        style={{ opacity: stillShown ? 1 : 0 }}
      />
      <div
        className="hero__blackout"
        aria-hidden="true"
        style={{ opacity: faded && !stillShown ? 1 : 0 }}
      />
      <div className="hero__grade" aria-hidden="true" />

      <div className="hero__copy">
        <h1 className="hero__title">The ring that reads your nervous system.</h1>
        <p className="hero__lede">
          Reads your nervous system with EDA, helping you understand and manage stress in real time.
        </p>
        <div className="hero__cta">
          <a className="btn btn--led btn--lg" href="#follow">Get launch updates</a>
          <a className="btn btn--onfilm btn--lg" href="#inside">See what’s inside</a>
        </div>
      </div>

      <div className="hero__bezel">
        <EdaWave />
      </div>
    </section>
  )
}

/* ---------- scroll-scrubbed cinematic sensor film ---------- */
const FILM_SRC = '/nerva-sensors.mp4'

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

    /* --- Reduced motion: poster only. Never fetch the film. --- */
    if (reduce) return

    /* --- Touch: plain streaming playback. Sequential play needs no seeking,
           so it works off the network URL and never pulls the whole file. --- */
    if (!canScrub) {
      video.src = FILM_SRC
      video.loop = true
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) video.play().catch(() => {})
          else video.pause()
        }),
        { threshold: 0.25 },
      )
      io.observe(video)
      return () => io.disconnect()
    }

    /* --- Desktop: scrub currentTime to scroll position --- */
    video.loop = false
    let lastP = -1
    let objectUrl = ''

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

    /* Scrubbing means seeking, and seeking needs the server to answer byte-range
       requests. Cloudflare Pages serves this file with a flat 200 and the whole
       body no matter what Range we ask for, so the browser reports seekable = 0
       and currentTime silently refuses to move. Pulling the file down once and
       handing the element a local blob: URL sidesteps the server entirely.

       Held until the page has loaded and the film is near the viewport, so the
       fetch never competes with the hero. */
    const warm = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return
        warm.disconnect()
        fetch(FILM_SRC)
          .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
          .then((blob) => {
            objectUrl = URL.createObjectURL(blob)
            video.src = objectUrl
            video.addEventListener('loadedmetadata', update, { once: true })
          })
          .catch(() => {
            video.src = FILM_SRC
            video.loop = true
            video.play().catch(() => {})
          })
      }),
      { rootMargin: '120% 0px' },
    )
    const startWarm = () => warm.observe(section)
    if (document.readyState === 'complete') startWarm()
    else window.addEventListener('load', startWarm, { once: true })

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('load', startWarm)
      warm.disconnect()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  return (
    <section ref={sectionRef as never} className={`film ${scrub ? 'film--scrub' : ''}`} aria-label="NERVA Ring sensor architecture film">
      <div className="film__sticky">
        <video
          ref={videoRef}
          className="film__video"
          poster="/nerva-sensors-poster.jpg"
          muted
          playsInline
          preload="none"
        />
        <div className="film__grade" aria-hidden="true" />
        <div className="film__ui">
          <span className="mono-label mono-label--film">SENSOR ARCHITECTURE · RENDERED FROM THE WORKING MODEL</span>
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
   Set VITE_BUTTONDOWN_USERNAME to the Buttondown account name.

   This posts as a NATIVE form, deliberately, not with fetch(). A subscriber
   sometimes has to follow the response to clear a CAPTCHA or fix a validation
   error; an XHR swallows that response, so those people would look subscribed
   here and never land on the list. */
const BUTTONDOWN_USER = import.meta.env.VITE_BUTTONDOWN_USERNAME as string | undefined
const SIGNUP_ACTION = BUTTONDOWN_USER
  ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USER}`
  : undefined
const CONTACT_EMAIL = 'hello@nervaring.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Signup() {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const trapRef = useRef<HTMLInputElement>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (trapRef.current?.value) { e.preventDefault(); return } // bot fell in the honeypot

    if (!EMAIL_RE.test(email.trim())) {
      e.preventDefault()
      setErr('That email address doesn’t look right.')
      return
    }

    if (!SIGNUP_ACTION) {
      e.preventDefault()
      setErr(`Signup isn’t connected yet. Email ${CONTACT_EMAIL} and I’ll add you by hand.`)
      return
    }
  }

  return (
    <form className="signup-wrap" action={SIGNUP_ACTION} method="post" onSubmit={onSubmit} noValidate>
      <div className="signup">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          aria-invalid={err ? true : undefined}
          onChange={(e) => { setEmail(e.target.value); if (err) setErr('') }}
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
        <input type="hidden" name="tag" value="nervaring.com" />
        <button className="btn btn--led btn--lg" type="submit">Notify me</button>
      </div>
      {err && <p className="signup__err" role="alert">{err}</p>}
    </form>
  )
}

const NAV = [
  { href: '#stress', label: 'Stress' },
  { href: '#signals', label: 'Signals' },
  { href: '#inside', label: 'Inside' },
  { href: '#finish', label: 'Finishes' },
]

const FINISHES = [
  { id: 'ceramic-black', label: 'Black Ceramic', sub: 'PREMIUM CERAMIC', img: ringCeramicBlack, swatch: 'linear-gradient(140deg,#3a3a3c,#050506 72%)' },
  { id: 'blue', label: 'Blue', sub: 'PREMIUM CERAMIC', img: ringBlue, swatch: 'linear-gradient(140deg,#3d5f8a,#0a0e14 72%)' },
  { id: 'coffee', label: 'Coffee', sub: 'PREMIUM CERAMIC', img: ringCoffee, swatch: 'linear-gradient(140deg,#6b4a30,#160f0a 72%)' },
  { id: 'pink', label: 'Pink', sub: 'PREMIUM CERAMIC', img: ringPink, swatch: 'linear-gradient(140deg,#f4c9d6,#d98fa6 72%)' },
] as const

/* the sensing stack, read as a numbered index rather than a feature grid */
const SPECS = [
  {
    n: '01',
    title: 'Optical sensing',
    part: 'MAXM86161',
    channel: 'pulse',
    body: 'Pulse and SpO₂ read straight from the finger, run in a custom low-power polling mode rather than stock continuous mode to stretch the battery dramatically further.',
  },
  {
    n: '02',
    title: 'Electrodermal front end',
    part: '2× Au ELECTRODES',
    channel: 'gold',
    body: 'A custom transimpedance-amplifier circuit tuned for the low-current, low-noise range of skin conductance, read through two dry gold-plated electrodes built into the flex PCB.',
  },
  {
    n: '03',
    title: 'Radio',
    part: 'ANNA-B402 · BLE 5',
    channel: 'sensor',
    body: 'A u-blox module with an antenna layout tuned to the ring’s compact form factor keeps the companion app in sync without draining the cell.',
  },
  {
    n: '04',
    title: 'Power',
    part: 'BQ25120A · 22 mAh',
    channel: 'sensor',
    body: 'One PMIC handles charging, monitoring, and both voltage rails. A wake-on-finger architecture sleeps between readings, targeting roughly a month of standby.',
  },
  {
    n: '05',
    title: 'Sealed build',
    part: 'RESIN-POTTED',
    channel: 'neutral',
    body: 'The flex PCB wraps the inner circumference and is fully potted in clear resin. No seams, no gaps, so it stays safe for hand-washing and showering. Charges on a 2-pin pogo dock.',
  },
] as const

const LEDGER = [
  { s: 'done', label: 'Power architecture finalized (BQ25120A-based)' },
  { s: 'done', label: 'GSR analog front end designed and tuned' },
  { s: 'done', label: 'BLE module and antenna layout complete' },
  { s: 'done', label: 'Housing & flex-PCB wrap modeled in Fusion 360' },
  { s: 'done', label: 'Resin-potting and waterproofing process defined' },
  { s: 'wip', label: 'Boost converter for LED drive' },
  { s: 'wip', label: 'Final PCB layout & prototype assembly' },
  { s: 'todo', label: 'Firmware implementation of full sensing pipeline' },
  { s: 'todo', label: 'Functional prototype testing' },
  { s: 'todo', label: 'Small-batch hand-assembled production run' },
  { s: 'todo', label: 'Beta testing / crowdfunding phase' },
] as const

/* counted off the ledger, so the tally can never drift from the list */
const TALLY = {
  done: LEDGER.filter((r) => r.s === 'done').length,
  wip: LEDGER.filter((r) => r.s === 'wip').length,
  todo: LEDGER.filter((r) => r.s === 'todo').length,
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [finish, setFinish] = useState<(typeof FINISHES)[number]['id']>('ceramic-black')
  const active = FINISHES.find((f) => f.id === finish)!

  return (
    <>
      {/* ---------------- NAV ---------------- */}
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
            <span className="brand__tag">PROTO</span>
          </a>
          <nav className="nav__links" aria-label="Primary">
            {NAV.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
          <div className="nav__right">
            <a className="btn btn--accent" href="#follow">Get updates</a>
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
          <a className="btn btn--accent btn--block" href="#follow" onClick={() => setMenuOpen(false)}>
            Get updates
          </a>
        </div>
      </header>

      <main id="top">
        <Hero />

        {/* ---------------- WHERE YOUR STRESS NUMBER COMES FROM ----------------
            Not a feature grid. The difference is a mechanism, so the section
            draws the mechanism: how far each ring has to travel from a nerve
            to the number it puts on your screen. */}
        <section className="section section--tint" id="stress">
          <div className="wrap">
            <Reveal className="lead lead--split">
              <h2 className="display">What makes NERVA Ring Different</h2>
              <p className="lead__sub">
               Most smart rings only track your heart, but NERVA Ring goes further 
                with continuous electrodermal activity (EDA) sensing,
                a direct window into how your nervous system responds to the world around you. 
                By learning your unique stress patterns over time, NERVA helps you recognize stress as it happens, 
                understand what triggers it, and take control of your response.

              </p>
            </Reveal>

            <div className="paths">
              <Reveal className="path path--inferred">
                <span className="path__idx">A</span>
                <div>
                  <h3 className="path__h">Inferred from the heart</h3>
                  <ol className="path__steps">
                    <li>Heart rate</li>
                    <li>Beat-to-beat variation</li>
                    <li>A model</li>
                    <li className="path__out">a stress score</li>
                  </ol>
                </div>
                <p className="path__note">
                  Beat-to-beat variation (HRV) shifts with sleep, caffeine, alcohol, a cold
                  coming on, and how hard you trained on Tuesday. The model has to decide
                  for you how much of today’s change was stress.
                </p>
              </Reveal>

              <Reveal className="path path--measured" delay={90}>
                <span className="path__idx">B</span>
                <div>
                  <h3 className="path__h">Measured at the skin</h3>
                  <ol className="path__steps">
                    <li>Sympathetic nerve</li>
                    <li>Sweat glands</li>
                    <li>Skin conductance</li>
                    <li className="path__out">4.6 µS</li>
                  </ol>
                </div>
                <p className="path__note">
                  Your sympathetic nerves drive your sweat glands directly. Hearing something as small as a pin drop can spike your EDA.
                  Two dry electrodes read it in microsiemens, capturing highly detailed short-term stress data. 
                </p>
              </Reveal>
            </div>

            <Reveal className="caveat">
              <p>
                <b>The hard part.</b> Skin conductance drifts with temperature, moves when
                you move, and a finger is a small place for two electrodes. That difficulty
                is most of why the signal is missing from other rings, and most of what
                NERVA’s firmware is built to solve.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- TWO SIGNALS ---------------- */}
        <section className="section" id="signals">
          <div className="wrap">
            <Reveal className="lead lead--wide">
              <h2 className="display">
                Your electrodermal activity is a hidden window into your nervous system.
              </h2>
            </Reveal>

            <Reveal>
              <SignalInstrument />
            </Reveal>

            <div className="sig-notes">
              <Reveal className="sig-note sig-note--hr">
                <h3><HeartIcon />The heart</h3>
                <p>
                  Optical PPG reads pulse and blood oxygen from the finger, a dense,
                  well-perfused site that gives clean signal. It is what most rings already
                  measure, and NERVA measures it too.
                </p>
              </Reveal>
              <Reveal className="sig-note sig-note--eda" delay={80}>
                <h3><NerveIcon />The nerves</h3>
                <p>
                  Two dry gold electrodes read skin conductance straight off the inner
                  band, the sympathetic arousal signal clinical stress research relies on.
                  This is the read most rings leave on the table, and where <b>NERVA</b>
                  {' '}earns its name.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- CINEMATIC SENSOR FILM ---------------- */}
        <FilmScroll />

        {/* ---------------- INSIDE THE BAND (dark) ---------------- */}
        <section className="inside" id="inside">
          <div className="wrap inside__grid">
            <Reveal className="inside__aside">
              <h2 className="display display--light">Inside the band</h2>
              <p className="inside__lede">
                A full sensing stack, wrapped to the inner circumference of a ring and
                potted in clear resin. Sealed, waterproof, no seams.
              </p>
              <div className="inside__stage">
                <img
                  className="inside__ring"
                  src={ringMacro}
                  width={2000}
                  height={2000}
                  loading="lazy"
                  alt="Macro view inside the NERVA Ring band, showing the flex PCB, gold electrodes, and the green and red optical sensor LEDs."
                />
              </div>
            </Reveal>

            <div className="inside__list">
              {SPECS.map((s, i) => (
                <Reveal key={s.n} className="spec" delay={i * 50}>
                  <span className="spec__n">{s.n}</span>
                  <div>
                    <div className="spec__head">
                      <h3>{s.title}</h3>
                      <span className={`spec__part spec__part--${s.channel}`}>{s.part}</span>
                    </div>
                    <p>{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FINISHES ---------------- */}
        <section className="section section--tint" id="finish">
          <div className="wrap">
            <Reveal className="finish__head">
              <div>
                <h2 className="display">Four finishes.</h2>
                <p className="finish__lede">
                  Every color is the same premium ceramic shell, not a coating, so it
                  stays smooth against skin and keeps its color for years, not months.
                </p>
              </div>
              <div className="finish__pills" role="radiogroup" aria-label="Ring finish">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    role="radio"
                    aria-checked={finish === f.id}
                    className={`pill ${finish === f.id ? 'is-active' : ''}`}
                    onClick={() => setFinish(f.id)}
                  >
                    <i className="pill__swatch" style={{ background: f.swatch }} />
                    {f.label}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal className="finish__stage">
              <img
                key={active.id}
                className="finish__ring"
                src={active.img}
                width={1400}
                height={1270}
                alt={`The NERVA Ring in ${active.label.toLowerCase()}, showing the internal flex PCB and its green and red optical sensor LEDs.`}
              />
              <div className="finish__caption">
                <span className="finish__name">{active.label}</span>
                <span className="mono-label mono-label--dark">{active.sub}</span>
              </div>
            </Reveal>

            <Reveal className="statusline">
              <div className="tally__bar" aria-hidden="true">
                {LEDGER.map((row) => (
                  <span key={row.label} className={`tally__seg tally__seg--${row.s}`} />
                ))}
              </div>
              <p className="statusline__read">
                Build status: <b className="is-done">{TALLY.done} done</b> ·{' '}
                <b className="is-wip">{TALLY.wip} in progress</b> · {TALLY.todo} ahead.
                Every milestone lands in the update notes.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="cta" id="follow">
          <div className="wrap cta__grid">
            <Reveal>
              <h2 className="display display--light">
                See it go from a schematic to a working prototype.
              </h2>
              <p className="cta__lede">
                We'll email you about new prototypes and project updates.
              </p>
              <Signup />
              <p className="cta__fine">Written by the person building it · no spam</p>
            </Reveal>

            <Reveal className="cta__sheet" delay={90}>
              <img
                src={blueprint}
                width={2600}
                height={1838}
                loading="lazy"
                alt="Engineering drawing of the NERVA Ring housing and internal flex PCB, shown from three isometric views plus a face-on section, with title block."
              />
              <div className="cta__sheetMeta">
                <span>HOUSING + FLEX-PCB ASSEMBLY</span>
                <span>REV 5 · SHEET 1/1</span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER (drawing title block) ---------------- */}
      <footer className="colophon">
        <div className="wrap">
          <div className="titleblock">
            <div className="tb tb--w3">
              <span className="tb__k">Product</span>
              <b className="tb__v">NERVA Ring · nervous-system sensing</b>
            </div>
            <div className="tb tb--w1">
              <span className="tb__k">Stage</span>
              <b className="tb__v">Prototype</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Contact</span>
              <b className="tb__v"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></b>
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
          <p className="colophon__fine">© 2026 NERVA Ring · built by Ryan Schreiber · sheet 1 of 1</p>
        </div>
      </footer>
    </>
  )
}

export default App
