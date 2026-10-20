/* ------------------------------------------------------------------
   The build log, at /updates. Entries live in src/updates.ts. The same
   list is written out as an Atom feed at /updates.xml (vite.config.ts),
   so people can follow the build without the email list.
   ------------------------------------------------------------------ */

import { SiteHeader, SiteFooter, SkipLink } from './Chrome.tsx'
import { Signup } from './Signup.tsx'
import { UPDATES, formatDate } from './updates.ts'

export default function Updates() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="/updates" />

      <main id="main" className="sheet log">
        <div className="wrap">
          <h1 className="sheet__title">Build log</h1>
          <p className="sheet__lede">
            Where the ring is, newest first. Written by the person building it, and
            only what has happened.
          </p>
          <p className="log__feed">
            <a href="/updates.xml">Subscribe with a feed reader</a>
          </p>

          <ol className="log__list">
            {UPDATES.map((u) => (
              <li key={u.date + u.title} className="entry">
                <time className="entry__date" dateTime={u.date}>{formatDate(u.date)}</time>
                <div className="entry__body">
                  <h2>{u.title}</h2>
                  {u.body.map((p) => <p key={p}>{p}</p>)}
                  {u.link && <a className="entry__link" href={u.link.href}>{u.link.label}</a>}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <section className="cta science__cta" id="follow" aria-labelledby="follow-title">
          <div className="wrap science__cta-grid">
            <div>
              <h2 id="follow-title" className="display display--light">Get the next one by email.</h2>
              <p className="cta__lede">About once a month, and only when something has happened.</p>
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
