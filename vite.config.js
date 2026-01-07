import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/linkdash/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'linkdash-icon.svg'],
      manifest: {
        name: 'LinkDash',
        short_name: 'LinkDash',
        description: 'Your new tab dashboard and link manager',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        start_url: './?q=',
        scope: './',
        icons: [
          {
            src: 'linkdash-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'linkdash-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
