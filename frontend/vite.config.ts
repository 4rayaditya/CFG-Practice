import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'MentorMatch AI',
        short_name: 'MentorMatch',
        description: 'Offline-capable, voice-enabled AI mentorship platform connecting students with specialized mentors.',
        theme_color: '#0284c7',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache all static build assets (HTML, CSS, JS, fonts)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        navigateFallback: '/index.html',
        // Explicitly exclude backend API routes from service worker navigation fallback & caching
        navigateFallbackDenylist: [/^\/api\/.*$/, /^\/docs.*$/, /^\/openapi\.json$/],
        runtimeCaching: [
          {
            // NetworkFirst for Supabase Database REST and Auth endpoints
            urlPattern: ({ url }) => url.hostname.includes('supabase.co') && url.pathname.includes('/rest/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // StaleWhileRevalidate for External Images (Unsplash, avatars, CDN)
            urlPattern: ({ request, url }) => 
              request.destination === 'image' || 
              url.hostname.includes('images.unsplash.com') ||
              url.hostname.includes('avatars.githubusercontent.com'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // StaleWhileRevalidate for Google Fonts stylesheets & webfonts
            urlPattern: ({ url }) => 
              url.origin === 'https://fonts.googleapis.com' || 
              url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
