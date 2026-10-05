# NERVA Website: Session Handoff

_Last updated: 2026-10-05. Read this, then `CLAUDEwebdesign copy.md` (design law)
and `nerva-ring-overview.md` (product facts)._

## What this is
Marketing / "follow the build" site for the **NERVA smart ring**, a solo-built
smart ring pairing heart rate and SpO₂ with **continuous GSR/EDA
(skin-conductance) sensing**. Early prototype, not for sale. Ryan Schreiber is
the sole builder. Contact is **nervaring@gmail.com**.

## Stack & how to run
- App lives in **`nerva-site/`**. React 19 + Vite + TypeScript. No router, no
  backend. Four HTML entry points, all listed in `vite.config.ts`:
  - `index.html` → `src/main.tsx` → `src/App.tsx` (the build site)
  - `buy.html` → `src/buy-main.tsx` → `src/Buy.tsx` (store preview, noindex)
  - `privacy.html` → `src/legal-main.tsx` → `src/Legal.tsx` (privacy + disclaimers)
  - `prototype.html` → `src/prototype-main.tsx` → `src/Prototype.tsx` (bench
    prototype photos, served at **`/prototype`**: Cloudflare's default
    `html_handling` drops the `.html`, and Vite's dev server does the same)
- The signup form lives in `src/Signup.tsx` (with `CONTACT_EMAIL`), shared by
  the main page and the prototype page.
- Styles: `src/index.css` holds the tokens and everything shared (buttons,
  nav, `.titleblock`, `.shopfoot`, `.cta`). `buy.css`, `legal.css` and
  `prototype.css` hold only their own page's furniture and are imported
  *after* index.css.
- Typecheck `npx tsc -b --pretty false`, lint `npx oxlint`, build `npm run build`.
  All three are currently clean; keep them that way.
- Dev server: `.claude/launch.json` runs on port 5188.
- Deploys to Cloudflare via `wrangler.jsonc` (static assets out of `dist`).

## Page structure (top → bottom)
**Direction: a consumer product page, not a spec sheet.** Ryan's references
are the Ultrahuman Ring PRO page (`/Reference website`). When he said the site
"looks more like a b2b website and less like a product website", this layout
is what fixed it. Build toward those screenshots, not away from them.

Sticky nav (What it does / Signals / Inside / Finishes) + hamburger
under 1080px. Every light section opens with a **centered** `.head`.

1. **Hero.** `nerva-levitate.mp4`: the ring rises out of the dark and settles,
   played **once**, holding its last frame (no loop). It runs at the render's
   own speed: 4.08s, 1080x1080, 24fps, re-encoded only for size (crf 22,
   faststart, 777KB). A 2x slowdown went live briefly and Ryan asked for the
   default speed back; interpolating it smeared the rim and blending ghosted
   it, so slowing it cleanly needs a slower render, not ffmpeg. The still
   (`nerva-levitate-still.webp`) is that last frame and shows under reduced
   motion (film never fetched), refused autoplay, or a load error. The film is
   square on pure black, standing as tall as the hero against the right edge;
   on phones it runs across the top with its bottom edge feathered, because
   the film opens with the ring rising in from below.
   **After it lands** (`onEnded`, or at once on the still) the hero gets
   `.is-resting`: the stage hovers a few pixels on a 7s cycle, and
   `.hero__pulse` glows off the green LED at 72 bpm (heartbeat-shaped
   keyframes, matching the readout's 72 bpm). The glow is pinned at
   41.9% / 37% of the stage, where the light module sits in the last frame;
   **re-measure it if the film changes.** Paused off screen; a steady faint
   glow and no hover under reduced motion.
2. **`#does`.** Charcoal (`--sheet: #1c1c1f`) with **no hard edge on either
   side**: the hero's black eases into it over `--fade-in`, and it eases into
   the light grey of `#signals` over `--fade-out`, in empty padding under the
   features so no text sits on mid-grey. Both fades are smoothstep-eased (four
   stops each); a linear dark-to-light ramp printed as a flat grey band. Ryan
   went through the other options first: a white section with the image in a
   card read as an island, pure black was too black with no break, and a
   rounded charcoal sheet over the hero was awkward. Centered white head,
   then the picture cards below. The app screens came in as a 2000px chat
   image; ask Ryan for originals if they need to be sharper. The phones say
   DEMO, and the footer and privacy page say the app screens are a design
   demo.
   **Picture cards** (`.cards`), the way Oura, Ultrahuman and RingConn show
   features: one rounded card per feature, picture on top at 4:5, channel
   stroke, heading and Ryan's copy under it. Three across above 1080px, a
   scroll-snap row you swipe below it (next card peeks in). Pictures:
   `does-today` (Today screen) and `does-ring` (silver ring) are cut from
   Ryan's app-and-ring render (`ring-app.webp`, now only in git history);
   the breathing card is a **looping film**, `public/nerva-breathe.mp4`
   (165KB, 10s at 25fps, faststart), made from Ryan's animated mockup
   `nerva_breathe_phone.webp` (repo root, 2.6MB, 250 frames with alpha):
   each frame set on a dark radial backdrop at 746x932 with the phone at
   ~76% width so the breath wave stays in frame. First and last frames
   match, so the loop has no seam. `CardFilm` fetches it only when the card
   is on screen, pauses it off screen, and never loads it under reduced
   motion, where `nerva-breathe-poster.webp` (frame 0) stands in. An earlier version put the whole render full
   width with a spotlight driven by tabs; Ryan preferred cards. **Better
   picture to ask Ryan for:** a Body/steps screen or the ring on a hand for
   the third card.
   **The title trace** (`.does__trace`): one green skin-conductance line
   across the page at the title's height, masked out behind the words, with
   a small response left of the title and the big one right of it. It is the
   same rise/decay model as the readout, placed by hand (`titleTrace()`), with
   a second placement for phones where the title fills half the width. It
   draws once by a **clip-path wipe**, not a dash animation: the stroke is
   `vector-effect: non-scaling-stroke`, which measures dashes on screen while
   `pathLength` measures them in the stretched viewBox, so a dash draw quit at
   ~69% at 1440px. Its `Reveal` waits until it is a third of the way up the
   screen (`margin` prop) so the draw happens while you look at it.
3. **`#signals`.** The EDA readout: both traces on a white card inside a grey
   stage, drawn like an app screen (red PPG + green EDA, generated from a
   seeded RNG so they never repeat). Caption under it says it is modeled, not
   recorded. Then the two notes, each keyed by a swatch of its own trace.
   Signals ends in a short eased fade to black (`--fade-black`, in extra
   bottom padding) so it does not cut from pale blue into the film. Its
   colour is `--signals-bg`; the almond override has to come after the
   generic `[data-palette] #signals` rule (same specificity).
4. ~~`#stress`~~ **removed** at Ryan's ask ("we already said what we
   needed to say"). The comparison it drew lives on in the FAQ answer
   "How is it different from other smart rings?".
5. **`FilmScroll`.** A full-bleed **exploded view**, scroll-scrubbed on desktop
   (`currentTime` follows scroll), autoplay-loop on touch, poster only under
   reduced motion. See the video notes below before touching it.
6. **`#inside`** (black). The reference's "Inside Out": centered head, macro
   render on the left (sticky), plain headings + copy on the right, part
   number small under each heading.
7. **`#finish`.** A product configurator like the reference: render big on the
   left; name, circular swatches (`aria-pressed`), "Finish. {name}", the build
   meter (counted off `LEDGER`, so it cannot drift) and a black pill CTA.
8. **`#faq`.** "Questions": native `details`/`summary` accordion, heading
   and contact email left, questions right. Every answer must be backed by
   `nerva-ring-overview.md` or the site's disclaimers; nothing about price,
   subscription or phone compatibility until those are decided.
9. **`#follow`.** Buttondown email capture on a deep green ground.
10. Footer as an engineering **title block**. Cell spans must tile each row of
   the 6-column grid exactly or the leftover gap prints as a solid hairline.
11. **Launch bar.** Fixed to the bottom where the reference pins price and
    "Continue". Shows once the hero is gone; hides while `#follow` or the
    footer is on screen; `inert` while hidden. It must never show a price.

## The prototype page (`/prototype`, added 5 Oct 2026)
Linked from the hero by a line under the two CTAs, **"New: See real
prototyping progress."** (Ryan's exact words; he had the green dot before
"New:" taken off),
and from the footer index. `prototype.html` hardcodes `data-palette="almond"`.
Top to bottom: headline left with the dated lede beside it; the two photos
(`src/assets/proto-bench.webp` large on the left, `proto-hand.webp` beside it)
with Ryan's caption **"NERVA Ring Bench Prototype with Black Ceramic
Housing"** under the small one; "What happens next" as three stages, each
under a plain hairline (Ryan had the green and gold status bars and the green
stroke over the caption taken off, so keep this page free of colour strips);
then the slate signup band asking for beta testers. Share card is
`public/og-prototype.jpg` (JPEG, 1200x630, cropped from the bench photo).
The facts on it are only what Ryan said: the bench prototype works, next is
Bluetooth testing on a VNA at UVM's lab, beta testers after that. It does
**not** claim the ring reads live data; the main readout's "not a recording"
caption and the build ledger were left as they were.
**Photos carry EXIF, and Ryan's iPhone shots carry GPS.** Strip it on the
way in (`convert in.jpg -auto-orient -strip ... out.webp`) and never commit
the original JPEGs.

## Colour scheme: **almond is live as the default** (29 Sep 2026)
`index.html` sets `data-palette="almond"` on `<html>`, so the first paint is
already almond. `?palette=dark` shows the original black design;
`?palette=linen|blackberry|petal` show the other trial schemes. When Ryan
settles for good, the other three blocks and the dark-only rules can go.

The light-scheme hero is **laid out after a reference Ryan chose** (a Nerva
mock with a sage circle behind the ring): the headline in the site's own
Hanken Grotesk at 500 with "nervous system." at 750 on one line (Ryan tried
and dropped a serif Newsreader headline and a kicker line above it), the
lede, a dark pill and
an underlined link, then a ruled strip of four facts (`HERO_FACTS` in
`App.tsx`: heart rate, skin conductance and blood oxygen from
`nerva-ring-overview.md`, and stress management, which replaced a battery
line at Ryan's ask). Behind the ring is a flat sage disc (`.hero__backdrop`,
`--pal-bg2`, 87% of the film frame) on its own layer, so it holds still while
the ring hovers. On desktop the film frame and disc are **placed directly
with left/top/width** (`--box`, the ring centre at 69% across and halfway
down the space above the strip), not with translate/transform: the resting
hover animates transform on the stage. At 1080px and below the ring and disc
take a square of their own at the top and the words start below it. The dark
design hides the strip and keeps its own headline. The earlier translate /
scale placement notes below are superseded.

Almond **swaps two section colours**: What it does is the sage-green
(`--sheet: #cdc6a5`, Dry Sage) and Signals is the blue from the linen scheme
(a pastel blue warmed toward the sage so it does not contrast with it,
`--almond-blue: #dce1de`, after two paler steps from Pale Sky), with the readout's backing panel lighter still. What
it does fades in from the almond hero and out into the blue (`--does-end`).
The page reads almond, green, blue. Tried before: the blackberry rose, then
blue What it does over sage Signals.

## Colour schemes on trial (`?palette=`)
Ryan picked four five-colour schemes. Each is switchable on the live page
with a URL parameter, and with none the page is the dark design:
`?palette=almond` (almond cream, sage, slate), `?palette=linen` (soft linen,
pale sky, olive), `?palette=blackberry` (bone, almond silk, blackberry) and
`?palette=petal` (powder petal, blush, dusty olive). `src/palette.ts` sets
`data-palette` on `<html>` before first render; the end of `index.css` maps
each scheme onto the page's own tokens (`--paper`, `--ink`, `--accent`...),
so everything that reads them follows. Roles: light ground, a tint for
alternating sections, an accent (the title trace), and a deep band for
Inside, the signup, the launch bar and every primary button. Almond and petal
had no colour dark enough to carry white text, so their band is their
darkest colour taken darker (4.5:1 checked). The sensing channels keep
green / red / gold; the exploded-view film stays black.

**Ryan's favourite so far is almond.** The light schemes play the **ceramic
render with a transparent background**, so the ring sits straight on the
palette colour with no blending: `nerva-levitate-ceramic.webm` (VP9 with
alpha, 1.07MB, re-encoded from Ryan's `nerva_air_levitate_ceramic_alpha.webm`
at the repo root) for Chrome, Edge and Firefox, and
`nerva-levitate-ceramic.webp` (animated WebP with alpha, 810px, plays once,
1.5MB) for Safari and every iPhone/iPad browser, because **WebKit plays VP9
WebM but drops its alpha and paints a black square**. `WEBKIT_ONLY` in
`App.tsx` picks the path by user agent; the WebP has no ended event, so
the resting state starts 4.1s after it loads. Both end on
`nerva-levitate-ceramic-still.webp` (transparent last frame), which is also
the reduced-motion image. The ring lands in the middle half of its frame
(x 20-75%). Ryan asked for it bigger and further left, so on wide screens
the stage is `translate: 14% 1%; scale: 1.08` (Ryan moved it lower and
right twice, from 5% -10%): it sits level with the headline, and its lower
left curve above "system." (checked at 1280, 1366, 1440, 1536 and 1920);
between 1081 and 1250px it stays at 12% / 0.9, where it would hit the
headline. That offset is set with
the individual `translate` / `scale` properties, **not `transform`**: the
resting hover animates `transform` and replaced it on landing, so the ring
jumped 240px left. The LED glow sits at
42% / 36.2% at width 24% (measured off a close-up of the LED; a colour
threshold over the whole frame caught reflections and put it 3% right). The white-ground film tried first is gone. **To pick one**: set
`data-palette="<name>"` on `<html>` in `index.html` (or make it the default in
`palette.ts`) and delete the other three blocks.

## Earlier versions of the site
Every earlier state is a commit in `main`'s history, so none of it is lost.
To look at one, `git checkout <commit>` then `npm run build`; to put one back
live, deploy that build. (Tags could not be pushed from the cloud session;
`git tag archive/<name> <commit> && git push --tags` from a laptop adds them.)

| Commit | What it is |
|---|---|
| `27cac32` | The site before the 27 Sep work: warm paper, chart-recorder strip, original hero film |
| `0a480d9` | Design cleanup + every image as WebP (PR #14) |
| `d5e9bb8` | Newsreader headline experiment. Never went live; Ryan read it as B2B |
| `3b9cdbd` | Product-page rebuild after the Ultrahuman references, old hero film |

The old hero files (`ring_void_16x9_0001-0400.mp4`,
`ring_03_black_glass_web.webp`) left `public/` with the new hero; they live on
in those commits.

## Video: read this before touching the films
Both files are **faststart** (moov atom before mdat) and must stay that way;
without it nothing plays until the whole file lands.

`nerva-exploded.mp4` is **scroll-scrubbed**, so it is encoded with a uniform
half-second GOP (`-g 12 -keyint_min 12 -sc_threshold 0`). A sparse GOP makes
every seek decode a long way back and the scrub goes to mush. Re-encode with:

```
ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 21 \
  -g 12 -keyint_min 12 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart out.mp4
```

The poster is **frame 0**. Scroll progress 0 maps to time 0, so the still the
browser paints before the file arrives is the frame the scrub starts on and
nothing jumps.

**The scrub does not blanket-download the file.** It sends one two-byte Range
request first: a 206 means it scrubs off the network and fetches only what a
seek lands on; anything else falls back to downloading a blob, for a host that
answers Range with a flat 200. Do not "simplify" that back into an
unconditional fetch, and do not assume either branch: test it.

Watch the weight. The old sensor film was 960x540 at **4271 kb/s**, four times
the bitrate of the 1080p hero, for 12.4MB. Anything over ~1500 kb/s at 540p is
a re-encode waiting to happen.

## HARD user directives (do not regress)
- **Zero em dashes** anywhere in copy. Rewrite the sentence, don't swap the
  punctuation. Currently 0 in the .tsx and .html files. Keep it that way.
- **No AI-slop patterns.** Ryan spots them instantly. Banned: symmetric
  light/dark chip-cards, monospace pill chips, mono-UPPERCASE eyebrows on
  every section, `real`/`actually`/`genuine` intensifiers, "it's not X it's Y"
  stacks. Tie new sections to the physiology or the hardware, not to a
  generic feature grid. No purple gradients.
- **Pictures over paragraphs.** The last round cut the stress section from
  ~180 words to ~60 and added a render. If a section is turning into prose,
  that is the signal to draw it instead.
- **Claims stay hedged.** The site says "most rings", never "every other
  ring". Keep it that way.
- **Commerce:** no Shopify and no payment backend for now. Email list only;
  pre-order money should route through crowdfunding.
- All `:hover` rules live inside `@media (hover: hover)` so a tapped control
  does not keep a stuck highlight.
- **Shapes and type follow the references.** Pills for buttons, fields and
  swatches (`--radius-sm: 999px`); grey stages at `--radius-lg: 28px`. Hanken
  Grotesk semibold (600) for heads, tight tracking; Plex Mono only for part
  numbers and tick labels. An earlier pass tried square corners and a journal
  serif (Newsreader); Ryan read that as B2B. Do not bring either back.
- **No stock icons.** Features carry a short stroke in their channel color;
  the signal notes carry a swatch of their own trace as a legend key.
- The readout carries a caption saying it is modeled, not recorded. Remove it
  only when it is a real capture off the ring.
- Ryan changed `·` to ` - ` in the footer and part-number strings himself.
  Those are his, leave them.

## Facts that must agree across the site
The battery is **22 mAh** and the target is **about a month of standby**, not
"days" (`nerva-ring-overview.md` is the source of truth). App.tsx said 23 mAh
and "days" until recently. The privacy page and the main footer note say
**every ring image on the main page is a CAD render, and the photographs are
on the prototype page**. If a photo lands anywhere else, fix both in the same
commit.

## Email signup (Buttondown)
Set `VITE_BUTTONDOWN_USERNAME` to the account name only; the form builds the
endpoint itself. Unset, it refuses to submit and says so rather than posting
into the void. **It is a native form POST on purpose. Do not "fix" it into a
fetch()**. A subscriber sometimes has to follow the response to clear a
CAPTCHA, and an XHR swallows that, so they look subscribed and never land on
the list. There is deliberately no success state in our UI.

## Known open items
1. ~~Self-host the fonts~~ done via `@fontsource` packages, imported once in
   `src/fonts.ts`. The privacy page no longer lists Google; if a font ever
   loads from a CDN again, that clause has to come back in the same commit.
2. ~~Image weight~~ done. The hero still and every render in `src/assets`
   are WebP now (4.9MB of JPEG/PNG down to 1.3MB). Renders were encoded at
   q86, the blueprint at q90 to keep its hairlines. `og-image.jpg` stays JPEG
   on purpose: some link-preview scrapers still refuse WebP.
3. ~~`<noscript>`~~ done. Still no React error boundary: one throw blanks
   the site.
4. No security headers. A Cloudflare `_headers` file would add CSP,
   X-Content-Type-Options, Referrer-Policy, HSTS.
5. `wrangler.jsonc` has no `not_found_handling`, so unknown paths get a bare
   Cloudflare 404 rather than a branded one.
6. No CI. Nothing runs typecheck/lint/build on push.
7. No analytics, so a launch cannot be measured. Deliberate so far; the privacy
   page currently promises none, so adding any means editing that page too.
8. `src/shopify.ts` defaults to Storefront API `2026-07`. Check Shopify's
   release calendar before switching the store on; a version older than a year
   stops being served.
9. Main site shows Black/Blue/Coffee/Pink ceramic; the store preview still
   offers Graphite/Champagne Gold. Two different product lines.
10. `hello@nervaring.com` was replaced by `nervaring@gmail.com`. Confirm the
    domain `nervaring.com` itself is live: it is hardcoded in canonical, OG,
    Twitter and sitemap URLs.

## Cloud-session gotchas
- **Pasted images sometimes never reach the container.** On 5 Oct the
  attached photos did land on disk (under the session's `images/` folder);
  in earlier sessions an image pasted into the composer was rendered into
  the conversation only. If the bytes are missing, push the art to the
  branch (GitHub's web uploader works) and pull.
- **ImageMagick (`convert`, with WebP) is preinstalled**, and so is
  `/usr/bin/ffmpeg`.
- If ffmpeg is ever missing, `npm i ffmpeg-static` pulls a full static build
  with libx264 and works fine through the proxy.
- The bundled Playwright Chromium has **no H.264**, so video never decodes in
  a headless check. You can verify which code path runs and what gets fetched,
  but the scrub itself needs a real browser.
- `vite preview` answers a zero-length Range with a 206 carrying the whole
  body, which is a dev-server quirk and not what Cloudflare does.
