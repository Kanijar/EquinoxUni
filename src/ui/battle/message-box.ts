import type Phaser from 'phaser';
import { BATTLE_MESSAGE } from '../../config/battle-config';
import { BATTLE_VIEW, COLORS, FONT, GAME_WIDTH } from '../../config/game-config';
import { drawPixelPanel } from './pixel-panel';

// Viestilaatikko näyttämön alla. Uusi viesti kirjoittuu näkyviin nopeasti kirjain
// kerrallaan, kuten vanhoissa roolipeleissä.

const BOX_DEPTH = 500;

export class MessageBox {
  private readonly text: Phaser.GameObjects.Text;
  private typing: Phaser.Time.TimerEvent | null = null;

  constructor(private readonly scene: Phaser.Scene) {
    const margin = BATTLE_VIEW.margin;
    const { y, height } = BATTLE_MESSAGE;
    const rect = { x: margin, y: y - height / 2, width: GAME_WIDTH - margin * 2, height };
    drawPixelPanel(scene.add.graphics().setDepth(BOX_DEPTH), rect);
    this.text = scene.add
      .text(GAME_WIDTH / 2, y, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - margin * 4 },
      })
      .setOrigin(0.5)
      .setDepth(BOX_DEPTH + 1);
  }

  say(message: string): void {
    this.typing?.remove();
    const letters = [...message];
    if (letters.length === 0) {
      this.text.setText('');
      return;
    }
    // Teksti asetetaan ensin kokonaan, jotta rivitys ja keskitys eivät hypi kirjoittaessa.
    this.text.setText(message);
    const lines = this.text.getWrappedText(message);
    let shown = 0;
    this.typing = this.scene.time.addEvent({
      delay: BATTLE_MESSAGE.typeMs / letters.length,
      repeat: letters.length - 1,
      callback: () => {
        shown += 1;
        this.text.setText(revealLines(lines, shown));
      },
    });
    this.text.setText(revealLines(lines, 0));
  }
}

/** Näyttää rivien kirjaimista ensimmäiset `count` ja korvaa loput välilyönneillä. */
function revealLines(lines: readonly string[], count: number): string {
  let left = count;
  return lines
    .map((line) => {
      const letters = [...line];
      const visible = letters.slice(0, Math.max(0, left)).join('');
      left -= letters.length;
      return visible.padEnd(letters.length, ' ');
    })
    .join('\n');
}
