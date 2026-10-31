import type Phaser from 'phaser';
import { BATTLE_VIEW } from '../config/game-config';
import type { Vec2 } from '../logic/vector';

// Voittoruudun pudotus: esineen kuva ponnahtaa kaatuneen vihollisen kohdalta,
// nousee hetken ylöspäin ja häviää. Teksti "Löysit: ..." näkyy viestilaatikossa.

const DEPTH = 900;

export function showLootPopup(scene: Phaser.Scene, spriteKey: string, at: Vec2): void {
  const { scale, offsetY, risePx, popMs, holdMs, fadeMs } = BATTLE_VIEW.loot;
  const icon = scene.add
    .image(at.x, at.y - offsetY, spriteKey)
    .setScale(0)
    .setDepth(DEPTH);
  scene.tweens.add({
    targets: icon,
    scale,
    y: icon.y - risePx,
    duration: popMs,
    ease: 'Back.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: icon,
        alpha: 0,
        delay: holdMs,
        duration: fadeMs,
        onComplete: () => icon.destroy(),
      });
    },
  });
}
