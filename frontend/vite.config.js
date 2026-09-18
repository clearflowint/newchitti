import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const apiServerPlugin = () => ({
  name: 'api-server-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && (req.url.startsWith('/api/') || req.url === '/api' || req.url.startsWith('/api?'))) {
        try {
          const { handleApiRequest } = await import('../backend/app/routes/apiRouter.js');
          await handleApiRequest(req, res);
        } catch (err) {
          console.error('[Vite API Middleware Error]:', err);
          next(err);
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  root: path.resolve(__dirname, '.'),
  plugins: [
    vue(),
    apiServerPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ClearFlow Small Chits',
        short_name: 'ClearFlow',
        description: 'Chit Fund 20-Month Workflow Automation',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});
