# NERVA Website: Session Handoff

_Last updated: 2026-09-27. Read this, then `CLAUDEwebdesign copy.md` (design law)
and `nerva-ring-overview.md` (product facts)._

## What this is
Marketing / "follow the build" site for the **NERVA smart ring**, a solo-built
smart ring pairing heart rate and SpO₂ with **continuous GSR/EDA
(skin-conductance) sensing**. Early prototype, not for sale. Ryan Schreiber is
the sole builder. Contact is **nervaring@gmail.com**.

## Stack & how to run
- App lives in **`nerva-site/`**. React 19 + Vite + TypeScript. No router, no
  backend. Three HTML entry points, all listed in `vite.config.ts`:
  - `index.html` → `src/main.tsx` → `src/App.tsx` (the build site)
  - `buy.html` → `src/buy-main.tsx` → `src/Buy.tsx` (store preview, noindex)
  - `privacy.html` → `src/legal-main.tsx` → `src/Legal.tsx` (privacy + disclaimers)
- Styles: `src/index.css` holds the tokens and everything shared (buttons,
  nav, `.titleblock`, `.shopfoot`). `buy.css` and `legal.css` hold only their
  own page's furniture and are imported *after* index.css.
- Typecheck `npx tsc -b --pretty false`, lint `npx oxlint`, build `npm run build`.
  All three are currently clean; keep them that way.
- Dev server: `.claude/launch.json` runs on port 5188.
- Deploys to Cloudflare via `wrangler.jsonc` (static assets out of `dist`).

## Page structure (top → bottom)
**Direction: a consumer product page, not a spec sheet.** Ryan's references
are the Ultrahuman Ring PRO page (`/Reference website`). When he said the site
"looks more like a b2b website and less like a product website", this layout
is what fixed it. Build toward those screenshots, not away from them.

Sticky nav (What it does / Signals / Stress / Inside / Finishes) + hamburger
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
2. **`#does`.** Continues the hero's **black** on purpose: as a white section
   with the image in a rounded card it read as an island between the hero
   and the grey section below. Centered white head, then `ring-app.webp`
   (two demo app screens beside the silver ring) at up to 1480px wide in no
   card, every edge feathered into the black by a CSS mask. The image's top
   is pure black, so it rises out of the same dark the hero ring landed in.
   Its first rows were re-cut after the white-band trim left a grey hairline;
   if it is re-exported, check row 0 is near black. It came in as a 2000px
   chat image; ask Ryan for the original PNG if it needs to be sharper. The
   phones say DEMO, and the footer and privacy page both say the app screens
   are a design demo. Then the three features, white on black.
3. **`#signals`.** The EDA readout: both traces on a white card inside a grey
   stage, drawn like an app screen (red PPG + green EDA, generated from a
   seeded RNG so they never repeat). Caption under it says it is modeled, not
   recorded. Then the two notes, each keyed by a swatch of its own trace.
4. **`#stress`.** Two chains on white cards inside a grey stage; the measured
   one is visibly half as long. Then the "hard part" note, centered.
5. **`FilmScroll`.** A full-bleed **exploded view**, scroll-scrubbed on desktop
   (`currentTime` follows scroll), autoplay-loop on touch, poster only under
   reduced motion. See the video notes below before touching it.
6. **`#inside`** (black). The reference's "Inside Out": centered head, macro
   render on the left (sticky), plain headings + copy on the right, part
   number small under each heading.
7. **`#finish`.** A product configurator like the reference: render big on the
   left; name, circular swatches (`aria-pressed`), "Finish. {name}", the build
   meter (counted off `LEDGER`, so it cannot drift) and a black pill CTA.
8. **`#follow`.** Buttondown email capture on a deep green ground.
9. Footer as an engineering **title block**. Cell spans must tile each row of
   the 6-column grid exactly or the leftover gap prints as a solid hairline.
10. **Launch bar.** Fixed to the bottom where the reference pins price and
    "Continue". Shows once the hero is gone; hides while `#follow` or the
    footer is on screen; `inert` while hidden. It must never show a price.

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
and "days" until recently. The privacy page asserts that **every ring image is
a CAD render, not a photograph**. If that ever stops being true, fix that page
in the same commit.

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
- **Pasted images never reach the container.** A file attached so that it
  produces an `@"/root/.claude/uploads/..."` path does; an image pasted into
  the composer is rendered into the conversation only, with no bytes on disk.
  To get art in, push it to the branch (GitHub's web uploader works) and pull.
- **No ffmpeg or image tooling preinstalled**, but `npm i ffmpeg-static` pulls
  a full static build with libx264 and works fine through the proxy.
- The bundled Playwright Chromium has **no H.264**, so video never decodes in
  a headless check. You can verify which code path runs and what gets fetched,
  but the scrub itself needs a real browser.
- `vite preview` answers a zero-length Range with a 206 carrying the whole
  body, which is a dev-server quirk and not what Cloudflare does.
