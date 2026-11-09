# NERVA Website: Session Handoff

_Last updated: 2026-11-08. Read this, then `CLAUDEwebdesign copy.md` (design law)
and `nerva-ring-overview.md` (product facts)._

## What this is
Marketing / "follow the build" site for the **NERVA smart ring**, a solo-built
smart ring pairing heart rate and SpO₂ with **continuous GSR/EDA
(skin-conductance) sensing**. Early prototype, not for sale. Ryan Schreiber is
the sole builder. Contact is **nervaring@gmail.com**.

## Stack & how to run
- App lives in **`nerva-site/`**. React 19 + Vite + TypeScript. No router. The only
  backend is the waitlist Worker under `worker/` (see "Waitlist and email signup" below). Ten HTML entry points, all listed in `vite.config.ts` (every page mounts through `src/mount.tsx`, which wraps it in an error boundary):
  - `index.html` → `src/main.tsx` → `src/App.tsx` (the build site)
  - `buy.html` → `src/buy-main.tsx` → `src/Buy.tsx` (store preview, noindex)
  - `privacy.html` → `src/legal-main.tsx` → `src/Legal.tsx` (privacy + disclaimers)
  - `prototype.html` → `src/prototype-main.tsx` → `src/Prototype.tsx` (bench
    prototype photos, served at **`/prototype`**: Cloudflare's default
    `html_handling` drops the `.html`, and Vite's dev server does the same)
  - `waitlist.html` → `src/waitlist-main.tsx` → `src/Waitlist.tsx` (just the
    signup form and a prototype photo, served at **`/waitlist`**; the link for
    the Instagram bio, as `/waitlist?utm_source=instagram`)
  - `subscribed.html` → `src/subscribed-main.tsx` → `src/Subscribed.tsx`
    (where Kit sends people after signup, served at **`/subscribed`**)
  - **Added 16 Oct 2026** (almond palette, shared `Chrome.tsx` header/footer/skip
    link, styles in `pages.css`): `science.html` at **/science** (how EDA
    works, with a drawn skin-conductance response; textbook physiology only,
    hedged, cites Boucsein), `updates.html` at **/updates** (build log, entries
    in `src/updates.ts`, also written out as the Atom feed `/updates.xml` by
    the `siteData` plugin in `vite.config.ts`), `press.html` at **/press**
    (facts, labelled render/photo downloads, how to describe it) and
    `404.html` (served by Cloudflare for unknown paths via `not_found_handling`).
    To post an update: add an entry at the top of `updates.ts` and bump the
    `/updates` lastmod in `public/sitemap.xml`.
  - The FAQ lives in `src/faq.ts`; the plugin also writes it into
    `index.html` as FAQPage JSON-LD at build time.
- The signup form lives in `src/Signup.tsx` (with `CONTACT_EMAIL`), shared by
  the main page and the prototype page.
- Styles: `src/index.css` holds the tokens and everything shared (buttons,
  nav, the sub-page header links `.subnav`, `.titleblock`, `.shopfoot`,
  `.cta`). `buy.css`, `legal.css` and
  `prototype.css` hold only their own page's furniture and are imported
  *after* index.css.
- **Shared sub-page chrome** (`src/Chrome.tsx`): `SiteHeader` and
  `SiteFooter` are on /science, /updates, /press, /prototype, /privacy and
  the 404. Both take `current` (a path) and mark that page. The page list
  is `SITE_LINKS` in `src/siteLinks.ts`. /waitlist and /subscribed keep
  their own bare header and footer on purpose (end of the funnel).
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
   (89KB, 10s at 25fps, faststart). Since 3 Nov 2026 it is made from Ryan's
   night-theme mockup `nerva_breathe_night.webp` (repo root, 1.7MB, 250
   frames with alpha; the older purple one, `nerva_breathe_phone.webp`, is
   still beside it): each frame set on a dark radial backdrop at 746x932,
   the phone at native size (566 wide) placed at +90+42, so the blue bpm
   panel starts at the card's bottom edge and the breath line, which dips
   to y 889 of the phone, stays in frame. The film starts at the mockup's
   frame 10, where the word is a clean "In" (frame 0 catches the In/Out
   crossfade), and the poster is that frame. The mockup's countdown jumps
   1:39 to 1:49 at the loop point; that is in Ryan's file.
   The Today card (`src/assets/does-today.webp`, 746x932) is Ryan's
   night-theme Today mockup framed exactly the same way (phone scaled to
   566 wide, at +90+42 on the same backdrop), so the two phones match. `CardFilm` fetches it only when the card
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
   reduced motion. See the video notes below before touching it. **Since
   8 Nov 2026, on desktops 1200px and up** (fine pointer, motion allowed;
   `labeledFilm` in `App`) it carries Inside the band itself: the head
   beside the assembled ring, then callouts while the ring holds apart
   (see "Main page changes, 8 Nov 2026" below).
6. **`#inside`** (black). The reference's "Inside Out": centered head, macro
   render on the left (sticky), plain headings + copy on the right, part
   number small under each heading (in the page's face and plain white
   since 8 Nov 2026; it was coloured mono). Rendered only where the film is not
   labelled (phones, tablets, narrower windows, reduced motion).
6a. **`#build`, "Progress"** (added 8 Nov 2026). The one photograph on the
   main page: the bench prototype with Ryan's caption, his headline and
   lede from /prototype, what comes next, one link to /prototype. Words
   left, photo right. Deliberately plain, see below.
7. **`#finish`.** A product configurator like the reference: render big on the
   left; name, circular swatches (`aria-pressed`), "Finish. {name}", the build
   meter (counted off `LEDGER`, so it cannot drift) and a black pill CTA.
   Since 8 Nov 2026 the swatches double as a vote that goes in with the
   signup (`fields[finish]`).
   Inside, Finishes and the signup bands (`.cta__grid`: here, /waitlist
   and /subscribed) keep their two columns down to 761px (Finishes
   splits 1:1 there) and stack at 760 and below. The Signals notes stay
   side by side until the 620px phone breakpoint. Stacking them at 1080
   (6 Nov 2026 fix) left half of each band empty on an iPad.
8. **`#faq`.** "Questions": native `details`/`summary` accordion, heading
   and contact email left, questions right. Every answer must be backed by
   `nerva-ring-overview.md` or the site's disclaimers; nothing about price,
   subscription or phone compatibility until those are decided.
9. **`#follow`.** Kit email capture on the scheme's deep band (slate on
   almond; the green ground is the `?palette=dark` design). Since 8 Nov 2026
   it makes the same offer as /waitlist, in the same words: the Kickstarter
   in early 2027 and the three perks (`.perks`, shared, in index.css).
10. Footer as an engineering **title block**. Cell spans must tile each row of
   the 6-column grid exactly or the leftover gap prints as a solid hairline.
   From 621 to 1080px it is three equal columns, because every partial row
   (here and in the /science, /press and /privacy headers) is three cells.
   Two columns there printed a grey block beside the third cell. A new
   row that isn't three cells needs its own tablet span.
11. **Launch bar.** Fixed to the bottom where the reference pins price and
    "Continue". Shows once the hero is gone; hides while `#follow` or the
    footer is on screen; `inert` while hidden. It must never show a price.
    Its line reads "Launches on Kickstarter in early 2027." (8 Nov 2026).

## The prototype page (`/prototype`, added 5 Oct 2026)
**Pitch video: taken down (3 Nov 2026).** A click-to-load Loom pitch sat
under the headline for an afternoon (commit 9d9a35e); Ryan pulled it to
record a new one. To bring one back, restore that commit's pitch block in
`Prototype.tsx` / `prototype.css` and, together, the CSP `frame-src` for
the host and its entry on the privacy page. The hero's "New:" line stays
a pill with an arrow mark, linking to `/prototype`.
Linked from the hero by a line under the two CTAs, **"New: See real
prototyping progress."** (Ryan's exact words; he had the green dot before
"New:" taken off),
and from the footer index. `prototype.html` hardcodes `data-palette="almond"`.
Since 8 Nov 2026 it uses the shared `SiteHeader` / `SiteFooter`.
Top to bottom: headline left with the dated lede beside it; the two photos
(`src/assets/proto-bench.webp` large on the left, `proto-hand.webp` beside it)
with Ryan's caption **"NERVA Ring Bench Prototype with Black Ceramic
Housing"** under the small one; "What happens next" as three stages with a
drawn arrow between each (right in a row, down when stacked). Ryan had the
green and gold status bars, the hairlines that replaced them and the green
stroke over the caption taken off, so keep this page free of strips and rules
there;
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
an underlined link. The ruled strip of four facts that sat under it
(heart rate, skin conductance, blood oxygen, stress management) was
**removed on 3 Nov 2026 at Ryan's ask**; `--strip` is now 0px, so the
ring centres in the full hero height. Don't bring it back. Ryan then asked for more colour and picked **direction D, pulse rings**
(3 Nov 2026): `.hero__ripples`, three rings behind the disc stepping from
`--pal-bg2` toward `--pal-bg`, centred on the ring's rest point with the
backdrop's geometry (`--cx`, `--cy`, `--rb` per breakpoint), masked out
before the hero's bottom edge, breathing in one slow 10 s swell once the
ring lands (paused off screen, still under reduced motion). They beat at
72 bpm for an hour and Ryan found the hero too quick and stark, so the
rings, LED glow, hover and disc rise were all softened the same day: keep
hero motion slow and small. **Since 9 Nov 2026 the circles are blended**
(Ryan: "make the green concentric circles more blended"): the disc and
each ring hold their colour to `--s` of their radius, then fade to clear
over four smoothstep stops, so each band runs into the next. A wider fade
turned them into one glow and lost the rings; keep them reading as rings.
If the
film or the backdrop geometry changes, change `--cx`/`--cy`/`--rb` too. Behind the ring is a sage disc (soft-edged since 9 Nov 2026) (`.hero__backdrop`,
`--pal-bg2`, 87% of the film frame) on its own layer, so it holds still while
the ring hovers. On desktop the film frame and disc are **placed directly
with left/top/width** (`--box`, the ring centre at 69% across and halfway
down the hero; the strip is gone), not with translate/transform: the resting
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

## Layout and keyboard rules added 6 Nov 2026
- **Landscape phones** (`max-width: 1080px and orientation: landscape and
  max-height: 560px`) get the wide-screen hero, words left and ring right,
  placed with the same `--box` geometry (ring centre at 74%). The stacked
  layout put the headline below the fold there. If the hero geometry
  changes, change this block too.
- **Scroll clearance** lives on the page, `html { scroll-padding: nav+20px
  0 96px }`, not as `scroll-margin` on each `[id]`. Anchors land where they
  did (84px down), and Tab / Shift+Tab never leave the focused control
  under the sticky nav or the launch bar.
- **Phone menu**: Escape hands focus back to the toggle; tabbing out of the
  header closes the panel.
- **Contrast on almond**: Finishes (the tint) has its own `--ink-3`,
  `--green-ink` and `--gold-ink`. All clear 4.5:1. (The part numbers on
  the slate band used lifted `--pulse` / `--gold` until 8 Nov 2026; they
  are plain white now.) axe-core reports no
  violations on any page; keep it that way.
- **320px**: sub-page headers tighten the back button below 361px.

## Layout and navigation changes added 8 Nov 2026
- **Landscape tablets** (900 to 1080px wide, landscape) get the
  landscape-phone hero block too: words left, ring right. An iPad held
  sideways is about 1080x740 in Safari, and the stacked hero there showed
  only the ring and the headline. A second block raises the type for
  heights of 561px and up; "nervous system." ends 145px or more short of
  the disc across that range. **If the hero geometry changes, change both
  landscape blocks.**
- **Film into Inside** (palette schemes only): Inside eases up out of the
  film's black into the band over `--fade-band`, smoothstep at quarters,
  mirroring the Signals fade. It was a hard black-to-slate line. The dark
  design is untouched (its Inside is black already).
- **What it does into Signals** (palette schemes only): `--fade-out` is
  `clamp(100px, 9vw, 140px)`, down from the dark design's 170 to 300px.
  Two pale tints need no long run, and the cards had left about 450px of
  empty colour above the Signals head at 1440.
- **Signup bands on tablets**: see item 7 above. /waitlist centres its
  column again from 761px up; only phones top-align it.
- **Sub-page navigation**: /prototype and /privacy now use `SiteHeader`
  and `SiteFooter`, so their header shows the page links like the others.
  `SiteFooter` lists `SITE_LINKS` as well, because the header hides them
  at 720px and below and phones had no way from one sub-page to another
  except back through the build. The /updates link reads **"Build log"**
  everywhere now (its title, and the main footer's word); "Updates" is
  left to mean the email list. The `.subnav` rules moved from `pages.css`
  to `index.css`, and the sub-page header keeps the 32px gutter down to
  621px so it lines up with the page.
- The hero's priority hint is `fetchPriority="high"` on the animated WebP
  only (React 19 warned about the old lowercase spread, and browsers
  ignore the hint on `<video>`).
- axe-core still reports no violations on any page (1440, 390 and
  1024x700).

## Main page changes, 8 Nov 2026 (approved by Ryan)
- **The labelled film.** `FILM_PARTS` in `App.tsx` lists each callout as a
  part and what it does, with its position in the film's 1280x720 frame at
  5, 6.5 and 8.5 s (read off the frames by hand; re-measure if the film is
  re-rendered). The page maps them through the film's object-fit: cover
  scale, puts the labels in a column at the right with a dark wash behind
  it, and draws a leader to each part. Ryan asked for "the parts, a dash,
  and what it does" in the page's own face and **white only**: the first
  try used coloured Plex Mono part numbers and he read them as code. The
  four callouts: Resin - waterproofing, Bluetooth module - brain and
  connection (Ryan: the ANNA-B402 module is the brain), Gold electrodes -
  stress, Optical sensor - heart rate. **The silver cylinder is not the
  battery** (the battery stays inside the housing in this film), so it has
  no callout. The label column is 300px wide at the right edge. With the film labelled, Inside is not
  rendered, so the next section eases out of the film's black
  (`.film--labeled + .section::before`).
- **Progress (`#build`)** is plain on purpose. A first try put the full
  build ledger beside the photo with a segmented meter, a coloured mark per
  milestone and a rule under every row; Ryan called it AI-looking, and those
  are exactly what he had taken off /prototype earlier. The meter lives in
  Finishes only.
- **The finish vote.** A swatch click sets `voted`; from then the signup
  form carries `fields[finish]` (`ceramic-black`, `blue`, `coffee` or
  `pink`), and the band shows "Your pick: {finish}" with a Change link. The
  Worker passes it to Kit untouched in the 307 and does not store it in
  D1. **Kit only keeps it once a custom field named `finish` exists**
  (Subscribers, open any subscriber, Add a new field), the same as
  `ref_code`. The Kit connector here needs a paid Kit plan, so Claude could
  not add it. The privacy page already says the pick goes to Kit.
- **Perks** (main page band and /waitlist): plain lines, no markers. The
  short stroke that keyed each line read as an em dash.

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
  generic feature grid. No purple gradients. Added 8 Nov 2026 after Ryan
  flagged them: no progress meters, coloured status marks or ruled
  checklists around the prototype; no dash-like list markers (they read as
  em dashes); no coloured monospace labels anywhere (Ryan read them as
  code, in the film and then in Inside the band, which went plain too).
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
  Grotesk semibold (600) for heads, tight tracking; Plex Mono only for tick
  labels and the SNS / PNS abbreviations (part numbers moved to the page's
  face, in white, on 8 Nov 2026). An earlier pass tried square corners and a journal
  serif (Newsreader); Ryan read that as B2B. Do not bring either back.
- **No stock icons.** The signal notes carry a swatch of their own trace as
  a legend key. (The feature cards used to carry a short coloured rule over
  each heading; Ryan had it taken off on 3 Nov 2026. Don't bring it back.)
- The readout carries a caption saying it is modeled, not recorded. Remove it
  only when it is a real capture off the ring.
- Ryan changed `·` to ` - ` in the footer and part-number strings himself.
  Those are his, leave them.

## Facts that must agree across the site
The battery is **22 mAh** and the target is **about a month of standby**, not
"days" (`nerva-ring-overview.md` is the source of truth). App.tsx said 23 mAh
and "days" until recently. The privacy page and the main footer note say
**every ring image on the main page is a CAD render except the one labelled
as a photograph of the bench prototype (Progress), and the other photographs
are on the prototype page** (and the waitlist page). If a photo lands
anywhere else, fix both in the same commit.

## Waitlist and email signup (Worker + D1 + Kit)
_Added 1 Nov 2026 on `claude/vigilant-goodall-6zcqsx`._ The plan and Ryan's
sign-in steps are in `launch/PLAN.md`.

- **Worker:** `nerva-site/worker/index.ts`, wired in `wrangler.jsonc`
  (`main`, `assets.binding: ASSETS`, `run_worker_first: ["/api/*"]`). Only
  `/api/*` runs it; every other path is a static file as before.
  `tsc -b` typechecks it (`worker/tsconfig.json`).
- **D1** database `nerva-waitlist`, binding `DB`. `wrangler.jsonc` has no
  `database_id` yet: the first deploy provisions it. **Pin the id it
  prints afterwards.** The table creates itself on first use;
  `worker/0001_signups.sql` is the same schema plus handy queries.
- **The form posts natively to `/api/join`.** The Worker stores the
  address and answers **307** to `https://app.kit.com/forms/10036721/subscriptions`,
  so the browser re-posts the identical body to Kit itself. That keeps the
  old reason for the native POST: Kit's CAPTCHA and redirect still happen
  in the browser. **Do not "fix" either hop into a fetch().** If D1 is
  missing or throws, the 307 still happens; a signup is never lost.
  An address already in D1 skips Kit and goes straight to `/subscribed`
  (so its `ref_code` in Kit isn't overwritten).
- Kit's form setting "redirect after subscribe" must stay
  `https://nervaring.com/subscribed`.
- **Fields posted** (and Kit custom fields Ryan has to create):
  `fields[source]` (utm_source or `nervaring.com`), `fields[ref_code]`
  (made in the page so Kit and D1 agree; the welcome email prints the
  share link with `{{ subscriber.ref_code }}`), `fields[referred_by]`
  (from `?ref=`). Honeypot `company`.
- **Referrals:** each credited friend moves you up `REF_BOOST` = 10 places
  (position = rank of `id - 10*referrals`). No credit when the friend is on
  the referrer's network (same salted IP hash) or that network already
  made 3 signups in a day.
- **`/subscribed`** reads `GET /api/me` off the HttpOnly cookie `nerva_wl`
  (random token, not the email) and shows "You're number N of M", the
  share link (Web Share on phones, copy elsewhere) and the Kickstarter
  button once `KICKSTARTER_URL` in `src/siteLinks.ts` is set. With no
  cookie it falls back to the plain confirmation.
- **`/waitlist`** shows the promise (Kickstarter early 2027, hear first,
  first pick of a limited early-bird tier, front of the list gets beta
  spots), "A friend saved you a spot." on a `?ref=` link, and the list
  size from `GET /api/stats` once it reaches `SHOW_COUNT_FROM` (50).
  Since 6 Nov 2026 it and `/subscribed` set `data-palette="almond"` like
  every other page (they had been left on the dark-green design, which
  did not match the almond Instagram posts). The field takes focus only
  with a mouse and only if already in view: plain `autoFocus` scrolled an
  iPhone SE past the headline on load.
- **Privacy:** the page now lists the D1 copy, the hashed IP and the
  cookie. Every band's fine print says "Kit and the waitlist's own
  database, nowhere else." Change all of these together.
- **Local test:** `npm run build && npx wrangler dev --port 8788` gives a
  local D1. To follow the 307 in Playwright, map `app.kit.com` to a local
  HTTPS stub with `--host-resolver-rules` and clear the proxy env vars;
  `page.route` does not see requests that come from a redirect.

## Known open items
1. ~~Self-host the fonts~~ done via `@fontsource` packages, imported once in
   `src/fonts.ts`. The privacy page no longer lists Google; if a font ever
   loads from a CDN again, that clause has to come back in the same commit.
2. ~~Image weight~~ done. The hero still and every render in `src/assets`
   are WebP now (4.9MB of JPEG/PNG down to 1.3MB). Renders were encoded at
   q86, the blueprint at q90 to keep its hairlines. `og-image.jpg` stays JPEG
   on purpose: some link-preview scrapers still refuse WebP.
3. ~~`<noscript>`~~ and ~~error boundary~~ done (`ErrorBoundary.tsx`).
4. ~~Security headers~~ done: `public/_headers` (CSP, nosniff, referrer,
   HSTS, frame-ancestors, immutable cache on `/assets/*`). **No `form-action`
   in the CSP on purpose**: Kit can redirect the signup POST through other
   hosts and a block would silently kill signups. If you add a script, font
   or media origin, add it to the CSP in the same commit.
5. ~~Branded 404~~ done.
6. ~~CI~~ done: `.github/workflows/check.yml` runs oxlint, tsc + build and
   an em-dash grep. (If the push of a workflow file was refused for lack of
   the `workflow` scope, add it from a laptop.)
7. No analytics, so a launch cannot be measured. Deliberate so far; the privacy
   page currently promises none, so adding any means editing that page too.
   Signups by source and referral are countable from D1 instead.
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
