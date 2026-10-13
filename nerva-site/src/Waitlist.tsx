/* ------------------------------------------------------------------
   The waitlist on its own, served at /waitlist. It's the link for the
   Instagram bio and anywhere else that should land straight on the
   email field: one band, the form, and a real photo of the prototype.

   Link it with a source so Kit can count it, e.g.
   /waitlist?utm_source=instagram
   ------------------------------------------------------------------ */

import handPhoto from './assets/proto-hand.webp'
import { Signup } from './Signup.tsx'

export default function Waitlist() {
  return (
    <>
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
          </a>
          <a className="btn btn--ghost" href="/">See the build</a>
        </div>
      </header>

      <main className="cta wait">
        <div className="wrap cta__grid">
          <div>
            <h1 className="display display--light">Join the waitlist.</h1>
            <p className="cta__lede">
              NERVA Ring is a smart ring that helps you manage your stress and avoid
              burnout. Get on the list to hear first when beta testing opens and when
              it launches.
            </p>
            <Signup autoFocus />
            <p className="cta__fine">
              Written by the person building it, about once a month. No spam. Your
              address goes to Kit and nowhere else.{' '}
              <a href="/privacy.html">What this site collects</a>.
            </p>
          </div>

          <figure className="wait__photo">
            <img
              src={handPhoto}
              width={768}
              height={1024}
              alt="The NERVA Ring bench prototype resting in an open palm, its green LED glowing on the flex PCB inside the black ceramic band."
            />
            <figcaption>The bench prototype. A photo, not a render.</figcaption>
          </figure>
        </div>
      </main>

      <footer className="shopfoot">
        <div className="wrap shopfoot__inner">
          <a className="brand" href="/">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
          </a>
          <p>© 2026 NERVA Ring - built by Ryan Schreiber</p>
        </div>
      </footer>
    </>
  )
}
