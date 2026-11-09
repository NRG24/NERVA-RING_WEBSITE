/* Offline tests for worker/index.ts. No network, no wrangler: D1 is
   faked with node:sqlite, which runs the Worker's real SQL.
   Run from nerva-site/ (Node 22.6 or later):
     node --experimental-strip-types --no-warnings --test worker/join.test.mjs */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import worker from './index.ts'

// index.ts makes the table once per isolate (schemaReady), so each fresh
// fake database gets the same schema from the migration file up front
const SCHEMA = readFileSync(new URL('./0001_signups.sql', import.meta.url), 'utf8')

const ORIGIN = 'https://nervaring.com'
const SALT = 'a-test-salt-of-enough-length'
const KIT = 'https://app.kit.com/forms/1/subscriptions'

function fakeD1() {
  const db = new DatabaseSync(':memory:')
  db.exec(SCHEMA)
  const stmt = (sql, args = []) => ({
    sql,
    args,
    bind: (...a) => stmt(sql, a),
    first: async (col) => {
      const row = db.prepare(sql).get(...args)
      if (!row) return null
      return col ? row[col] : row
    },
    run: async () => { db.prepare(sql).run(...args); return { success: true } },
  })
  return {
    raw: db,
    prepare: (sql) => stmt(sql),
    batch: async (list) => {
      db.exec('BEGIN')
      try {
        for (const s of list) db.prepare(s.sql).run(...s.args)
        db.exec('COMMIT')
      } catch (e) { db.exec('ROLLBACK'); throw e }
      return []
    },
  }
}

function env(over = {}) {
  return { KIT_FORM_ID: '1', DB: fakeD1(), IP_SALT: SALT, ...over }
}

function post(fields, { ip = '203.0.113.7', cookie, origin = ORIGIN } = {}) {
  const body = new URLSearchParams({ 'fields[ref_code]': '', ...fields })
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (ip) headers['CF-Connecting-IP'] = ip
  if (cookie) headers.Cookie = cookie
  if (origin) headers.Origin = origin
  return new Request(`${ORIGIN}/api/join`, { method: 'POST', headers, body })
}

const me = (e, cookie) =>
  worker.fetch(new Request(`${ORIGIN}/api/me`, { headers: cookie ? { Cookie: cookie } : {} }), e)

const cookieOf = (res) => (res.headers.get('Set-Cookie') ?? '').split(';')[0] || null

test('new address: recorded, 307 to Kit, cookie set, IP hashed', async () => {
  const e = env()
  const res = await worker.fetch(post({ email_address: 'a@example.com' }), e)
  assert.equal(res.status, 307)
  assert.equal(res.headers.get('Location'), KIT)
  assert.match(cookieOf(res), /^nerva_wl=[0-9a-f]{32}$/)
  const row = e.DB.raw.prepare('SELECT * FROM signups').get()
  assert.equal(row.email, 'a@example.com')
  assert.match(row.ip_hash, /^[0-9a-f]{32}$/)
  const m = await me(e, cookieOf(res))
  assert.equal(m.status, 200)
  assert.equal((await m.json()).position, 1)
})

test('existing address without its cookie: no cookie, not sent to Kit', async () => {
  const e = env()
  await worker.fetch(post({ email_address: 'a@example.com' }), e)
  const res = await worker.fetch(post({ email_address: 'A@Example.com ' }, { ip: '198.51.100.1' }), e)
  assert.equal(res.status, 303)
  assert.equal(res.headers.get('Location'), `${ORIGIN}/subscribed`)
  assert.equal(res.headers.get('Set-Cookie'), null)
  assert.equal(e.DB.raw.prepare('SELECT COUNT(*) AS n FROM signups').get().n, 1)
})

test('existing address with its own cookie: same answer, and /api/me still works', async () => {
  const e = env()
  const first = await worker.fetch(post({ email_address: 'a@example.com' }), e)
  const c = cookieOf(first)
  const res = await worker.fetch(post({ email_address: 'a@example.com' }, { cookie: c }), e)
  assert.equal(res.status, 303)
  assert.equal(res.headers.get('Set-Cookie'), null)
  assert.equal((await me(e, c)).status, 200)
})

test('/api/me with no or a wrong cookie: 404, not cached', async () => {
  const e = env()
  await worker.fetch(post({ email_address: 'a@example.com' }), e)
  for (const c of [undefined, 'nerva_wl=' + '0'.repeat(32), 'nerva_wl=../x']) {
    const r = await me(e, c)
    assert.equal(r.status, 404)
    assert.equal(r.headers.get('Cache-Control'), 'no-store')
  }
})

test('no IP_SALT (or a short one): no hash stored, no referral credit', async () => {
  for (const IP_SALT of [undefined, '', 'nerva-waitlist']) {
    const e = env({ IP_SALT })
    await worker.fetch(post({ email_address: 'r@example.com', 'fields[ref_code]': 'abcdefgh' }, { ip: '192.0.2.1' }), e)
    await worker.fetch(post({ email_address: 'f@example.com', 'fields[referred_by]': 'abcdefgh' }, { ip: '192.0.2.2' }), e)
    const rows = e.DB.raw.prepare('SELECT email, ip_hash, referred_by, credited, referrals FROM signups ORDER BY id').all()
    assert.deepEqual(rows.map((r) => r.ip_hash), [null, null])
    assert.equal(rows[1].referred_by, 'abcdefgh')
    assert.equal(rows[1].credited, 0)
    assert.equal(rows[0].referrals, 0)
  }
})

test('with salt: friend on another network is credited, same network is not', async () => {
  const e = env()
  await worker.fetch(post({ email_address: 'r@example.com', 'fields[ref_code]': 'abcdefgh' }, { ip: '192.0.2.1' }), e)
  await worker.fetch(post({ email_address: 'f1@example.com', 'fields[referred_by]': 'abcdefgh' }, { ip: '192.0.2.2' }), e)
  await worker.fetch(post({ email_address: 'f2@example.com', 'fields[referred_by]': 'abcdefgh' }, { ip: '192.0.2.1' }), e)
  const credited = e.DB.raw.prepare('SELECT credited FROM signups ORDER BY id').all().map((r) => r.credited)
  assert.deepEqual(credited, [0, 1, 0])
  assert.equal(e.DB.raw.prepare("SELECT referrals FROM signups WHERE code = 'abcdefgh'").get().referrals, 1)
})

test('rate limit binding says no: back to /waitlist?err=busy, nothing stored', async () => {
  const keys = []
  const e = env({ JOIN_LIMIT: { limit: async ({ key }) => { keys.push(key); return { success: false } } } })
  const res = await worker.fetch(post({ email_address: 'a@example.com' }), e)
  assert.equal(res.status, 303)
  assert.equal(res.headers.get('Location'), `${ORIGIN}/waitlist?err=busy`)
  assert.deepEqual(keys, ['203.0.113.7'])
  assert.equal(e.DB.raw.prepare('SELECT COUNT(*) AS n FROM signups').get().n, 0)
})

test('rate limit binding throws or is missing: fails open', async () => {
  const e = env({ JOIN_LIMIT: { limit: async () => { throw new Error('down') } } })
  const res = await worker.fetch(post({ email_address: 'a@example.com' }), e)
  assert.equal(res.status, 307)
  const e2 = env()
  assert.equal((await worker.fetch(post({ email_address: 'b@example.com' }), e2)).status, 307)
})

test('D1 hourly cap per hashed IP', async () => {
  const e = env()
  for (let i = 0; i < 60; i++) {
    const r = await worker.fetch(post({ email_address: `u${i}@example.com` }), e)
    assert.equal(r.status, 307, `signup ${i}`)
  }
  const res = await worker.fetch(post({ email_address: 'u60@example.com' }), e)
  assert.equal(res.headers.get('Location'), `${ORIGIN}/waitlist?err=busy`)
  // another network is unaffected
  assert.equal((await worker.fetch(post({ email_address: 'x@example.com' }, { ip: '192.0.2.9' }), e)).status, 307)
  // rows older than an hour don't count
  e.DB.raw.exec("UPDATE signups SET created_at = datetime('now', '-2 hours')")
  assert.equal((await worker.fetch(post({ email_address: 'u99@example.com' }), e)).status, 307)
})

test('Origin: another site is refused, same site / none / null pass', async () => {
  const e = env()
  const bad = await worker.fetch(post({ email_address: 'a@example.com' }, { origin: 'https://evil.example' }), e)
  assert.equal(bad.status, 303)
  assert.equal(bad.headers.get('Location'), `${ORIGIN}/waitlist`)
  assert.equal((await worker.fetch(post({ email_address: 'b@example.com' }, { origin: null }), e)).status, 307)
  assert.equal((await worker.fetch(post({ email_address: 'c@example.com' }, { origin: 'null' }), e)).status, 307)
})

test('no DB: still 307 to Kit, no cookie', async () => {
  const res = await worker.fetch(post({ email_address: 'a@example.com' }), env({ DB: undefined }))
  assert.equal(res.status, 307)
  assert.equal(res.headers.get('Set-Cookie'), null)
})

test('honeypot and bad email unchanged', async () => {
  const e = env()
  const hp = await worker.fetch(post({ email_address: 'a@example.com', company: 'x' }), e)
  assert.equal(hp.headers.get('Location'), `${ORIGIN}/subscribed`)
  const bad = await worker.fetch(post({ email_address: 'nope' }), e)
  assert.equal(bad.headers.get('Location'), `${ORIGIN}/waitlist?err=email`)
})
