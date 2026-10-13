import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Six entry points: the build site, the store preview at /buy.html, the
    // privacy / disclaimer sheet, the bench-prototype photos at /prototype,
    // the bare signup form at /waitlist, and /subscribed, where Kit sends
    // people after they sign up. Vite only picks up index.html on its own,
    // so the other five are listed here.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        buy: fileURLToPath(new URL('./buy.html', import.meta.url)),
        privacy: fileURLToPath(new URL('./privacy.html', import.meta.url)),
        prototype: fileURLToPath(new URL('./prototype.html', import.meta.url)),
        waitlist: fileURLToPath(new URL('./waitlist.html', import.meta.url)),
        subscribed: fileURLToPath(new URL('./subscribed.html', import.meta.url)),
      },
    },
  },
})
