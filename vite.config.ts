import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleApiRoute } from './server/router.ts';

function rootRedirectPlugin(): Plugin {
  return {
    name: 'root-redirect-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRoute(req, res, next);
      });
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/html/index.html';
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=html/index.html"></head><body><script>window.location.href="html/index.html";</script></body></html>'
      });
    }
  };
}

export default defineConfig({
  root: '.',
  plugins: [rootRedirectPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'html/index.html'),
        dashboard: path.resolve(process.cwd(), 'html/dashboard.html'),
        newReview: path.resolve(process.cwd(), 'html/new-review.html'),
        review: path.resolve(process.cwd(), 'html/review.html'),
        reviews: path.resolve(process.cwd(), 'html/reviews.html'),
        repositories: path.resolve(process.cwd(), 'html/repositories.html'),
        complexity: path.resolve(process.cwd(), 'html/complexity.html'),
        settings: path.resolve(process.cwd(), 'html/settings.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});

