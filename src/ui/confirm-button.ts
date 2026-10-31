import type Phaser from 'phaser';
import { BUTTON } from '../config/game-config';
import { TextButton, type TextButtonOptions } from './text-button';

// Nappi, joka kysyy varmistuksen ennen kuin tekee jotain, mitä ei voi perua
// (esim. POISTA). Ensimmäinen painallus vaihtaa tekstiksi "VARMA?", toinen tekee
// toiminnon. Jos toista painallusta ei tule hetkeen, nappi palaa ennalleen.

export interface ConfirmButtonOptions extends Omit<TextButtonOptions, 'onTap'> {
  readonly confirmLabel: string;
  /** Kysytäänkö varmistus tällä kertaa (esim. vain, jos paikassa on jo tallennus). */
  readonly needsConfirm: () => boolean;
  readonly onConfirm: () => void;
}

export class ConfirmButton {
  private readonly button: TextButton;
  private timer: Phaser.Time.TimerEvent | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly options: ConfirmButtonOptions,
  ) {
    this.button = new TextButton(scene, { ...options, onTap: () => this.tap() });
  }

  setVisible(visible: boolean): void {
    this.disarm();
    this.button.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.disarm();
    this.button.setEnabled(enabled);
  }

  private tap(): void {
    if (this.timer || !this.options.needsConfirm()) {
      this.disarm();
      this.options.onConfirm();
      return;
    }
    this.button.setLabel(this.options.confirmLabel);
    this.timer = this.scene.time.delayedCall(BUTTON.confirmMs, () => this.disarm());
  }

  private disarm(): void {
    this.timer?.remove();
    this.timer = null;
    this.button.setLabel(this.options.label);
  }
}
