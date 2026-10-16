/* ------------------------------------------------------------------
   Header, footer and skip link for the pages that are not the main
   build site (science, updates, press, 404). The older sub-pages carry
   their own copies; these are the ones to reuse for anything new.
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

export function SiteFooter() {
  return (
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
          <a className="shopfoot__link" href="/privacy">Privacy and disclaimers</a>
        </p>
      </div>
    </footer>
  )
}
