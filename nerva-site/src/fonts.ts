/* Self-hosted type, bundled by Vite from @fontsource, so no page asks
   Google's servers for anything. Each face ships per-subset files behind
   unicode-range, so a visitor only downloads the Latin ones.

   Newsreader  display: headlines, with optical sizing, so the same file
               draws a fine-hairline display cut at 5rem and a sturdier one
               at 1.5rem. Italic only sets the one quoted guess on the page.
   Hanken      everything read in sentences, and the subheads.
   Plex Mono   readings, units, and part numbers. */
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/newsreader/opsz-italic.css'
import '@fontsource-variable/hanken-grotesk/index.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
