import Phaser from 'phaser';
import { MENU_VIEW, WOLF_MAGIC } from '../config/game-config';
import { playSound } from '../systems/sound-fx';
import { awakenSpiritWolf, burstStars } from './wolf-magic';

// Alkuruudun susi, jota voi napauttaa: susi ulvahtaa ja nostaa päänsä.
// Ensimmäinen napautus herättää henkisuden (välähdys, tähdet, hehkuvat silmät).
// Mitä napautus tekee pelissä, päättää kutsuja (scenes/menu-scene.ts).

/** Tekee kuvasta napautettavan. onTap kutsutaan joka napautuksella. */
export function makeHowlingWolf(
  scene: Phaser.Scene,
  wolf: Phaser.GameObjects.Image,
  spiritSprite: string,
  onTap: () => void,
): void {
  let howling: Phaser.Tweens.Tween | null = null;
  let awake = false;
  wolf.setInteractive();
  wolf.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    playSound('howl');
    howling?.stop();
    howling = howl(scene, wolf);
    const center = { x: wolf.x, y: wolf.y - wolf.displayHeight / 2 };
    if (awake) {
      burstStars(scene, center, WOLF_MAGIC.starCountSmall);
    } else {
      awake = true;
      playSound('wolf-magic');
      awakenSpiritWolf(scene, wolf, spiritSprite);
      burstStars(scene, center, WOLF_MAGIC.starCount);
    }
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
