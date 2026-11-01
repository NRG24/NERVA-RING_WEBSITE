/* ------------------------------------------------------------------
   The waitlist on its own, served at /waitlist. It's the link for the
   Instagram bio and anywhere else that should land straight on the
   email field: one band, the form, and a real photo of the prototype.

   Link it with a source so Kit can count it, e.g.
   /waitlist?utm_source=instagram. Share links from /subscribed land
   here too, as /waitlist?ref=<code>&utm_source=referral.

   What the list is promised (Ryan, 1 Nov 2026): early notice of the
   Kickstarter and first pick of a limited early-bird tier. No price.
   Referrals move people up; the front of the list gets first pick of
   beta-tester spots. Keep the page to those promises.
   ------------------------------------------------------------------ */

import { useEffect, useState } from 'react'
import handPhoto from './assets/proto-hand.webp'
import { Signup } from './Signup.tsx'
import { SkipLink } from './Chrome.tsx'
import { SHOW_COUNT_FROM } from './siteLinks.ts'

/* how many are on the list, once that's worth saying */
function useListSize() {
  const [total, setTotal] = useState<number | null>(null)
  useEffect(() => {
    const ctl = new AbortController()
    fetch('/api/stats', { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total: number | null } | null) => {
        if (d && typeof d.total === 'number') setTotal(d.total)
      })
      .catch(() => {})
    return () => ctl.abort()
  }, [])
  return total !== null && total >= SHOW_COUNT_FROM ? total : null
}

export default function Waitlist() {
  const total = useListSize()
  const invited = new URLSearchParams(window.location.search).has('ref')

  return (
    <>
      <SkipLink />
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
          </a>
          <a className="btn btn--ghost" href="/">See the build</a>
        </div>
      </header>

      <main id="main" className="cta wait">
        <div className="wrap cta__grid">
          <div>
            <h1 className="display display--light">
              {invited ? 'A friend saved you a spot.' : 'Join the waitlist.'}
            </h1>
            <p className="cta__lede">
              NERVA Ring is a smart ring that reads your skin’s response to stress
              alongside your heart rate, so you can see stress building before it turns
              into burnout. It launches on Kickstarter in early 2027.
            </p>

            <ul className="wait__perks">
              <li>Hear about the launch before it goes public.</li>
              <li>First pick of the limited early-bird tier.</li>
              <li>
                Share your link to move up the list. The front of the list gets first
                pick of beta-tester spots.
              </li>
            </ul>

            <Signup autoFocus />
            {total !== null && (
              <p className="wait__count">{total.toLocaleString('en-US')} people are on the list.</p>
            )}
            <p className="cta__fine">
              Written by the person building it, about once a month. No spam. Your
              address goes to Kit, which sends the emails, and to the waitlist’s own
              database, which keeps your place in line. Nowhere else.{' '}
              <a href="/privacy">What this site collects</a>.
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
