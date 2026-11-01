import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// REPPU-nappi kartan oikeassa alakulmassa. Näkyy aina, ja napista avautuu reppu,
// jossa varusteita laitetaan käyttöön ja juomia juodaan (scenes/backpack-scene.ts).

export function addBackpackButton(scene: Phaser.Scene, onTap: () => void): TextButton {
  const { width } = WORLD_VIEW.backpackButton;
  return new TextButton(scene, cornerButton(0, width, TEXT.backpack.button, onTap));
}
