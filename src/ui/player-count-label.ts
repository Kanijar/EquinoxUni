import type Phaser from 'phaser';
import { COLORS, FONT, GAME_HEIGHT, PLAYER_COUNT_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { playerCounter } from '../systems/player-count';

// "Pelaajia nyt: 3" pienellä ja himmeällä tekstillä vasemmassa alakulmassa.
// Kulma on vapaa napeista. Teksti on piilossa, jos laskuria ei ole tai yhteys puuttuu.

export function addPlayerCountLabel(scene: Phaser.Scene): Phaser.GameObjects.Text {
  const label = scene.add
    .text(PLAYER_COUNT_VIEW.margin, GAME_HEIGHT - PLAYER_COUNT_VIEW.margin, '', {
      fontFamily: FONT.family,
      fontSize: FONT.small,
      color: COLORS.text,
    })
    .setOrigin(0, 1)
    .setAlpha(PLAYER_COUNT_VIEW.alpha)
    .setStroke(COLORS.textShadow, PLAYER_COUNT_VIEW.stroke)
    .setScrollFactor(0)
    .setDepth(PLAYER_COUNT_VIEW.depth)
    .setVisible(false);
  const unsubscribe = playerCounter().subscribe((count) => {
    label.setVisible(count !== null);
    if (count !== null) {
      label.setText(TEXT.hud.players(count));
    }
  });
  scene.events.once('shutdown', unsubscribe);
  return label;
}
