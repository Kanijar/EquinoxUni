import type Phaser from 'phaser';

// Koko näytön tila ja vaakasuunta Android-selaimessa. Selain sallii nämä
// vain käyttäjän kosketuksen jälkeen, joten kutsu tätä kosketuksen käsittelijästä.

interface LockableOrientation {
  lock?: (orientation: 'landscape') => Promise<void>;
}

export function enterFullscreenLandscape(scene: Phaser.Scene): void {
  if (!scene.scale.isFullscreen) {
    scene.scale.startFullscreen();
  }
  const orientation = screen.orientation as LockableOrientation | undefined;
  orientation?.lock?.('landscape').catch(() => {
    // Kaikki selaimet eivät tue lukitusta. Peli toimii silti.
  });
}
