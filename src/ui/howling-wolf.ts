import Phaser from 'phaser';
import { MENU_VIEW } from '../config/game-config';
import { playSound } from '../systems/sound-fx';

// Alkuruudun susi, jota voi napauttaa: susi ulvahtaa ja nostaa päänsä.
// Mitä napautus tekee pelissä, päättää kutsuja (scenes/menu-scene.ts).

/** Tekee kuvasta napautettavan. onTap kutsutaan joka napautuksella. */
export function makeHowlingWolf(
  scene: Phaser.Scene,
  wolf: Phaser.GameObjects.Image,
  onTap: () => void,
): void {
  let howling: Phaser.Tweens.Tween | null = null;
  wolf.setInteractive();
  wolf.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    playSound('howl');
    howling?.stop();
    howling = howl(scene, wolf);
    onTap();
  });
}

/**
 * Pää ylös ja pieni pullistus. Susi katsoo vasemmalle, joten myötäpäivään kallistus
 * nostaa päätä. Keinunta (y) jatkuu samalla, koska tämä muuttaa vain kulmaa ja kokoa.
 */
function howl(scene: Phaser.Scene, wolf: Phaser.GameObjects.Image): Phaser.Tweens.Tween {
  const scale = MENU_VIEW.characterScale;
  wolf.setAngle(0).setScale(scale);
  return scene.tweens.add({
    targets: wolf,
    angle: MENU_VIEW.wolfHowlAngle,
    scale: scale * MENU_VIEW.wolfHowlScale,
    duration: MENU_VIEW.wolfHowlMs,
    yoyo: true,
    hold: MENU_VIEW.wolfHowlMs,
  });
}
