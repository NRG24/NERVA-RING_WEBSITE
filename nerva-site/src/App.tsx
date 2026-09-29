import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { lightHero } from './palette.ts'
import ringBlue from './assets/ring-blue.webp'
import ringCoffee from './assets/ring-coffee.webp'
import ringPink from './assets/ring-pink.webp'
import ringCeramicBlack from './assets/ring-ceramic-black.webp'
import ringMacro from './assets/ring-macro.webp'
import doesToday from './assets/does-today.webp'
import doesRing from './assets/does-ring.webp'
import blueprint from './assets/blueprint.webp'

/* ---------- scroll reveal ---------- */
function Reveal({ children, className = '', delay = 0, margin = '0px 0px -6% 0px' }: {
  children: ReactNode
  className?: string
  delay?: number
  /* how far into the viewport it has to come before it counts as seen */
  margin?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }),
      { threshold: 0.14, rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
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

/* The line behind the What it does title: one skin-conductance record,
   placed rather than random, so each response lands clear of the title.
   Same model as edaTrace: a fast rise, a slow decay, on a slowly drifting
   tonic level. The middle of the line is masked out in CSS where the title
   sits. The title covers 38 to 62% of a desktop and 23 to 77% of a small
   phone, so there are two placements, one per breakpoint. */
function titleTrace(bursts: { at: number; amp: number }[]) {
  const base = 70
  const pts: string[] = []
  for (let x = 0; x <= SPAN; x += 4) {
    let y = base - 2.2 * Math.sin(x / 130)
    for (const b of bursts) {
      const t = x - b.at
      if (t < 0) continue
      y -= b.amp * (1 - Math.exp(-t / 9)) * Math.exp(-t / 75) * 1.35
    }
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return 'M' + pts.join(' L')
}
const TITLE_TRACE_WIDE = titleTrace([{ at: 150, amp: 9 }, { at: 790, amp: 50 }])
const TITLE_TRACE_NARROW = titleTrace([{ at: 70, amp: 12 }, { at: 850, amp: 50 }])

/* a tick per second, labelled every fifth */
const TICKS = Array.from({ length: WINDOW_S + 1 }, (_, s) => ({
  s,
  pct: (s / WINDOW_S) * 100,
  major: s % 5 === 0,
}))

/* Legend keys for the two notes under the strip: a swatch of each trace in
   its own ink, one beat and one skin-conductance response, rather than a
   stock heart and zigzag. They say which line on the sheet each note is
   about. */
function PulseKey() {
  return (
    <svg className="sig-note__key" viewBox="0 0 40 16" fill="none" aria-hidden="true">
      <path d="M0 10 H9 C10.5 10 11.5 2 13 2 C14.5 2 15.5 13 17 13 C18.5 13 19.3 7 20.8 7 C22.3 7 23.5 10 26 10 H40" />
    </svg>
  )
}
function EdaKey() {
  return (
    <svg className="sig-note__key" viewBox="0 0 40 16" fill="none" aria-hidden="true">
      <path d="M0 13 H8 C11 13 11.5 3 15 3 C20 3 26 10.5 40 11.5" />
    </svg>
  )
}


function SignalInstrument() {
  return (
    <figure className="strip-chart">
      <div
        className="strip-chart__sheet"
        role="img"
        aria-label="An illustration of two sensor channels. The upper channel is a pulse trace at about 72 beats per minute, with the interval between beats varying slightly. The lower channel is skin conductance around 4.6 microsiemens, drifting slowly upward with several sharp rises that decay away, the largest of them marked as a spontaneous skin-conductance response."
      >
        <div className="strip-chart__body">
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
      {/* The traces are modeled, not recorded, and the page says so right
          under them. Delete this line the day the readout is a real capture
          off the ring. */}
      <figcaption className="strip-chart__cap">
        Illustration, not a recording. Both traces are modeled from how each
        signal behaves; the ring’s firmware isn’t reading live data yet.
      </figcaption>
    </figure>
  )
}

/* ---------- HERO ----------
   The ring rises out of the dark and settles, once. No loop: the film ends
   on its last frame and simply stays there, so the page opens on motion
   and rests on the product. The still is that same last frame, so a
   visitor who never sees the film (reduced motion, refused autoplay, a
   failed load) lands on exactly the picture everyone else ends on.

   Played at the render's own speed (4s). A 2x slowdown was tried and
   dropped: the ring turns too far per frame, so interpolated frames smeared
   the rim and blended ones ghosted it. */
/* Spread rather than written as a prop: React forwards the lowercase DOM
   attribute as-is, so this does not break the build the day @types/react
   adds its own camelCase declaration for it. */
const HIGH_PRIORITY: Record<string, string> = { fetchpriority: 'high' }

/* Two renders of the flight: the black glass ring on black for the dark
   design, and the ceramic ring with a transparent background for the light
   palettes, so it sits straight on whatever colour the page is. */
const LIGHT = lightHero()
const HERO_FILM = LIGHT ? '/nerva-levitate-ceramic.webm' : '/nerva-levitate.mp4'
const HERO_POSTER = LIGHT ? undefined : '/nerva-levitate-poster.webp'
const HERO_STILL = LIGHT ? '/nerva-levitate-ceramic-still.webp' : '/nerva-levitate-still.webp'
/* Safari, and every browser on an iPhone or iPad (they all run WebKit),
   plays a VP9 WebM but throws its transparency away and paints the ring on
   a black square. There the flight plays as an animated WebP instead,
   which WebKit does draw transparently. It plays once and holds its last
   frame, like the film. */
const HERO_ANIM = '/nerva-levitate-ceramic.webp'
const HERO_ANIM_MS = 4100
const WEBKIT_ONLY = (() => {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return true
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true // iPadOS as a Mac
  return /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android/.test(ua)
})()
const USE_ANIM = LIGHT && WEBKIT_ONLY

const HERO_FACTS = [
  { k: 'Heart rate', v: 'Green and red light, read at the finger' },
  { k: 'Skin conductance', v: 'Two gold electrodes on the inner band' },
  { k: 'Blood oxygen', v: 'SpO₂ from the same optical sensor' },
  { k: 'Stress management', v: 'Breathing exercises that train your nervous system' },
] as const

function Hero() {
  /* Reduced motion skips the film outright: decided before first paint,
     so the still never swaps in after the fact and the film is never
     fetched. */
  const [playFilm] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [filmFailed, setFilmFailed] = useState(false)
  const [filmEnded, setFilmEnded] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  /* one frame after mount, so the backdrop disc can ease in */
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const filmRef = useRef<HTMLVideoElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)

  /* A browser that refuses the autoplay (iOS Low Power Mode is the usual
     one) rejects this promise, and the hero would otherwise hold the near
     black first frame for the life of the page. */
  const toStill = () => setFilmFailed(true)
  useEffect(() => { if (!USE_ANIM) filmRef.current?.play().catch(toStill) }, [])

  const showFilm = playFilm && !filmFailed

  /* the animated WebP has no ended event: count its length from when it
     has loaded and started drawing */
  const [animLoaded, setAnimLoaded] = useState(false)
  useEffect(() => {
    if (!animLoaded) return
    const t = window.setTimeout(() => setFilmEnded(true), HERO_ANIM_MS)
    return () => window.clearTimeout(t)
  }, [animLoaded])
  /* Once the ring has landed it stays alive: a slow hover, and the green
     sensor light pulsing at 72 bpm, the same pulse the readout further
     down draws. Anyone on the still lands straight in this state. */
  const resting = !showFilm || filmEnded

  /* the loop is cheap, but there is no reason to run it off screen */
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className={`hero ${ready ? 'is-ready' : ''} ${resting ? 'is-resting' : ''} ${onScreen ? '' : 'is-offscreen'}`}
    >
      {/* a flat disc behind where the ring comes to rest, on its own layer so
          it holds still while the ring hovers in front of it (light schemes
          only; CSS hides it on the dark design) */}
      <div className="hero__backdrop" aria-hidden="true"><span /></div>
      <div className="hero__stage">
        {showFilm && USE_ANIM ? (
          <img
            className="hero__film"
            src={HERO_ANIM}
            width={810}
            height={810}
            alt="The NERVA Ring rising into view and turning to show the optical sensor and the gold electrodes on its inner band."
            onLoad={() => setAnimLoaded(true)}
            onError={toStill}
            {...HIGH_PRIORITY}
          />
        ) : showFilm ? (
          <video
            ref={filmRef}
            className="hero__film"
            src={HERO_FILM}
            poster={HERO_POSTER}
            onError={toStill}
            onEnded={() => setFilmEnded(true)}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label="The NERVA Ring rising out of the dark, turning to show the optical sensor and the gold electrodes on its inner band."
            {...HIGH_PRIORITY}
          />
        ) : (
          <img
            className="hero__film"
            src={HERO_STILL}
            width={1080}
            height={1080}
            alt="The NERVA Ring held in the dark, its inner band showing the green and red optical sensor and a gold electrode."
          />
        )}
        {/* the glow off the green LED, pinned to where the light module sits
            in the last frame. The outer span fades it in when the ring lands;
            the inner one carries the beat. */}
        <span className="hero__pulse" aria-hidden="true"><span /></span>
      </div>
      <div className="hero__grade" aria-hidden="true" />

      <div className="hero__copy">
        {/* the fact strip below is light-scheme furniture; CSS hides it on
            the dark design */}
        <h1 className="hero__title">The ring that reads your <em>nervous system.</em></h1>
        <p className="hero__lede">
          Helping you understand and manage stress in real time with EDA sensors.
        </p>
        {/* one button, one link: the page asks for one thing, and the way
            down to the hardware is a place to go, not a second offer */}
        <div className="hero__cta">
          <a className="btn btn--led btn--lg" href="#follow">Get launch updates</a>
          <a className="textlink textlink--onfilm" href="#inside">See what’s inside</a>
        </div>
      </div>

      {/* what the ring does, one line each; the first three are in
          nerva-ring-overview.md, the last is Ryan's What it does copy */}
      <ul className="hero__facts" aria-label="What it reads">
        {HERO_FACTS.map((f) => (
          <li key={f.k}>
            <span className="hero__fact-k">{f.k}</span>
            <span className="hero__fact-v">{f.v}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- scroll-scrubbed exploded view ----------
   Scrolling drives the ring apart: housing, flex PCB, outer shell. The
   poster is frame 0, the assembled ring, because scroll progress 0 maps to
   time 0, so the still the browser paints before the file lands is the same
   frame the scrub starts on and nothing jumps when it loads. */
const FILM_SRC = '/nerva-exploded.mp4'

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

    /* Scrubbing means seeking, and seeking needs the server to answer byte
       range requests. This used to assume no server would, and pulled the
       whole film down as a blob before the first frame could move, which
       cost every desktop visitor the entire file.

       So ask instead. One request for one byte settles it: a 206 means the
       host serves ranges and the element can scrub straight off the network,
       fetching only the parts a seek actually lands on. The blob path is kept
       for a host that answers a Range with a flat 200, where the browser
       reports seekable = 0 and currentTime silently refuses to move.

       Held until the page has loaded and the film is near the viewport, so
       none of this competes with the hero. */
    const scrubOverNetwork = () => {
      video.preload = 'auto'
      video.src = FILM_SRC
      video.addEventListener('loadedmetadata', update, { once: true })
    }

    const scrubFromBlob = () => {
      fetch(FILM_SRC)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob)
          video.src = objectUrl
          video.addEventListener('loadedmetadata', update, { once: true })
        })
        .catch(() => {
          /* last resort: no scrub, just let it play */
          video.src = FILM_SRC
          video.loop = true
          video.play().catch(() => {})
        })
    }

    const warm = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return
        warm.disconnect()
        fetch(FILM_SRC, { headers: { Range: 'bytes=0-1' } })
          .then((r) => {
            const servesRanges = r.status === 206
            /* only the status line was needed. Drop the body without reading
               it, so a server that answers a Range by streaming the whole
               file does not cost us the whole file just to be asked. */
            r.body?.cancel().catch(() => {})
            if (servesRanges) scrubOverNetwork()
            else scrubFromBlob()
          })
          .catch(scrubFromBlob)
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
    <section ref={sectionRef as never} className={`film ${scrub ? 'film--scrub' : ''}`} aria-label="An exploded view of the NERVA Ring, separating into the outer housing, the flex PCB carrying the sensors, and the inner shell.">
      <div className="film__sticky">
        <video
          ref={videoRef}
          className="film__video"
          poster="/nerva-exploded-poster.jpg"
          muted
          playsInline
          preload="none"
        />
        <div className="film__grade" aria-hidden="true" />
        <div className="film__ui">
          <span className="film__hint" style={scrub ? { opacity: Math.max(0, 1 - progress * 4) } : undefined}>
            {scrub ? 'Scroll to take it apart' : 'Every reading begins inside the band'}
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
const CONTACT_EMAIL = 'nervaring@gmail.com'
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

/* Ryan's copy, cut down and reordered, never rewritten: each label and body
   below is a literal run from the brief. The channel colors keep the meanings
   set at the top of index.css: gold is the electrode channel that times the
   two branches, green is the ring's own sensing, red is the pulse channel.
   The color marks the rule over each row; there are no icons, because three
   stock glyphs beside three headings is the feature grid this avoids. */
/* Each feature is a card with its own picture, the way Oura, Ultrahuman
   and RingConn lay theirs out. The Today screen and the ring are cut from
   Ryan's app-and-ring render (ring-app.webp, in git history); the breathing
   card is Ryan's animated mockup, set on the same dark backdrop and cut to
   a 165KB looping film. */
const DOES = [
  {
    k: 'Gas pedal and brake',
    channel: 'gold',
    img: doesToday, w: 578, h: 722,
    alt: 'The NERVA app on a phone, the Today screen: 68 percent of the day inside your range, a graph of the day, and minutes above your line against minutes restoring.',
    body: (
      <> Measures how long your <b className="abbr">SNS</b> or <b className="abbr">PNS</b> is engaged so you keep a steady flow and avoid burnout.</>
    ),
  },
  {
    k: 'In-app breathing exercises',
    channel: 'sensor',
    img: '/nerva-breathe-poster.webp', w: 746, h: 932,
    video: '/nerva-breathe.mp4',
    alt: 'The NERVA app on a phone during a breathing exercise: breathe 5 seconds in and 5 seconds out. The screen fills with colour on each breath in and drains on each breath out, while a wave traces the breaths.',
    body: <>Exercises to train your nervous system and manage stress. Measures your ability to downregulate your nervous system so you can track progress.</>,
  },
  {
    k: 'Steps, calories burned, heart rate',
    channel: 'pulse',
    img: doesRing, w: 857, h: 1071,
    alt: 'The NERVA Ring in polished silver, its clear inner band showing the flex PCB and the optical sensor.',
    body: <>All of the things you would expect in a premium wearable.</>,
  },
] as const

/* Every answer here is checkable against nerva-ring-overview.md or the
   site's own disclaimers. Keep it that way: no claim goes in this list that
   the build cannot back yet. */
const FAQ = [
  {
    q: 'Can I buy one yet?',
    a: 'Not yet. NERVA Ring is an early prototype built by one person, and nothing on this site is for sale. The plan is a crowdfunding campaign once the prototype has been tested, and the update list hears about it first.',
  },
  {
    q: 'What is EDA?',
    a: 'Electrodermal activity: how easily your skin conducts a tiny current. When your sympathetic nervous system fires, your sweat glands respond and skin conductance rises within seconds. It is the arousal signal clinical stress research relies on.',
  },
  {
    q: 'How is it different from other smart rings?',
    a: 'Most rings estimate stress from heart rate and heart rate variability, through a model. NERVA adds two dry gold electrodes on the inner band that read skin conductance directly, alongside heart rate and blood oxygen.',
  },
  {
    q: 'How long will the battery last?',
    a: 'The ring carries a 22 mAh cell and sleeps between readings, targeting about a month of standby. Battery life in everyday wear will be measured during prototype testing and published in the update notes.',
  },
  {
    q: 'Can I wear it in the shower?',
    a: 'The electronics are fully potted in resin inside the band, so the ring is sealed with no seams, and it is designed for hand-washing and showering. It has not been through formal water-rating tests yet.',
  },
  {
    q: 'Is it a medical device?',
    a: 'No. NERVA Ring is a wellness product. It is not intended to diagnose, treat, cure, or prevent any disease.',
  },
] as const

const NAV = [
  { href: '#does', label: 'What it does' },
  { href: '#signals', label: 'Signals' },
  { href: '#stress', label: 'Stress' },
  { href: '#inside', label: 'Inside' },
  { href: '#finish', label: 'Finishes' },
]

const FINISHES = [
  { id: 'ceramic-black', label: 'Black', img: ringCeramicBlack, swatch: 'linear-gradient(140deg,#3a3a3c,#050506 72%)' },
  { id: 'blue', label: 'Blue', img: ringBlue, swatch: 'linear-gradient(140deg,#3d5f8a,#0a0e14 72%)' },
  { id: 'coffee', label: 'Coffee', img: ringCoffee, swatch: 'linear-gradient(140deg,#6b4a30,#160f0a 72%)' },
  { id: 'pink', label: 'Pink', img: ringPink, swatch: 'linear-gradient(140deg,#f4c9d6,#d98fa6 72%)' },
] as const

/* the sensing stack, read like a bill of materials: the part number owns
   the left column, because it is the one thing here nobody could invent */
const SPECS = [
  {
    title: 'Optical sensing',
    part: 'MAXM86161',
    channel: 'pulse',
    body: 'Pulse and SpO₂ read straight from the finger, run in a custom low-power polling mode rather than stock continuous mode to stretch the battery dramatically further.',
  },
  {
    title: 'Electrodermal front end',
    part: '2× Au ELECTRODES',
    channel: 'gold',
    body: 'A custom transimpedance-amplifier circuit tuned for the low-current, low-noise range of skin conductance, read through two dry gold-plated electrodes built into the flex PCB.',
  },
  {
    title: 'Radio',
    part: 'ANNA-B402 - BLE 5',
    channel: 'sensor',
    body: 'An internal antenna paired with advanced geometry and layout for optimal Bluetooth connectivity.',
  },
  {
    title: 'Power',
    part: 'BQ25120A - 22 mAh',
    channel: 'sensor',
    body: 'One PMIC handles charging, monitoring, and safety. Efficient power-rail management and a low-voltage threshold target about a month of standby on a 22 mAh cell.',
  },
  {
    title: 'Sealed build',
    part: 'RESIN-POTTED',
    channel: 'neutral',
    body: 'The flex PCB wraps the inner circumference and is fully potted in RF-tuned resin. Charges on the provided charging case.',
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

/* A card's looping film. Fetched and played only while the card is on
   screen, paused off it, and never loaded under reduced motion, where the
   first frame stands in as a still. */
function CardFilm({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = src
        v.play().catch(() => {})
      } else v.pause()
    }, { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [src])
  if (still) return <img src={poster} width={746} height={932} loading="lazy" alt={label} />
  return <video ref={ref} poster={poster} muted loop playsInline preload="none" aria-label={label} />
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [finish, setFinish] = useState<(typeof FINISHES)[number]['id']>('ceramic-black')
  const active = FINISHES.find((f) => f.id === finish)!
  const [barShown, setBarShown] = useState(false)

  /* Escape closes the phone menu, and so does widening past the breakpoint,
     where the toggle disappears and would leave the panel stuck open */
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    const wide = window.matchMedia('(min-width: 1081px)')
    const onWide = () => { if (wide.matches) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [menuOpen])

  /* The launch bar arrives once the hero has scrolled away, and steps aside
     while the signup form or the footer is on screen, so it never sits on
     top of the thing it points at. */
  useEffect(() => {
    const hero = document.querySelector('.hero')
    const ends = [document.getElementById('follow'), document.querySelector('.colophon')]
    if (!hero || ends.some((el) => !el)) return
    let pastHero = false
    const atEnd = new Set<Element>()
    const sync = () => setBarShown(pastHero && atEnd.size === 0)
    const heroIo = new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync() })
    const endIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) atEnd.add(e.target); else atEnd.delete(e.target) })
      sync()
    }, { threshold: 0.12 })
    heroIo.observe(hero)
    ends.forEach((el) => endIo.observe(el!))
    return () => { heroIo.disconnect(); endIo.disconnect() }
  }, [])

  return (
    <>
      {/* ---------------- NAV ---------------- */}
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
            <span className="brand__tag">Prototype</span>
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
              type="button"
              aria-label="Menu"
              aria-controls="mobile-menu"
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
        <nav id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-label="Menu">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a className="btn btn--accent btn--block" href="#follow" onClick={() => setMenuOpen(false)}>
            Get updates
          </a>
        </nav>
      </header>

      <main id="top">
        <Hero />

        {/* ---------------- WHAT IT DOES ----------------
            Carries on in the hero's black rather than opening a new white
            section, so it reads as what happens after the ring lands, not as
            a separate card: a centered head, the ring and the app it talks
            to coming out of the dark, then the three things it does. */}
        <section className="section does" id="does">
          {/* a stress response drawn across the page at the title's height,
              picking up the green of the hero's pulsing sensor light and
              leading on to the full readout further down */}
          {/* held until it is a third of the way up the screen, so the pen
              runs while you are looking at it, not while it is still at the
              bottom edge */}
          <Reveal className="does__trace" margin="0px 0px -34% 0px">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="does__trace-ink does__trace-ink--wide" d={TITLE_TRACE_WIDE} />
              <path className="does__trace-ink does__trace-ink--narrow" d={TITLE_TRACE_NARROW} />
            </svg>
          </Reveal>
          <div className="wrap">
            <Reveal className="head head--light">
              <h2 className="display display--light">What it does</h2>
              <p className="head__sub">
                NERVA Ring is continuously monitoring your nervous system. Unlike
                other wearables that are mainly beneficial to athletes, NERVA Ring
                is tuned specifically for you.
              </p>
            </Reveal>
          </div>

          {/* wider than the text column and in no card: the render's black
              top is the hero's black, so the phones and the ring come up out
              of the same dark the ring landed in */}
          <div className="wrap">
            {/* a swipeable row on a phone, three across on a desktop */}
            <ul className="cards" aria-label="What it does">
              {DOES.map((d, i) => (
                <li key={d.k} className={`card card--${d.channel}`}>
                  <Reveal className="card__in" delay={i * 80}>
                    <figure className="card__img">
                      {'video' in d
                        ? <CardFilm src={d.video} poster={d.img} label={d.alt} />
                        : <img src={d.img} width={d.w} height={d.h} loading="lazy" alt={d.alt} />}
                    </figure>
                    <div className="card__txt">
                      <h3>{d.k}</h3>
                      <p>{d.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- TWO SIGNALS ---------------- */}
        <section className="section section--tint" id="signals">
          <div className="wrap">
            <Reveal className="head">
              <h2 className="display">
                Your electrodermal activity is a hidden window into your nervous system.
              </h2>
            </Reveal>

            <Reveal className="stage readout">
              <SignalInstrument />
            </Reveal>

            <div className="sig-notes">
              <Reveal className="sig-note sig-note--hr">
                <h3><PulseKey />The heart</h3>
                <p>
                  Optical PPG reads pulse and blood oxygen off the finger, a dense,
                  well-perfused site that gives clean signal. Most rings already measure
                  it. So does NERVA.
                </p>
              </Reveal>
              <Reveal className="sig-note sig-note--eda" delay={80}>
                <h3><EdaKey />The nerves</h3>
                <p>
                  Two dry gold electrodes read skin conductance straight off the inner
                  band, the sympathetic arousal signal clinical stress research relies on.
                  This is the read most rings leave on the table.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- WHERE YOUR STRESS NUMBER COMES FROM ----------------
            The argument is about distance, so the section draws the distance.
            Both chains start on the same nerve and one is visibly half as long;
            the endpoints finish it, a reading with a unit against a phrase in
            quotation marks. */}
        <section className="section" id="stress">
          <div className="wrap">
            <Reveal className="head">
              <h2 className="display">Two ways to read your nervous system.</h2>
            </Reveal>

            <div className="stage paths-stage">
              <div className="paths">
                <Reveal className="path path--measured">
                  <h3 className="path__h">NERVA measures it</h3>
                  <ol className="path__steps">
                    <li>Sympathetic nerve</li>
                    <li>Sweat glands</li>
                    <li>Skin conductance</li>
                    <li className="path__out">4.6 µS</li>
                  </ol>
                </Reveal>

                <Reveal className="path path--inferred" delay={90}>
                  <h3 className="path__h">Most rings infer it</h3>
                  <ol className="path__steps">
                    <li>Sympathetic nerve</li>
                    <li>Heart rate</li>
                    <li>Beat-to-beat variation</li>
                    <li>A model</li>
                    <li className="path__out">“a stress score”</li>
                  </ol>
                </Reveal>
              </div>
            </div>

            <Reveal className="caveat">
              <p>
                <b>The hard part.</b> Skin conductance drifts with temperature, moves
                when you move, and a finger is a small place for two electrodes. That
                difficulty is why most rings skip it.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- CINEMATIC SENSOR FILM ---------------- */}
        <FilmScroll />

        {/* ---------------- INSIDE THE BAND (black) ---------------- */}
        <section className="inside" id="inside">
          <div className="wrap">
            <Reveal className="head head--light">
              <h2 className="display display--light">Inside the band</h2>
              <p className="head__sub">
                A full sensing stack, wrapped to the inner circumference of a ring and
                potted in RF-transparent resin. Sealed and waterproofed.
              </p>
            </Reveal>

            <div className="inside__grid">
              <Reveal className="inside__aside">
                <figure className="stage inside__stage">
                  <img
                    src={ringMacro}
                    width={2000}
                    height={2000}
                    loading="lazy"
                    alt="Macro view inside the NERVA Ring band, showing the flex PCB, gold electrodes, and the green and red optical sensor LEDs."
                  />
                </figure>
              </Reveal>

              <div className="inside__list">
                {SPECS.map((s, i) => (
                  <Reveal key={s.title} className="spec" delay={i * 50}>
                    <h3>{s.title}</h3>
                    <span className={`spec__part spec__part--${s.channel}`}>{s.part}</span>
                    <p>{s.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- FINISHES ----------------
            Laid out the way a product page sells the object: the render
            big on the left, and on the right the name, the swatches, the
            chosen finish, where the build is, and the one thing to do. */}
        <section className="section section--tint" id="finish">
          <div className="wrap config">
            <Reveal>
              <figure className="stage config__stage">
                <img
                  key={active.id}
                  src={active.img}
                  width={1400}
                  height={1270}
                  loading="lazy"
                  alt={`The NERVA Ring in ${active.label.toLowerCase()}, showing the internal flex PCB and its green and red optical sensor LEDs.`}
                />
              </figure>
            </Reveal>

            <Reveal className="config__panel" delay={90}>
              <p className="config__name">NERVA Ring</p>
              <h2 className="config__title">Ceramic in Four Finishes</h2>

              <div className="config__opt">
                <p className="config__label">Finish. <span>{active.label}</span></p>
                {/* toggle buttons, not role="radio": a radiogroup promises arrow
                    keys and a roving tab stop, and these are four plain buttons */}
                <div className="swatches" role="group" aria-label="Ring finish">
                  {FINISHES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="swatch"
                      aria-label={f.label}
                      aria-pressed={finish === f.id}
                      style={{ background: f.swatch }}
                      onClick={() => setFinish(f.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="config__status">
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
              </div>

              <a className="btn btn--accent btn--lg btn--block config__cta" href="#follow">
                Get launch updates
              </a>
              <p className="config__fine">Not on sale yet. The update list hears first.</p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- FAQ ----------------
            Native details/summary, so it opens with a keyboard and a screen
            reader for free, and every answer is in the page for search. */}
        <section className="section faq" id="faq">
          <div className="wrap faq__grid">
            <Reveal>
              <h2 className="display">Questions</h2>
              <p className="faq__lede">
                Anything else, write to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </Reveal>
            <Reveal className="faq__list">
              {FAQ.map((f) => (
                <details key={f.q} className="faq__item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
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
                We’ll email you about new prototypes and project updates.
              </p>
              <Signup />
              <p className="cta__fine">
                Written by the person building it, no spam. Your address goes to
                Buttondown and nowhere else.{' '}
                <a href="/privacy.html">What this site collects</a>.
              </p>
            </Reveal>

            <Reveal className="cta__sheet" delay={90}>
              <img
                src={blueprint}
                width={2600}
                height={1838}
                loading="lazy"
                alt="Engineering drawing of the NERVA Ring housing and internal flex PCB, shown from three isometric views plus a face-on section, with title block."
              />
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
              <b className="tb__v">NERVA Ring - Launching soon</b>
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
                <a href="#faq">Questions</a>
                <a href="#follow">Updates</a>
                <a href="/privacy.html">Privacy</a>
              </nav>
            </div>
            {/* the cell spans are load-bearing: every row of the 6-column
                grid has to tile exactly or the leftover gap prints as a
                solid hairline block */}
            <div className="tb tb--w6">
              <span className="tb__k">Notes</span>
              <p className="tb__note">
                NERVA Ring is a wellness product, not a medical device. It is not
                intended to diagnose, treat, cure, or prevent any disease, and nothing
                on this site is for sale. Every ring image is a render of the CAD
                model, and the app screens are a design demo, not live data.{' '}
                <a href="/privacy.html">Privacy and disclaimers</a>.
              </p>
            </div>
          </div>
          <p className="colophon__fine">© 2026 NERVA Ring - built by Ryan Schreiber</p>
        </div>
      </footer>

      {/* ---------------- LAUNCH BAR ----------------
          inert while hidden, so its button is never a tab stop you cannot
          see */}
      <div className={`launchbar ${barShown ? 'is-shown' : ''}`} inert={!barShown}>
        <div className="launchbar__inner">
          <p className="launchbar__txt">
            <b>NERVA Ring</b>
            <span>In prototype. Not on sale yet.</span>
          </p>
          <a className="btn btn--led" href="#follow">Get launch updates</a>
        </div>
      </div>
    </>
  )
}

export default App
