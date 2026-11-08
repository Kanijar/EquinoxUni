import type Phaser from 'phaser';
import { attachOverlay, styleField, type OverlayRect } from './dom-overlay';

// Tekstikenttä pelaajan nimelle (hahmonluonti). Kenttä on HTML <input> pelin päällä
// (ui/dom-overlay.ts): puhelin avaa siihen oman näppäimistönsä.

export interface NameInputOptions extends OverlayRect {
  readonly maxLength: number;
  readonly value: string;
  /** Harmaa vihje tyhjässä kentässä (oletusnimi). */
  readonly placeholder: string;
  /** Siistii kirjoitetun nimen (logic/hero-name.ts). Kenttä näyttää siistityn nimen, kun se suljetaan. */
  readonly clean: (raw: string) => string;
  readonly onChange: (value: string) => void;
}

export class NameInput {
  private readonly input: HTMLInputElement;

  constructor(scene: Phaser.Scene, options: NameInputOptions) {
    this.input = createInput(options);
    this.input.addEventListener('input', () => options.onChange(options.clean(this.input.value)));
    this.input.addEventListener('blur', () => {
      this.input.value = options.clean(this.input.value);
    });
    // Enter tai näppäimistön OK sulkee näppäimistön.
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.input.blur();
    });
    attachOverlay(scene, this.input, options);
  }
}

function createInput(options: NameInputOptions): HTMLInputElement {
  const input = document.createElement('input');
  Object.assign(input, {
    type: 'text',
    value: options.value,
    maxLength: options.maxLength,
    placeholder: options.placeholder,
    autocomplete: 'off',
    enterKeyHint: 'done',
  });
  input.setAttribute('autocapitalize', 'words');
  styleField(input);
  Object.assign(input.style, { padding: '0 4px', textAlign: 'center' });
  return input;
}
