import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vite only bundles index.html unless the other pages are named here — the
// existing work/privacy/terms pages were never reaching dist because of that.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        work:    resolve(__dirname, 'work.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms:   resolve(__dirname, 'terms.html'),
        case:    resolve(__dirname, 'case.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
