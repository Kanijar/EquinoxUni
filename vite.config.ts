import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { COLORS } from './src/config/game-config.ts';
import { GAME_INFO, webManifest } from './src/data/game-info.ts';

const MANIFEST_FILE = 'manifest.webmanifest';

// Kirjoittaa pelin nimen (src/data/game-info.ts) sivun otsikkoon ja PWA-manifestiin,
// jotta nimi on määritelty vain yhdessä paikassa.
function gameInfo(): Plugin {
  const manifest = JSON.stringify(webManifest(COLORS.background), null, 2);
  return {
    name: 'game-info',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%GAME_NAME%', GAME_INFO.name),
    },
    configureServer(server) {
      server.middlewares.use(`/${MANIFEST_FILE}`, (_req, res) => {
        res.setHeader('Content-Type', 'application/manifest+json');
        res.end(manifest);
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: MANIFEST_FILE, source: manifest });
    },
  };
}

// base: './' toimii sekä paikallisesti että GitHub Pagesissa (/EquinoxUni/).
export default defineConfig({
  base: './',
  plugins: [gameInfo()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
