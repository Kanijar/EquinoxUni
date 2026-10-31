import Phaser from 'phaser';
import { WOLF_MAGIC } from '../config/game-config';

// Alkuruudun suden salaisuuden taikaefektit: tähtisäihke, välähdys ja tuikkivat tähdet.
// Efektit kertovat pelaajalle, että jotain tapahtui, mutta eivät kerro mitä.

/** Pikselitähdet lentävät kohdasta at joka suuntaan ja himmenevät. */
export function burstStars(
  scene: Phaser.Scene,
  at: { readonly x: number; readonly y: number },
  count: number,
  starColors: readonly number[] = WOLF_MAGIC.starColors,
): void {
  const { starSizePx, starMinPx, starMaxPx, starMs, starDepth } = WOLF_MAGIC;
  const { x, y } = at;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.2, 0.2);
    const distance = Phaser.Math.Between(starMinPx, starMaxPx);
    const color = starColors[i % starColors.length] ?? 0xffffff;
    const star = scene.add
      .rectangle(x, y, starSizePx, starSizePx, color)
      .setAngle(45)
      .setDepth(starDepth);
    scene.tweens.add({
      targets: star,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      scale: 0.3,
      duration: starMs,
      ease: 'Cubic.easeOut',
      onComplete: () => star.destroy(),
    });
  }
}

/** Susi muuttuu henkisudeksi: välähdys, uusi kuva (hehkuvat silmät) ja tuikkivat tähdet. */
export function awakenSpiritWolf(
  scene: Phaser.Scene,
  wolf: Phaser.GameObjects.Image,
  spiritSprite: string,
): void {
  const [red, green, blue] = WOLF_MAGIC.flashRgb;
  scene.cameras.main.flash(WOLF_MAGIC.flashMs, red, green, blue);
  wolf.setTexture(spiritSprite);
  scene.time.addEvent({
    delay: WOLF_MAGIC.twinkleEveryMs,
    loop: true,
    callback: () => twinkle(scene, wolf),
  });
}

/** Yksi tähti syttyy ja sammuu satunnaisessa kohdassa suden ympärillä. */
function twinkle(scene: Phaser.Scene, wolf: Phaser.GameObjects.Image): void {
  const { twinkleRangePx, twinkleMs, starSizePx, starColors, starDepth } = WOLF_MAGIC;
  const x = wolf.x + Phaser.Math.Between(-twinkleRangePx, twinkleRangePx);
  const y = wolf.y - wolf.displayHeight / 2 + Phaser.Math.Between(-twinkleRangePx, twinkleRangePx);
  const color = Phaser.Utils.Array.GetRandom([...starColors]);
  const star = scene.add
    .rectangle(x, y, starSizePx, starSizePx, color)
    .setAngle(45)
    .setDepth(starDepth)
    .setAlpha(0);
  scene.tweens.add({
    targets: star,
    alpha: 1,
    duration: twinkleMs / 2,
    yoyo: true,
    onComplete: () => star.destroy(),
  });
}
