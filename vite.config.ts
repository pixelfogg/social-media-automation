import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'live-crawler-proxy',
      configureServer(server) {
        server.middlewares.use('/api/crawl', async (req, res) => {
          try {
            const urlObj = new URL(req.url || '', 'http://localhost:5173');
            const targetUrl = urlObj.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing target url parameter' }));
              return;
            }

            const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
            const response = await fetch(cleanUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });

            if (!response.ok) {
              res.statusCode = response.status;
              res.end(JSON.stringify({ error: `Target responded with ${response.status}` }));
              return;
            }

            const html = await response.text();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(html);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Crawl proxy error' }));
          }
        });
      }
    }
  ],
})
