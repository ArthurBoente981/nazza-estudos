import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// No GitHub Pages o app fica em /nazza-estudos/; rodando local fica na raiz.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/nazza-estudos/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // versão nova é baixada sozinha e entra na próxima abertura
      includeAssets: ['icones/*.png'],
      manifest: {
        name: 'Estuda com a Nazza',
        short_name: 'Nazza',
        description: 'Questões do concurso UFRJ com a Nazzareh',
        lang: 'pt-BR',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#130f1f',
        theme_color: '#5b34b5',
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icones/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tudo do app fica salvo no celular pra funcionar offline (vídeos em webm e mp4: ~1 MB)
        globPatterns: ['**/*.{js,css,html,png,webp,jpg,webm,mp4}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'fontes', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
}))
