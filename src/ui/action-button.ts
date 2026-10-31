import Phaser from 'phaser';
import { FONT } from '../config/game-config';

// Pyöreä kosketusnappi (esim. LYÖ). isDown kertoo, onko nappi pohjassa.

export interface ActionButtonOptions {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly radius?: number;
}

export class ActionButton {
  isDown = false;
  private readonly circle: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, options: ActionButtonOptions) {
    const radius = options.radius ?? 22;
    this.circle = scene.add
      .circle(options.x, options.y, radius, 0xffffff, 0.3)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();
    scene.add
      .text(options.x, options.y, options.label, { fontFamily: FONT.family, fontSize: FONT.small })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.setDown(true));
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.setDown(false));
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.setDown(false));
  }

  private setDown(down: boolean): void {
    this.isDown = down;
    this.circle.setFillStyle(0xffffff, down ? 0.55 : 0.3);
  }
}
