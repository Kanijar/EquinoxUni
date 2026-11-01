import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { COLORS } from './src/config/game-config.ts';
import { APP_ICON, manifestIcon } from './src/data/app-icon.ts';
import { GAME_INFO, webManifest } from './src/data/game-info.ts';
import { renderPixelIcon } from './src/logic/pixel-icon.ts';
import { encodePng } from './src/logic/png-encode.ts';
import { latestPrNumber } from './src/logic/release-number.ts';

const MANIFEST_FILE = 'manifest.webmanifest';
/** Montako uusinta committia käydään läpi uusimman PR:n numeron etsimiseksi. */
const GIT_LOG_DEPTH = 200;

interface GeneratedFile {
  readonly contentType: string;
  readonly source: string | Uint8Array;
}

// PWA-tiedostot: manifesti ja pikselikuvakkeet (src/data/app-icon.ts). Ne tehdään koodista,
// joten public/-kansiota ja käsin piirrettyjä kuvia ei tarvita.
function pwaFiles(): Map<string, GeneratedFile> {
  const files = new Map<string, GeneratedFile>();
  for (const variant of APP_ICON.variants) {
    const image = renderPixelIcon(APP_ICON, { ...variant, background: APP_ICON.background });
    files.set(variant.file, { contentType: 'image/png', source: encodePng(image, deflateSync) });
  }
  const manifest = webManifest(COLORS.background, APP_ICON.variants.map(manifestIcon));
  const json = JSON.stringify(manifest, null, 2);
  files.set(MANIFEST_FILE, { contentType: 'application/manifest+json', source: json });
  return files;
}

// Kirjoittaa pelin nimen (src/data/game-info.ts) sivun otsikkoon ja PWA-manifestiin,
// jotta nimi on määritelty vain yhdessä paikassa. Kehityspalvelin tarjoilee samat tiedostot.
function gameInfo(): Plugin {
  const files = pwaFiles();
  return {
    name: 'game-info',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%GAME_NAME%', GAME_INFO.name),
    },
    configureServer(server) {
      for (const [fileName, file] of files) {
        server.middlewares.use(`/${fileName}`, (_req, res) => {
          res.setHeader('Content-Type', file.contentType);
          res.end(file.source);
        });
      }
    },
    generateBundle() {
      for (const [fileName, file] of files) {
        this.emitFile({ type: 'asset', fileName, source: file.source });
      }
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
