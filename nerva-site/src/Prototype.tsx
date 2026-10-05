/* ------------------------------------------------------------------
   The bench prototype, at /prototype.

   The one page on the site that shows photographs instead of renders.
   The privacy page and the main page's footer note both say which is
   which; if a photo ever lands on another page, fix those in the same
   commit.

   Both photos had their EXIF stripped on the way in (one carried GPS).
   Keep it that way for any photo added here.
   ------------------------------------------------------------------ */

import benchPhoto from './assets/proto-bench.webp'
import handPhoto from './assets/proto-hand.webp'
import { CONTACT_EMAIL, Signup } from './Signup.tsx'

const UPDATED = '5 October 2026'

/* where the build goes from here, in order */
const STAGES = [
  {
    when: 'Now',
    title: 'Running on the bench',
    body: <>This is the unit in the photos above.</>,
  },
  {
    when: 'Next',
    title: 'Bluetooth on the VNA',
    body: (
      <>
        We’re taking it to <abbr title="University of Vermont">UVM</abbr>’s lab to test
        the Bluetooth on a vector network analyzer. A ring is a hard place for an
        antenna: the housing and the finger inside it can both pull it off the
        2.4 GHz band Bluetooth runs on. The VNA shows how far, so we can tune it back.
      </>
    ),
  },
  {
    when: 'After that',
    title: 'Beta testers',
    body: <>Once the radio checks out, the ring needs to be worn every day by people who aren’t building it. That is where we’ll need beta testers.</>,
  },
] as const

export default function Prototype() {
  return (
    <>
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
          </a>
          <a className="btn btn--ghost" href="/">Back to the build</a>
        </div>
      </header>

      <main className="proto">
        <div className="wrap">
          <header className="proto__head">
            <h1 className="proto__title">The bench prototype is working.</h1>
            <div className="proto__intro">
              <p className="proto__date">Build update, {UPDATED}</p>
              <p className="proto__lede">
                The flex PCB is assembled, wrapped inside a black ceramic housing, and
                powered up with its green LED lit. Every other ring on this site is a
                render of the CAD model. These are photographs of the one on the bench.
              </p>
            </div>
          </header>

          {/* the big shot on the left, the in-hand one beside it with the
              caption under it, so the caption sits against both */}
          <figure className="proto__photos">
            <img
              className="proto__photo proto__photo--main"
              src={benchPhoto}
              width={1200}
              height={1600}
              alt="The NERVA Ring bench prototype standing on a dark table. Inside the black ceramic band, the flex PCB lines the inner wall with a lit green LED, two round gold contacts and a small silver one."
              fetchPriority="high"
            />
            <img
              className="proto__photo proto__photo--side"
              src={handPhoto}
              width={768}
              height={1024}
              alt="The same prototype resting in an open palm, its green LED glowing on the flex PCB inside the black ceramic band."
            />
            <figcaption className="proto__cap">
              NERVA Ring Bench Prototype with Black Ceramic Housing
            </figcaption>
          </figure>

          <section className="proto__next" aria-labelledby="next-title">
            <h2 id="next-title" className="proto__h2">What happens next</h2>
            <ol className="stages">
              {STAGES.map((st, i) => (
                <li key={st.when} className="stage-step">
                  <span className="stage-step__when">{st.when}</span>
                  <h3>{st.title}</h3>
                  <p>{st.body}</p>
                  {/* an arrow on to the next stage: right when they sit in a
                      row, down when they stack. The list order says the same
                      thing to a screen reader. */}
                  {i < STAGES.length - 1 && (
                    <span className="stage-step__arrow" aria-hidden="true">
                      <svg viewBox="0 0 44 12" fill="none">
                        <path d="M0 6 H42 M36 1 L42 6 L36 11" />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* the same deep band and form as the main page's signup */}
        <section className="cta proto__beta" id="beta" aria-labelledby="beta-title">
          <div className="wrap proto__beta-grid">
            <div>
              <h2 id="beta-title" className="display display--light">Want to be a beta tester?</h2>
              <p className="cta__lede">
                We aren’t taking testers yet. The update list hears first when we are.
              </p>
            </div>
            <div>
              <Signup />
              <p className="cta__fine">
                Written by the person building it, no spam. Your address goes to
                Buttondown and nowhere else.{' '}
                <a href="/privacy.html">What this site collects</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="shopfoot">
        <div className="wrap shopfoot__inner">
          <a className="brand" href="/">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
          </a>
          <p>
            © 2026 NERVA Ring - built by Ryan Schreiber. Not a medical device, and not
            for sale.{' '}
            <a className="shopfoot__link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            {' - '}
            <a className="shopfoot__link" href="/privacy.html">Privacy and disclaimers</a>
          </p>
        </div>
      </footer>
    </>
  )
}
