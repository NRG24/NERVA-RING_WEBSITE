import { useEffect, useRef, useState, type FormEvent } from 'react'

/* ---------- email capture ----------
   Shared by every page with a signup band.

   It posts as a NATIVE form, deliberately, not with fetch(). It goes to
   /api/join (worker/index.ts), which records the address and a referral
   code in D1 and answers 307, so the browser re-posts these same fields
   to Kit itself. Kit sometimes makes a subscriber clear a CAPTCHA or fix
   a validation error on its own page; an XHR would swallow that, and
   those people would look subscribed and never land on the list.

   Kit then sends people to /subscribed (the form's redirect in Kit's
   settings), which shows their place on the list and their share link.

   Two hidden fields ride along for the referral loop. Both are Kit
   custom fields too, so Kit's welcome email can print the share link
   with {{ subscriber.ref_code }}:
     fields[ref_code]     this person's code, made here so Kit and D1 agree
     fields[referred_by]  the ?ref= code of whoever sent them, if any */
export const CONTACT_EMAIL = 'nervaring@gmail.com'
const SIGNUP_ACTION = '/api/join'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // the Worker accepts only these
const CODE_RE = /^[a-hjkmnp-z2-9]{8}$/

/* where the visitor came from, for Kit's "source" custom field:
   ?utm_source=instagram on the bio link lands as "instagram" */
function signupSource() {
  const utm = new URLSearchParams(window.location.search).get('utm_source')
  return utm ? utm.slice(0, 40) : 'nervaring.com'
}

function referredBy() {
  const ref = (new URLSearchParams(window.location.search).get('ref') ?? '').toLowerCase()
  return CODE_RE.test(ref) ? ref : ''
}

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

/* /api/join sends a script or a no-JS post back with ?err=email, and
   ?err=busy when one network has sent too many signups in a short time */
function initialError() {
  const err = new URLSearchParams(window.location.search).get('err')
  if (err === 'email') return 'That email address doesn’t look right.'
  if (err === 'busy') return 'Too many signups from your network just now. Please try again in a little while.'
  return ''
}

/* `extra` rides along as more hidden fields, for something the visitor
   chose elsewhere on the page (the main page sends the finish they would
   back as fields[finish], a Kit custom field) */
export function Signup({ autoFocus = false, extra }: { autoFocus?: boolean; extra?: Record<string, string> }) {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState(initialError)
  const [source] = useState(signupSource)
  const [ref] = useState(referredBy)
  const [code] = useState(newCode)
  const trapRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  /* The waitlist page puts the cursor in the field, but only where that
     costs nothing: on a screen with a mouse, and only if the field is
     already in view. Plain autoFocus scrolled a short phone straight past
     the headline and the promise, and could raise the keyboard over them. */
  useEffect(() => {
    const el = emailRef.current
    if (!autoFocus || !el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (el.getBoundingClientRect().bottom > window.innerHeight) return
    el.focus({ preventScroll: true })
  }, [autoFocus])

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (trapRef.current?.value) { e.preventDefault(); return } // bot fell in the honeypot

    if (!EMAIL_RE.test(email.trim())) {
      e.preventDefault()
      setErr('That email address doesn’t look right.')
    }
  }

  return (
    <form className="signup-wrap" action={SIGNUP_ACTION} method="post" onSubmit={onSubmit} noValidate>
      <div className="signup">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          ref={emailRef}
          id="email"
          type="email"
          name="email_address"
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          aria-invalid={err ? true : undefined}
          onChange={(e) => { setEmail(e.target.value); if (err) setErr('') }}
        />
        {/* honeypot: hidden from people, catnip for bots */}
        <input
          ref={trapRef}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="signup__trap"
        />
        <input type="hidden" name="fields[source]" value={source} />
        <input type="hidden" name="fields[ref_code]" value={code} />
        {ref && <input type="hidden" name="fields[referred_by]" value={ref} />}
        {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <button className="btn btn--led btn--lg" type="submit">Notify me</button>
      </div>
      {err && <p className="signup__err" role="alert">{err}</p>}
    </form>
  )
}
