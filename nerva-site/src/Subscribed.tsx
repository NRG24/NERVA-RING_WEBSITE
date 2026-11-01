/* ------------------------------------------------------------------
   Where Kit sends people after they sign up (served at /subscribed).
   Set as the form's "redirect after subscribe" in Kit's settings.

   It's the signup band carried on: same deep green, same drawing, so
   it reads as the form answering rather than as a new site.

   /api/join set an HttpOnly cookie on the way to Kit, so /api/me can
   say where this person is on the list and hand back their share
   link. If that call fails (no cookie, other browser, D1 down) the
   page is what it always was: the confirmation and two links.
   ------------------------------------------------------------------ */

import { useEffect, useState } from 'react'
import blueprint from './assets/blueprint.webp'
import { SkipLink } from './Chrome.tsx'
import { KICKSTARTER_URL } from './siteLinks.ts'

const INSTAGRAM = 'https://www.instagram.com/nerva_ring/'

type Place = { position: number; total: number; code: string; referrals: number; boost: number }

function usePlace() {
  const [place, setPlace] = useState<Place | null>(null)
  useEffect(() => {
    const ctl = new AbortController()
    fetch('/api/me', { signal: ctl.signal, credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Place | null) => { if (d && typeof d.position === 'number') setPlace(d) })
      .catch(() => {})
    return () => ctl.abort()
  }, [])
  return place
}

function ShareLink({ code }: { code: string }) {
  const link = `https://nervaring.com/waitlist?ref=${code}&utm_source=referral`
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator.share === 'function'

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // clipboard refused: select the text so a long-press or Ctrl+C works
      const el = document.getElementById('share-link') as HTMLInputElement | null
      el?.select()
    }
  }

  function share() {
    navigator.share({
      title: 'NERVA Ring',
      text: 'A smart ring that shows stress building before it turns into burnout. Join the waitlist:',
      url: link,
    }).catch(() => {})
  }

  return (
    <div className="subd__share">
      <label htmlFor="share-link" className="sr-only">Your share link</label>
      <div className="signup">
        <input id="share-link" type="text" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
        <button className="btn btn--led btn--lg" type="button" onClick={canShare ? share : copy}>
          {canShare ? 'Share link' : copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p className="subd__status" role="status">{copied ? 'Link copied.' : ''}</p>
    </div>
  )
}

export default function Subscribed() {
  const place = usePlace()

  return (
    <>
      <SkipLink />
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="NERVA Ring home">
            <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
            NERVA Ring
          </a>
          <a className="btn btn--ghost" href="/">Back to the build</a>
        </div>
      </header>

      <main id="main" className="cta subd">
        <div className="wrap cta__grid">
          <div>
            <h1 className="display display--light">You’re on the list.</h1>

            {place && (
              <>
                <p className="cta__lede">
                  You’re number <b className="subd__num">{place.position.toLocaleString('en-US')}</b>{' '}
                  of {place.total.toLocaleString('en-US')}.
                  {place.referrals > 0 &&
                    ` ${place.referrals} ${place.referrals === 1 ? 'friend has' : 'friends have'} joined with your link.`}
                </p>
                <h2 className="subd__h">Move up the list</h2>
                <p className="subd__p">
                  Every friend who joins with your link moves you up {place.boost} places.
                  The front of the list gets first pick of beta-tester spots.
                </p>
                <ShareLink code={place.code} />
              </>
            )}

            <div className="subd__actions">
              {/* sharing is the one green button once it shows; this steps back */}
              <a key={place ? 'quiet' : 'lead'} className={`btn btn--lg ${place ? 'subd__ig' : 'btn--led'}`} href="/prototype">
                See the bench prototype
              </a>
              {KICKSTARTER_URL && (
                <a className="btn btn--lg subd__ig" href={KICKSTARTER_URL} rel="noopener">
                  Get notified on Kickstarter
                </a>
              )}
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
