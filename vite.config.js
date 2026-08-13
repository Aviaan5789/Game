import { defineConfig } from 'vite';

// Served from https://<user>.github.io/Game/ on GitHub Pages, so assets
// need to resolve relative to that subpath rather than the domain root.
export default defineConfig({
  base: '/Game/',
});
