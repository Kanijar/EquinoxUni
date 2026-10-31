import type Phaser from 'phaser';
import { COLORS, FONT, GAME_HEIGHT, GAME_WIDTH, MENU_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';

// Pelin versio pienellä ja himmeällä tekstillä alkuruudun oikeassa alakulmassa.
// Kulma on vapaa napeista, joten teksti ei peitä mitään pienelläkään näytöllä.

export function addVersionLabel(scene: Phaser.Scene): Phaser.GameObjects.Text {
  return scene.add
    .text(
      GAME_WIDTH - MENU_VIEW.versionMargin,
      GAME_HEIGHT - MENU_VIEW.versionMargin,
      TEXT.menu.version,
      {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.text,
      },
    )
    .setOrigin(1, 1)
    .setAlpha(MENU_VIEW.versionAlpha)
    .setShadow(1, 1, COLORS.textShadow);
}
