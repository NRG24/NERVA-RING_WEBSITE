import { useRef, useState, type FormEvent } from 'react'

/* ---------- email capture ----------
   Shared by the build site and the prototype page. Posts to a Kit form.

   This posts as a NATIVE form, deliberately, not with fetch(). A subscriber
   sometimes has to follow the response to clear a CAPTCHA or fix a validation
   error; an XHR swallows that response, so those people would look subscribed
   here and never land on the list.

   Kit then sends people to /subscribed (set as the form's redirect in Kit's
   settings), and that page is the only success state we show. */
const KIT_FORM_ID = '10036721' // public by design: it's in the form's own URL
const SIGNUP_ACTION = `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`
export const CONTACT_EMAIL = 'nervaring@gmail.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* where the visitor came from, for Kit's "source" custom field:
   ?utm_source=instagram on the bio link lands as "instagram" */
function signupSource() {
  const utm = new URLSearchParams(window.location.search).get('utm_source')
  return utm ? utm.slice(0, 40) : 'nervaring.com'
}

export function Signup() {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [source] = useState(signupSource)
  const trapRef = useRef<HTMLInputElement>(null)

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
        <button className="btn btn--led btn--lg" type="submit">Notify me</button>
      </div>
      {err && <p className="signup__err" role="alert">{err}</p>}
    </form>
  )
}
