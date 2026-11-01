import type Phaser from 'phaser';
import { BUTTON, GAME_WIDTH, MENU_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { installOffer } from '../systems/install-prompt';
import { TextButton } from './text-button';

// ASENNA-nappi alkuruudun oikeassa yläkulmassa. Näkyy vain, kun Chrome tarjoaa pelin
// asennusta puhelimen aloitusnäytölle (systems/install-prompt.ts). Asennettu peli aukeaa
// koko näytölle ilman selaimen osoiteriviä.

export function addInstallButton(scene: Phaser.Scene): TextButton {
  const offer = installOffer();
  const button = new TextButton(scene, {
    x: GAME_WIDTH - BUTTON.margin - MENU_VIEW.installWidth / 2,
    y: BUTTON.margin + BUTTON.height / 2,
    width: MENU_VIEW.installWidth,
    height: BUTTON.height,
    label: TEXT.menu.install,
    onTap: () => {
      offer.install().catch(() => {
        // Asennusikkuna ei auennut. Chromen valikosta voi silti asentaa.
      });
    },
  });
  const unsubscribe = offer.subscribe((available) => button.setVisible(available));
  scene.events.once('shutdown', unsubscribe);
  return button;
}
