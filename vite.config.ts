import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        dashboard: path.resolve(__dirname, 'dashboard.html'),
        newReview: path.resolve(__dirname, 'new-review.html'),
        review: path.resolve(__dirname, 'review.html'),
        reviews: path.resolve(__dirname, 'reviews.html'),
        repositories: path.resolve(__dirname, 'repositories.html'),
        complexity: path.resolve(__dirname, 'complexity.html'),
        settings: path.resolve(__dirname, 'settings.html'),
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
