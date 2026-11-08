/* ------------------------------------------------------------------
   Header, footer and skip link for the pages that are not the main
   build site (science, updates, press, prototype, privacy, 404). The
   waitlist and its thank-you page keep their own bare header on
   purpose: they are the end of a funnel, not a place to browse from.
   These are the ones to reuse for anything new.
   ------------------------------------------------------------------ */

import { CONTACT_EMAIL } from './Signup.tsx'
import { SITE_LINKS } from './siteLinks.ts'

export function SkipLink({ to = '#main' }: { to?: string }) {
  return <a className="skip" href={to}>Skip to content</a>
}

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="brand" href="/" aria-label="NERVA Ring home">
          <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
          NERVA Ring
        </a>
        <nav className="subnav" aria-label="Primary">
          {SITE_LINKS.map((l) => (
            <a key={l.href} href={l.href} aria-current={current === l.href ? 'page' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="btn btn--ghost" href="/">Back to the build</a>
      </div>
    </header>
  )
}

/* The header hides its page links on a phone, so the footer carries them
   too: whoever reaches the end of one page can go on to the next without
   going back through the build. */
export function SiteFooter({ current }: { current?: string }) {
  return (
    <footer className="shopfoot shopfoot--site">
      <div className="wrap shopfoot__inner">
        <a className="brand" href="/">
          <img className="brand__mark" src="/favicon.png" alt="" width={22} height={22} />
          NERVA Ring
        </a>
        <nav className="shopfoot__nav" aria-label="Footer">
          {SITE_LINKS.map((l) => (
            <a key={l.href} href={l.href} aria-current={current === l.href ? 'page' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <p>
          © 2026 NERVA Ring - built by Ryan Schreiber. Not a medical device, and not
          for sale.{' '}
          <a className="shopfoot__link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {' - '}
          <a
            className="shopfoot__link"
            href="/privacy"
            aria-current={current === '/privacy' ? 'page' : undefined}
          >
            Privacy and disclaimers
          </a>
        </p>
      </div>
    </footer>
  )
}
