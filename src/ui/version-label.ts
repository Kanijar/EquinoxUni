import type Phaser from 'phaser';
import { COLORS, FONT, GAME_HEIGHT, GAME_WIDTH, MENU_VIEW } from '../config/game-config';
import { releaseLines } from '../logic/release-info';

// Pelin versio ja julkaisuaika pienellä ja himmeällä tekstillä alkuruudun oikeassa alakulmassa:
//   Versio: 0.25 (alfa)
//   Julkaistu 1.11.2026 klo 10.05
// Kulma on vapaa napeista, joten teksti ei peitä mitään pienelläkään näytöllä.

export function addVersionLabel(scene: Phaser.Scene): Phaser.GameObjects.Text {
  const lines = releaseLines({
    prNumber: import.meta.env.VITE_RELEASE_PR,
    builtAt: import.meta.env.VITE_RELEASE_TIME,
    dev: import.meta.env.DEV,
  });
  return scene.add
    .text(GAME_WIDTH - MENU_VIEW.versionMargin, GAME_HEIGHT - MENU_VIEW.versionMargin, lines, {
      fontFamily: FONT.family,
      fontSize: FONT.small,
      color: COLORS.text,
      align: 'right',
    })
    .setOrigin(1, 1)
    .setAlpha(MENU_VIEW.versionAlpha)
    .setShadow(1, 1, COLORS.textShadow);
}
