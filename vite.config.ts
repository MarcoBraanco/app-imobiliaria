import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function apiProxy(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/scrape', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const handler = (await import('./api/scrape')).default
            const parsed = JSON.parse(body)

            // Minimal adapter: VercelRequest/VercelResponse shim
            const fakeReq = { method: 'POST', body: parsed } as any
            const fakeRes = {
              statusCode: 200,
              status(code: number) { this.statusCode = code; return this },
              json(data: unknown) {
                res.writeHead(this.statusCode, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(data))
              },
            } as any

            await handler(fakeReq, fakeRes)
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    apiProxy(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Busca Imóveis',
        short_name: 'Imóveis',
        description: 'Busca colaborativa de apartamentos para alugar',
        lang: 'pt-BR',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
