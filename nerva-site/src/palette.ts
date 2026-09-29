/* Colour schemes. Almond is the site's scheme: index.html sets
   data-palette="almond" on <html> so the very first paint is already
   almond. `?palette=linen` (or blackberry, petal) swaps to another trial
   scheme, and `?palette=dark` shows the original black design, which is
   the page with no data-palette at all. */
export const PALETTES = ['almond', 'linen', 'blackberry', 'petal'] as const
export type Palette = (typeof PALETTES)[number]

const want = new URLSearchParams(window.location.search).get('palette')
if (want === 'dark') {
  delete document.documentElement.dataset.palette
} else if (want && (PALETTES as readonly string[]).includes(want)) {
  document.documentElement.dataset.palette = want
}

/* light palettes put the ring on a light ground, so the hero plays the
   transparent ceramic render instead of the glass ring on black */
export const lightHero = () => !!document.documentElement.dataset.palette
