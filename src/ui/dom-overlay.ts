import Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';

// HTML-tekstikenttä pelin päällä (nimi hahmonluonnissa, ideaviestit). Phaserissa ei ole
// tekstikenttää, joten kenttä on tavallinen HTML-elementti: puhelin avaa siihen oman
// näppäimistönsä. Kenttä sijoitetaan pelin pikseleinä ja siirretään aina, kun pelin koko
// muuttuu (myös koko näytön tilaan mennessä, jolloin Phaser siirtää canvasin toiseen elementtiin).
// Kenttä poistetaan, kun näkymä sulkeutuu.

export interface OverlayRect {
  /** Kentän vasen reuna ja keskikohdan korkeus pelin pikseleinä. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fontPx: number;
}

const BORDER_PX = 2;

/** Pelin tyyli kentälle: tumma pohja, valkoinen teksti ja reunus. */
export function styleField(field: HTMLInputElement | HTMLTextAreaElement): void {
  Object.assign(field.style, {
    position: 'fixed',
    zIndex: '10',
    boxSizing: 'border-box',
    margin: '0',
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
  field.setAttribute('autocorrect', 'off');
  field.spellcheck = false;
  // Pelin näppäinkomennot (esim. välilyönti) eivät saa viedä kirjaimia kentältä.
  field.addEventListener('keydown', (event) => event.stopPropagation());
  field.addEventListener('keyup', (event) => event.stopPropagation());
}

/** Kiinnittää kentän canvasin päälle. Kenttä poistuu, kun scene sulkeutuu. */
export function attachOverlay(scene: Phaser.Scene, field: HTMLElement, rect: OverlayRect): void {
  const layout = (): void => {
    const canvas = scene.game.canvas;
    const parent = canvas.parentElement;
    if (parent && field.parentElement !== parent) parent.appendChild(field);
    const bounds = canvas.getBoundingClientRect();
    const scale = bounds.width / scene.scale.width;
    Object.assign(field.style, {
      left: `${bounds.left + rect.x * scale}px`,
      top: `${bounds.top + (rect.y - rect.height / 2) * scale}px`,
      width: `${rect.width * scale}px`,
      height: `${rect.height * scale}px`,
      fontSize: `${rect.fontPx * scale}px`,
      borderWidth: `${Math.max(1, BORDER_PX * scale)}px`,
    });
  };
  scene.scale.on(Phaser.Scale.Events.RESIZE, layout);
  window.addEventListener('resize', layout);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, layout);
    window.removeEventListener('resize', layout);
    field.remove();
  });
  layout();
}
