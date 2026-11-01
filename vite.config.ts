import { execFileSync } from 'node:child_process';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { COLORS } from './src/config/game-config.ts';
import { GAME_INFO, webManifest } from './src/data/game-info.ts';
import { latestPrNumber } from './src/logic/release-number.ts';

const MANIFEST_FILE = 'manifest.webmanifest';
/** Montako uusinta committia käydään läpi uusimman PR:n numeron etsimiseksi. */
const GIT_LOG_DEPTH = 200;

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

// Commitien otsikot uusimmasta alkaen. Tyhjä, jos gitiä ei ole (esim. zip-tiedosto).
function gitSubjects(): string[] {
  try {
    const log = execFileSync('git', ['log', `-n${GIT_LOG_DEPTH}`, '--format=%s'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return log.split('\n');
  } catch {
    return [];
  }
}

// Versionumero (uusimman PR:n numero) ja julkaisuaika peliin, ks. src/logic/release-info.ts.
// Buildin aika on julkaisuaika: GitHub julkaisee pelin heti buildin perään (deploy.yml).
function releaseEnv(): Record<string, string> {
  const env: Record<string, string> = {
    'import.meta.env.VITE_RELEASE_TIME': JSON.stringify(new Date().toISOString()),
  };
  const prNumber = latestPrNumber(gitSubjects());
  if (prNumber !== null) env['import.meta.env.VITE_RELEASE_PR'] = JSON.stringify(String(prNumber));
  return env;
}

// base: './' toimii sekä paikallisesti että GitHub Pagesissa (/EquinoxUni/).
export default defineConfig({
  base: './',
  plugins: [gameInfo()],
  define: releaseEnv(),
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
