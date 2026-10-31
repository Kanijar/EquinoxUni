import type Phaser from 'phaser';
import { getItem } from '../data';
import type { Spawn } from '../data/types';
import type { Player } from '../entities/player';
import { TEXT } from '../i18n/fi';
import { heal } from '../logic/combat';
import { tileToWorld } from './level-builder';

// Maassa olevat esineet ja niiden poimiminen.

export function spawnPickups(scene: Phaser.Scene, player: Player, spawns: readonly Spawn[]): void {
  for (const spawn of spawns) {
    const item = getItem(spawn.id);
    const pos = tileToWorld(spawn.x, spawn.y);
    const sprite = scene.physics.add.staticSprite(pos.x, pos.y, item.sprite);
    scene.physics.add.overlap(player.sprite, sprite, () => {
      if (item.kind === 'heal') {
        heal(player.fighter, item.value);
      }
      showFloatingText(scene, pos.x, pos.y, TEXT.pickup(item.name));
      sprite.destroy();
    });
  }
}

function showFloatingText(scene: Phaser.Scene, x: number, y: number, message: string): void {
  const text = scene.add
    .text(x, y - 10, message, { fontFamily: 'monospace', fontSize: '10px' })
    .setOrigin(0.5);
  scene.tweens.add({
    targets: text,
    y: y - 30,
    alpha: 0,
    duration: 1200,
    onComplete: () => text.destroy(),
  });
}
