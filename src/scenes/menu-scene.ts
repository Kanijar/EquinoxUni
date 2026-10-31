import Phaser from 'phaser';
import { BUTTON, GAME_WIDTH, MENU_VIEW, SCENES } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { enterFullscreenLandscape } from '../systems/fullscreen';
import { drawMenuBackdrop } from '../ui/menu-backdrop';
import { addPlayerCountLabel } from '../ui/player-count-label';
import { TextButton } from '../ui/text-button';
import { addTitle } from '../ui/title-text';
import { addVersionLabel } from '../ui/version-label';
import type { SavesSceneData } from './saves-scene';
import type { WorldSceneData } from './world-scene';

// Alkuruutu: PELAA aloittaa uuden pelin Valkeakoskelta, LATAA avaa tallennukset,
// ASETUKSET avaa valon ja äänten säädöt ja LÄHDE lopettaa pelin.
// Oikeassa alakulmassa näkyy pelin versio (data/game-info.ts), vasemmassa pelaajamäärä.

interface MenuEntry {
  readonly label: string;
  readonly onTap: () => void;
}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.menu);
  }

  create(): void {
    drawMenuBackdrop(this);
    addTitle(this, MENU_VIEW.titleY, TEXT.gameTitle);
    addVersionLabel(this);
    addPlayerCountLabel(this);
    const entries: MenuEntry[] = [
      { label: TEXT.menu.play, onTap: () => this.play() },
      { label: TEXT.menu.load, onTap: () => this.open(SCENES.saves, {} satisfies SavesSceneData) },
      { label: TEXT.menu.settings, onTap: () => this.open(SCENES.settings, {}) },
      { label: TEXT.menu.quit, onTap: () => this.scene.start(SCENES.exit) },
    ];
    entries.forEach((entry, index) => {
      new TextButton(this, {
        x: GAME_WIDTH / 2,
        y: MENU_VIEW.firstButtonY + index * MENU_VIEW.buttonGap,
        width: MENU_VIEW.buttonWidth,
        height: BUTTON.height,
        label: entry.label,
        onTap: entry.onTap,
      });
    });
  }

  private play(): void {
    this.open(SCENES.world, {} satisfies WorldSceneData);
  }

  /** Koko näytön tila ja vaakasuunta pyydetään napautuksesta (selain vaatii kosketuksen). */
  private open(key: string, data: object): void {
    enterFullscreenLandscape(this);
    this.scene.start(key, data);
  }
}
