import type Phaser from 'phaser';
import { TALK_BUTTON } from '../config/quest-config';
import type { NpcDef } from '../data/types';
import { TEXT } from '../i18n/text';
import type { NpcMarker } from '../logic/quests';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// Puhenappi kartan oikeassa alakulmassa TALLENNA-napin yläpuolella, esim. "JUSSI KETOLA !".
// Näkyy vain paikkakunnassa, jossa tehtävänantaja asuu. Napista avautuu tehtävänäkymä.

export class TalkButton {
  private readonly button: TextButton;
  private npc: NpcDef | null = null;

  constructor(scene: Phaser.Scene, onTap: (npc: NpcDef) => void) {
    const { stackIndex, width } = TALK_BUTTON;
    const options = cornerButton(stackIndex, width, '', () => this.npc && onTap(this.npc));
    this.button = new TextButton(scene, options);
    this.button.setVisible(false);
  }

  /** npc = paikkakunnan tehtävänantaja, tai null, kun pelaaja ei ole hänen paikkakunnassaan. */
  update(npc: NpcDef | null, marker: NpcMarker): void {
    this.npc = npc;
    this.button.setVisible(npc !== null);
    if (npc) {
      const mark = marker ? TEXT.quests.markers[marker] : '';
      this.button.setLabel(TEXT.quests.talkButton(npc, mark));
    }
  }
}
