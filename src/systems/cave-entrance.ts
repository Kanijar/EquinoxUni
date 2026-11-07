import type Phaser from 'phaser';
import { CAVE_MAP } from '../config/cave-config';
import { CAVE } from '../data/cave';
import { TEXT } from '../i18n/text';
import { atCaveMouth, isCaveOpen } from '../logic/cave';
import type { GameState } from '../logic/game-state';
import type { Vec2 } from '../logic/vector';
import { pointTile } from '../logic/world-grid';
import { cornerButton } from '../ui/corner-stack';
import { TextButton } from '../ui/text-button';
import { tileToWorld } from './world-map';

// Peikkokuninkaan luolan suu kartalla (data/cave.ts). Ennen Peikkokuninkaan voittoa suun
// tukkii iso kivi, ja suulle tultaessa kerrotaan, että kuningas vartioi sitä. Voiton jälkeen
// kivi on poissa, ja suulla oikeaan alakulmaan tulee LUOLA-nappi, josta luola avautuu
// (scenes/cave-scene.ts).

export interface CaveEntranceEvents {
  /** LUOLA-nappia painettiin (luola on auki ja sankari on suulla). */
  readonly onOpen: () => void;
  readonly message: (text: string) => void;
}

export class CaveEntrance {
  private readonly boulder: Phaser.GameObjects.Image;
  private readonly button: TextButton;
  private near = false;

  constructor(
    scene: Phaser.Scene,
    private readonly state: GameState,
    private readonly events: CaveEntranceEvents,
  ) {
    const pos = tileToWorld(pointTile(CAVE));
    const { depth, scale } = CAVE_MAP;
    scene.add.image(pos.x, pos.y, 'cave-mouth').setDepth(depth).setScale(scale);
    this.boulder = scene.add.image(pos.x, pos.y, 'cave-boulder').setDepth(depth).setScale(scale);
    const { buttonStackIndex, buttonWidth } = CAVE_MAP;
    const options = cornerButton(buttonStackIndex, buttonWidth, TEXT.cave.button, () => {
      if (this.near && isCaveOpen(state)) {
        events.onOpen();
      }
    });
    this.button = new TextButton(scene, options);
    this.button.setVisible(false);
  }

  /** tile = sankarin ruutu. Suljetulle suulle tultaessa näytetään viesti kerran. */
  update(tile: Vec2): void {
    const open = isCaveOpen(this.state);
    const near = atCaveMouth(tile);
    if (near && !this.near && !open) {
      this.events.message(TEXT.cave.closed);
    }
    this.near = near;
    this.boulder.setVisible(!open);
    this.button.setVisible(near && open);
  }
}
