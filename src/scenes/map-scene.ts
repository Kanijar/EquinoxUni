import Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH, SCENES } from '../config/game-config';
import { MAP_VIEW } from '../config/minimap-config';
import { getNpc, WORLD } from '../data';
import { MERCHANT } from '../data/merchant';
import {
  MINIMAP_MARKER_COLORS,
  MINIMAP_MARKER_ORDER,
  type MinimapMarkerKind,
} from '../data/minimap';
import { TEXT } from '../i18n/text';
import { bossName } from '../logic/boss';
import type { GameState } from '../logic/game-state';
import { minimapMarkers, type MinimapMarker } from '../logic/minimap';
import { paintMinimapTexture } from '../systems/minimap-texture';
import { drawMarkers } from '../ui/minimap-markers';
import { TextButton } from '../ui/text-button';
import { addTitle } from '../ui/title-text';

// Iso kartta: avautuu kartan päälle, kun minikarttaa napautetaan (ui/minimap.ts). Vasemmalla
// koko saari merkkeineen, oikealla selite (vain merkit, jotka kartalla nyt näkyvät).
// Kartta nukkuu taustalla, joten viholliset odottavat. TAKAISIN-nappi tai kartan napautus
// palaa kartalle.

export interface MapSceneData {
  readonly state: GameState;
}

const TEXTURE_KEY = 'minimap-large';
const LEGEND_OUTLINE = 0x000000;

export class MapScene extends Phaser.Scene {
  private state!: GameState;
  private graphics!: Phaser.GameObjects.Graphics;
  private markers: MinimapMarker[] = [];

  constructor() {
    super(SCENES.map);
  }

  create(data: MapSceneData): void {
    this.state = data.state;
    this.markers = minimapMarkers(this.state, WORLD);
    const { x, y, width, height, border } = MAP_VIEW;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.panel).setOrigin(0);
    addTitle(this, MAP_VIEW.titleY, TEXT.map.title);
    paintMinimapTexture(this.textures, TEXTURE_KEY, MAP_VIEW, this.state);
    this.add
      .rectangle(
        x - border,
        y - border,
        width + border * 2,
        height + border * 2,
        COLORS.panelBorder,
      )
      .setOrigin(0);
    this.add
      .image(x, y, TEXTURE_KEY)
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.close());
    this.graphics = this.add.graphics();
    this.addLegend();
    this.addBackButton();
  }

  override update(time: number): void {
    drawMarkers(this.graphics, this.markers, MAP_VIEW, time);
  }

  /** Selite: väriruutu ja nimi jokaiselle merkille, joka kartalla nyt näkyy. */
  private addLegend(): void {
    const { legendX, legendFirstY, legendGap, legendSwatch, legendTextX } = MAP_VIEW;
    const kinds = MINIMAP_MARKER_ORDER.filter((kind) =>
      this.markers.some((marker) => marker.kind === kind),
    ).reverse();
    kinds.forEach((kind, index) => {
      const rowY = legendFirstY + index * legendGap;
      this.add
        .rectangle(legendX, rowY, legendSwatch, legendSwatch, MINIMAP_MARKER_COLORS[kind])
        .setStrokeStyle(1, LEGEND_OUTLINE)
        .setOrigin(0, 0.5);
      this.addSmallText(legendX + legendTextX, rowY, legendLabel(kind)).setOrigin(0, 0.5);
    });
    const allFound = this.state.isles.length >= WORLD.isles.length;
    if (!allFound) {
      const hintY = legendFirstY + kinds.length * legendGap + MAP_VIEW.hintGap;
      this.addSmallText(legendX, hintY, TEXT.map.islesHint)
        .setWordWrapWidth(MAP_VIEW.hintWrap)
        .setColor(COLORS.notice);
    }
  }

  private addSmallText(x: number, y: number, text: string): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: FONT.family,
      fontSize: FONT.small,
      color: COLORS.text,
    });
  }

  private addBackButton(): void {
    const { margin, backButtonWidth, backButtonHeight } = MAP_VIEW;
    new TextButton(this, {
      x: GAME_WIDTH - margin - backButtonWidth / 2,
      y: margin + backButtonHeight / 2,
      width: backButtonWidth,
      height: backButtonHeight,
      label: TEXT.map.back,
      onTap: () => this.close(),
    });
  }

  private close(): void {
    this.scene.stop();
    this.scene.wake(SCENES.world);
  }
}

/** Selitteen teksti merkille (nimet valitulla kielellä). */
function legendLabel(kind: MinimapMarkerKind): string {
  switch (kind) {
    case 'merchant':
      return TEXT.map.merchant(MERCHANT.name);
    case 'ossi':
      return TEXT.names.npc(getNpc('ossi'));
    case 'boss':
      return bossName();
    default:
      return TEXT.map[kind];
  }
}
