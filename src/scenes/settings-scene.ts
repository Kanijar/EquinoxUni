import Phaser from 'phaser';
import { BUTTON, GAME_HEIGHT, GAME_WIDTH, SCENES, SETTINGS_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import {
  canStep,
  stepSetting,
  toggleMute,
  type AdjustableSetting,
  type Settings,
} from '../logic/settings';
import { changeSettings, currentSettings } from '../systems/game-settings';
import { SettingRow } from '../ui/setting-row';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';

// Asetukset: valon määrä (kirkkaus), äänenvoimakkuus ja äänet päälle/pois.
// Muutos näkyy ja kuuluu heti, ja se tallentuu selaimeen (systems/game-settings.ts).

const ADJUSTABLE: readonly { readonly key: AdjustableSetting; readonly label: string }[] = [
  { key: 'brightness', label: TEXT.settings.brightness },
  { key: 'volume', label: TEXT.settings.volume },
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
        label,
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
