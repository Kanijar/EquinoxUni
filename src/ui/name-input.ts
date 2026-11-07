import Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';

// Tekstikenttä pelaajan nimelle (hahmonluonti). Phaserissa ei ole tekstikenttää, joten
// kenttä on tavallinen HTML <input> pelin päällä: puhelin avaa siihen oman näppäimistönsä.
// Kenttä sijoitetaan pelin pikseleinä ja siirretään aina, kun pelin koko muuttuu
// (myös koko näytön tilaan mennessä, jolloin Phaser siirtää canvasin toiseen elementtiin).

export interface NameInputOptions {
  /** Kentän vasen reuna ja keskikohdan korkeus pelin pikseleinä. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fontPx: number;
  readonly maxLength: number;
  readonly value: string;
  /** Harmaa vihje tyhjässä kentässä (oletusnimi). */
  readonly placeholder: string;
  /** Siistii kirjoitetun nimen (logic/hero-name.ts). Kenttä näyttää siistityn nimen, kun se suljetaan. */
  readonly clean: (raw: string) => string;
  readonly onChange: (value: string) => void;
}

const BORDER_PX = 2;

export class NameInput {
  private readonly input: HTMLInputElement;
  private readonly layoutNow = (): void => this.layout();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly options: NameInputOptions,
  ) {
    this.input = createInput(options);
    this.input.addEventListener('input', () => options.onChange(options.clean(this.input.value)));
    this.input.addEventListener('blur', () => {
      this.input.value = options.clean(this.input.value);
    });
    // Enter tai näppäimistön OK sulkee näppäimistön.
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.input.blur();
      // Pelin näppäinkomennot (esim. välilyönti) eivät saa viedä kirjaimia kentältä.
      event.stopPropagation();
    });
    this.input.addEventListener('keyup', (event) => event.stopPropagation());
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layoutNow);
    window.addEventListener('resize', this.layoutNow);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    this.layout();
  }

  /** Sijoittaa kentän canvasin päälle oikeaan kohtaan ja kokoon. */
  private layout(): void {
    const canvas = this.scene.game.canvas;
    const parent = canvas.parentElement;
    if (parent && this.input.parentElement !== parent) parent.appendChild(this.input);
    const bounds = canvas.getBoundingClientRect();
    const scale = bounds.width / this.scene.scale.width;
    const { x, y, width, height, fontPx } = this.options;
    Object.assign(this.input.style, {
      left: `${bounds.left + x * scale}px`,
      top: `${bounds.top + (y - height / 2) * scale}px`,
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      fontSize: `${fontPx * scale}px`,
      borderWidth: `${Math.max(1, BORDER_PX * scale)}px`,
    });
  }

  private destroy(): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.layoutNow);
    window.removeEventListener('resize', this.layoutNow);
    this.input.remove();
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
    spellcheck: false,
    enterKeyHint: 'done',
  });
  input.setAttribute('autocapitalize', 'words');
  input.setAttribute('autocorrect', 'off');
  Object.assign(input.style, {
    position: 'fixed',
    zIndex: '10',
    boxSizing: 'border-box',
    margin: '0',
    padding: '0 4px',
    textAlign: 'center',
    fontFamily: FONT.family,
    color: COLORS.text,
    background: COLORS.background,
    borderStyle: 'solid',
    borderColor: COLORS.text,
    borderRadius: '0',
    outline: 'none',
    userSelect: 'text',
    touchAction: 'manipulation',
  });
  return input;
}
