import type Phaser from 'phaser';
import { BATTLE_CAMERA, BATTLE_STAGE } from '../../config/battle-config';
import { COLORS, FONT, GAME_WIDTH } from '../../config/game-config';

// Koko ruutua koskevat taisteluefektit: kameran tärähdys ja zoomaus kriittisestä
// osumasta, kilpi puolustaessa, lentävä esine varastaessa ja iso voittoteksti.

const BANNER_DEPTH = 950;
const SHIELD_DEPTH = 120;
const BANNER_STROKE = 6;
const BANNER_POP = 2.2;
const BANNER_POP_MS = 260;
const SHIELD_FILL_ALPHA = 0.15;
const SHIELD_START_SCALE = 0.4;
const ITEM_SCALE = 2;

/** Tavallinen osuma: pieni tärähdys. */
export function shakeHit(scene: Phaser.Scene): void {
  scene.cameras.main.shake(BATTLE_CAMERA.hitShakeMs, BATTLE_CAMERA.hitShakeIntensity);
}

/** Kriittinen osuma: valkoinen välähdys ja nopea zoomaus sisään ja ulos. */
export function critImpact(scene: Phaser.Scene): void {
  const { critFlashMs, critFlashRgb, punchZoom, punchMs } = BATTLE_CAMERA;
  const [red, green, blue] = critFlashRgb;
  const camera = scene.cameras.main;
  camera.flash(critFlashMs, red, green, blue);
  scene.tweens.add({ targets: camera, zoom: punchZoom, duration: punchMs, yoyo: true });
}

/** Sininen kilpikupla pelaajan ympärillä: syttyy, sykkii ja himmenee. */
export function showShield(scene: Phaser.Scene, at: { x: number; y: number }): void {
  const { radius, color, width, ms } = BATTLE_STAGE.shield;
  const ring = scene.add
    .circle(at.x, at.y, radius)
    .setStrokeStyle(width, color)
    .setFillStyle(color, SHIELD_FILL_ALPHA)
    .setDepth(SHIELD_DEPTH)
    .setScale(SHIELD_START_SCALE);
  scene.tweens.add({ targets: ring, scale: 1, duration: ms / 8, ease: 'Back.easeOut' });
  scene.tweens.add({
    targets: ring,
    alpha: 0,
    delay: ms / 2,
    duration: ms / 2,
    onComplete: () => ring.destroy(),
  });
}

/** Esine lentää kaarena paikasta toiseen (vihollinen nappaa juoman). */
export function throwItem(
  scene: Phaser.Scene,
  spriteKey: string,
  path: { readonly from: { x: number; y: number }; readonly to: { x: number; y: number } },
): void {
  const item = scene.add
    .image(path.from.x, path.from.y, spriteKey)
    .setScale(ITEM_SCALE)
    .setDepth(SHIELD_DEPTH);
  const flightMs = BATTLE_STAGE.lunge.ms * 3;
  scene.tweens.add({ targets: item, x: path.to.x, duration: flightMs });
  scene.tweens.add({
    targets: item,
    y: Math.min(path.from.y, path.to.y) - BATTLE_STAGE.lunge.hopPx * 3,
    duration: flightMs / 2,
    ease: 'Quad.easeOut',
    yoyo: true,
    onComplete: () => item.destroy(),
  });
}

/** Iso teksti ruudun keskellä (VOITTO!), ponnahtaa esiin ja häviää. */
export function showBanner(scene: Phaser.Scene, text: string, color: string): void {
  const banner = scene.add
    .text(GAME_WIDTH / 2, BATTLE_CAMERA.bannerY, text, {
      fontFamily: FONT.family,
      fontSize: FONT.large,
      color,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setStroke(COLORS.textShadow, BANNER_STROKE)
    .setDepth(BANNER_DEPTH)
    .setScale(BANNER_POP);
  scene.tweens.add({ targets: banner, scale: 1, duration: BANNER_POP_MS, ease: 'Back.easeOut' });
  scene.tweens.add({
    targets: banner,
    alpha: 0,
    delay: BATTLE_CAMERA.bannerMs * 0.7,
    duration: BATTLE_CAMERA.bannerMs * 0.3,
    onComplete: () => banner.destroy(),
  });
}
