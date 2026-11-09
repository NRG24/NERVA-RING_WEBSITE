-- Same schema the Worker creates on first use (ensureSchema in index.ts).
-- Handy reads, from nerva-site/:
--   npx wrangler d1 execute nerva-waitlist --remote --command "SELECT COUNT(*) FROM signups"
--   npx wrangler d1 execute nerva-waitlist --remote --command "SELECT source, COUNT(*) FROM signups GROUP BY source"
--   npx wrangler d1 execute nerva-waitlist --remote --command "SELECT email, referrals FROM signups ORDER BY referrals DESC LIMIT 20"

CREATE TABLE IF NOT EXISTS signups (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  code        TEXT NOT NULL UNIQUE,  -- public: goes in the share link as ?ref=
  token       TEXT NOT NULL UNIQUE,  -- private: the HttpOnly cookie, never shown
  source      TEXT,                  -- utm_source, or nervaring.com
  referred_by TEXT,                  -- the code of whoever shared the link
  credited    INTEGER NOT NULL DEFAULT 0,  -- 1 if that referrer got the credit
  referrals   INTEGER NOT NULL DEFAULT 0,  -- credited friends who joined via this code
  ip_hash     TEXT,                  -- SHA-256 of IP_SALT secret + IP, for abuse limits; NULL if no secret
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS signups_ip ON signups (ip_hash, created_at);
