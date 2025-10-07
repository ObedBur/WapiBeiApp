import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/WapiBeiApp/',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
