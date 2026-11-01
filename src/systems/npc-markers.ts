import Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { NPC_MAP_VIEW } from '../config/quest-config';
import { getTown, NPCS } from '../data';
import type { NpcDef } from '../data/types';
import { TEXT } from '../i18n/text';
import type { GameState } from '../logic/game-state';
import { npcMarker } from '../logic/quests';
import { townTile } from '../logic/world-grid';
import { tileToWorld } from './world-map';

// Tehtävänantajat (esim. Jussi Ketola) kartalla paikkakuntansa talon vieressä. Pään päällä
// pomppii keltainen ! (uusi tehtävä) tai ? (valmis tehtävä palautettavaksi).
// Hahmoa napauttamalla avautuu tehtävänäkymä (kun pelaaja on samassa paikkakunnassa).

interface NpcMarker {
  readonly npc: NpcDef;
  readonly mark: Phaser.GameObjects.Text;
}

export class NpcMarkers {
  private readonly markers: NpcMarker[];

  constructor(scene: Phaser.Scene, onTap: (npc: NpcDef) => void) {
    this.markers = NPCS.map((npc) => this.place(scene, npc, onTap));
  }

  /** Päivittää merkit pelin tilan mukaan (esim. tehtävän valmistuttua ! vaihtuu ?:ksi). */
  update(state: GameState): void {
    for (const { npc, mark } of this.markers) {
      const kind = npcMarker(state, npc.id);
      mark.setText(kind ? TEXT.quests.markers[kind] : '');
    }
  }

  private place(scene: Phaser.Scene, npc: NpcDef, onTap: (npc: NpcDef) => void): NpcMarker {
    const { offsetX, offsetY, depth, markerOffsetY, markerBobPx, markerBobMs } = NPC_MAP_VIEW;
    const town = tileToWorld(townTile(getTown(npc.town)));
    const x = town.x + offsetX;
    const y = town.y + offsetY;
    const sprite = scene.add.image(x, y, npc.sprite).setDepth(depth).setInteractive();
    sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => onTap(npc));
    const mark = scene.add
      .text(x, y + markerOffsetY, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: NPC_MAP_VIEW.markerColor,
      })
      .setOrigin(0.5)
      .setStroke(COLORS.textShadow, NPC_MAP_VIEW.markerStroke)
      .setDepth(depth);
    scene.tweens.add({
      targets: mark,
      y: mark.y - markerBobPx,
      duration: markerBobMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return { npc, mark };
  }
}
