/* ------------------------------------------------------------------
   A trial of the home page, served at /preview and linked from nowhere.
   Ryan asked (9 Nov 2026) for something more radical that reads like
   Oura's page and not like a generated one. This is the main page with
   most of it taken away:

     - five sections, each one picture and one thought
     - two grounds only, black and a warm bone, meeting on hard edges
     - large, light type; no glow rings, traces, pills or section fades
     - the bench photograph given half the screen, edge to edge

   The signal readout, the part list, the finish vote and the build
   meter are not here; they stay on the live page, /science and
   /prototype. Nothing on the live page changes because of this file.
   If Ryan picks it, it replaces App.tsx; if not, delete preview.html,
   this file, preview-main.tsx, preview.css and the vite.config entry.
   ------------------------------------------------------------------ */

import { useEffect, useRef, useState } from 'react'
import benchPhoto from './assets/proto-bench.webp'
import todayScreen from './assets/does-today.webp'
import { Signup, CONTACT_EMAIL } from './Signup.tsx'
import { SkipLink } from './Chrome.tsx'
import { SITE_LINKS } from './siteLinks.ts'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* One skin-conductance line: a level baseline with four responses, each a
   quick rise and a slow fall. The same shape /science explains, drawn
   once and left still. Seconds on x, arbitrary conductance on y. */
function edaPath(w: number, h: number) {
  const events = [
    { t: 2.2, a: 0.34 },
    { t: 6.4, a: 0.62 },
    { t: 10.1, a: 1 },
    { t: 15.2, a: 0.46 },
  ]
  const span = 20
  const pts: string[] = []
  for (let i = 0; i <= 400; i++) {
    const t = (i / 400) * span
    let y = 0
    for (const e of events) {
      const dt = t - e.t
      if (dt > 0) y += e.a * (1 - Math.exp(-dt / 0.35)) * Math.exp(-dt / 2.6)
    }
    const px = (t / span) * w
    const py = h - 8 - y * (h - 16) * 0.86
    pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`)
  }
  return pts.join(' ')
}

/* The hero film plays once and holds its last frame. Under reduced
   motion, or if the browser refuses to play it, the still stands in. */
function HeroFilm() {
  const [still, setStill] = useState(reducedMotion)
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.play().catch(() => setStill(true))
  }, [])
  const alt = 'The NERVA Ring in the dark, its inner band showing the green optical sensor and a gold electrode.'
  if (still) return <img className="pv-hero__film" src="/nerva-levitate-still.webp" width={1080} height={1080} alt={alt} />
  return (
    <video
      ref={ref}
      className="pv-hero__film"
      src="/nerva-levitate.mp4"
      poster="/nerva-levitate-poster.webp"
      muted
      playsInline
      preload="auto"
      onError={() => setStill(true)}
      aria-label={alt}
    />
  )
}

/* the breathing screen loops only while it is on screen */
function BreatheFilm() {
  const ref = useRef<HTMLVideoElement>(null)
  const [still] = useState(reducedMotion)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const alt = 'The NERVA app during a breathing exercise: breathe 5 seconds in and 5 seconds out.'
  if (still) return <img src="/nerva-breathe-poster.webp" width={746} height={932} loading="lazy" alt={alt} />
  return (
    <video ref={ref} src="/nerva-breathe.mp4" poster="/nerva-breathe-poster.webp" muted loop playsInline preload="none" aria-label={alt} />
  )
}

export default function Preview() {
  return (
    <div className="pv">
      <SkipLink />
      <header className="pv-nav">
        <a className="pv-nav__brand" href="/" aria-label="NERVA Ring home">NERVA Ring</a>
        <a className="pv-nav__cta" href="#join">Get updates</a>
      </header>

      <main id="main">
        {/* ---- 1. the ring ---- */}
        <section className="pv-hero" aria-labelledby="pv-title">
          <HeroFilm />
          <div className="pv-hero__copy">
            <h1 id="pv-title">The ring that reads your nervous system.</h1>
            <p>Heart rate, blood oxygen and stress, read from your finger all day.</p>
            <a className="pv-btn" href="#join">Get launch updates</a>
          </div>
        </section>

        {/* ---- 2. the signal ---- */}
        <section className="pv-signal" aria-labelledby="pv-signal-title">
          <div className="pv-wrap pv-signal__grid">
            <h2 id="pv-signal-title">Your skin reacts to stress before you notice it.</h2>
            <div className="pv-signal__txt">
              <p>
                Two gold electrodes inside the band read skin conductance, the signal
                stress research uses. Most rings measure your heart. NERVA Ring measures
                both.
              </p>
              <a className="pv-link" href="/science">How skin conductance works</a>
            </div>
          </div>
          <figure className="pv-trace">
            <svg viewBox="0 0 1200 150" preserveAspectRatio="none" role="img" aria-label="A skin-conductance line: level, then four rises of different heights, each falling back slowly.">
              <path d={edaPath(1200, 150)} />
            </svg>
            <figcaption className="pv-wrap">An illustration of the signal, not a recording.</figcaption>
          </figure>
        </section>

        {/* ---- 3. the app ---- */}
        <section className="pv-app" aria-labelledby="pv-app-title">
          <div className="pv-wrap pv-app__grid">
            <div className="pv-app__txt">
              <h2 id="pv-app-title">See it build. Bring it down.</h2>
              <ul>
                <li>
                  <b>Gas pedal and brake</b>
                  How long you have spent in fight-or-flight, and how long at rest.
                </li>
                <li>
                  <b>Breathing exercises</b>
                  Train your nervous system to settle, and watch it get quicker.
                </li>
                <li>
                  <b>The everyday numbers</b>
                  Steps, calories burned and heart rate, next to your stress.
                </li>
              </ul>
              <p className="pv-note">The app screens are a design demo, not live data.</p>
            </div>
            <div className="pv-app__screens">
              <img src={todayScreen} width={746} height={932} loading="lazy" alt="The NERVA app, the Today screen, with demo data: back down in 9 minutes, a reserve of 39, and two spikes in the day so far." />
              <BreatheFilm />
            </div>
          </div>
        </section>

        {/* ---- 4. the real one ---- */}
        <section className="pv-proto" aria-labelledby="pv-proto-title">
          <img
            className="pv-proto__photo"
            src={benchPhoto}
            width={1200}
            height={1600}
            loading="lazy"
            alt="The NERVA Ring bench prototype on a dark surface, its green LED lit on the flex PCB inside the black ceramic band."
          />
          <div className="pv-proto__txt">
            <p className="pv-kicker">A photograph, 5 October 2026</p>
            <h2 id="pv-proto-title">It exists, and it is switched on.</h2>
            <p>
              The flex PCB is assembled, wrapped inside a black ceramic housing and
              powered up. Every other ring on this page is a render. This one is on the
              bench.
            </p>
            <p>
              Next it goes to UVM’s lab to have its Bluetooth tested. After that, beta
              testers.
            </p>
            <a className="pv-link" href="/prototype">See the bench prototype</a>
          </div>
        </section>

        {/* ---- 5. the list ---- */}
        <section className="pv-join" id="join" aria-labelledby="pv-join-title">
          <div className="pv-wrap pv-join__grid">
            <h2 id="pv-join-title">Kickstarter, early 2027.</h2>
            <div>
              <p className="pv-join__lede">
                Join the list to hear before it goes public, and for first pick of the
                limited early-bird tier.
              </p>
              <Signup />
              <p className="pv-note">
                Written by the person building it, about once a month. Your address goes
                to Kit and the waitlist’s own database, nowhere else.{' '}
                <a href="/privacy">What this site collects</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="pv-foot">
        <div className="pv-wrap pv-foot__in">
          <nav aria-label="Footer">
            {SITE_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
            <a href="/privacy">Privacy</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </nav>
          <p>
            NERVA Ring is a wellness product, not a medical device, and nothing on this
            site is for sale. © 2026 NERVA Ring, built by Ryan Schreiber.
          </p>
        </div>
      </footer>
    </div>
  )
}
