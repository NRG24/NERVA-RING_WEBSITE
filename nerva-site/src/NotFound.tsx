/* ------------------------------------------------------------------
   The 404, served by Cloudflare for any address the site does not have
   (wrangler.jsonc sets not_found_handling to "404-page"). Every path
   in it is absolute, because it can be shown at any depth.
   ------------------------------------------------------------------ */

import { SiteHeader, SiteFooter, SkipLink } from './Chrome.tsx'
import { SITE_LINKS } from './siteLinks.ts'

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />

      <main id="main" className="lost">
        <div className="wrap">
          <svg className="lost__trace" viewBox="0 0 640 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 40 H640" />
          </svg>
          <h1 className="lost__title">Nothing responds here.</h1>
          <p className="lost__lede">
            That address is not on this site. It may have moved, or the link may have
            a typo in it.
          </p>
          <div className="lost__links">
            <a className="btn btn--accent btn--lg" href="/">Back to the build</a>
            {SITE_LINKS.map((l) => (
              <a key={l.href} className="textlink" href={l.href}>{l.label}</a>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
