import Phaser from 'phaser';
import { BURGER_VIEW } from '../config/burger-config';
import { playSound } from '../systems/sound-fx';
import { burstStars } from './wolf-magic';

// Alkuruudun salainen burgeri: todella pieni pixelart-burgeri vasemmassa reunassa.
// Burgeri on näkymätön ja välähtää näkyviin hetkeksi kerran minuutissa (BURGER_VIEW.flashEveryMs).
// Napautus toimii myös näkymättömänä: burgeri välähtää esiin ja haukataan (ääni, murut,
// purtu burgeri), mutta ruutu ei kerro mitä tapahtui.
// Mitä napautus tekee pelissä, päättää kutsuja (scenes/menu-scene.ts).

/** Lisää burgerin alkuruutuun. onTap kutsutaan joka napautuksella. */
export function addSecretBurger(scene: Phaser.Scene, onTap: () => void): Phaser.GameObjects.Image {
  const { x, y, scale, hitSize, sprite, bittenSprite } = BURGER_VIEW;
  const burger = scene.add.image(x, y, sprite).setScale(scale).setAlpha(0);
  const flash = makeFlash(scene, burger);
  scene.time.addEvent({ delay: BURGER_VIEW.flashEveryMs, loop: true, callback: flash });
  const hit = scene.add.zone(x, y, hitSize, hitSize).setInteractive();
  let pop: Phaser.Tweens.Tween | null = null;
  let bitten = false;
  hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    playSound('chomp');
    flash();
    pop?.stop();
    burger.setScale(scale);
    pop = scene.tweens.add({
      targets: burger,
      scale: scale * BURGER_VIEW.popScale,
      duration: BURGER_VIEW.popMs,
      yoyo: true,
    });
    const count = bitten ? BURGER_VIEW.crumbCountSmall : BURGER_VIEW.crumbCount;
    burstStars(scene, { x, y }, count, BURGER_VIEW.crumbColors);
    bitten = true;
    burger.setTexture(bittenSprite);
    onTap();
  });
  return burger;
}

/** Palauttaa funktion, joka tuo burgerin hetkeksi näkyviin ja häivyttää sen taas. */
function makeFlash(scene: Phaser.Scene, burger: Phaser.GameObjects.Image): () => void {
  let fade: Phaser.Tweens.Tween | null = null;
  return () => {
    fade?.stop();
    fade = scene.tweens.add({
      targets: burger,
      alpha: 1,
      duration: BURGER_VIEW.flashFadeMs,
      hold: BURGER_VIEW.flashHoldMs,
      yoyo: true,
    });
  };
}
