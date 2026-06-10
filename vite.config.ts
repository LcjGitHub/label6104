/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 9101,
    strictPort: true,
  },
  preview: {
    port: 9101,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
