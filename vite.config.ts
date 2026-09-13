import path from 'path';
import { defineConfig, Plugin } from 'vite';

function rootRedirectPlugin(): Plugin {
  return {
    name: 'root-redirect-plugin',
    configureServer(server) {
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
        main: path.resolve(__dirname, 'html/index.html'),
        dashboard: path.resolve(__dirname, 'html/dashboard.html'),
        newReview: path.resolve(__dirname, 'html/new-review.html'),
        review: path.resolve(__dirname, 'html/review.html'),
        reviews: path.resolve(__dirname, 'html/reviews.html'),
        repositories: path.resolve(__dirname, 'html/repositories.html'),
        complexity: path.resolve(__dirname, 'html/complexity.html'),
        settings: path.resolve(__dirname, 'html/settings.html'),
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
