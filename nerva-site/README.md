# NERVA Ring site

## Waitlist Worker: one-time setup

`worker/index.ts` runs `/api/*` (the waitlist). Before the first deploy, and
on any new Cloudflare account:

1. **Set the IP salt secret (required).**

   ```sh
   openssl rand -hex 32          # copy the output
   npx wrangler secret put IP_SALT
   ```

   `wrangler.jsonc` lists `IP_SALT` under `secrets.required`, so
   `wrangler deploy` stops with an error until it is set. If it is ever
   missing anyway, the Worker stores no IP hash and gives no referral credit,
   rather than hashing with a salt anyone could guess. Never put it in
   `vars`. Changing it later only means new hashes no longer match old ones
   (old signups stop counting towards the per-network limits).

   If the site ran before this secret existed, the stored hashes were made
   with the old built-in salt and can be reversed. Clear them once:

   ```sh
   npx wrangler d1 execute nerva-waitlist --remote --command "UPDATE signups SET ip_hash = NULL"
   ```

2. **Pin the D1 database id.** Run `npx wrangler d1 list`, copy the id of
   `nerva-waitlist`, and add it as `"database_id"` in `wrangler.jsonc`
   (see the TODO there).

3. **Rate limit.** The `JOIN_LIMIT` binding in `wrangler.jsonc` (5 posts per
   IP per minute) needs no dashboard step. Its `namespace_id` only has to be
   unique among the account's rate limiters; change it if `1001` is taken.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
