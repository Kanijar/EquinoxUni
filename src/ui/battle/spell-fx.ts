import type Phaser from 'phaser';
import { BATTLE_VIEW } from '../../config/game-config';
import type { Point } from './fireball';

// Noidan loitsujen efektit taistelussa: salama iskee ylhäältä viholliseen ja jäänuoli lentää
// suoraan loitsijalta viholliseen. Kun efekti osuu, onHit kutsutaan (vahinko ja numerot
// näytetään ui/battle-view.ts:ssä). Tulipallo on omassa tiedostossaan (fireball.ts).

const SPELL_FX_DEPTH = 800;

/** Salama: sahalaitainen viiva ruudun yläreunasta kohteeseen välähtää ja katoaa. */
export function showLightning(scene: Phaser.Scene, to: Point, onHit: () => void): void {
  const { color, glowColor, width, glowWidth, segments, jitterPx, flashMs } = BATTLE_VIEW.lightning;
  const points: Point[] = [];
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const jitter = index === 0 || index === segments ? 0 : (Math.random() * 2 - 1) * jitterPx;
    points.push({ x: to.x + jitter, y: to.y * t });
  }
  const bolt = scene.add.graphics().setDepth(SPELL_FX_DEPTH);
  for (const [lineWidth, lineColor] of [
    [glowWidth, glowColor],
    [width, color],
  ] as const) {
    bolt.lineStyle(lineWidth, lineColor, 1);
    bolt.beginPath();
    points.forEach((point, index) =>
      index === 0 ? bolt.moveTo(point.x, point.y) : bolt.lineTo(point.x, point.y),
    );
    bolt.strokePath();
  }
  onHit();
  scene.tweens.add({
    targets: bolt,
    alpha: 0,
    duration: flashMs,
    onComplete: () => bolt.destroy(),
  });
}

/** Jäänuoli: valkoinen kärki ja sininen varsi lentävät suoraan kohteeseen. */
export function showIceArrow(
  scene: Phaser.Scene,
  path: { readonly from: Point; readonly to: Point },
  onHit: () => void,
): void {
  const { color, coreColor, length, width, flightMs } = BATTLE_VIEW.iceArrow;
  const { from, to } = path;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const shaft = scene.add.rectangle(from.x, from.y, length, width, color);
  const tip = scene.add.rectangle(from.x, from.y, width, width, coreColor);
  for (const part of [shaft, tip]) {
    part.setRotation(angle).setDepth(SPELL_FX_DEPTH);
  }
  const tipOffset = { x: (Math.cos(angle) * length) / 2, y: (Math.sin(angle) * length) / 2 };
  tip.setPosition(from.x + tipOffset.x, from.y + tipOffset.y);
  scene.tweens.add({ targets: shaft, x: to.x, y: to.y, duration: flightMs });
  scene.tweens.add({
    targets: tip,
    x: to.x + tipOffset.x,
    y: to.y + tipOffset.y,
    duration: flightMs,
    onComplete: () => {
      shaft.destroy();
      tip.destroy();
      onHit();
    },
  });
}
