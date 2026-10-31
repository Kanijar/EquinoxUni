import type Phaser from 'phaser';
import { SCREEN_WIPE } from '../config/battle-config';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game-config';
import { wipeOrder } from '../logic/battle-look';

// Pikselöity siirtymä: ruutu täyttyy (tai tyhjenee) mustista pikseliruuduista
// vinosti vasemmalta oikealle. Käytössä kartalta taisteluun ja takaisin.
// Piirretään yhdellä Graphics-oliolla, joten se on kevyt myös puhelimelle.

const COLS = Math.ceil(GAME_WIDTH / SCREEN_WIPE.cellPx);
const ROWS = Math.ceil(GAME_HEIGHT / SCREEN_WIPE.cellPx);
const ORDER = wipeOrder(COLS, ROWS);
const SIZE_STEPS = 4;

/** Peittää ruudun pikseleillä ja kutsuu lopuksi done(). */
export function coverScreen(scene: Phaser.Scene, done: () => void): void {
  runWipe(scene, { covering: true, ms: SCREEN_WIPE.coverMs, done });
}

/** Paljastaa ruudun: aluksi kokonaan peitetty, pikselit katoavat samassa järjestyksessä. */
export function revealScreen(scene: Phaser.Scene): void {
  runWipe(scene, { covering: false, ms: SCREEN_WIPE.revealMs, done: () => {} });
}

interface WipeRun {
  readonly covering: boolean;
  readonly ms: number;
  readonly done: () => void;
}

function runWipe(scene: Phaser.Scene, run: WipeRun): void {
  const g = scene.add.graphics().setScrollFactor(0).setDepth(SCREEN_WIPE.depth);
  draw(g, 0, run.covering);
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: run.ms,
    onUpdate: (tween) => draw(g, tween.getValue() ?? 1, run.covering),
    onComplete: () => {
      if (!run.covering) {
        g.destroy();
      }
      run.done();
    },
  });
}

/** Piirtää ruudut, joiden vuoro on tullut. Reunalla ruudut ovat vielä pienempiä. */
function draw(g: Phaser.GameObjects.Graphics, progress: number, covering: boolean): void {
  const cell = SCREEN_WIPE.cellPx;
  g.clear();
  g.fillStyle(SCREEN_WIPE.color, 1);
  ORDER.forEach((order, index) => {
    const local = Math.min(1, Math.max(0, (progress * 1.3 - order) / 0.3));
    const amount = covering ? local : 1 - local;
    if (amount <= 0) {
      return;
    }
    // Koko kasvaa neljän pikselin askelin, jotta reunat pysyvät terävinä pikseleinä.
    const size = Math.ceil(amount * SIZE_STEPS) * (cell / SIZE_STEPS);
    const inset = Math.floor((cell - size) / 2);
    const x = (index % COLS) * cell + inset;
    const y = Math.floor(index / COLS) * cell + inset;
    g.fillRect(x, y, size, size);
  });
}
