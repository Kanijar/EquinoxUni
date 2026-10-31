import type Phaser from 'phaser';
import { TILE_SIZE } from '../config/game-config';
import type { LevelDef } from '../data/types';
import type { Vec2 } from '../logic/vector';

// Rakentaa kentän data/levels.ts:n merkkikartasta.

export const WALL = '#';

/** Muuttaa ruutukoordinaatin pikselikoordinaatiksi (ruudun keskipiste). */
export function tileToWorld(tileX: number, tileY: number): Vec2 {
  return { x: tileX * TILE_SIZE + TILE_SIZE / 2, y: tileY * TILE_SIZE + TILE_SIZE / 2 };
}

export interface BuiltLevel {
  readonly walls: Phaser.Physics.Arcade.StaticGroup;
  readonly widthPx: number;
  readonly heightPx: number;
}

export function buildLevel(scene: Phaser.Scene, level: LevelDef): BuiltLevel {
  const walls = scene.physics.add.staticGroup();
  level.map.forEach((row, tileY) => {
    [...row].forEach((char, tileX) => {
      const pos = tileToWorld(tileX, tileY);
      if (char === WALL) {
        walls.create(pos.x, pos.y, 'wall');
      } else {
        scene.add.image(pos.x, pos.y, 'floor');
      }
    });
  });
  const widthPx = (level.map[0]?.length ?? 0) * TILE_SIZE;
  const heightPx = level.map.length * TILE_SIZE;
  scene.physics.world.setBounds(0, 0, widthPx, heightPx);
  return { walls, widthPx, heightPx };
}
