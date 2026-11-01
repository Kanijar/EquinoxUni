import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/game-config';
import { QUEST_VIEW } from '../config/quest-config';
import { getItem, getNpc } from '../data';
import type { NpcDef } from '../data/types';
import { TEXT } from '../i18n/text';
import type { GameState } from '../logic/game-state';
import {
  acceptQuest,
  nextQuestLevel,
  questRows,
  turnInQuest,
  type QuestRow,
  type QuestTurnIn,
} from '../logic/quests';
import { playSound } from '../systems/sound-fx';
import { QuestInfo, type QuestInfoContent } from '../ui/quest-info';
import { QuestRowView } from '../ui/quest-row';
import { TextButton } from '../ui/text-button';
import { addTitle } from '../ui/title-text';

// Tehtävänäkymä: puhe tehtävänantajan (esim. Jussi Ketola) kanssa. Avataan kartalta
// puhenapista tai hahmoa napauttamalla. Vasemmalla hahmo, oikealla hänen tehtävänsä
// (valmiit, kesken ja uudet). Tehtävää napauttamalla näkee tarinan, tavoitteen ja palkinnon,
// ja alareunan napista tehtävän voi ottaa vastaan tai palauttaa. Kartta nukkuu taustalla.
// Säännöt: logic/quests.ts ja logic/quest-log.ts.

export interface QuestSceneData {
  readonly state: GameState;
  /** Tehtävänantajan tunniste (data/npcs.ts). */
  readonly npc: string;
}

export class QuestScene extends Phaser.Scene {
  private state!: GameState;
  private npc!: NpcDef;
  private selected: string | null = null;
  /** Puhe viimeisimmän toiminnon jälkeen (esim. "Tehtävä otettu: Limat kuriin!"). */
  private notice: string | null = null;
  /** Palautetun tehtävän kiitos ja palkinto. Näkyy, kunnes jotain muuta napautetaan. */
  private rewardContent: QuestInfoContent | null = null;
  private rowViews: QuestRowView[] = [];
  private rows: QuestRow[] = [];
  private info!: QuestInfo;

  constructor() {
    super(SCENES.quests);
  }

  create(data: QuestSceneData): void {
    this.state = data.state;
    this.npc = getNpc(data.npc);
    this.selected = null;
    this.notice = null;
    this.rewardContent = null;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.panel).setOrigin(0);
    addTitle(this, QUEST_VIEW.titleY, TEXT.names.npc(this.npc));
    this.addBackButton();
    const { npcX, npcY, npcScale, rowFirstY, rowGap, maxRows } = QUEST_VIEW;
    this.add.image(npcX, npcY, this.npc.sprite).setScale(npcScale);
    this.rowViews = Array.from(
      { length: maxRows },
      (_, index) => new QuestRowView(this, rowFirstY + index * rowGap, () => this.select(index)),
    );
    this.info = new QuestInfo(this, () => this.act());
    this.refresh();
  }

  private addBackButton(): void {
    const { margin, backButtonWidth, buttonHeight } = QUEST_VIEW;
    new TextButton(this, {
      x: GAME_WIDTH - margin - backButtonWidth / 2,
      y: margin + buttonHeight / 2,
      width: backButtonWidth,
      height: buttonHeight,
      label: TEXT.quests.back,
      onTap: () => this.close(),
    });
  }

  private select(index: number): void {
    this.selected = this.rows[index]?.quest.id ?? null;
    this.notice = null;
    this.rewardContent = null;
    this.refresh();
  }

  /** Alareunan nappi: ota valittu tehtävä vastaan tai palauta valmis tehtävä. */
  private act(): void {
    const row = this.rows.find((entry) => entry.quest.id === this.selected);
    if (row?.status === 'available' && acceptQuest(this.state, row.quest.id)) {
      this.notice = TEXT.quests.accepted(this.title(row));
    } else if (row?.status === 'ready') {
      const result = turnInQuest(this.state, row.quest.id);
      if (result) {
        this.rewarded(result);
      }
    }
    this.refresh();
  }

  private rewarded(result: QuestTurnIn): void {
    playSound(result.leveledUp ? 'level-up' : 'loot');
    this.cameras.main.flash(QUEST_VIEW.rewardFlashMs);
    const gear = result.items.some((stack) => getItem(stack.id).kind === 'gear');
    const extra = result.leveledUp ? TEXT.battle.levelUp(result.level) : '';
    this.selected = null;
    this.rewardContent = {
      name: TEXT.names.quest(result.quest).title,
      speech: TEXT.names.quest(result.quest).thanks,
      goal: TEXT.quests.rewarded(result.xp, result.items),
      reward: extra || (gear ? TEXT.quests.gearHint : ''),
      action: null,
    };
  }

  private refresh(): void {
    this.rows = questRows(this.state, this.npc.id).slice(0, QUEST_VIEW.maxRows);
    if (!this.rows.some((row) => row.quest.id === this.selected)) {
      this.selected = null;
    }
    this.rowViews.forEach((view, index) => {
      const row = this.rows[index];
      view.set(row, row !== undefined && row.quest.id === this.selected);
    });
    const content = this.selectedContent();
    const notice = this.notice;
    this.info.update(this.rewardContent ?? (notice ? { ...content, speech: notice } : content));
  }

  private title(row: QuestRow): string {
    return TEXT.names.quest(row.quest).title;
  }

  /** Valitun tehtävän tiedot, tai tervehdys, kun mitään ei ole valittu. */
  private selectedContent(): QuestInfoContent {
    const row = this.rows.find((entry) => entry.quest.id === this.selected);
    if (!row) {
      return { name: '', speech: this.greeting(), goal: '', reward: '', action: null };
    }
    const { have, need } = row.progress;
    const goal = TEXT.quests.goal(row.quest.goal);
    const started = row.status !== 'available';
    const actions = { available: TEXT.quests.accept, ready: TEXT.quests.turnIn };
    return {
      name: this.title(row),
      speech: TEXT.names.quest(row.quest).story,
      goal: started ? `${goal}  ${TEXT.quests.progress(have, need)}` : goal,
      reward: TEXT.quests.reward(row.quest.reward.xp, row.quest.reward.items),
      action: row.status === 'active' ? null : actions[row.status as keyof typeof actions],
    };
  }

  /** Tervehdys ja vihje: napauta tehtävää, tule myöhemmin uudestaan tai kaikki on tehty. */
  private greeting(): string {
    if (this.rows.length > 0) {
      return `${TEXT.quests.greeting}\n${TEXT.quests.hint}`;
    }
    const level = nextQuestLevel(this.state, this.npc.id);
    if (level !== null) {
      return `${TEXT.quests.noQuests}\n${TEXT.quests.nextLevel(level)}`;
    }
    return TEXT.quests.allDone;
  }

  /** Tehtävänäkymä sulkeutuu ja kartta jatkuu siitä, mihin se jäi. */
  private close(): void {
    this.scene.stop();
    this.scene.wake(SCENES.world);
  }
}
