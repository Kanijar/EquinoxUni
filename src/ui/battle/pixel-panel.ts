import type Phaser from 'phaser';
import { PIXEL_PANEL } from '../../config/battle-config';

// Pikselitaiteen paneeli: tumma pohja, vaalea kehys viistetyin kulmin, varjo alla
// ja ohut valoraita yläreunassa. Käytössä nimikylteissä, viestilaatikossa ja napeissa.

const BORDER = 2;
const SHADOW_PX = 2;

export interface PanelRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PanelColors {
  readonly fill: number;
  readonly border: number;
  /** Korosteväri paneelin alareunassa (esim. napin toiminto), tai undefined. */
  readonly accent?: number;
  readonly accentHeight?: number;
}

const DEFAULT_COLORS: PanelColors = { fill: PIXEL_PANEL.fill, border: PIXEL_PANEL.border };

/** Piirtää paneelin annettuun Graphics-olioon (rect = vasen yläkulma ja koko). */
export function drawPixelPanel(
  g: Phaser.GameObjects.Graphics,
  rect: PanelRect,
  colors: PanelColors = DEFAULT_COLORS,
): void {
  const { x, y, width: w, height: h } = rect;
  g.fillStyle(PIXEL_PANEL.shadow, PIXEL_PANEL.alpha);
  g.fillRect(x + BORDER, y + h, w - BORDER, SHADOW_PX);
  g.fillRect(x + w, y + BORDER, SHADOW_PX, h - BORDER);
  g.fillStyle(colors.fill, PIXEL_PANEL.alpha);
  g.fillRect(x + BORDER, y + BORDER, w - BORDER * 2, h - BORDER * 2);
  g.fillStyle(PIXEL_PANEL.highlight, 1);
  g.fillRect(x + BORDER + 1, y + BORDER, w - BORDER * 2 - 2, 1);
  if (colors.accent !== undefined) {
    const accentHeight = colors.accentHeight ?? BORDER;
    g.fillStyle(colors.accent, 1);
    g.fillRect(x + BORDER, y + h - BORDER - accentHeight, w - BORDER * 2, accentHeight);
  }
  g.fillStyle(colors.border, 1);
  g.fillRect(x + BORDER, y, w - BORDER * 2, BORDER);
  g.fillRect(x + BORDER, y + h - BORDER, w - BORDER * 2, BORDER);
  g.fillRect(x, y + BORDER, BORDER, h - BORDER * 2);
  g.fillRect(x + w - BORDER, y + BORDER, BORDER, h - BORDER * 2);
  // Viistetyt kulmat: yksi pikseli kulman sisäpuolelle.
  g.fillRect(x + 1, y + 1, BORDER, BORDER);
  g.fillRect(x + w - BORDER - 1, y + 1, BORDER, BORDER);
  g.fillRect(x + 1, y + h - BORDER - 1, BORDER, BORDER);
  g.fillRect(x + w - BORDER - 1, y + h - BORDER - 1, BORDER, BORDER);
}
