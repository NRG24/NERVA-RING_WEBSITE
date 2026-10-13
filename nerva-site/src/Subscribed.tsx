/* ------------------------------------------------------------------
   Where Kit sends people after they sign up (served at /subscribed).
   Set as the form's "redirect after subscribe" in Kit's settings.

   It's the signup band carried on: same deep green, same drawing, so
   it reads as the form answering rather than as a new site.
   ------------------------------------------------------------------ */

import blueprint from './assets/blueprint.webp'

const INSTAGRAM = 'https://www.instagram.com/nerva_ring/'

export default function Subscribed() {
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

      <main className="cta subd">
        <div className="wrap cta__grid">
          <div>
            <h1 className="display display--light">You’re on the list.</h1>
            <div className="subd__actions">
              <a className="btn btn--led btn--lg" href="/prototype">See the bench prototype</a>
              <a className="btn btn--lg subd__ig" href={INSTAGRAM} rel="noopener">
                Follow @nerva_ring
              </a>
            </div>
          </div>

          <div className="cta__sheet">
            <img
              src={blueprint}
              width={2600}
              height={1838}
              alt="Engineering drawing of the NERVA Ring housing and internal flex PCB, shown from three isometric views plus a face-on section, with title block."
            />
          </div>
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
