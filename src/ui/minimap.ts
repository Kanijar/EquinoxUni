import Phaser from 'phaser';
import { MINIMAP_VIEW } from '../config/minimap-config';
import { WORLD } from '../data';
import type { GameState } from '../logic/game-state';
import { minimapMarkers } from '../logic/minimap';
import { paintMinimapTexture } from '../systems/minimap-texture';
import { drawMarkers } from './minimap-markers';

// Pieni minikartta kartan vasemmassa yläkulmassa: koko saari, kylät, kauppias, Ossi Ketola,
// avattu luola, herännyt loppuboss ja vilkkuva sankari. Napautus avaa ison kartan
// (scenes/map-scene.ts). Kun sankari löytää uuden saaren, minikartta piirretään uudelleen.

const TEXTURE_KEY = 'minimap-small';

export class Minimap {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private paintedIsles = -1;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState,
    onTap: () => void,
  ) {
    const { x, y, width, height, border, borderColor, alpha, depth } = MINIMAP_VIEW;
    this.repaintIfNeeded();
    scene.add
      .rectangle(x - border, y - border, width + border * 2, height + border * 2, borderColor)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(depth);
    const image = scene.add
      .image(x, y, TEXTURE_KEY)
      .setOrigin(0)
      .setAlpha(alpha)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive();
    image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onTap);
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(depth);
  }

  update(): void {
    this.repaintIfNeeded();
    drawMarkers(
      this.graphics,
      minimapMarkers(this.state, WORLD),
      MINIMAP_VIEW,
      this.scene.time.now,
    );
  }

  /** Maasto piirretään vain alussa ja silloin, kun uusi saari on löytynyt. */
  private repaintIfNeeded(): void {
    if (this.paintedIsles === this.state.isles.length) {
      return;
    }
    paintMinimapTexture(this.scene.textures, TEXTURE_KEY, MINIMAP_VIEW, this.state);
    this.paintedIsles = this.state.isles.length;
  }
}
