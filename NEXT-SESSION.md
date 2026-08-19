# NERVA Website — Session Handoff

_Last updated: 2026-08-19. Read this first, then `memory/nerva-site-design.md`._

## 2026-08-19 polish pass (branch `claude/festive-fermi-cj74c5`)
**Nav marks where you are.** `useActiveSection` reads geometry on scroll (last
section whose top has passed the nav) rather than using an IntersectionObserver,
because the sections differ wildly in height and the 340vh scrub film breaks
ratio-based observers. It sets `aria-current` on the desktop link (rule stays
drawn) and the mobile row (inset rule). Nothing is marked over the hero or film.

**Mobile menu**: Escape closes it and returns focus to the toggle, crossing back
above 980px closes it, and the toggle carries `aria-controls="mobile-menu"`.

**Section rhythm** now varies by beat as well as by intro shape: `.section--beat`
gives `#signals` a longer landing out of the black film, `.section--pair` pulls
`#spec` up under the drawing so the two engineering sheets read as a pair.

**Footer title block** rows now tile 4+2, 3+3, 3+3. The index and notes fields
used to be full-width rows filled only across their left half. `.tb--index` and
`.tb--notes` carry their own span overrides at the two breakpoints, since a row
that fails to tile shows the container hairline as a solid cell.

**Palette**: every raw hex outside `:root` is now a token (`--pulse`, `--attn`,
`--ink-done`, `--ink-attn`, `--alert`, `--alert-2`, `--ink-lift`).

**Contrast**: `--ink-3` moved `#86868b` → `#6e6e73` (3.6:1 → 5.1:1 on white,
4.7:1 on the tint), and the 0.4/0.42 white alphas on the dark sections
(`.inst__cap`, `.inst__sub`, `.cta__fine`, the signup placeholder) went to
0.5/0.52. Every small label now clears WCAG AA. Keep new labels at or above
these values.

**Focus**: the email field used `outline: none` on `:focus`, which took the
keyboard ring with it. Now only `:focus:not(:focus-visible)` drops it.

**Finish selector** warms the unpicked renders after `window.load`, so swapping
swatches no longer flashes an empty tile while a 400 kB image downloads.

## 2026-08-18 polish pass (branch `claude/festive-fermi-8r6xs4`)
**Pillars are gone.** The dark band's three-up bordered grid was the last
card-shaped thing on the page, complete with a mono kicker on each cell. It is
now `.pillars__grid`: a bold standfirst naming the two constraints that drive
the design (22 mAh cell, seamless housing) against three run-in notes on
hairline rules, reusing the rule language of the `.feat` list directly above so
the whole dark band reads as one spread. `PILLARS` lost its `k` field.

**Footer** absorbed the loose fine print as a `Notes` cell (`.tb__note`), so the
title block is one closed artifact instead of a block plus a trailing
paragraph. Row spans still tile 6 columns per row: 4+2, 3+3, 6, 6. The
copyright line is now a mono sheet stamp (`© 2026 NERVA · sheet 1 of 1`).

**Copy:** "An honest build log, not a launch page" was an X-not-Y construction,
now "Where the build stands today." Datasheet headline is "Every part, and why
it is there." The CTA moved to first person to match the signup error copy.

**Hover states** are behind `(hover: hover)` everywhere now (nav links, footer
index, datasheet and ledger rows), matching what the buttons already did, so
tapped rows on touch do not keep a stuck highlight.

## 2026-08-16 polish pass (branch `claude/polish-2026-08-16`, PR #1)
Two passes landed on this branch, the second building on the first.

**Footer** is now a **drawing title block** (`.colophon` / `.titleblock`),
echoing the Fusion sheet in the Design section: hairline-ruled cells for
drawing, stage, builder, and contact, with the section index as one
horizontal row. The first pass's brand-row + dark "spec plate" footer was
replaced by this. Cell spans (`.tb--w2/w3/w4/w6`) must tile each row of the
6-column grid exactly, or the leftover gap renders as a solid hairline block.

**Section rhythm** no longer repeats headline+sub everywhere: Design uses a
split lead (`.lead--split`), Hardware opens headline-only with its caveat as
a footnote under the table, Build status gained a segment meter counted off
the `LEDGER` array (`TALLY`), so the tally cannot drift from the list. The
first pass's side-by-side blueprint intro was dropped: it shrank the 2600px
CAD sheet to ~740px and the title-block text stopped being legible.

**Dock-bar clearance** is now `body { padding-bottom: 64px }`. It used to sit
on `main`, which left a white band under the dark CTA while still covering
the footer. Anything appended after the footer inherits the clearance now.

Also: `[id] { scroll-margin-top }` so anchor jumps clear the sticky nav;
`.display` capped below the hero title; mono pill badges dropped from the
ledger tags and dock-bar stage label; focus rings made round on round
targets and white-on-dark inside the black sections.

## What this is
Marketing / "follow the build" site for the **NERVA smart ring** — a solo-built
smart ring that pairs heart rate + SpO₂ with **continuous GSR/EDA (skin-conductance)
sensing**. Early-stage prototype, not for sale. Ryan Schreiber is the sole builder.
Product facts live in `nerva-ring-overview.md`. Design law lives in
`CLAUDEwebdesign copy.md` (anti-AI-slop rules — obey it).

## Stack & how to run
- App is in **`nerva-site/`** — React 19 + Vite + TypeScript. Single page:
  everything is `src/App.tsx` + `src/index.css`. No routing, no backend.
- Dev server: `.claude/launch.json` runs on **port 5190** (5188 was taken by a
  parallel session earlier). Use `preview_start` name `nerva-dev`; never Bash.
- Typecheck: `npx tsc -b --pretty false` (must pass — React 19 removed the global
  `JSX` namespace, so `App.tsx` imports `type JSX` explicitly).
- Prod build: `npm run build` (tsc + vite). Currently clean.

## Current page structure (top → bottom)
1. Status strip (black) → sticky nav (5 links: Sensing / Inside the ring / Design /
   Hardware / Build status) → mobile hamburger menu.
2. **Hero** — split: graphite ring in a floating studio-gray tile (deep shadow) +
   headline + **finish selector** (graphite ↔ champagne gold, swaps the render) +
   Apple-blue CTAs + meta row. This is the ONLY section that keeps an eyebrow label.
3. EDA wave strip (thin animated divider).
4. **Cinematic sensor film** (`FilmScroll`) — full-bleed video that **scroll-scrubs**
   `currentTime` to scroll position on desktop; autoplay-loop on touch; poster only
   under reduced-motion. Video lazy-loads after `window.load` + near-viewport.
5. **Two signals** (`#signals`) — custom **dual-signal instrument readout**: animated
   red PPG pulse trace + green EDA drift trace (colors = the ring's real red/green
   LEDs) + two plain editorial notes ("The heart" / "The nerves"). NO cards/chips.
6. **Inside the band** (`#inside`, dark) — chrome ring cutaway + feature list.
7. Pillars (dark 3-col: Battery / Sealed / Solo full-stack).
8. **Design** (`#design`) — the Fusion 360 CAD blueprint in a framed white sheet.
9. Datasheet (`#spec`) — spec table (keeps `PMIC`/`MCU` mono sublabels — legit here).
10. Build ledger (`#status`) — honest done/in-progress/planned list.
11. CTA (`#follow`) — **real email signup** (see below).
12. Footer + fixed bottom dock bar.

## Design system (Apple-premium, Ultrahuman-derived)
- Tokens in `:root` at top of `index.css`. Palette: white, `--paper-2: #f5f5f7`,
  near-black ink, true-black `--void`, `--studio` gray for product tiles.
  Accent `--accent: #0071e3` (Apple blue, CTAs only). `--sensor: #30d158` (green).
- Type: **Hanken Grotesk** (display+body, 800 for headlines) + **IBM Plex Mono**
  (data labels only). Loaded via Google Fonts in `index.html`.
- Borderless soft-shadow cards (`--shadow-sm/md/lg`), radius 24/32px, airy sections.

## HARD user directives (do not regress)
- **Zero em dashes** anywhere in copy. Rewrite sentences; don't just swap punctuation.
  Currently 0 in `App.tsx` and `index.html`. Keep it that way.
- **No AI-slop patterns.** Ryan spots them instantly. Banned: symmetric light/dark
  chip-cards, monospace pill "chips", mono-UPPERCASE eyebrow kickers on every section
  (cut from 6→1), `real`/`actually`/`genuine` intensifiers, "it's not X it's Y" stacks.
  When adding a section, tie it to the physiology/hardware, not generic feature cards.
- **Apple-premium** look is the target. Cool grays, floating product, big tight type.
- **Commerce:** no Shopify / no custom payment backend now. Email list only; pre-order
  money should route through crowdfunding (Kickstarter/Indiegogo). Never hand-roll cards.

## Email signup (needs Ryan's action)
Form POSTs `{email}` to `VITE_SIGNUP_ENDPOINT` (see `.env.example`). With no endpoint
set it shows an honest "signup isn't connected yet, email hello@nervaring.com" error
rather than faking success. **Ryan still needs to pick a provider (Buttondown/
ConvertKit/Formspree) and set that env var** — until then no addresses are captured.

## Assets & tooling gotchas
- `src/assets/`: `ring-graphite.jpg`, `ring-gold2.jpg` (studio-gray bg → light tiles),
  `ring-chrome.jpg` (dark bg → dark Inside section), `blueprint.jpg` (2600px CAD sheet).
- `public/`: `nerva-sensors.mp4` (12.7MB, 540p H.264), `nerva-sensors-poster.jpg`,
  `og-image.jpg` (1200×630 share card), `favicon.svg` (ring + green LED mark).
- **Source images in `Pictures of NERVA Ring/` have a Unicode no-break space in their
  filenames** — Read and `cp` fail on the literal name; use a glob (`cp Screenshot*10.13*.PNG`).
- **No ffmpeg on this machine.** Compress video with macOS `avconvert -p Preset960x540
  --multiPass`; grab video poster frames with `qlmanage -t -s 1600 -o <dir> <file>`.
  Resize/convert images with `sips`.

## Browser-pane quirks (waste hours if you don't know them)
- The in-app Browser pane sometimes opens at a **0×0 viewport** → blank screenshots and
  bogus "overflow" readings. Fix: `resize_window` to an explicit size (e.g. 1440×860)
  before measuring/screenshotting.
- Screenshots often **blank out when scrolled**; the pane reports `document.hidden=true`
  so `requestAnimationFrame` and video autoplay don't run there. To verify below-fold
  sections, isolate them via JS (`display:none` the other sections, force `.reveal.in`)
  and screenshot at scroll 0. To verify the scrub, dispatch scroll events and read
  `video.currentTime` — don't rely on rAF/animation in the pane.

## Suggested next steps (Ryan's priorities)
1. **Get an on-hand / on-finger lifestyle shot** — biggest remaining gap; every premium
   wearable site leads with the product worn. Also a ring render on pure white/transparent
   would let the hero truly float (currently sits in a gray tile).
2. Wire up the real email endpoint (above).
3. Update placeholder domain `https://nervaring.com` in `index.html` OG/canonical tags
   once the real domain exists (absolute URLs required for social scrapers).
4. Possible additions: FAQ ("how is this different from Oura"), companion-app preview.

## Skills used this project
`web-artifacts-builder` (noted it targets standalone claude.ai artifacts, NOT this Vite
site — don't fork the project into one), `hallmark` (design de-slop audit), and
`avoid-ai-writing` (copy audit). Ran hallmark audit → cut section eyebrows; ran
avoid-ai-writing → light cleanup (copy was already mostly clean).
