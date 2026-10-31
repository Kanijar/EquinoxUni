import Phaser from 'phaser';
import {
  BUTTON,
  COLORS,
  FONT,
  GAME_HEIGHT,
  GAME_WIDTH,
  SAVES_VIEW,
  SCENES,
  WORLD_VIEW,
} from '../config/game-config';
import { TEXT } from '../i18n/fi';
import type { GameState } from '../logic/game-state';
import { deleteSlot, listSlots, loadFromSlot, saveToSlot, slotNumbers } from '../logic/save-slots';
import { browserStore } from '../systems/browser-storage';
import { enterFullscreenLandscape } from '../systems/fullscreen';
import { playSound } from '../systems/sound-fx';
import { SaveSlotRow } from '../ui/save-slot-row';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';
import type { WorldSceneData } from './world-scene';

// Tallennukset: kolme paikkaa selaimen muistissa. Alkuruudun LATAA-napista voi
// ladata ja poistaa, pelin aikana (paikkakunnan TALLENNA-napista) myös tallentaa.
// Tallennusmuoto ja säännöt: logic/save-format.ts ja logic/save-slots.ts.

export interface SavesSceneData {
  /** Käynnissä oleva peli, jos näkymä avattiin pelin aikana. */
  readonly game?: { readonly state: GameState; readonly place: string };
}

export class SavesScene extends Phaser.Scene {
  private current: SavesSceneData['game'];
  private rows: SaveSlotRow[] = [];
  private status!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.saves);
  }

  create(data: SavesSceneData): void {
    this.current = data.game;
    addTitle(this, SAVES_VIEW.titleY, TEXT.saves.title);
    this.status = this.add
      .text(GAME_WIDTH / 2, SAVES_VIEW.statusY, '', {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.notice,
      })
      .setOrigin(0.5);
    this.rows = slotNumbers().map(
      (slot, index) =>
        new SaveSlotRow(this, {
          slot,
          y: SAVES_VIEW.firstRowY + index * SAVES_VIEW.rowGap,
          inGame: this.current !== undefined,
          onSave: (target) => this.saveGame(target),
          onLoad: (target) => this.loadGame(target),
          onRemove: (target) => this.removeSave(target),
        }),
    );
    this.addFooter();
    this.refresh();
  }

  private addFooter(): void {
    const { backButtonWidth } = SAVES_VIEW;
    const y = GAME_HEIGHT - BUTTON.margin - BUTTON.height / 2;
    const hint = this.current ? TEXT.saves.hintGame : TEXT.saves.hintMenu;
    addLabel(this, { x: SAVES_VIEW.textX, y, text: hint, size: FONT.small });
    new TextButton(this, {
      x: GAME_WIDTH - BUTTON.margin - backButtonWidth / 2,
      y,
      width: backButtonWidth,
      height: BUTTON.height,
      label: TEXT.saves.back,
      onTap: () => this.back(),
    });
  }

  private refresh(): void {
    listSlots(browserStore()).forEach((info, index) => this.rows[index]?.update(info));
  }

  private saveGame(slot: number): void {
    if (!this.current) {
      return;
    }
    const meta = { savedAt: Date.now(), place: this.current.place };
    const ok = saveToSlot(browserStore(), slot, this.current.state, meta);
    if (ok) {
      playSound('save');
    }
    this.status.setText(ok ? TEXT.saves.saved(slot) : TEXT.saves.saveFailed);
    this.refresh();
  }

  private loadGame(slot: number): void {
    const state = loadFromSlot(browserStore(), slot);
    if (!state) {
      this.status.setText(TEXT.saves.loadFailed);
      this.refresh();
      return;
    }
    enterFullscreenLandscape(this);
    const next: WorldSceneData = {
      state,
      graceMs: WORLD_VIEW.graceMs.start,
      message: TEXT.saves.loaded,
    };
    this.scene.start(SCENES.world, next);
  }

  private removeSave(slot: number): void {
    deleteSlot(browserStore(), slot);
    this.status.setText(TEXT.saves.removed(slot));
    this.refresh();
  }

  private back(): void {
    if (!this.current) {
      this.scene.start(SCENES.menu);
      return;
    }
    const next: WorldSceneData = {
      state: this.current.state,
      graceMs: WORLD_VIEW.graceMs.afterBattle,
    };
    this.scene.start(SCENES.world, next);
  }
}
