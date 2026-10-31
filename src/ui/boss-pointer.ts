import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_VIEW } from '../config/game-config';
import type { Vec2 } from '../logic/vector';

// Punainen nuoli ruudun reunalla osoittaa kohti loppubossia, kun boss ei näy ruudulla.
// Suomen kartta on iso, joten nuoli auttaa löytämään Lapin tunturille.

const POINTER_DEPTH = 905;
/** Nuolen puolileveys suhteessa sen pituuteen. */
const ARROW_WIDTH = 0.7;
/** Estää nollalla jakamisen, kun suunta on täsmälleen vaaka tai pysty. */
const MIN_COMPONENT = 1e-6;

export class BossPointer {
  private readonly arrow: Phaser.GameObjects.Triangle;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly target: Phaser.GameObjects.Sprite,
  ) {
    const { size, color, alpha, pulseMs } = WORLD_VIEW.bossPointer;
    // Kärki osoittaa oikealle (kulma 0); kolmio kiertyy keskipisteensä ympäri bossin suuntaan.
    const half = size * ARROW_WIDTH;
    this.arrow = scene.add
      .triangle(0, 0, size * 2, half, 0, 0, 0, half * 2, color, alpha)
      .setScrollFactor(0)
      .setDepth(POINTER_DEPTH)
      .setVisible(false);
    scene.tweens.add({
      targets: this.arrow,
      alpha: alpha / 3,
      duration: pulseMs,
      yoyo: true,
      repeat: -1,
    });
  }

  /** Näyttää nuolen ruudun reunalla, jos boss on ruudun ulkopuolella. */
  update(): void {
    const view = this.scene.cameras.main.worldView;
    const boss: Vec2 = { x: this.target.x, y: this.target.y };
    if (view.contains(boss.x, boss.y)) {
      this.arrow.setVisible(false);
      return;
    }
    const center = { x: view.centerX, y: view.centerY };
    const angle = Math.atan2(boss.y - center.y, boss.x - center.x);
    const spot = edgeSpot(angle);
    this.arrow.setVisible(true).setPosition(spot.x, spot.y).setRotation(angle);
  }
}

/** Piste ruudun reunalla (marginaalin sisällä) ruudun keskeltä kulman suuntaan. */
function edgeSpot(angle: number): Vec2 {
  const { margin } = WORLD_VIEW.bossPointer;
  const halfW = GAME_WIDTH / 2 - margin;
  const halfH = GAME_HEIGHT / 2 - margin;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const scale = Math.min(
    halfW / Math.max(Math.abs(dx), MIN_COMPONENT),
    halfH / Math.max(Math.abs(dy), MIN_COMPONENT),
  );
  return { x: GAME_WIDTH / 2 + dx * scale, y: GAME_HEIGHT / 2 + dy * scale };
}
