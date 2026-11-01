import type Phaser from 'phaser';
import { BUTTON, SETTINGS_VIEW } from '../config/game-config';
import { LANGUAGES, type Language } from '../i18n/language';
import { TEXT } from '../i18n/text';
import { TextButton } from './text-button';
import { addLabel } from './title-text';

// Asetusnäkymän kielirivi: "Kieli" [SUOMI] [ENGLISH]. Valittu kieli on korostettu.
// Napit ovat aina omalla kielellään, jotta oikean kielen löytää, vaikka ei osaisi toista.

export interface LanguageRowOptions {
  readonly y: number;
  readonly selected: Language;
  readonly onChoose: (language: Language) => void;
}

export function addLanguageRow(scene: Phaser.Scene, options: LanguageRowOptions): void {
  const { labelX, lessX, moreX, languageButtonWidth, languageButtonGap } = SETTINGS_VIEW;
  addLabel(scene, { x: labelX, y: options.y, text: TEXT.settings.language });
  const step = languageButtonWidth + languageButtonGap;
  const firstX = (lessX + moreX) / 2 - (step * (LANGUAGES.length - 1)) / 2;
  LANGUAGES.forEach((language, index) => {
    const button = new TextButton(scene, {
      x: firstX + index * step,
      y: options.y,
      width: languageButtonWidth,
      height: BUTTON.height,
      label: TEXT.settings.languageNames[language],
      onTap: () => options.onChoose(language),
    });
    button.setSelected(language === options.selected);
  });
}
