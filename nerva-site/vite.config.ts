import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Three entry points: the build site, the store preview at /buy.html,
    // and the FAQ/updates page at /updates.html. Vite only picks up
    // index.html on its own, so the others are listed here.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        buy: fileURLToPath(new URL('./buy.html', import.meta.url)),
        updates: fileURLToPath(new URL('./updates.html', import.meta.url)),
      },
    },
  },
})
