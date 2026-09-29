/* Colour schemes under trial. `?palette=almond` (or linen, blackberry,
   petal) sets data-palette on <html> before the first render, and
   index.css re-points the page's colour tokens from there. With no
   parameter the page is the dark design that is live now. When one is
   chosen, set data-palette in index.html and delete the others. */
export const PALETTES = ['almond', 'linen', 'blackberry', 'petal'] as const
export type Palette = (typeof PALETTES)[number]

const want = new URLSearchParams(window.location.search).get('palette')
if (want && (PALETTES as readonly string[]).includes(want)) {
  document.documentElement.dataset.palette = want
}

/* light palettes put the ring on a light ground, so the hero plays the
   white-background film, blended onto the palette colour in CSS */
export const lightHero = () => !!document.documentElement.dataset.palette
