import Phaser from 'phaser';
import { BUTTON, GAME_HEIGHT, GAME_WIDTH, SCENES, SETTINGS_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/text';
import type { Language } from '../i18n/language';
import {
  canStep,
  chooseLanguage,
  stepSetting,
  toggleMute,
  type AdjustableSetting,
  type Settings,
} from '../logic/settings';
import { changeSettings, currentSettings } from '../systems/game-settings';
import { addLanguageRow } from '../ui/language-row';
import { SettingRow } from '../ui/setting-row';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';

// Asetukset: valon määrä (kirkkaus), äänenvoimakkuus, äänet päälle/pois ja kieli.
// Muutos näkyy ja kuuluu heti, ja se tallentuu selaimeen (systems/game-settings.ts).

/** Säädettävät asetukset. Nimi haetaan vasta piirrettäessä, jotta se on valitulla kielellä. */
const ADJUSTABLE: readonly {
  readonly key: AdjustableSetting;
  readonly label: () => string;
}[] = [
  { key: 'brightness', label: () => TEXT.settings.brightness },
  { key: 'volume', label: () => TEXT.settings.volume },
];

export class SettingsScene extends Phaser.Scene {
  private rows: { readonly key: AdjustableSetting; readonly row: SettingRow }[] = [];
  private soundToggle!: TextButton;

  constructor() {
    super(SCENES.settings);
  }

  create(): void {
    const { titleY, firstRowY, rowGap, labelX, lessX, moreX, backButtonWidth } = SETTINGS_VIEW;
    addTitle(this, titleY, TEXT.settings.title);
    this.rows = ADJUSTABLE.map(({ key, label }, index) => ({
      key,
      row: new SettingRow(this, {
        y: firstRowY + index * rowGap,
        label: label(),
        onStep: (direction) => this.change(stepSetting(currentSettings(), key, direction)),
      }),
    }));
    const toggleY = firstRowY + ADJUSTABLE.length * rowGap;
    addLabel(this, { x: labelX, y: toggleY, text: TEXT.settings.sound });
    this.soundToggle = new TextButton(this, {
      x: (lessX + moreX) / 2,
      y: toggleY,
      width: SETTINGS_VIEW.toggleWidth,
      height: BUTTON.height,
      label: '',
      onTap: () => this.change(toggleMute(currentSettings())),
    });
    addLanguageRow(this, {
      y: toggleY + rowGap,
      selected: currentSettings().language,
      onChoose: (language) => this.changeLanguage(language),
    });
    new TextButton(this, {
      x: GAME_WIDTH - BUTTON.margin - backButtonWidth / 2,
      y: GAME_HEIGHT - BUTTON.margin - BUTTON.height / 2,
      width: backButtonWidth,
      height: BUTTON.height,
      label: TEXT.settings.back,
      onTap: () => this.scene.start(SCENES.menu),
    });
    this.refresh(currentSettings());
  }

  private change(next: Settings): void {
    changeSettings(this.game, next);
    this.refresh(next);
  }

  /** Uusi kieli: näkymä piirretään alusta, jotta kaikki tekstit vaihtuvat heti. */
  private changeLanguage(language: Language): void {
    if (language === currentSettings().language) return;
    changeSettings(this.game, chooseLanguage(currentSettings(), language));
    this.scene.restart();
  }

  private refresh(settings: Settings): void {
    for (const { key, row } of this.rows) {
      row.update(
        TEXT.settings.percent(settings[key]),
        canStep(settings, key, -1),
        canStep(settings, key, 1),
      );
    }
    this.soundToggle.setLabel(settings.muted ? TEXT.settings.soundOff : TEXT.settings.soundOn);
  }
}
