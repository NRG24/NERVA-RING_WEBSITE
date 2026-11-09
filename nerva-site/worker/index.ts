/* ------------------------------------------------------------------
   The waitlist backend. Only /api/* reaches this Worker
   (run_worker_first in wrangler.jsonc); every other path is a static
   file out of dist, exactly as before.

   POST /api/join   the signup form posts here as a NATIVE form.
                    The address is recorded in D1 with a referral code,
                    then answered with a 307 to Kit's form endpoint.
                    307 keeps the method and body, so the browser
                    re-posts the same fields to Kit itself, and Kit's
                    CAPTCHA / redirect to /subscribed work as they did
                    when the form posted to Kit directly. If D1 is
                    missing or throws, the 307 still happens: a signup
                    is never lost to this code.
   GET  /api/me     the visitor's place on the list, read off an
                    HttpOnly cookie set by /api/join. /subscribed uses it.
   GET  /api/stats  the total, for "join N others".

   Referrals: each friend who joins with your link moves you up
   REF_BOOST places. Credit is refused when the friend shares the
   referrer's network (same hashed IP) or that network has already
   made REF_IP_LIMIT signups in the last day, which stops one person
   farming their own link from one browser. With no IP_SALT secret
   no IP hash is stored, so neither check can run and no credit is
   given: a referral that can't be checked isn't paid.

   Abuse limits on /api/join, both optional and both fail open:
   JOIN_LIMIT (a Workers rate limit binding, per IP, per minute) and
   JOIN_IP_HOURLY rows per hashed IP per hour, counted in D1. A person
   who trips either lands back on /waitlist?err=busy with a message.
   ------------------------------------------------------------------ */

export interface Env {
  ASSETS: Fetcher
  DB?: D1Database
  KIT_FORM_ID: string
  // a secret (`wrangler secret put IP_SALT`), never a var: with a known
  // salt every IPv4 hash can be reversed by trying all 2^32 addresses
  IP_SALT?: string
  JOIN_LIMIT?: RateLimit
}

const REF_BOOST = 10
const REF_IP_LIMIT = 3
const JOIN_IP_HOURLY = 60 // new rows per hashed IP per hour; a campus or event can share one address
const MIN_SALT = 16
const COOKIE = 'nerva_wl'
const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // no 0/o, 1/l/i
const CODE_RE = /^[a-hjkmnp-z2-9]{8}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Row = {
  id: number
  email: string
  code: string
  token: string
  referrals: number
  ip_hash: string | null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/join') {
      if (request.method !== 'POST') return Response.redirect(new URL('/waitlist', url).toString(), 303)
      return join(request, env, url)
    }
    if (url.pathname === '/api/me' && request.method === 'GET') return me(request, env)
    if (url.pathname === '/api/stats' && request.method === 'GET') return stats(env)
    if (url.pathname.startsWith('/api/')) return json({ error: 'not found' }, 404)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>

/* ---------- POST /api/join ---------- */

async function join(request: Request, env: Env, url: URL): Promise<Response> {
  const kit = `https://app.kit.com/forms/${env.KIT_FORM_ID}/subscriptions`
  const toKit = (cookie?: string) => {
    const h = new Headers({ Location: kit, 'Cache-Control': 'no-store' })
    if (cookie) h.append('Set-Cookie', cookie)
    return new Response(null, { status: 307, headers: h })
  }

  // Read a clone: the 307 makes the browser resend the original body,
  // so nothing here needs to rebuild it.
  let form: FormData
  try {
    form = await request.clone().formData()
  } catch {
    return toKit()
  }

  // Only this site's own pages post here. A native form post always
  // carries Origin (the site's Referrer-Policy keeps it), so a different
  // one is another site using this as a signup proxy. No Origin at all
  // (an old browser, curl) is let through to the other checks.
  const origin = request.headers.get('Origin')
  if (origin && origin !== 'null' && origin !== url.origin) {
    return Response.redirect(new URL('/waitlist', url).toString(), 303)
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? ''
  const busy = () => Response.redirect(new URL('/waitlist?err=busy', url).toString(), 303)
  if (ip && env.JOIN_LIMIT) {
    try {
      if (!(await env.JOIN_LIMIT.limit({ key: ip })).success) return busy()
    } catch (err) {
      console.error('join: rate limit binding failed, carrying on', err)
    }
  }

  const email = String(form.get('email_address') ?? '').trim().toLowerCase()
  if (String(form.get('company') ?? '') !== '') {
    // honeypot: answer like a success, record nothing, send nothing to Kit
    return Response.redirect(new URL('/subscribed', url).toString(), 303)
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    // the page validates first, so this is a script or a page with JS off
    return Response.redirect(new URL('/waitlist?err=email', url).toString(), 303)
  }

  if (!env.DB) return toKit()

  try {
    await ensureSchema(env.DB)

    const existing = await env.DB.prepare('SELECT * FROM signups WHERE email = ?').bind(email).first<Row>()
    if (existing) {
      // Already on the list (and already sent to Kit the first time).
      // Re-posting would overwrite their ref_code in Kit with this page's
      // new random one, so go straight to /subscribed instead.
      // The cookie is NOT handed out here: typing an address proves
      // nothing about owning it, so anyone could take someone else's
      // place and share link. Only a browser that already holds this
      // row's cookie sees the place; everyone else gets the plain page.
      return Response.redirect(new URL('/subscribed', url).toString(), 303)
    }

    const salt = env.IP_SALT && env.IP_SALT.length >= MIN_SALT ? env.IP_SALT : null
    if (!salt) console.warn('join: IP_SALT secret missing or short; storing no IP hash, giving no referral credit')
    const ipHash = ip && salt ? await sha256(`${salt}:${ip}`) : null

    // One indexed read serves both the hourly cap and the referral check.
    const recent = ipHash
      ? await env.DB.prepare(
          `SELECT COUNT(*) AS day,
                  COALESCE(SUM(created_at > datetime('now', '-1 hour')), 0) AS hour
           FROM signups WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')`,
        ).bind(ipHash).first<{ day: number; hour: number }>()
      : null
    if (recent && recent.hour >= JOIN_IP_HOURLY) return busy()

    // The page sends the code it put in Kit's ref_code field, so the
    // welcome email and this table agree. Make one up only if it's
    // missing, malformed, or (vanishingly unlikely) already taken.
    let code = String(form.get('fields[ref_code]') ?? '')
    if (!CODE_RE.test(code) || (await env.DB.prepare('SELECT 1 FROM signups WHERE code = ?').bind(code).first())) {
      code = randomCode()
    }

    const refCode = String(form.get('fields[referred_by]') ?? '')
    let referrer: Row | null = null
    if (CODE_RE.test(refCode)) {
      referrer = await env.DB.prepare('SELECT * FROM signups WHERE code = ?').bind(refCode).first<Row>()
    }
    // No hash means no way to tell a friend from the referrer on a
    // second tab, so no credit. referred_by is still kept.
    const credit = !!referrer && ipHash !== null && referrer.ip_hash !== ipHash && (recent?.day ?? 0) < REF_IP_LIMIT

    const token = randomHex(16)
    const source = String(form.get('fields[source]') ?? '').slice(0, 40) || null
    const insert = env.DB.prepare(
      'INSERT INTO signups (email, code, token, source, referred_by, ip_hash, credited) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).bind(email, code, token, source, referrer ? referrer.code : null, ipHash, credit ? 1 : 0)

    if (credit && referrer) {
      await env.DB.batch([
        insert,
        env.DB.prepare('UPDATE signups SET referrals = referrals + 1 WHERE id = ?').bind(referrer.id),
      ])
    } else {
      await insert.run()
    }
    return toKit(cookieFor(token))
  } catch (err) {
    console.error('join: D1 failed, passing straight to Kit', err)
    return toKit()
  }
}

/* ---------- GET /api/me ---------- */

async function me(request: Request, env: Env): Promise<Response> {
  const token = readCookie(request, COOKIE)
  if (!env.DB || !token || !/^[0-9a-f]{32}$/.test(token)) return json({ error: 'unknown' }, 404)
  try {
    await ensureSchema(env.DB)
    const row = await env.DB.prepare('SELECT * FROM signups WHERE token = ?').bind(token).first<Row>()
    if (!row) return json({ error: 'unknown' }, 404)

    // Lower key = nearer the front. Ties keep join order.
    const key = row.id - REF_BOOST * row.referrals
    const ahead = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM signups
       WHERE (id - ${REF_BOOST} * referrals) < ?1
          OR ((id - ${REF_BOOST} * referrals) = ?1 AND id < ?2)`,
    ).bind(key, row.id).first<number>('n')
    const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM signups').first<number>('n')

    return json({
      position: (ahead ?? 0) + 1,
      total: total ?? 0,
      code: row.code,
      referrals: row.referrals,
      boost: REF_BOOST,
    })
  } catch (err) {
    console.error('me: D1 failed', err)
    return json({ error: 'unavailable' }, 503)
  }
}

/* ---------- GET /api/stats ---------- */

async function stats(env: Env): Promise<Response> {
  if (!env.DB) return json({ total: null }, 200, 60)
  try {
    await ensureSchema(env.DB)
    const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM signups').first<number>('n')
    return json({ total: total ?? 0 }, 200, 60)
  } catch {
    return json({ total: null }, 200, 60)
  }
}

/* ---------- helpers ---------- */

// The table makes itself on first use, so a fresh D1 needs no
// migration step. migrations/0001_signups.sql is the same schema,
// kept for reading and for `wrangler d1 execute`.
let schemaReady = false
async function ensureSchema(db: D1Database) {
  if (schemaReady) return
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS signups (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT NOT NULL UNIQUE,
      code        TEXT NOT NULL UNIQUE,
      token       TEXT NOT NULL UNIQUE,
      source      TEXT,
      referred_by TEXT,
      credited    INTEGER NOT NULL DEFAULT 0,
      referrals   INTEGER NOT NULL DEFAULT 0,
      ip_hash     TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS signups_ip ON signups (ip_hash, created_at)'),
  ])
  schemaReady = true
}

function cookieFor(token: string) {
  return `${COOKIE}=${token}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get('Cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

function json(body: unknown, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store',
    },
  })
}

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

function randomHex(n: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256(s: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(d).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('')
}
