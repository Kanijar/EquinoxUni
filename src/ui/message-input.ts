import type Phaser from 'phaser';
import { attachOverlay, styleField, type OverlayRect } from './dom-overlay';

// Monirivinen tekstikenttä ideaviestille tai kommentille (scenes/ideas-scene.ts).
// HTML <textarea> pelin päällä (ui/dom-overlay.ts). Rivinvaihdot muuttuvat välilyönneiksi
// lähetettäessä (logic/idea-text.ts). Kenttä ei päästä yli enimmäispituuden.

export interface MessageInputOptions extends OverlayRect {
  readonly maxLength: number;
  readonly placeholder: string;
  readonly onChange: (value: string) => void;
}

export class MessageInput {
  private readonly field: HTMLTextAreaElement;

  constructor(scene: Phaser.Scene, options: MessageInputOptions) {
    const field = document.createElement('textarea');
    Object.assign(field, {
      maxLength: options.maxLength,
      placeholder: options.placeholder,
      autocomplete: 'off',
      rows: 3,
    });
    field.setAttribute('autocapitalize', 'sentences');
    styleField(field);
    Object.assign(field.style, { padding: '2px 4px', resize: 'none' });
    field.addEventListener('input', () => options.onChange(field.value));
    this.field = field;
    attachOverlay(scene, field, options);
  }

  get value(): string {
    return this.field.value;
  }

  /** Kenttä pois käytöstä lähetyksen ajaksi. */
  setEnabled(enabled: boolean): void {
    this.field.disabled = !enabled;
  }

  focus(): void {
    this.field.focus();
  }
}
