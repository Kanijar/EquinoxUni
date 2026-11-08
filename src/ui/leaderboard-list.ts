import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { HOUSE_VIEW } from '../config/house-config';
import { LEADERBOARD } from '../config/leaderboard';
import { TEXT } from '../i18n/text';
import { heroName } from '../logic/hero-name';
import type { LeaderboardEntry } from '../logic/leaderboard';
import { levelForXp } from '../logic/progression';

// 10 parhaan lista sankarin talon seinällä (scenes/house-scene.ts): tumma taulu kultaisella
// reunalla, rivillä sija, nimimerkki, taso ja KP. Oman sankarin rivi on keltainen.
// Ennen listaa taululla näkyy viesti (haetaan, ei yhteyttä, ei käytössä).

interface Row {
  readonly name: Phaser.GameObjects.Text;
  readonly level: Phaser.GameObjects.Text;
  readonly xp: Phaser.GameObjects.Text;
}

export class LeaderboardList {
  private readonly rows: Row[] = [];
  private readonly message: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { panel, listTitleY, firstRowY, rowGap, rowPadding, xpColumnWidth } = HOUSE_VIEW;
    scene.add
      .rectangle(panel.x, panel.y, panel.width, panel.height, panel.color)
      .setOrigin(0)
      .setStrokeStyle(2, panel.border);
    const centerX = panel.x + panel.width / 2;
    this.text(scene, centerX, listTitleY, TEXT.house.listTitle)
      .setOrigin(0.5)
      .setColor(COLORS.critText);
    for (let index = 0; index < LEADERBOARD.topCount; index += 1) {
      const y = firstRowY + index * rowGap;
      const right = panel.x + panel.width - rowPadding;
      const name = this.text(scene, panel.x + rowPadding, y, '');
      const level = this.text(scene, right - xpColumnWidth, y, '').setOrigin(1, 0.5);
      const xp = this.text(scene, right, y, '').setOrigin(1, 0.5);
      this.rows.push({ name, level, xp });
    }
    const middleY = panel.y + panel.height / 2;
    this.message = this.text(scene, centerX, middleY, '').setOrigin(0.5).setAlign('center');
  }

  /** Näyttää viestin listan paikalla. */
  showMessage(text: string): void {
    this.message.setText(text);
    for (const row of this.rows) {
      for (const text of [row.name, row.level, row.xp]) {
        text.setText('');
      }
    }
  }

  /** Näyttää listan. ownRank = oman sankarin sija (korostetaan, jos se on listalla). */
  showEntries(entries: readonly LeaderboardEntry[], ownRank: number | null): void {
    this.message.setText(entries.length === 0 ? TEXT.house.empty : '');
    this.rows.forEach((row, index) => {
      const entry = entries[index];
      const color = index + 1 === ownRank ? HOUSE_VIEW.ownRowColor : COLORS.text;
      const name = entry ? heroName(entry.name, TEXT.names.player) : '';
      row.name.setText(entry ? TEXT.house.rowName(index + 1, name) : '').setColor(color);
      row.level.setText(entry ? TEXT.house.rowLevel(levelForXp(entry.xp)) : '').setColor(color);
      row.xp.setText(entry ? TEXT.house.rowXp(entry.xp) : '').setColor(color);
    });
  }

  private text(scene: Phaser.Scene, x: number, y: number, text: string): Phaser.GameObjects.Text {
    return scene.add
      .text(x, y, text, { fontFamily: FONT.family, fontSize: FONT.small, color: COLORS.text })
      .setOrigin(0, 0.5);
  }
}
