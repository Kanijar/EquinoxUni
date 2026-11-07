import Phaser from 'phaser';
import { BURGER_VIEW } from '../config/burger-config';
import { playSound } from '../systems/sound-fx';
import { burstStars } from './wolf-magic';

// Alkuruudun salainen burgeri: todella pieni pixelart-burgeri vasemmassa reunassa.
// Napautus haukkaa burgeria (ääni, murut, purtu burgeri), mutta ei kerro mitä tapahtui.
// Mitä napautus tekee pelissä, päättää kutsuja (scenes/menu-scene.ts).

/** Lisää burgerin alkuruutuun. onTap kutsutaan joka napautuksella. */
export function addSecretBurger(scene: Phaser.Scene, onTap: () => void): Phaser.GameObjects.Image {
  const { x, y, scale, hitSize, sprite, bittenSprite } = BURGER_VIEW;
  const burger = scene.add.image(x, y, sprite).setScale(scale);
  const hit = scene.add.zone(x, y, hitSize, hitSize).setInteractive();
  let pop: Phaser.Tweens.Tween | null = null;
  let bitten = false;
  hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    playSound('chomp');
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
