/* ------------------------------------------------------------------
   Privacy and disclaimers.

   Written from what the site actually does, not from a template. Every
   factual claim here is checkable against the source: there is no
   analytics, no cookie, and no storage call anywhere in src/, the only
   form posts to Buttondown, and the only other third-party origins the
   pages touch are Cloudflare (the host) and Google's font servers.

   If any of that changes, this page changes in the same commit.
   ------------------------------------------------------------------ */

import type { ReactNode } from 'react'

const CONTACT_EMAIL = 'nervaring@gmail.com'
const UPDATED = '12 September 2026'

/* one hanging label, one block of document */
function Clause({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="clause">
      <h2 className="clause__label">{label}</h2>
      <div className="clause__body">{children}</div>
    </section>
  )
}

export default function Legal() {
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

      <main className="sheet">
        <div className="wrap">
          <h1 className="sheet__title">Privacy and disclaimers</h1>

          {/* the same title block the main site's footer uses, so the legal
              sheet reads as another drawing off the same set */}
          <div className="titleblock sheet__block">
            <div className="tb tb--w2">
              <span className="tb__k">Applies to</span>
              <b className="tb__v">nervaring.com</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Last updated</span>
              <b className="tb__v">{UPDATED}</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Questions</span>
              <b className="tb__v">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </b>
            </div>
          </div>

          <p className="sheet__lede">
            This site runs no analytics, sets no cookies, and stores nothing in your
            browser. The only personal thing it can collect is an email address, and
            only if you type one into the update form.
          </p>

          <Clause label="If you join the update list">
            <p>
              Your address is posted to <b>Buttondown</b>, the service that runs the
              mailing list, tagged so I know the signup came from this site. Buttondown
              stores it. I keep no second copy anywhere else.
            </p>
            <p>
              It is used for one thing: emails about NERVA Ring, meaning build progress,
              prototypes, and eventually a launch. It is never sold, rented, traded, or
              handed to anyone else.
            </p>
            <p>
              Every email carries an unsubscribe link. You can also write to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and ask me to delete
              the record. No reason needed.
            </p>
          </Clause>

          <Clause label="Who else sees your visit">
            <dl className="party">
              <dt>Cloudflare</dt>
              <dd>
                Hosts the site, and sees what any web host sees: your IP address, your
                browser's user agent, and which file you asked for.
              </dd>

              <dt>Google Fonts</dt>
              <dd>
                The two typefaces load from Google's servers, so Google receives your IP
                address when the page fetches them. This is the one third party here I
                would rather not have, and self-hosting the font files would remove it.
              </dd>

              <dt>Shopify</dt>
              <dd>
                The store preview at <a href="/buy.html">/buy.html</a> is not connected to
                a store and collects nothing. If it is ever switched on, checkout will
                happen on Shopify's own pages and no card details will be entered on this
                site.
              </dd>
            </dl>
          </Clause>

          <Clause label="Not a medical device">
            <p className="clause__loud">
              NERVA Ring is a wellness product. It is not a medical device.
            </p>
            <p>
              It has not been evaluated or cleared by the FDA or by any other regulator.
              It is not designed, tested, or intended to diagnose, treat, cure, or prevent
              any disease or condition, and nothing it displays is a medical diagnosis.
            </p>
            <p>
              Heart rate, blood oxygen, and skin conductance are reported as wellness
              information. Do not use them to make a medical decision, and do not start,
              stop, or change any treatment because of a reading. If you think something
              is wrong with your health, talk to a clinician.
            </p>
          </Clause>

          <Clause label="What you are looking at">
            <p>
              Nothing on this site is for sale. NERVA Ring is a prototype in active
              development by one person, and the build status on the main page is the
              honest state of it.
            </p>
            <p>
              Every ring image on this site is a render of the CAD model, not a
              photograph of a finished unit. Parts, specifications, finishes, and
              timelines describe work in progress and will change.
            </p>
          </Clause>

          <Clause label="Changes to this page">
            <p>
              If this page changes in a way that affects what happens to your email
              address, that change goes out to the list rather than landing here quietly.
            </p>
          </Clause>
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
