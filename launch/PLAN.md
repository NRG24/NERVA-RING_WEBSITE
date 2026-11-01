# NERVA launch plan: status and next steps

_Updated 1 November 2026. Target: Kickstarter launch Tuesday 26 January 2027,
backup date Tuesday 23 February if the ring isn't working on a finger by
15 December._

## Where things stand

| Piece | State |
|---|---|
| Website | Live. `/waitlist`, `/subscribed`, `/updates`, `/prototype`, `/science`, `/press`. |
| Waitlist backend | **Built, waiting on Cloudflare** (branch `claude/vigilant-goodall-6zcqsx`). A Worker at `/api/*` stores each signup in D1 with a referral code, then hands the same post on to Kit. `/subscribed` shows "You're number N of M" and a share link; each friend who joins through it moves you up 10 places. Tested end to end locally. Not merged yet. If the site deploys from `main` (Cloudflare's Git integration), merging deploys it, and that first deploy creates the D1 database. |
| Waitlist promise | Kickstarter in early 2027; the list hears first and gets first pick of a limited early-bird tier; the front of the list gets first pick of beta-tester spots. No price anywhere. |
| Signup form | Posts to `/api/join` → Kit form 10036721 → `/subscribed`. Carries `source`, `ref_code`, `referred_by`. |
| Kit email | **Broken.** Nothing Kit sends reaches anyone. Likely cause found 1 Nov (below). Kit's API is paid-only, so Claude can't see or fix the account. |
| Kickstarter | No project yet. Pre-launch copy and steps in `kickstarter-prelaunch.md`. |
| Instagram | @nerva_ring exists. Bio and first month of posts drafted in `instagram.md`. |
| Emails | Welcome (now with share link), November update, privacy notice: `emails.md`. |

## Ryan's sign-in list (everything else is done or Claude's)

In order. Each is a few minutes.

1. **Fix Kit (likely one click).** On 12 Oct Kit sent "Confirm your Kit
   email address" to schreiber.rn24@gmail.com at 19:06, then the login was
   moved to **nervaring@gmail.com** at 19:50. The new address will have
   had its own confirm email, and nothing shows it was clicked. An
   unconfirmed login or sending address is the most likely reason Kit
   sends nothing. Open the
   **nervaring@gmail.com** inbox, search `from:kit.com OR from:convertkit.com`,
   click the newest confirm link. Then in Kit → Settings → Email →
   Sending addresses, make sure nervaring@gmail.com says *verified*
   (resend if not). Send a test broadcast to schreiber.rn24@gmail.com.
   If it still doesn't arrive, paste this to Kit support (chat bubble):
   > Nothing from my account is being delivered: test emails, broadcasts,
   > and form confirmation emails all fail to arrive (checked spam). Is my
   > account restricted or under review, and is my sending address verified?
2. **Kit custom fields.** Add `ref_code` and `referred_by` (Subscribers →
   open any subscriber → Add a new field). Paste the welcome email from
   `emails.md` into the form's automation.
3. **Authorize the Cloudflare connector** in claude.ai → Settings →
   Connectors → Cloudflare Developer Platform. Then tell Claude "deploy
   the waitlist": Claude merges the branch, confirms the D1 database
   came up, pins its id in `wrangler.jsonc`, and checks a live signup.
   (Without the connector you can merge the PR yourself; the deploy
   creates the database on its own.)
4. **Kickstarter pre-launch page**, from `kickstarter-prelaunch.md`
   (about 15 minutes). Send Claude the URL.
5. **Send the privacy notice** in `emails.md` once Kit sends.

Longer term: send from `hello@nervaring.com` instead of a gmail.com address.
Mail claiming to be from gmail.com but sent by Kit's servers is exactly what
spam filters look for. With the Cloudflare connector authorized, Claude can
set up the DNS records and Email Routing (free) to forward hello@ to Gmail.

## November (week by week)

| Week of | Ryan | Claude |
|---|---|---|
| 2 Nov | Sign-in list items 1-4 (above). Update Instagram bio. Post Reels 1-3. | Done: plan, emails, Instagram drafts, waitlist backend, Kickstarter copy. Deploy the waitlist once Cloudflare is authorized. |
| 9 Nov | Reels 4-6. Comment on 10 smart-ring / maker posts. | Post an /updates entry when there's news. |
| 16 Nov | Reels 7-9. One build post in r/PrintedCircuitBoard. | Draft the Kickstarter page outline. |
| 23 Nov | Reels 10-12. Send the November build update (in `emails.md`). | Checkpoint: count signups by source and referrals, straight from D1. |

**Checkpoint 22 Nov:** ~400 emails, ~600 Instagram followers. Below half
of that, post more often before spending anything on ads.

## December gate

By **15 December**: a clip of the ring on a finger, streaming heart rate and
skin conductance to a phone, with the trace jumping on a startle. That clip
is the Kickstarter requirement (working prototype, no photoreal renders) and
the best single piece of content. No clip by then → launch moves to 23 Feb.
