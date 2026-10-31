import Phaser from 'phaser';
import { clampLength, ZERO, type Vec2 } from '../logic/vector';

// Kelluva virtuaalitikku: ilmestyy kohtaan, jota pelaaja koskettaa (missä tahansa
// kohdassa ruutua, joten sopii kummallekin peukalolle). value on vektori, pituus 0..1.
// Napin päältä aloitettu kosketus ei liikuta tikkua.

const RADIUS = 28;
const ALPHA = 0.35;

export class VirtualJoystick {
  private pointerId: number | null = null;
  private origin: Vec2 = ZERO;
  private current: Vec2 = ZERO;
  private readonly base: Phaser.GameObjects.Arc;
  private readonly knob: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene) {
    this.base = scene.add.circle(0, 0, RADIUS, 0xffffff, ALPHA).setVisible(false);
    this.knob = scene.add.circle(0, 0, RADIUS / 2.2, 0xffffff, ALPHA * 2).setVisible(false);
    for (const obj of [this.base, this.knob]) {
      obj.setScrollFactor(0).setDepth(1000);
    }
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
  }

  get value(): Vec2 {
    if (this.pointerId === null) {
      return ZERO;
    }
    const delta = { x: this.current.x - this.origin.x, y: this.current.y - this.origin.y };
    const clamped = clampLength(delta, RADIUS);
    return { x: clamped.x / RADIUS, y: clamped.y / RADIUS };
  }

  /** currentlyOver: napit tms. kosketuskohdassa. Niiden päällä tikku ei aktivoidu. */
  private onDown(
    pointer: Phaser.Input.Pointer,
    currentlyOver: readonly Phaser.GameObjects.GameObject[],
  ): void {
    if (this.pointerId !== null || currentlyOver.length > 0) {
      return;
    }
    this.pointerId = pointer.id;
    this.origin = { x: pointer.x, y: pointer.y };
    this.current = this.origin;
    this.base.setPosition(pointer.x, pointer.y).setVisible(true);
    this.knob.setPosition(pointer.x, pointer.y).setVisible(true);
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.current = { x: pointer.x, y: pointer.y };
    const v = this.value;
    this.knob.setPosition(this.origin.x + v.x * RADIUS, this.origin.y + v.y * RADIUS);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.base.setVisible(false);
    this.knob.setVisible(false);
  }
}
