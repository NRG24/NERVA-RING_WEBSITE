import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { FAQ } from './src/faq.ts'
import { UPDATES } from './src/updates.ts'

const SITE = 'https://nervaring.com'
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* Things that are generated from the site's own data, so they cannot drift
   from it: the FAQPage JSON-LD on the main page (from src/faq.ts) and the
   Atom feed of the build log at /updates.xml (from src/updates.ts). */
function siteData(): Plugin {
  const feed = () => {
    const latest = UPDATES[0].date
    const entries = UPDATES.map((u) => `  <entry>
    <title>${esc(u.title)}</title>
    <link href="${SITE}${u.link?.href ?? '/updates'}"/>
    <id>${SITE}/updates#${u.date}</id>
    <updated>${u.date}T12:00:00Z</updated>
    <content type="html">${esc(u.body.map((p) => `<p>${esc(p)}</p>`).join(''))}</content>
  </entry>`).join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>NERVA Ring build log</title>
  <subtitle>Dated updates on the NERVA Ring prototype, from the person building it.</subtitle>
  <link href="${SITE}/updates.xml" rel="self"/>
  <link href="${SITE}/updates"/>
  <id>${SITE}/updates</id>
  <updated>${latest}T12:00:00Z</updated>
  <author><name>Ryan Schreiber</name></author>
${entries}
</feed>
`
  }
  return {
    name: 'nerva-site-data',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!/[\\/]index\.html$/.test(ctx.filename)) return html
        const ld = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
        return {
          html,
          tags: [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(ld), injectTo: 'head' }],
        }
      },
    },
    configureServer(server) {
      server.middlewares.use('/updates.xml', (_req, res) => {
        res.setHeader('Content-Type', 'application/atom+xml')
        res.end(feed())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'updates.xml', source: feed() })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteData()],
  build: {
    // One entry per page. Vite only picks up index.html on its own, so
    // every other page is listed here: the build site, the store preview
    // at /buy.html, the privacy / disclaimer sheet, the bench-prototype
    // photos at /prototype, the bare signup form at /waitlist, /subscribed
    // where Kit sends people after they sign up, then /science, /updates
    // and /press, and 404.html, which Cloudflare serves for unknown paths.
    rollupOptions: {
      input: Object.fromEntries(
        [
          ['main', 'index.html'],
          ['buy', 'buy.html'],
          ['privacy', 'privacy.html'],
          ['prototype', 'prototype.html'],
          ['waitlist', 'waitlist.html'],
          ['subscribed', 'subscribed.html'],
          ['science', 'science.html'],
          ['updates', 'updates.html'],
          ['press', 'press.html'],
          ['notfound', '404.html'],
        ].map(([k, f]) => [k, fileURLToPath(new URL(`./${f}`, import.meta.url))]),
      ),
    },
  },
})
