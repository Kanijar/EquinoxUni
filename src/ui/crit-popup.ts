import type Phaser from 'phaser';
import { BATTLE_VIEW, COLORS, FONT, GAME_WIDTH } from '../config/game-config';
import { TEXT } from '../i18n/fi';

// Kriittisen osuman efekti: ruutu tärähtää ja "KRIITTINEN OSUMA!" nousee
// kohteen yläpuolelle ja häviää.

const POPUP_DEPTH = 900;
const POPUP_STROKE = 4;

/** Näyttää kriittisen osuman efektin kohdassa (x, y), joka on osuman kohteen jalkojen kohta. */
export function showCritPopup(scene: Phaser.Scene, x: number, y: number): void {
  const { shakeMs, shakeIntensity, popupMs, popupRisePx, popupOffsetY } = BATTLE_VIEW.crit;
  scene.cameras.main.shake(shakeMs, shakeIntensity);
  const text = scene.add
    .text(x, y - popupOffsetY, TEXT.battle.critPopup, {
      fontFamily: FONT.family,
      fontSize: FONT.large,
      color: COLORS.critText,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setStroke(COLORS.textShadow, POPUP_STROKE)
    .setDepth(POPUP_DEPTH);
  // Pidetään teksti kokonaan ruudulla, vaikka kohde on lähellä reunaa.
  const half = text.width / 2 + BATTLE_VIEW.margin;
  text.setX(Math.min(Math.max(x, half), GAME_WIDTH - half));
  scene.tweens.add({
    targets: text,
    y: text.y - popupRisePx,
    alpha: 0,
    duration: popupMs,
    ease: 'Cubic.easeIn',
    onComplete: () => text.destroy(),
  });
}
