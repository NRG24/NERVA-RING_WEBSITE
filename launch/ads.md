# Paid ads: a small Meta test

_Written 1 November 2026. One small, measured test on Instagram and
Facebook to find which message gets waitlist signups cheapest. It is a
test, not a launch push._

## When to start

Only when all three are true:

1. Kit sends (a test signup gets the confirmation email).
2. The waitlist backend is live (`/subscribed` shows "You're number N").
3. Reels 1 to 3 from `instagram.md` are posted. Ads send people to look
   at the profile, and an empty profile wastes the click.

`PLAN.md` says to post more before paying if the 22 November checkpoint
is under half its target. The test below is small enough to run
alongside that, but don't scale it up before the checkpoint.

## Setup (Ryan, signed in, about 20 minutes)

1. Instagram → Settings → Account type → switch to a **Professional /
   Creator** account if it isn't one. Link it to a Facebook Page
   (create a "NERVA Ring" page if needed). Meta requires the Page for ads.
2. business.facebook.com → **Ads Manager** → add a payment method.
   Use Ads Manager, not the "Boost" button: Boost can't set a separate
   link per ad, and the per-ad link is how we measure.
3. Build one campaign as below. Every ad uses its own link, so D1 counts
   signups per ad with no tracking pixel on the site.

## The campaign

| Setting | Value |
|---|---|
| Objective | **Traffic**, optimise for landing page views |
| Budget | **$15/day at campaign level, 7 days** (about $105 total) |
| Locations | United States, Canada, United Kingdom, Australia |
| Age | 22 to 45 |
| Audience | Advantage+ audience, with these as suggestions: Oura, WHOOP, wearable technology, quantified self, heart rate variability, meditation, Kickstarter |
| Placements | Advantage+ placements (Instagram feed, Stories, Reels, Facebook feed) |
| Call to action button | **Sign Up** |

Why Traffic and not Leads: Meta's lead objective wants either its own
form (the address never reaches the site's referral system) or a
tracking pixel on the site. The site promises no analytics, and adding a
pixel means changing the privacy page and the security headers. Traffic
needs neither. Revisit once there's a working ring video worth
retargeting.

## The four ads

Each file is in `launch/creative/`. Use the 4:5 still in feed placements
and the 9:16 file in Stories and Reels, where an ad has both.

| Ad | Feed (4:5) | Stories/Reels (9:16) | Link |
|---|---|---|---|
| A. Prototype | `feed-prototype.jpg` | `story-prototype.jpg` | `https://nervaring.com/waitlist?utm_source=meta-photo` |
| B. Skin signal | `feed-skin.jpg` | (feed only) | `https://nervaring.com/waitlist?utm_source=meta-skin` |
| C. Levitate | (story only) | `ad-levitate-9x16.mp4` | `https://nervaring.com/waitlist?utm_source=meta-levitate` |
| D. Finishes | `feed-finishes.jpg` | `reel-finishes-9x16.mp4` | `https://nervaring.com/waitlist?utm_source=meta-finish` |

**Headline (all):** Join the NERVA Ring waitlist

**Description (all):** Kickstarter, early 2027

**Primary text, one per ad:**

- **A:** I'm building a smart ring that reads stress through your skin, on
  my own. This is the bench prototype. It launches on Kickstarter in early
  2027, and the waitlist hears first and gets first pick of the limited
  early-bird tier.
- **B:** Your skin's conductance shifts within seconds of a stressful
  moment. Most rings estimate stress from heart rate alone. NERVA reads the
  skin signal directly, alongside heart rate. Kickstarter in early 2027;
  join the waitlist for first pick of the early-bird tier.
- **C:** A smart ring that shows stress building through the day, from
  the skin signal stress research uses. Designed and built by one
  engineer. Join the waitlist for early-bird access when it launches on
  Kickstarter.
- **D:** Four finishes, one ring that reads stress through your skin.
  Which would you wear? Join the waitlist to hear first when it launches
  on Kickstarter in early 2027.

### Copy rules (Meta reviews these)

- Never tell the reader they have a condition or feeling: no "Are you
  stressed?", "your anxiety", "you're burning out". Meta's personal
  attributes policy rejects those. Describe the ring, not the person.
- No medical words: diagnose, treat, prevent, cure, clinical, medical
  device. The site's line is "wellness product, not a medical device".
- Renders are labelled on the creative. Keep it that way.

## Reading the results

Signups per ad come out of D1 (or ask Claude):

```
npx wrangler d1 execute nerva-waitlist --remote --command "SELECT source, COUNT(*) FROM signups WHERE source LIKE 'meta-%' GROUP BY source"
```

Divide each ad's spend (from Ads Manager) by its signups to get
**cost per signup**.

- **Day 3:** pause any ad that has spent $20 with zero signups.
- **Day 7:** keep the cheapest ad, pause the rest. If its cost per signup
  is under your ceiling, raise the budget by about 20% every few days
  rather than all at once (big jumps reset Meta's learning).

**Setting the ceiling.** This is arithmetic on assumptions, not data. A
waitlist email is worth roughly (share of the list that backs) ×
(average pledge). If 3% back at an average of $200, each email is worth
about $6 in pledges, so paying more than about $3 per signup loses money
on paper. Redo this when the price and the early-bird tier are set.

## Rebuilding the creatives

Stills: `node launch/creative/build.cjs <outdir> [name-prefix]` from the
repo root (needs `npm ci` in `nerva-site/`). It renders HTML pages with
the site's font and almond palette through Playwright.

Videos, from those outputs (`disc.png`, `ov-levitate.png`,
`reel-finish-0..3.png`):

```
# levitate: ring rises (feathered at the bottom), holds 4 s, text on top
ffmpeg -f lavfi -i "color=c=0xf0dcca:s=1080x1920:r=24:d=8" -c:v libvpx-vp9 -i nerva-site/public/nerva-levitate-ceramic.webm -loop 1 -i disc.png -loop 1 -i ov-levitate.png -filter_complex "[1:v]format=rgba,scale=1000:1000,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*clip((H-Y)/260,0,1)',tpad=stop_mode=clone:stop_duration=4[ring];[0:v][2:v]overlay[a];[a][ring]overlay=40:330:eof_action=repeat[b];[b][3:v]overlay,format=yuv420p[v]" -map "[v]" -t 8 -c:v libx264 -crf 20 -movflags +faststart -an ad-levitate-9x16.mp4

# finishes: four renders, one second each, twice (fin.txt is an ffmpeg concat list)
ffmpeg -f concat -safe 0 -i fin.txt -vf "fps=24,format=yuv420p" -c:v libx264 -crf 20 -movflags +faststart -an reel-finishes-9x16.mp4
```

The `-c:v libvpx-vp9` before the WebM input matters: ffmpeg's built-in
VP9 decoder drops the alpha channel.
