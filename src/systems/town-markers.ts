import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { WORLD } from '../data';
import type { TownDef } from '../data/types';
import { townAt, townTile } from '../logic/world-grid';
import type { Vec2 } from '../logic/vector';
import { tileToWorld, worldToTile } from './world-map';

// Paikkakuntien talot ja nimet kartalla sekä paikkakuntaan saapumisen tunnistus.

const LABEL_OFFSET_Y = 11;
const MARKER_DEPTH = 5;

export function placeTownMarkers(scene: Phaser.Scene): void {
  for (const town of WORLD.towns) {
    const pos = tileToWorld(townTile(town));
    scene.add.image(pos.x, pos.y, 'town').setDepth(MARKER_DEPTH);
    scene.add
      .text(pos.x, pos.y + LABEL_OFFSET_Y, town.name, {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.text,
      })
      .setOrigin(0.5, 0)
      .setStroke(COLORS.textShadow, 3)
      .setDepth(MARKER_DEPTH);
  }
}

/** Seuraa, missä paikkakunnassa pelaaja on. update() kertoo, kun pelaaja saapuu uuteen. */
export class TownTracker {
  private current: TownDef | undefined;

  constructor(position: Vec2) {
    this.current = townAt(WORLD, worldToTile(position));
  }

  get town(): TownDef | undefined {
    return this.current;
  }

  /** Palauttaa paikkakunnan, jos pelaaja juuri saapui siihen. */
  update(position: Vec2): TownDef | undefined {
    const town = townAt(WORLD, worldToTile(position));
    const arrived = town && town !== this.current ? town : undefined;
    this.current = town;
    return arrived;
  }
}
