import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { clampLength, normalize, type Vec2 } from '../logic/vector';
import { ActionButton } from '../ui/action-button';
import { VirtualJoystick } from '../ui/virtual-joystick';

// Yhdistää kosketusohjauksen (virtuaalitikku + napit) ja näppäimistön
// (nuolet/WASD + välilyönti) samaan rajapintaan. Pelilogiikka lukee vain tätä.

export interface ControlState {
  readonly move: Vec2;
  readonly attack: boolean;
}

type MoveKeys = Record<
  'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd',
  Phaser.Input.Keyboard.Key
>;

export class Controls {
  private readonly joystick: VirtualJoystick;
  private readonly attackButton: ActionButton;
  private readonly keys: MoveKeys | null;
  private readonly attackKey: Phaser.Input.Keyboard.Key | null;

  constructor(scene: Phaser.Scene) {
    scene.input.addPointer(2);
    this.joystick = new VirtualJoystick(scene);
    this.attackButton = new ActionButton(scene, {
      x: GAME_WIDTH - 40,
      y: GAME_HEIGHT - 40,
      label: TEXT.controls.attack,
    });
    const keyboard = scene.input.keyboard;
    this.keys = keyboard ? (keyboard.addKeys('up,down,left,right,w,a,s,d') as MoveKeys) : null;
    this.attackKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ?? null;
  }

  read(): ControlState {
    const keyMove = this.readKeyboard();
    const move = keyMove.x !== 0 || keyMove.y !== 0 ? keyMove : this.joystick.value;
    const attack = this.attackButton.isDown || (this.attackKey?.isDown ?? false);
    return { move: clampLength(move, 1), attack };
  }

  private readKeyboard(): Vec2 {
    const k = this.keys;
    if (!k) {
      return { x: 0, y: 0 };
    }
    const x = Number(k.right.isDown || k.d.isDown) - Number(k.left.isDown || k.a.isDown);
    const y = Number(k.down.isDown || k.s.isDown) - Number(k.up.isDown || k.w.isDown);
    return normalize({ x, y });
  }
}
