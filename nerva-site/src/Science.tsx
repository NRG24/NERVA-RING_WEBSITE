/* ------------------------------------------------------------------
   How skin conductance works, at /science.

   The page that answers the question the product raises: what is the
   ring reading, and what can it honestly say. It also carries the
   searches nobody else on the site answers ("electrodermal activity
   ring", "skin conductance response").

   Everything here is textbook electrodermal physiology, stated with
   its limits. Nothing claims what the NERVA firmware does yet. Keep it
   that way, and keep the "not a recording" line on the figure.
   ------------------------------------------------------------------ */

import type { ReactNode } from 'react'
import { SiteHeader, SiteFooter, SkipLink } from './Chrome.tsx'
import { CONTACT_EMAIL, Signup } from './Signup.tsx'

const UPDATED = '16 October 2026'

/* ---------- the response, drawn ----------
   One skin-conductance response in the textbook shape: flat, a trigger,
   a pause, a fast rise, a slow fall. Same rise/decay model as the
   readout on the main page. The numbers on it are the labels in the
   key under the drawing, which is HTML so it stays legible on a phone. */
const BASE = 190
const PEAK = 70
const T0 = 150          // the trigger
const ONSET = 200       // where the rise begins
const TOP = 262         // the peak
const TAU = 110         // decay time constant, in drawing units

const FALL = Array.from({ length: 24 }, (_, i) => {
  const x = TOP + i * 15
  const y = BASE - (BASE - PEAK) * Math.exp(-(x - TOP) / TAU)
  return `L${x} ${y.toFixed(1)}`
}).join(' ')
const HALF_X = TOP + TAU * Math.LN2
const HALF_Y = BASE - (BASE - PEAK) / 2

function Pin({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g className="scr__pin">
      <circle cx={x} cy={y} r={15} />
      <text x={x} y={y + 5.5} textAnchor="middle">{n}</text>
    </g>
  )
}

const KEY: { n: number; k: string; v: ReactNode }[] = [
  { n: 1, k: 'Resting level', v: 'Skin conductance sits at a baseline that drifts slowly over minutes. This is the tonic level.' },
  { n: 2, k: 'A trigger', v: 'A sound, a breath you did not expect, a hard thought. The sympathetic nervous system fires.' },
  { n: 3, k: 'A short pause', v: 'Nothing shows for roughly one to three seconds, the time the signal takes to reach the glands and sweat to reach the skin.' },
  { n: 4, k: 'The rise', v: 'Conductance climbs quickly. How far it climbs is the amplitude of the response.' },
  { n: 5, k: 'The fall', v: 'It drifts back down more slowly than it rose. How long it takes to fall halfway is one of the standard measures.' },
]

function Response() {
  return (
    <figure className="scr">
      <div className="scr__sheet">
        <svg
          viewBox="0 0 640 250"
          role="img"
          aria-label="A drawing of one skin-conductance response. A flat baseline, a trigger marked by a dashed line, a short pause, a fast rise to a peak, and a slower fall back toward the baseline. Five numbered markers match the key below."
        >
          <path className="scr__grid" d="M20 190 H620 M20 130 H620 M20 70 H620" />
          <path className="scr__rest" d={`M20 ${BASE} H${TOP}`} />
          <path className="scr__trigger" d={`M${T0} 24 V${BASE + 28}`} />
          <path className="scr__dim" d={`M${T0} 222 H${ONSET} M${TOP + 20} ${PEAK} V${BASE} M${TOP} 222 H${HALF_X}`} />
          <path className="scr__half" d={`M${HALF_X} ${HALF_Y} V222`} />
          <path
            className="scr__trace"
            d={`M20 ${BASE} H${ONSET} C${ONSET + 22} ${BASE} ${TOP - 26} ${PEAK} ${TOP} ${PEAK} ${FALL}`}
          />
          <Pin n={1} x={80} y={156} />
          <Pin n={2} x={T0} y={24} />
          <Pin n={3} x={(T0 + ONSET) / 2} y={246 - 8} />
          <Pin n={4} x={TOP - 6} y={166} />
          <Pin n={5} x={HALF_X + 80} y={HALF_Y - 22} />
          <text className="scr__axis" x="620" y="244" textAnchor="end">time</text>
          <text className="scr__axis" x="24" y="48">µS</text>
        </svg>
      </div>
      <ol className="scr__key">
        {KEY.map((r) => (
          <li key={r.n}>
            <span className="scr__n" aria-hidden="true">{r.n}</span>
            <div>
              <b>{r.k}</b>
              <p>{r.v}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="scr__cap">
        An illustration of the textbook shape, not a recording. Real responses vary
        in height, speed and timing from person to person and from one moment to
        the next.
      </figcaption>
    </figure>
  )
}

function Clause({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="clause">
      <h2 className="clause__label">{label}</h2>
      <div className="clause__body">{children}</div>
    </section>
  )
}

export default function Science() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="/science" />

      <main id="main" className="sheet science">
        <div className="wrap">
          <h1 className="sheet__title">How skin conductance works</h1>

          <div className="titleblock sheet__block">
            <div className="tb tb--w2">
              <span className="tb__k">Signal</span>
              <b className="tb__v">Electrodermal activity (EDA)</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Last updated</span>
              <b className="tb__v">{UPDATED}</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Corrections</span>
              <b className="tb__v">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </b>
            </div>
          </div>

          <p className="sheet__lede">
            The sweat glands in your fingers are wired to your sympathetic nervous
            system. When it fires, your skin conducts electricity a little better
            within a couple of seconds. A ring can measure that.
          </p>

          <Response />

          <Clause label="The wiring">
            <p>
              The glands involved are the eccrine sweat glands, the ones that open
              onto the surface of the skin. They are packed densely into the palms
              and the fingers, and they answer to the sympathetic nervous system,
              the side that mobilizes you.
            </p>
            <p>
              Heart rate is pushed and pulled by both branches of the nervous system
              at once, so a change in it does not say which branch moved. Eccrine
              glands are driven by the sympathetic branch alone, which is why skin
              conductance is a more direct read on arousal than heart rate is.
            </p>
          </Clause>

          <Clause label="Two layers of signal">
            <p>
              <b>The tonic level</b>, written SCL, is the slow baseline. It moves
              over tens of seconds to minutes with how alert, warm or settled you
              are.
            </p>
            <p>
              <b>The phasic response</b>, written SCR, is the quick bump on top of
              it, like the one drawn above. Some follow a clear trigger. Others,
              called spontaneous or non-specific responses, arrive with nothing you
              can point to, a few a minute in a resting person. Counting them and
              measuring their size is the standard way electrodermal research
              describes arousal.
            </p>
            <p>
              Both are measured in microsiemens (µS), a unit of how easily the skin
              passes a tiny current. A sensor measures it with a voltage small enough
              that you never feel it.
            </p>
          </Clause>

          <Clause label="Why a finger">
            <p>
              Palmar skin sweats in response to emotional arousal as well as heat,
              which is what makes the hand a good place to look for the signal. NERVA
              reads it with two dry gold-plated electrodes on the inner band, where
              they touch the finger all day without gel or a strap.
            </p>
            <p>
              A ring sits at the base of the finger, which has fewer glands than the
              fingertip or the palm, so the signal there is expected to be smaller.
              How much smaller, and how well it holds up through a day of ordinary
              wear, is one of the things the prototype testing is for.
            </p>
          </Clause>

          <Clause label="What muddies it">
            <p>
              A warm room or a workout makes you sweat for reasons that have nothing
              to do with arousal. Motion shifts how the electrodes touch the skin,
              dry skin conducts less, and a ring that is loose reads differently from
              one that fits. Any wearable that reports skin conductance has to deal
              with these, and the NERVA firmware that does so is not written yet.
            </p>
          </Clause>

          <Clause label="What it cannot say">
            <p>
              Skin conductance measures how aroused the nervous system is, not
              whether the arousal is good or bad. A frightening email and a
              thrilling one look alike. Baselines also differ widely between people,
              so a reading means most when compared with your own usual range.
            </p>
            <p className="clause__loud">
              NERVA Ring is a wellness product, not a medical device, and nothing it
              reads is a diagnosis.
            </p>
          </Clause>

          <Clause label="Where to read more">
            <ul className="refs">
              <li>
                Boucsein, W. <cite>Electrodermal Activity</cite>, 2nd ed. Springer, 2012.
                The standard reference text.
              </li>
              <li>
                Boucsein, W., et al. “Publication recommendations for electrodermal
                measurements.” <cite>Psychophysiology</cite>, 49(8), 2012. The field’s
                guidelines for how to record and report EDA.
              </li>
              <li>
                Dawson, M. E., Schell, A. M., and Filion, D. L. “The electrodermal
                system.” In <cite>Handbook of Psychophysiology</cite>, Cambridge
                University Press. A shorter introduction.
              </li>
            </ul>
          </Clause>
        </div>

        <section className="cta science__cta" id="follow" aria-labelledby="follow-title">
          <div className="wrap science__cta-grid">
            <div>
              <h2 id="follow-title" className="display display--light">Follow the build.</h2>
              <p className="cta__lede">
                Updates come from the person building the ring, about once a month.
              </p>
            </div>
            <div>
              <Signup />
              <p className="cta__fine">
                No spam. Your address goes to Kit and nowhere else.{' '}
                <a href="/privacy">What this site collects</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
