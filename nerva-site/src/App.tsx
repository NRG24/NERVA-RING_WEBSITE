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

/* ---------- chart-recorder strip ----------
   Both traces are generated rather than drawn by hand, because the thing
   that makes a real recording look real is that it never repeats. A tiled
   waveform is the giveaway. Seeded so every render is the same sheet. */
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
  /* stop early enough that the last response still has room to peak and
     start decaying before the paper is cut */
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
    /* the note hangs over the peak of the largest response, which lands a
       little after its onset, so its position comes out of the data */
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
       handing the element a local blob: URL sidesteps the server entirely, since
       seeking an in-memory copy needs no ranges. Vite's dev server does answer
       206, which is why this only ever broke in production.

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
            /* Network fetch failed. Stream it instead: the scrub will not track,
               but the film still plays rather than sitting on the poster. */
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
    <section ref={sectionRef as any} className={`film ${scrub ? 'film--scrub' : ''}`} aria-label="NERVA Ring sensor architecture film">
      <div className="film__sticky">
        {/* src is set from the effect, not here: the desktop path swaps in a
            blob: URL and the poster carries the section until it arrives. */}
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
   Set VITE_BUTTONDOWN_USERNAME to the Buttondown account name (see .env.example).

   This posts as a NATIVE form, deliberately, not with fetch(). Buttondown's docs
   are explicit about it: a subscriber sometimes has to follow the response to
   clear a CAPTCHA or fix a validation error. An XHR swallows that response, so
   those people would look subscribed here and never land on the list. Letting
   the browser navigate hands them the page they need.

   The tradeoff is that a successful signup ends on Buttondown's confirmation
   page rather than this one. Buttondown settings can point that back at
   nervaring.com once there is a thank-you page to send them to.

   With no username set the form refuses to submit and says so, rather than
   posting into the void. */
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

  /* Runs before the browser submits. Anything that returns early with
     preventDefault keeps us on the page; otherwise the POST goes through. */
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
    <form
      className="signup-wrap"
      action={SIGNUP_ACTION}
      method="post"
      onSubmit={onSubmit}
      noValidate
    >
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
        <button className="btn btn--accent btn--lg" type="submit">Notify me</button>
      </div>
      {err && <p className="signup__err" role="alert">{err}</p>}
    </form>
  )
}

const NAV = [
  { href: '#signals', label: 'Sensing' },
  { href: '#inside', label: 'Inside the ring' },
  { href: '#design', label: 'Design' },
  { href: '#status', label: 'Build status' },
]

const FINISHES = [
  { id: 'graphite', label: 'Graphite', sub: 'Polished PVD-style', img: ringGraphite, swatch: 'linear-gradient(140deg,#3a3d42,#0d0e10 70%)' },
  { id: 'gold', label: 'Champagne Gold', sub: 'Warm brushed finish', img: ringGold, swatch: 'linear-gradient(140deg,#e6cf9b,#8f7636 72%)' },
] as const

/* the ring, read inside-out */
const INSIDE = [
  {
    title: 'Heart rate & SpO₂',
    body: 'A MAXM86161-class PPG sensor reads pulse and blood oxygen straight from the finger, one of the most vascularized, signal-rich sites on the body.',
  },
  {
    title: 'Continuous stress (GSR)',
    body: 'Two dry gold-plated electrodes built into the flex PCB read galvanic skin response continuously. It is the same signal used in clinical stress research.',
  },
  {
    title: 'Bluetooth LE 5',
    body: 'A u-blox ANNA-B402 module with an antenna tuned to the ring’s form factor keeps the companion app in sync without draining the cell.',
  },
  {
    title: '2-pin pogo dock',
    body: 'Charges on a standard 2-pin dock, with circuit protection against sweat bridging the contacts. It is the approach used across the smart-ring industry.',
  },
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
        <b>Functional prototype</b> · built solo · not for sale yet
      </div>

      {/* ---------------- NAV ---------------- */}
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={24} height={24} />
            NERVA Ring
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
                alt={`The NERVA Ring in ${active.label.toLowerCase()}, showing the internal flex PCB and its green and red optical sensor LEDs on the inner band.`}
              />
            </div>

            <div className="hero__copy">
              <h1 className="hero__title">
                The ring that reads your nervous system.
              </h1>
              <p className="hero__lede">
                Most wearables measure your heart. NERVA Ring also reads your nervous system, 
                pairing heart rate and blood oxygen with continuous electrodermal sensing. 
                Designed for everyone, not just athletes, NERVA Ring tracks stress short- and long-term, helping you actually manage it.
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
                <div>
                  <dt>Signals</dt>
                  <dd><span className="sig-hr">HR</span> · SpO₂ · <span className="sig-eda">EDA</span> · HRV</dd>
                </div>
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
              <h2 className="display">Your electrodermal activity is a hidden window into your nervous system.</h2>
            </Reveal>

            <Reveal>
              <SignalInstrument />
            </Reveal>

            <div className="sig-notes">
              <Reveal className="sig-note sig-note--hr">
                <h3><HeartIcon />The heart</h3>
                <p>
                  Optical PPG reads pulse and blood oxygen from the finger, a dense, well-perfused
                  site that gives clean signal. It is what most rings already measure, and
                  NERVA Ring measures it too.
                </p>
              </Reveal>
              <Reveal className="sig-note sig-note--eda" delay={80}>
                <h3><NerveIcon />The nerves</h3>
                <p>
                  Two dry gold electrodes read skin conductance straight off the inner band, the
                  sympathetic arousal signal clinical stress research relies on. This is the read
                  most rings leave on the table, and where <b>NERVA Ring</b> earns its name.
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
                  alt="Close view inside the NERVA Ring band, exposing the flex PCB, gold electrodes, and the green and red optical sensor LEDs."
                />
              </Reveal>
              <div className="inside__list">
                {INSIDE.map((item, i) => (
                  <Reveal key={item.title} className="feat" delay={i * 60}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </Reveal>
                ))}
              </div>
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
                  alt="Engineering drawing of the NERVA Ring housing and internal flex PCB, shown from three isometric views plus a face-on section, with title block."
                />
              </div>
              <div className="bp__meta">
                <span>NERVA Ring · housing + flex-PCB assembly</span>
                <span className="bp__rev">Sketch · Rev 5 · Sheet 1/1</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- BUILD STATUS ---------------- */}
        <section className="section section--tint" id="status">
          <div className="wrap">
            <Reveal className="lead">
              <h2 className="display">Where the build stands today.</h2>
              <p className="lead__sub">
                NERVA Ring is an early-stage, solo-built hardware project in functional prototyping.
                Every line below is either finished, on the bench, or still ahead of me.
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
                No countdown and no pre-order. I send a note when a milestone lands:
                first firmware, first clean EDA trace, first hand-assembled batch.
                If a board comes back dead, that goes in the note too.
              </p>
              <Signup />
              <p className="cta__fine">Written by the person building it · no spam</p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER (drawing title block) ---------------- */}
      <footer className="colophon">
        <div className="wrap">
          <div className="colophon__head">
            <a className="brand" href="#top">
              <img className="brand__mark" src="/favicon.png" alt="" width={24} height={24} />
              NERVA Ring
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
            <div className="tb tb--w6">
              <span className="tb__k">Notes</span>
              <p className="tb__note">
                Renders and drawings on this page come from the working Fusion model. Nothing
                here is for sale, and the specs move as the design does.
              </p>
            </div>
          </div>

          <p className="colophon__fine">© 2026 NERVA Ring · sheet 1 of 1</p>
        </div>
      </footer>

      {/* ---------------- STICKY BAR ---------------- */}
      <div className="dockbar">
        <div className="dockbar__inner">
          <div className="dockbar__meta">
            <b>NERVA Ring</b>
            <span className="dockbar__desc">nervous-system sensing</span>
            <span className="dockbar__stage">Prototype</span>
          </div>
          <a className="btn btn--accent" href="#follow">Follow the build</a>
        </div>
      </div>
    </>
  )
}

export default App
