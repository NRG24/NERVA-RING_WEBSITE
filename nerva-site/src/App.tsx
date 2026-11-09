import { useEffect, useRef, useState, type ReactNode } from 'react'
import { lightHero } from './palette.ts'
import { CONTACT_EMAIL, Signup } from './Signup.tsx'
import { FAQ } from './faq.ts'
import { SkipLink } from './Chrome.tsx'
import ringBlue from './assets/ring-blue.webp'
import ringCoffee from './assets/ring-coffee.webp'
import ringPink from './assets/ring-pink.webp'
import ringCeramicBlack from './assets/ring-ceramic-black.webp'
import ringMacro from './assets/ring-macro.webp'
import doesToday from './assets/does-today.webp'
import doesRing from './assets/does-ring.webp'
import blueprint from './assets/blueprint.webp'
import benchPhoto from './assets/proto-bench.webp'

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
   the rim and blended ones ghosted it.

   The animated WebP asks for fetchPriority="high"; the <video> does not,
   because browsers only honour that hint on images, links, scripts and
   iframes (React 19 also warned about the lowercase spread used before). */
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
      {/* three rings spreading out from the disc in steps from sage toward the
          ground, swelling with the LED at 72 bpm once the ring lands (Ryan
          picked this, direction D, 3 Nov 2026). Their own layer, under the
          disc, clipped to the hero and faded out before its bottom edge. */}
      <div className="hero__ripples" aria-hidden="true"><i /><i /><i /></div>
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
            fetchPriority="high"
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
        {/* points at the prototype page, the one page with photographs
            instead of renders. Set as a pill (3 Nov 2026) so it reads as more
            than a footnote; the pitch video it also pointed to is down until
            Ryan records a new one. */}
        <p className="hero__news">
          <a className="hero__proto" href="/prototype">
            <span className="hero__proto-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </span>
            <span className="hero__proto-txt"><b>New:</b> See real prototyping progress.</span>
          </a>
        </p>
      </div>

    </section>
  )
}

/* ---------- scroll-scrubbed exploded view ----------
   Scrolling drives the ring apart: housing, flex PCB, outer shell. The
   poster is frame 0, the assembled ring, because scroll progress 0 maps to
   time 0, so the still the browser paints before the file lands is the same
   frame the scrub starts on and nothing jumps when it loads. */
const FILM_SRC = '/nerva-exploded.mp4'
const FILM_DUR = 12.5

/* Where each part of the stack sits in the film while the ring holds apart,
   in the film's own 1280x720 frame, as [seconds, x, y]; between those
   moments the point moves in a straight line. Read off the frames by hand
   at 6.5 s and 8.5 s, with 5 s taken between the 4.5 s frame and the 6.5 s
   one (before 5 s the radio is still behind the shell). Re-measure if the
   film is re-rendered. The silver cylinder is not the battery (Ryan, 8 Nov
   2026): the battery stays inside the housing in this film, so it has no
   callout.

   Each callout is the part and what it does, in plain words (Ryan, 8 Nov
   2026: "list the parts and add a dash next to it and say power or brain").
   One face, one colour: the coloured mono part numbers read as code. */
const FILM_W = 1280
const FILM_H = 720
type Key = [number, number, number]
const FILM_PARTS: { name: string; does: string; at: Key[] }[] = [
  { name: 'Resin', does: 'waterproofing', at: [[5, 705, 136], [6.5, 720, 125], [8.5, 735, 120]] },
  { name: 'Bluetooth module', does: 'brain and connection', at: [[5, 527, 276], [6.5, 547, 280], [8.5, 580, 287]] },
  { name: 'Gold electrodes', does: 'stress', at: [[5, 583, 495], [6.5, 573, 500], [8.5, 607, 493]] },
  { name: 'Optical sensor', does: 'heart rate', at: [[5, 605, 589], [6.5, 620, 593], [8.5, 627, 593]] },
]
const HEAD_OUT: [number, number] = [2.4, 3.2]     // seconds of film the head fades over
const LABELS_IN: [number, number] = [5, 5.5]
const LABELS_OUT: [number, number] = [8.6, 9.1]
const ramp = (t: number, [a, b]: [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)))
function partAt(keys: Key[], t: number): [number, number] {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]]
  for (let i = 1; i < keys.length; i++) {
    const [t0, x0, y0] = keys[i - 1]
    const [t1, x1, y1] = keys[i]
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0)
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]
    }
  }
  const [, x, y] = keys[keys.length - 1]
  return [x, y]
}

function FilmScroll({ labeled }: { labeled: boolean }) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [scrub, setScrub] = useState(false)
  const [progress, setProgress] = useState(0)
  /* the pinned viewport the film is drawn into, for placing the callouts */
  const [vp, setVp] = useState(() => ({ w: document.documentElement.clientWidth, h: window.innerHeight }))
  useEffect(() => {
    if (!labeled) return
    const on = () => setVp({ w: document.documentElement.clientWidth, h: window.innerHeight })
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [labeled])

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

  /* The callouts. The film is drawn with object-fit: cover, so a point in
     its frame maps to the screen by one scale and one offset. Each label
     sits in a column at the right, level with its part where it can be,
     at least 62px from the next, with a leader back to the part. */
  const filmT = progress * (FILM_DUR - 0.05)
  const headOpacity = 1 - ramp(filmT, HEAD_OUT)
  const labelOpacity = ramp(filmT, LABELS_IN) * (1 - ramp(filmT, LABELS_OUT))
  const s = Math.max(vp.w / FILM_W, vp.h / FILM_H)
  const ox = (vp.w - FILM_W * s) / 2
  const oy = (vp.h - FILM_H * s) / 2
  const colX = vp.w - 32 - 300
  const rows = FILM_PARTS
    .map((part) => {
      const [fx, fy] = partAt(part.at, filmT)
      return { part, ax: ox + fx * s, ay: oy + fy * s, ly: 0 }
    })
    .sort((a, b) => a.ay - b.ay)
  rows.forEach((r, i) => { r.ly = Math.max(r.ay, i ? rows[i - 1].ly + 48 : 112) })
  for (let i = rows.length - 1; i >= 0; i--) {
    rows[i].ly = Math.min(rows[i].ly, i < rows.length - 1 ? rows[i + 1].ly - 48 : vp.h - 64)
  }

  return (
    <section
      ref={sectionRef as never}
      id={labeled ? 'inside' : undefined}
      className={`film ${scrub ? 'film--scrub' : ''} ${labeled ? 'film--labeled' : ''}`}
      {...(labeled
        ? { 'aria-labelledby': 'inside-title' }
        : { 'aria-label': 'An exploded view of the NERVA Ring, separating into the outer housing, the flex PCB carrying the sensors, and the inner shell.' })}
    >
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
        {labeled && (
          <>
            <div className="film__head" style={{ opacity: headOpacity }}>
              <h2 id="inside-title" className="display display--light">Inside the band</h2>
              <p>
                A full sensing stack, wrapped to the inner circumference of a ring and
                potted in RF-transparent resin. Sealed and waterproofed.
              </p>
            </div>
            <div
              className="film__labels"
              style={{ opacity: labelOpacity, visibility: labelOpacity > 0 ? 'visible' : 'hidden' }}
            >
              <svg className="film__leaders" width={vp.w} height={vp.h} aria-hidden="true">
                {rows.map((r) => (
                  <g key={r.part.name}>
                    <polyline points={`${r.ax},${r.ay} ${colX - 44},${r.ay} ${colX - 12},${r.ly}`} />
                    <circle cx={r.ax} cy={r.ay} r="4" />
                  </g>
                ))}
              </svg>
              <ul className="film__parts">
                {rows.map((r) => (
                  <li key={r.part.name} style={{ left: colX, top: r.ly }}>
                    <b>{r.part.name}</b> - {r.part.does}
                  </li>
                ))}
              </ul>
            </div>
            {/* the full sentences, for a screen reader, which the callouts
                leave out on screen */}
            <ul className="sr-only">
              {SPECS.map((sp) => <li key={sp.title}>{sp.title}, {sp.part}. {sp.body}</li>)}
            </ul>
          </>
        )}
        <div className="film__ui">
          <span className="film__hint" style={scrub ? { opacity: Math.max(0, 1 - progress * 4) } : undefined}>
            {scrub ? 'Scroll to take it apart' : 'Every reading begins inside the band'}
          </span>
        </div>
        {scrub && (
          <div className={`film__progress ${progress > 0.985 ? 'is-done' : ''}`} aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        )}
      </div>
    </section>
  )
}

/* Ryan's copy, cut down and reordered, never rewritten: each label and body
   below is a literal run from the brief. Each card still carries a channel
   (card--gold / --sensor / --pulse) but nothing draws it: the short
   coloured rule over each heading was taken off at Ryan's ask (3 Nov
   2026). There are no icons either, because three stock glyphs beside
   three headings is the feature grid this avoids. */
/* Each feature is a card with its own picture, the way Oura, Ultrahuman
   and RingConn lay theirs out. The Today screen is Ryan's night-theme
   mockup (3 Nov 2026), framed exactly like the breathing film (phone 566
   wide at +90+42 on the same dark backdrop) so the two phones match; the ring is cut from his app-and-ring render (ring-app.webp, in
   git history); the breathing card is Ryan's animated mockup, set on the
   same dark backdrop and cut to a small looping film. */
const DOES = [
  {
    k: 'Gas pedal and brake',
    channel: 'gold',
    img: doesToday, w: 746, h: 932,
    alt: 'The NERVA app on a phone, the Today screen in its night theme, with demo data: back down in 9 minutes, a reserve of 39, today at 1.4 times the usual load, a week that has been running down, and two spikes in the day so far.',
    body: (
      <>Shows how long you have spent in fight-or-flight and how long at rest, so you keep a steady flow and avoid burnout.</>
    ),
  },
  {
    k: 'In-app breathing exercises',
    channel: 'sensor',
    img: '/nerva-breathe-poster.webp', w: 746, h: 932,
    video: '/nerva-breathe.mp4',
    alt: 'The NERVA app on a phone during a breathing exercise, in its night theme: breathe 5 seconds in and 5 seconds out. The word changes between In and Out, the screen fills with blue on each breath in and drains on each breath out, and a line traces the breaths.',
    body: <>Exercises to train your nervous system and manage stress. Measures your ability to downregulate your nervous system so you can track progress.</>,
  },
  {
    k: 'Steps, calories burned, heart rate',
    channel: 'pulse',
    img: doesRing, w: 857, h: 1071,
    alt: 'The NERVA Ring in polished silver, its clear inner band showing the flex PCB and the optical sensor.',
    body: <>The everyday numbers, kept next to your stress so you can see how one moves the other.</>,
  },
] as const

const NAV = [
  { href: '#does', label: 'What it does' },
  { href: '#signals', label: 'Signals' },
  { href: '#inside', label: 'Inside' },
  { href: '#build', label: 'Prototype' },
  { href: '#finish', label: 'Finishes' },
]

const FINISHES = [
  { id: 'ceramic-black', label: 'Black', img: ringCeramicBlack, swatch: 'linear-gradient(140deg,#3a3a3c,#050506 72%)' },
  { id: 'blue', label: 'Blue', img: ringBlue, swatch: 'linear-gradient(140deg,#3d5f8a,#0a0e14 72%)' },
  { id: 'coffee', label: 'Coffee', img: ringCoffee, swatch: 'linear-gradient(140deg,#6b4a30,#160f0a 72%)' },
  { id: 'pink', label: 'Pink', img: ringPink, swatch: 'linear-gradient(140deg,#f4c9d6,#d98fa6 72%)' },
] as const

/* The sensing stack, shown where the labelled film is not (phones, touch,
   reduced motion). The line under each heading leads with what the part
   does, in the words the film's callouts use, and then names the part, so
   both layouts tell the same story at the same level. */
const SPECS = [
  {
    title: 'Optical sensing',
    part: 'Heart rate and blood oxygen · MAXM86161',
    body: 'Pulse and SpO₂ read straight from the finger, run in a custom low-power polling mode rather than stock continuous mode to stretch the battery dramatically further.',
  },
  {
    title: 'Electrodermal front end',
    part: 'Stress · two gold electrodes',
    body: 'A custom transimpedance-amplifier circuit tuned for the low-current, low-noise range of skin conductance, read through two dry gold-plated electrodes built into the flex PCB.',
  },
  {
    title: 'Radio',
    part: 'Brain and connection · ANNA-B402, Bluetooth 5',
    body: 'An internal antenna paired with advanced geometry and layout for optimal Bluetooth connectivity.',
  },
  {
    title: 'Power',
    part: 'Battery and charging · BQ25120A, 22 mAh',
    body: 'One PMIC handles charging, monitoring, and safety. Efficient power-rail management and a low-voltage threshold target about a month of standby on a 22 mAh cell.',
  },
  {
    title: 'Sealed build',
    part: 'Waterproofing · resin-potted',
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

/* true while a media query matches, and kept current as the window resizes */
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

function App() {
  /* at and below 1080px the feature cards are a row you swipe; it holds
     nothing focusable, so it takes focus itself and the arrow keys scroll it */
  const cardsSwipe = useMedia('(max-width: 1080px)')
  /* a mouse, a wide screen and motion allowed: the film can carry its own labels */
  const labeledFilm = useMedia('(pointer: fine) and (min-width: 1200px) and (prefers-reduced-motion: no-preference)')
  const [menuOpen, setMenuOpen] = useState(false)
  const [finish, setFinish] = useState<(typeof FINISHES)[number]['id']>('ceramic-black')
  const active = FINISHES.find((f) => f.id === finish)!
  /* the finish only counts as a pick once someone has touched a swatch:
     the black that shows by default is nobody's vote */
  const [voted, setVoted] = useState(false)
  const [barShown, setBarShown] = useState(false)

  const headerRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  /* Escape closes the phone menu and hands focus back to its button, and
     widening past the breakpoint closes it too, where the toggle
     disappears and would leave the panel stuck open. Tabbing out of the
     header closes it as well: the panel is not a dialog, but left open it
     would sit over whatever the keyboard moved on to. */
  useEffect(() => {
    if (!menuOpen) return
    const header = headerRef.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      if (header?.contains(document.activeElement)) toggleRef.current?.focus()
    }
    const onFocusOut = (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null
      if (to && !header?.contains(to)) setMenuOpen(false)
    }
    const wide = window.matchMedia('(min-width: 1081px)')
    const onWide = () => { if (wide.matches) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    header?.addEventListener('focusout', onFocusOut)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKey)
      header?.removeEventListener('focusout', onFocusOut)
      wide.removeEventListener('change', onWide)
    }
  }, [menuOpen])

  /* The launch bar arrives once the hero has scrolled away, and steps aside
     while the signup form or the footer is on screen, so it never sits on
     top of the thing it points at. */
  useEffect(() => {
    const hero = document.querySelector('.hero')
    const ends = [document.getElementById('follow'), document.querySelector('.colophon'), document.querySelector('.config__cta')]
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
      <SkipLink to="#top" />
      {/* ---------------- NAV ---------------- */}
      <header className="nav" ref={headerRef}>
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="NERVA Ring Prototype, top of page">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring{' '}
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
              ref={toggleRef}
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
            <ul className="cards" aria-label="What it does" tabIndex={cardsSwipe ? 0 : undefined}>
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

        {/* ---------------- CINEMATIC SENSOR FILM ----------------
            On a desktop screen 1200px and up it carries Inside the band
            itself: the head over the assembled ring, then a callout on each
            part while it holds apart. Everywhere else (touch, narrower,
            reduced motion) the film plays as before and the section below
            lists the parts. */}
        <FilmScroll labeled={labeledFilm} />

        {/* ---------------- INSIDE THE BAND (black) ---------------- */}
        {!labeledFilm && (
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
                    <span className="spec__part">{s.part}</span>
                    <p>{s.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ---------------- PROGRESS ----------------
            The one photograph on this page: the bench prototype, set the way
            the prototype page sets it, in Ryan's words and caption. No meter,
            no status colours, no rules: Ryan had all of those taken off the
            prototype page, and they stay off wherever the prototype appears.
            The words come first and the photo sits right, so the picture
            alternates sides with Inside and Finishes around it. */}
        <section className="section build" id="build" aria-labelledby="build-title">
          <div className="wrap build__grid">
            <Reveal className="build__panel">
              <h2 id="build-title" className="display build__title">The bench prototype is working.</h2>
              <p className="build__date">Build update, 5 October 2026</p>
              <p className="build__lede">
                The flex PCB is assembled, wrapped inside a black ceramic housing, and
                powered up with its green LED lit. Every other ring on this page is a
                render of the CAD model. This is a photograph of the one on the bench.
              </p>
              <p className="build__lede">
                Next we’re taking it to <abbr title="University of Vermont">UVM</abbr>’s
                lab to test the Bluetooth on a vector network analyzer. After that, beta
                testers.
              </p>
              <p className="build__more">
                <a className="textlink" href="/prototype">See the bench prototype</a>
              </p>
            </Reveal>

            <Reveal delay={90}>
              <figure className="build__fig">
                <img
                  className="build__photo"
                  src={benchPhoto}
                  width={1200}
                  height={1600}
                  loading="lazy"
                  alt="The NERVA Ring bench prototype standing on a dark table. Inside the black ceramic band, the flex PCB lines the inner wall with a lit green LED and two round gold contacts."
                />
                <figcaption>NERVA Ring Bench Prototype with Black Ceramic Housing</figcaption>
              </figure>
            </Reveal>
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
              <h2 className="config__title">Ceramic in four finishes</h2>

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
                      onClick={() => { setFinish(f.id); setVoted(true) }}
                    />
                  ))}
                </div>
                {/* draft copy for Ryan: the swatches double as a vote, so the
                    Kickstarter can launch with the finishes people pick */}
                <p className="config__vote">
                  Pick the one you would back. It goes in with your email, so the
                  Kickstarter launches with the finishes people want.
                </p>
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
              {/* the same offer, in the same words, as /waitlist: the list is
                  how the Kickstarter launch reaches people first */}
              <p className="cta__lede">
                It launches on Kickstarter in early 2027.
              </p>
              <ul className="perks">
                <li>Hear about the launch before it goes public.</li>
                <li>First pick of the limited early-bird tier.</li>
                <li>
                  Share your link to move up the list. The front of the list gets first
                  pick of beta-tester spots.
                </li>
              </ul>
              {voted && (
                <p className="cta__pick">
                  <span className="cta__pick-swatch" style={{ background: active.swatch }} aria-hidden="true" />
                  <span>Your pick: <b>{active.label}</b></span>
                  <a href="#finish">Change</a>
                </p>
              )}
              <Signup extra={voted ? { 'fields[finish]': active.id } : undefined} />
              <p className="cta__fine">
                Written by the person building it, no spam. Your address goes to
                Kit and the waitlist’s own database, nowhere else.{' '}
                <a href="/privacy">What this site collects</a>.
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
                <a href="#follow">Get updates</a>
                <a href="/science">Science</a>
                <a href="/updates">Build log</a>
                <a href="/prototype">Prototype photos</a>
                <a href="/press">Press</a>
                <a href="/privacy">Privacy</a>
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
                on this site is for sale. Every ring image on this page is a render
                of the CAD model except the one labelled as a photograph of the bench
                prototype; the prototype page has more of those. The app screens are
                a design demo, not live data.{' '}
                <a href="/privacy">Privacy and disclaimers</a>.
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
            <span>Launches on Kickstarter in early 2027.</span>
          </p>
          <a className="btn btn--led" href="#follow">Get launch updates</a>
        </div>
      </div>
    </>
  )
}

export default App
