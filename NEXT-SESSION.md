# NERVA Website: Session Handoff

_Last updated: 2026-09-12. Read this, then `CLAUDEwebdesign copy.md` (design law)
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
Sticky nav (Signals / Stress / Inside / Finishes) + hamburger under 1080px.

1. **Hero.** A full-bleed film that plays once, fades to black, then cross-fades
   into the black-glass still. Under `prefers-reduced-motion` the film is never
   rendered or fetched and the still shows immediately. A refused autoplay
   (iOS Low Power Mode) cuts to the still too, so it can never sit on a frozen
   frame.
2. **`#signals`.** The EDA readout. A drawn chart-recorder strip (red PPG
   trace + green EDA trace, both generated from a seeded RNG so they never
   repeat) plus two short editorial notes. **This leads on purpose**: EDA is
   the reason the ring exists, so the signal comes before the argument.
   Keeps the plain page ground, NOT the tint: the strip is a warm paper sheet
   (`--chart-paper #f7f0e3`) and it vanishes against `--paper-2 #f2efe8`.
3. **`#stress`.** "One nerve signal. Two ways to read it." Two chains that
   start on the same nerve; the measured one is visibly half as long, and the
   endpoints carry the argument typographically (a figure with a unit vs a
   phrase in quote marks). **No explanatory paragraph under it**: the picture
   is the section. Then the chrome render with the honest "hard part" note as
   its caption.
4. **`FilmScroll`.** A full-bleed **exploded view**, scroll-scrubbed on desktop
   (`currentTime` follows scroll), autoplay-loop on touch, poster only under
   reduced motion. See the video notes below before touching it.
5. **`#inside`** (dark). Numbered sensing stack with real part numbers.
6. **`#finish`.** Four ceramic finishes + the build-status meter, counted off
   the `LEDGER` array so the tally can never drift from the list.
7. **`#follow`.** Buttondown email capture on a deep green ground.
8. Footer as an engineering **title block**. Cell spans must tile each row of
   the 6-column grid exactly or the leftover gap prints as a solid hairline.

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
1. **Self-host the two Google Fonts.** It is the only third party the privacy
   page has to disclose, and it costs a render-blocking round trip. Blocked in
   the cloud session (no egress to fonts.googleapis.com); easy locally.
2. `ring_03_black_glass_web.png` is a **770KB PNG** at 2000x2000 rendered about
   1200px wide. Should be WebP or a JPEG.
3. No `<noscript>`, so a non-JS fetch gets a blank page. No React error
   boundary either: one throw blanks the site.
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
