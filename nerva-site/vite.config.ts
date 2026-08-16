import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Two entry points: the build site and the store preview at /buy.html.
    // Vite only picks up index.html on its own, so buy.html is listed here.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        buy: fileURLToPath(new URL('./buy.html', import.meta.url)),
      },
    },
  },
})
