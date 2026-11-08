import type Phaser from 'phaser';
import { MINIMAP_BLINK_MS } from '../config/minimap-config';
import { WORLD } from '../data';
import { MINIMAP_MARKER_COLORS } from '../data/minimap';
import { toMinimap, type MinimapMarker, type MinimapSize } from '../logic/minimap';

// Piirtää minikartan merkit (kylät, kauppias, sankari...) grafiikkaan kartan kuvan päälle.
// Sama piirto pienelle minikartalle (ui/minimap.ts) ja isolle kartalle (scenes/map-scene.ts).
// Sankari vilkkuu ja loppuboss sykkii, jotta ne huomaa heti.

const OUTLINE_COLOR = 0x000000;

export interface MarkerLayout extends MinimapSize {
  /** Kartan kuvan vasen yläkulma ruudulla. */
  readonly x: number;
  readonly y: number;
  /** Merkin sisuksen koko, sankarin merkin koko ja mustan reunuksen paksuus (pikseleinä). */
  readonly marker: number;
  readonly heroMarker: number;
  readonly outline: number;
}

export function drawMarkers(
  graphics: Phaser.GameObjects.Graphics,
  markers: readonly MinimapMarker[],
  layout: MarkerLayout,
  time: number,
): void {
  graphics.clear();
  const blinkOn = Math.floor(time / MINIMAP_BLINK_MS) % 2 === 0;
  for (const marker of markers) {
    const hero = marker.kind === 'hero';
    if ((hero || marker.kind === 'boss') && !blinkOn) {
      // Vilkkuva merkki on joka toisella hetkellä pelkkä pieni musta piste.
      drawSquare(graphics, marker, layout, { size: layout.outline * 2, color: OUTLINE_COLOR });
      continue;
    }
    const size = hero ? layout.heroMarker : layout.marker;
    drawSquare(graphics, marker, layout, { size: size + layout.outline * 2, color: OUTLINE_COLOR });
    drawSquare(graphics, marker, layout, { size, color: MINIMAP_MARKER_COLORS[marker.kind] });
  }
}

function drawSquare(
  graphics: Phaser.GameObjects.Graphics,
  marker: MinimapMarker,
  layout: MarkerLayout,
  square: { readonly size: number; readonly color: number },
): void {
  const center = toMinimap(marker.tile, WORLD, layout);
  const left = Math.round(layout.x + center.x - square.size / 2);
  const top = Math.round(layout.y + center.y - square.size / 2);
  graphics.fillStyle(square.color, 1).fillRect(left, top, square.size, square.size);
}
