import Phaser from 'phaser';
import { MENU_VIEW, SLIME_SQUISH } from '../config/game-config';
import { playSound } from '../systems/sound-fx';
import { burstStars } from './wolf-magic';

// Alkuruudun lima, jota voi napauttaa: lima litistyy, mulahtaa ja roiskii pisaroita.
// Mitä napautus tekee pelissä, päättää kutsuja (scenes/menu-scene.ts).

/** Tekee kuvasta napautettavan. onTap kutsutaan joka napautuksella. */
export function makeSquishySlime(
  scene: Phaser.Scene,
  slime: Phaser.GameObjects.Image,
  onTap: () => void,
): void {
  let squishing: Phaser.Tweens.Tween | null = null;
  slime.setInteractive();
  slime.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    playSound('splat');
    squishing?.stop();
    squishing = squish(scene, slime);
    const center = { x: slime.x, y: slime.y - slime.displayHeight / 4 };
    burstStars(scene, center, SLIME_SQUISH.splashCount, SLIME_SQUISH.splashColors);
    onTap();
  });
}

/** Lima litistyy leveäksi ja palaa muotoonsa. Keinunta (y) jatkuu samalla. */
function squish(scene: Phaser.Scene, slime: Phaser.GameObjects.Image): Phaser.Tweens.Tween {
  const scale = MENU_VIEW.characterScale;
  slime.setScale(scale);
  return scene.tweens.add({
    targets: slime,
    scaleX: scale * SLIME_SQUISH.scaleX,
    scaleY: scale * SLIME_SQUISH.scaleY,
    duration: SLIME_SQUISH.ms,
    yoyo: true,
  });
}
