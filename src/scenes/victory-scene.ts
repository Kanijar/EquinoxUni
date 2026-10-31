import Phaser from 'phaser';
import {
  COLORS,
  FONT,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
  VICTORY_VIEW,
  WORLD_VIEW,
} from '../config/game-config';
import { FINAL_BOSS } from '../data/boss';
import { TEXT } from '../i18n/fi';
import { bossName, isBossAwake } from '../logic/boss';
import { playerLevel, playerSprite, type GameState } from '../logic/game-state';
import { playSound } from '../systems/sound-fx';
import { revealScreen } from '../ui/screen-wipe';
import type { WorldSceneData } from './world-scene';

// Voittoruutu: loppuboss on voitettu ('boss') tai jokainen karttavihollinen on voitettu
// ainakin kerran ('complete'). Peli EI lopu: kosketus vie takaisin kartalle, ja
// seikkailua voi jatkaa (tasoja, kykypisteitä, vihollisia palaa kartalle).

export interface VictorySceneData {
  readonly state: GameState;
  readonly kind: 'boss' | 'complete';
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.victory);
  }

  create(data: VictorySceneData): void {
    this.cameras.main.setBackgroundColor(VICTORY_VIEW.background);
    this.addStars();
    const [title, text, hint] = victoryTexts(data);
    this.addText(VICTORY_VIEW.titleY, title, FONT.large).setColor(COLORS.critText);
    this.addText(VICTORY_VIEW.textY, text, FONT.medium);
    if (hint) {
      this.addText(VICTORY_VIEW.hintY, hint, FONT.small);
    }
    const stats = TEXT.victory.stats(playerLevel(data.state), data.state.xp);
    this.addText(VICTORY_VIEW.statsY, stats, FONT.medium);
    this.addHero(data.state);
    this.addText(VICTORY_VIEW.nextY, TEXT.victory.next, FONT.small);
    playSound('victory');
    revealScreen(this);
    this.time.delayedCall(VICTORY_VIEW.inputDelayMs, () => {
      this.input.once(Phaser.Input.Events.POINTER_UP, () => this.continueGame(data.state));
    });
  }

  private continueGame(state: GameState): void {
    const next: WorldSceneData = {
      state,
      graceMs: WORLD_VIEW.graceMs.afterBattle,
      message: TEXT.victory.continues,
    };
    this.scene.start(SCENES.world, next);
  }

  private addText(y: number, text: string, size: string): Phaser.GameObjects.Text {
    return this.add
      .text(GAME_WIDTH / 2, y, text, {
        fontFamily: FONT.family,
        fontSize: size,
        color: COLORS.text,
        align: 'center',
      })
      .setOrigin(0.5)
      .setStroke(COLORS.textShadow, 4);
  }

  /** Sankari hyppii voitonriemusta. */
  private addHero(state: GameState): void {
    const { heroY, heroScale, hopPx, hopMs } = VICTORY_VIEW;
    const hero = this.add
      .sprite(GAME_WIDTH / 2, heroY, playerSprite(state))
      .setOrigin(0.5, 1)
      .setScale(heroScale);
    this.tweens.add({
      targets: hero,
      y: heroY - hopPx,
      duration: hopMs,
      ease: 'Quad.easeOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private addStars(): void {
    const { count, size, minMs, maxMs, color } = VICTORY_VIEW.stars;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.rectangle(x, y, size, size, color).setAlpha(0);
      this.tweens.add({
        targets: star,
        alpha: 1,
        duration: Phaser.Math.Between(minMs, maxMs),
        delay: Phaser.Math.Between(0, maxMs),
        yoyo: true,
        repeat: -1,
      });
    }
  }
}

/** Otsikko, teksti ja vihje. Läpäisyssä vihje kertoo, odottaako loppuboss vielä. */
function victoryTexts(data: VictorySceneData): [string, string, string | null] {
  const name = bossName();
  if (data.kind === 'boss') {
    return [TEXT.victory.bossTitle, TEXT.victory.bossText(name), null];
  }
  const { state } = data;
  let hint: string | null = null;
  if (!state.bossDefeated) {
    hint = isBossAwake(state)
      ? TEXT.victory.bossWaiting(name)
      : TEXT.victory.bossHint(state.bossProgress, FINAL_BOSS.unlockCount);
  }
  return [TEXT.victory.completeTitle, TEXT.victory.completeText, hint];
}
