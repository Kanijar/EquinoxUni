import type Phaser from 'phaser';
import { DAMAGE_NUMBERS } from '../../config/battle-config';
import { COLORS, FONT } from '../../config/game-config';

// Lentävät numerot: vahinko, kriittinen osuma, palaminen, paraneminen ja torjuttu isku.
// Numero ponnahtaa isoksi, kutistuu ja nousee ylös häviten. Kriittinen on isompi ja kultainen.

export type DamageNumberKind = keyof typeof DAMAGE_NUMBERS.colors;

const NUMBER_DEPTH = 850;

export function showDamageNumber(
  scene: Phaser.Scene,
  at: { readonly x: number; readonly y: number },
  text: string,
  kind: DamageNumberKind,
): void {
  const { risePx, ms, popScale, popMs, stroke, spreadPx, fontSize, colors } = DAMAGE_NUMBERS;
  const size = kind === 'crit' ? fontSize.crit : kind === 'burn' ? fontSize.small : fontSize.normal;
  const x = at.x + (Math.random() * 2 - 1) * spreadPx;
  const label = scene.add
    .text(x, at.y, text, {
      fontFamily: FONT.family,
      fontSize: size,
      color: colors[kind],
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setStroke(COLORS.textShadow, stroke)
    .setDepth(NUMBER_DEPTH)
    .setScale(popScale);
  scene.tweens.add({ targets: label, scale: 1, duration: popMs, ease: 'Back.easeOut' });
  scene.tweens.add({
    targets: label,
    y: at.y - risePx,
    duration: ms,
    ease: 'Quad.easeOut',
  });
  scene.tweens.add({
    targets: label,
    alpha: 0,
    delay: ms / 2,
    duration: ms / 2,
    onComplete: () => label.destroy(),
  });
}
