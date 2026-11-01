# Email drafts

Written as Ryan, first person. Facts come from the site and
`nerva-ring-overview.md`; nothing here claims a result the build hasn't shown.
Paste into Kit once sending works (see `PLAN.md`).

---

## 1. Welcome email (Kit: the form's automation / incentive email)

Sent the moment someone joins. If you keep double opt-in, the confirm button
goes where the bracket is; with auto-confirm on, delete that line.

The share link uses Kit's custom field `ref_code`, which the site fills on
every signup. Create the field in Kit first (Subscribers → any subscriber
→ Add a field → `ref_code`, and one called `referred_by`), or the link
prints with an empty code.

**Subject:** You're on the NERVA list

**Preview text:** Your spot, your share link, and what happens next

> Hi,
>
> Thanks for joining. I'm Ryan, and I'm building NERVA Ring on my own: a smart
> ring that reads your skin's electrical response (the same signal behind
> stress research) alongside heart rate, so you can see stress building
> before it turns into burnout.
>
> [Confirm your email: button]
>
> NERVA Ring launches on Kickstarter in early 2027. Being on this list means
> you hear about it before it goes public, and you get first pick of the
> limited early-bird tier.
>
> If you know someone who'd want one, send them your link:
> https://nervaring.com/waitlist?ref={{ subscriber.ref_code }}&utm_source=referral
> Every friend who joins through it moves you up 10 places, and the front of
> the list gets first pick of beta-tester spots.
>
> Right now there's one working prototype, running on my bench in a black
> ceramic band. Photos here: nervaring.com/prototype
>
> You'll hear from me about once a month, with what got built, what broke,
> and what's next.
>
> One question, if you have ten seconds: what would you want a ring to tell
> you about your stress? Just hit reply. I read every one.
>
> Ryan
> NERVA Ring

---

## 2. November build update (send the week of 23 November)

Fill the bracketed parts with what actually happened. Delete any section you
have nothing real for; a short honest update beats a padded one.

**Subject:** The ring went to the lab

**Preview text:** November build update from NERVA

> Hi,
>
> Quick update from the bench.
>
> **What happened**
> The bench prototype went to the University of Vermont to have its Bluetooth
> tested on a vector network analyzer. A ring is a hard place for an antenna:
> the housing and the finger inside it both pull it off the 2.4 GHz band
> Bluetooth uses. [What the VNA showed, in one or two sentences. How far off
> it was, and what you're changing.]
>
> **What broke**
> [One honest thing that went wrong this month and what you learned. People
> remember these more than the wins.]
>
> **What's next**
> Getting the ring reading heart rate and skin conductance on a finger and
> streaming it to a phone. When that works, I'll send a video of the stress
> trace jumping in real time.
>
> [Photo: one real photo from this month. Bench, lab, or the ring on a hand.]
>
> The full build log is at nervaring.com/updates. If someone you know would
> want this, your link moves you up the list:
> https://nervaring.com/waitlist?ref={{ subscriber.ref_code }}&utm_source=referral
>
> Ryan

---

## 3. Short reply template (for people who answer the welcome question)

> Thanks, that's really useful. [One sentence reacting to what they said.]
> I'm noting it for the app. I'll be looking for beta testers early next
> year; want me to put you on that shortlist?
>
> Ryan

Replies like this turn early signups into beta testers and, later, day-one
backers. Keep a simple list of everyone who says yes.

---

## 4. Privacy notice (send once, before or with the November update)

The privacy page promises that any change affecting what happens to an
address "goes out to the list rather than landing here quietly". The
waitlist backend is that kind of change, so this goes out.

**Subject:** A small change to how the NERVA list works

> Hi,
>
> One housekeeping note. The waitlist now keeps your place in line, so your
> address is stored in two places instead of one: Kit, which sends these
> emails, and the waitlist's own database on Cloudflare. It also sets one
> cookie when you join, so the confirmation page can show your spot.
> Nothing is sold or shared. The full details are at nervaring.com/privacy.
>
> If you'd rather be off both, reply and I'll delete you from each.
>
> Ryan

