import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Avoid scanning sandbox HTML (CDN MapLibre) as Vite deps.
    entries: ['index.html'],
  },
  server: {
    watch: {
      ignored: ['**/sandbox/**'],
    },
    /**
     * In `npm run dev` there are no `api/` serverless functions.
     * Proxy `/api` to the deployed origin (same pattern as production).
     * For local BFF work, use `vercel dev` instead.
     */
    proxy: {
      '/api': {
        target: 'https://earthquake-tracker-siesquen.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
