import { useRef, useState, type FormEvent } from 'react'

/* ---------- email capture ----------
   Shared by the build site and the prototype page.
   Set VITE_BUTTONDOWN_USERNAME to the Buttondown account name.

   This posts as a NATIVE form, deliberately, not with fetch(). A subscriber
   sometimes has to follow the response to clear a CAPTCHA or fix a validation
   error; an XHR swallows that response, so those people would look subscribed
   here and never land on the list. */
const BUTTONDOWN_USER = import.meta.env.VITE_BUTTONDOWN_USERNAME as string | undefined
const SIGNUP_ACTION = BUTTONDOWN_USER
  ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USER}`
  : undefined
export const CONTACT_EMAIL = 'nervaring@gmail.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Signup() {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const trapRef = useRef<HTMLInputElement>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (trapRef.current?.value) { e.preventDefault(); return } // bot fell in the honeypot

    if (!EMAIL_RE.test(email.trim())) {
      e.preventDefault()
      setErr('That email address doesn’t look right.')
      return
    }

    if (!SIGNUP_ACTION) {
      e.preventDefault()
      setErr(`Signup isn’t connected yet. Email ${CONTACT_EMAIL} and I’ll add you by hand.`)
      return
    }
  }

  return (
    <form className="signup-wrap" action={SIGNUP_ACTION} method="post" onSubmit={onSubmit} noValidate>
      <div className="signup">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
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
        <input type="hidden" name="tag" value="nervaring.com" />
        <button className="btn btn--led btn--lg" type="submit">Notify me</button>
      </div>
      {err && <p className="signup__err" role="alert">{err}</p>}
    </form>
  )
}
