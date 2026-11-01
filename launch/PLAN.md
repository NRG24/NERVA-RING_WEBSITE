# NERVA launch plan: status and next steps

_Updated 1 November 2026. Target: Kickstarter launch Tuesday 26 January 2027,
backup date Tuesday 23 February if the ring isn't working on a finger by
15 December._

## Where things stand

| Piece | State |
|---|---|
| Website | Live. `/waitlist` (form only), `/subscribed` (after signup), `/updates` (build log + feed), `/prototype`, `/science`, `/press`. |
| Signup form | Posts to Kit form 10036721 and redirects to `/subscribed`. Each signup carries `source` from `?utm_source=`. |
| Kit email | **Broken.** Nothing Kit sends reaches anyone: no broadcast, no "confirm your subscription" email. Checked Ryan's inbox, spam included, 13 Oct to 1 Nov. Cause is inside the Kit account (see "Fix Kit" below). |
| Instagram | @nerva_ring exists. Bio and first month of posts drafted in `instagram.md`. |
| Emails | Welcome email and November build update drafted in `emails.md`. |

## Fix Kit (Ryan, about 20 minutes)

Kit's AI connection needs a paid plan, so these have to be done by hand in Kit.
In order, stopping when a test send arrives:

1. **Verify the sending address.** Kit → Settings → Email → Sending addresses.
   If `nervaring@gmail.com` (or whatever is listed) says *unverified*, click
   resend and click the link in the email Kit sends **to that address**.
   Your Kit login moved from schreiber.rn24@ to nervaring@ on 12 Oct; the
   sending address may still be waiting on a confirm click in the
   nervaring@gmail.com inbox.
2. **Send a test.** Open the broadcast → "Send test email" to schreiber.rn24@gmail.com.
   - Arrives: the account works; the real send skipped people because they
     were unconfirmed. Tick **Auto-confirm new subscribers** in the form's
     Incentive settings and resend.
   - Doesn't arrive: go to step 3.
3. **Ask Kit support** (chat bubble, bottom right). Paste:
   > Nothing from my account is being delivered: test emails, broadcasts, and
   > form confirmation emails all fail to arrive (checked spam). Is my account
   > restricted or under review, and is my sending address verified?
4. **If Kit can't fix it within a week, leave Kit.** Export subscribers (CSV)
   and move to beehiiv (free to 2,500). Tell Claude and the site form gets
   switched in one change.

Longer term: send from `hello@nervaring.com` instead of a gmail.com address.
Mail claiming to be from gmail.com but sent by Kit's servers is exactly what
spam filters look for. This needs the domain's DNS (in Cloudflare) plus
Cloudflare Email Routing (free) to forward hello@ to Gmail.

## November (week by week)

| Week of | Ryan | Claude |
|---|---|---|
| 2 Nov | Fix Kit (above). Update Instagram bio. Post Reels 1-3. | Done: plan, emails, Instagram drafts. |
| 9 Nov | Reels 4-6. Comment on 10 smart-ring / maker posts. | Post an /updates entry when there's news. |
| 16 Nov | Reels 7-9. One build post in r/PrintedCircuitBoard. | Draft the Kickstarter page outline. |
| 23 Nov | Reels 10-12. Send the November build update (in `emails.md`). | Checkpoint: count signups by source. |

**Checkpoint 22 Nov:** ~400 emails, ~600 Instagram followers. Below half
of that, post more often before spending anything on ads.

## December gate

By **15 December**: a clip of the ring on a finger, streaming heart rate and
skin conductance to a phone, with the trace jumping on a startle. That clip
is the Kickstarter requirement (working prototype, no photoreal renders) and
the best single piece of content. No clip by then → launch moves to 23 Feb.
