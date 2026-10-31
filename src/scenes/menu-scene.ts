import Phaser from 'phaser';
import { BUTTON, GAME_WIDTH, MENU_VIEW, SCENES } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { PLAYER } from '../data/player';
import { MENU_SECRET } from '../data/rules';
import { NO_MENU_TAPS, startFromMenu, type MenuTaps } from '../logic/menu-secret';
import { enterFullscreenLandscape } from '../systems/fullscreen';
import { makeHowlingWolf } from '../ui/howling-wolf';
import { drawMenuBackdrop } from '../ui/menu-backdrop';
import { addPlayerCountLabel } from '../ui/player-count-label';
import { makeSquishySlime } from '../ui/squishy-slime';
import { TextButton } from '../ui/text-button';
import { addTitle } from '../ui/title-text';
import { addVersionLabel } from '../ui/version-label';
import type { SavesSceneData } from './saves-scene';
import type { WorldSceneData } from './world-scene';

// Alkuruutu: PELAA aloittaa uuden pelin Valkeakoskelta, LATAA avaa tallennukset,
// ASETUKSET avaa valon ja äänten säädöt ja LÄHDE lopettaa pelin.
// Oikeassa alakulmassa näkyy pelin versio (data/game-info.ts), vasemmassa pelaajamäärä.
// Salaisuus: jos sutta napauttaa ennen PELAA-nappia, uusi peli alkaa kokemuspisteillä ja
// lisäjuomilla (logic/menu-secret.ts). Alkuruudulla siitä ei kerrota: susi vain ulvahtaa
// ja muuttuu hehkuvaksi henkisudeksi. Kartalla näkyy yllätysviesti.
// Toinen salaisuus: liman napautus muuttaa sankarin silmät mustiksi heti ja uudessa pelissä.

interface MenuEntry {
  readonly label: string;
  readonly onTap: () => void;
}

export class MenuScene extends Phaser.Scene {
  /** Mitä alkuruudulla on napautettu tällä käynnillä (salaisuudet). */
  private taps: MenuTaps = NO_MENU_TAPS;

  constructor() {
    super(SCENES.menu);
  }

  create(): void {
    this.taps = NO_MENU_TAPS;
    const { hero, slime, wolf } = drawMenuBackdrop(this);
    makeHowlingWolf(this, wolf, MENU_SECRET.spiritSprite, () => {
      this.taps = { ...this.taps, wolf: true };
    });
    makeSquishySlime(this, slime, () => {
      this.taps = { ...this.taps, slime: true };
      hero.setTexture(PLAYER.eyeSprites[MENU_SECRET.slimeEyeColor]);
    });
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
    const start = startFromMenu(this.taps);
    this.open(SCENES.world, start satisfies WorldSceneData);
  }

  /** Koko näytön tila ja vaakasuunta pyydetään napautuksesta (selain vaatii kosketuksen). */
  private open(key: string, data: object): void {
    enterFullscreenLandscape(this);
    this.scene.start(key, data);
  }
}
