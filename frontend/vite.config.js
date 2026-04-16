import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy /predict and /api/* calls to the FastAPI backend running on port 8000.
      // This avoids CORS issues in the browser during local development.
      '/predict': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/audio-sample': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

