import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'logo.png', 'logo.jpeg', 'libs/**/*', 'fonts/**/*'],
        manifest: {
          name: 'CBT Hub',
          short_name: 'CBTHub',
          description: 'Computer Based Tests portal',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'fullscreen',
          start_url: './',
          scope: './',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          // Exclude the large test HTML files from being precached to prevent memory/bandwidth spikes on initial load
          globIgnores: ['cbts/**/*.html'],
          runtimeCaching: [
            {
              // Dynamically cache KaTeX local libraries and font assets with CacheFirst strategy for 100% offline math rendering
              urlPattern: ({ url }) => url.pathname.includes('/libs/') || url.pathname.includes('/fonts/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'local-katex-assets-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Dynamically cache CBT tests only when they are actually opened
              urlPattern: ({ url }) => url.pathname.includes('/cbts/'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'cbt-tests-cache',
                expiration: {
                  maxEntries: 100, // Keep up to 100 tests cached
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Cache jsdelivr (for KaTeX)
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'jsdelivr-cdn-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Cache cdnjs (for cropperjs)
              urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdnjs-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            }
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
