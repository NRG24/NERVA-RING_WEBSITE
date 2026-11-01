# Kickstarter pre-launch page

_Written 1 November 2026. Ryan pastes this in while signed in to
Kickstarter; about 15 minutes. Facts are only what the site and
`nerva-ring-overview.md` already say._

The pre-launch page is the "Notify me on launch" button. Everyone who
presses it gets an email from Kickstarter the minute the campaign goes
live, and day-one backing is what Kickstarter's own ranking rewards most.
The waitlist on nervaring.com feeds it: `/subscribed` shows a
"Get notified on Kickstarter" button as soon as the URL is pasted into
`KICKSTARTER_URL` in `nerva-site/src/siteLinks.ts`.

## Steps

1. kickstarter.com → **Start a project** → category **Technology →
   Wearables**, country United States.
2. **Basics** tab, paste:
   - **Title** (60 max):
     `NERVA Ring: see stress before it turns into burnout`
   - **Subtitle** (135 max):
     `A smart ring that pairs heart rate with skin conductance, the signal behind stress research. Designed and built by one engineer.`
   - **Location:** your town.
   - **Project image:** `nerva-site/src/assets/proto-hand.webp` (the
     bench prototype in a palm), saved out as JPG at 1024x576 or larger.
     **Not a render.** Kickstarter bans photorealistic renders on
     hardware projects, so every image and frame in the campaign has to
     be a photo or video of the prototype.
   - **Target launch date:** 26 January 2027 (you can change it).
3. **Promotion** tab → **Pre-launch page** → turn it on. Kickstarter may
   ask you to verify your account (email + phone) first.
4. Copy the pre-launch URL (looks like
   `kickstarter.com/projects/<you>/nerva-ring`) and send it to Claude,
   or paste it into `KICKSTARTER_URL` yourself.
5. Add the same URL to the Instagram bio's second line once there are
   a few hundred on the waitlist. Until then keep the bio pointing at
   `nervaring.com/waitlist?utm_source=instagram`, which captures an
   email you can reach without Kickstarter in the middle.

## Story section (draft, for the full campaign later)

> I'm Ryan, and I'm building NERVA Ring on my own.
>
> Most smart rings read your heart. NERVA also reads your skin's
> electrical response, the signal stress researchers have used for
> decades, so it can show stress building through your day instead of
> only telling you how you slept.
>
> Inside the band: an optical sensor for heart rate and blood oxygen, two
> gold-plated electrodes on the inner surface for skin conductance, a
> Bluetooth radio, and a 22 mAh battery aimed at about a month of
> standby. Everything sits on one flex circuit, sealed in resin.
>
> [Video: the ring on a finger, streaming heart rate and skin
> conductance to a phone, the trace jumping on a startle. This is the
> 15 December gate in `PLAN.md`.]
>
> [Rewards, timeline, risks: write these once pricing and the
> manufacturing quote are settled.]

## What the waitlist was promised

Keep the campaign to these, word for word where it matters:

- **Hear about the launch before it goes public.** Send the waitlist the
  live link the moment the campaign opens, before any Instagram or
  Reddit post. Kit broadcast, scheduled for launch time.
- **First pick of the limited early-bird tier.** Size the early-bird tier
  so the waitlist can plausibly fill it on day one (a common rule of
  thumb is 2 to 5% of the list backing), and say how many there are.
- **Beta-tester spots go to the front of the list first.** Pull the
  order from D1 (see `nerva-site/worker/0001_signups.sql`).
