import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico'],
          manifest: {
            name: 'StageReady',
            short_name: 'StageReady',
            description: '프레젠테이션 준비를 위한 종합 도구 - 목 풀기, 체크리스트, 발표 노트',
            theme_color: '#2DD4BF',
            background_color: '#0A0A0A',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            categories: ['productivity', 'education'],
            lang: 'ko',
            dir: 'ltr',
            shortcuts: [
              {
                name: '목 풀기',
                short_name: 'Warmup',
                description: '발성 워밍업 시작',
                url: '/?tab=warmup',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }]
              },
              {
                name: '체크리스트',
                short_name: 'Checklist',
                description: '발표 준비 확인',
                url: '/?tab=checklist',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }]
              },
              {
                name: '발표 노트',
                short_name: 'Notes',
                description: '발표 내용 보기',
                url: '/?tab=notes',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }]
              }
            ],
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            cleanupOutdatedCaches: true,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'tailwind-cache',
                  expiration: {
                    maxEntries: 5,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                  }
                }
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
