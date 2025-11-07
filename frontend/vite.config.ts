import { defineConfig } from 'vite';

export default defineConfig({
  // Disable Vite's public directory to avoid serving raw source files placed
  // under `public/src` (which would bypass Vite's transform and cause the
  // browser to receive untranspiled TSX). This keeps `public/` present but
  // not served. If you rely on a public dir, change this accordingly.
  publicDir: false,
  server: {
    proxy: {
      '/scl': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/bulk-email': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/webhooks': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
