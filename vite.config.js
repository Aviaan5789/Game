import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// Served from https://<user>.github.io/Game/ on GitHub Pages, so assets
// need to resolve relative to that subpath rather than the domain root.
// This is a multi-page build: a landing page at the root plus one
// self-contained sub-app per game, each with its own index.html/src.
export default defineConfig({
  base: '/Game/',
  build: {
    rollupOptions: {
      input: {
        hub: resolve(root, 'index.html'),
        turboDodge: resolve(root, 'turbo-dodge/index.html'),
        penaltyKing: resolve(root, 'penalty-king/index.html'),
      },
    },
  },
});
