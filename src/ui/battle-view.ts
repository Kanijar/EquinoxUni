import type Phaser from 'phaser';
import { BATTLE_VIEW, COLORS, FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/game-config';
import { flash } from '../entities/effects';
import { TEXT } from '../i18n/fi';
import type { Battle, Side } from '../logic/battle';
import type { Fighter } from '../logic/combat';

// Taistelunäkymän grafiikka: tausta, taistelijat, elämäpalkit ja viestilaatikko.

const HORIZON_Y = 150;
const PLAYER_POS = { x: 120, y: 172 };
const ENEMY_POS = { x: 360, y: 142 };
const PLATFORM = { width: 110, height: 22 };
const PANEL = { x: 8, y: 6, barY: 22, barWidth: 120, barHeight: 6 };
const MESSAGE = { y: 202, height: 34 };
const LUNGE_PX = 14;
const ANIM_MS = 120;

export interface BattleViewInfo {
  readonly playerName: string;
  readonly playerSprite: string;
  readonly enemyName: string;
  readonly enemySprite: string;
}

interface FighterDisplay {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly bar: Phaser.GameObjects.Rectangle;
  readonly hpText: Phaser.GameObjects.Text;
}

export class BattleView {
  private readonly player: FighterDisplay;
  private readonly enemy: FighterDisplay;
  private readonly message: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    info: BattleViewInfo,
  ) {
    drawBackground(scene);
    this.player = this.addFighter(info.playerSprite, info.playerName, 'player');
    this.enemy = this.addFighter(info.enemySprite, info.enemyName, 'enemy');
    scene.add
      .rectangle(GAME_WIDTH / 2, MESSAGE.y, GAME_WIDTH - BATTLE_VIEW.margin * 2, MESSAGE.height)
      .setFillStyle(COLORS.panel, 0.85)
      .setStrokeStyle(2, COLORS.panelBorder);
    this.message = scene.add
      .text(GAME_WIDTH / 2, MESSAGE.y, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - BATTLE_VIEW.margin * 4 },
      })
      .setOrigin(0.5);
  }

  say(text: string): void {
    this.message.setText(text);
  }

  updateHp(battle: Battle): void {
    setHp(this.player, battle.player);
    setHp(this.enemy, battle.enemy);
  }

  /** Hyökkääjä syöksähtää ja kohde välähtää. */
  playHit(attacker: Side): void {
    this.playLunge(attacker);
    const target = this.display(attacker === 'player' ? 'enemy' : 'player');
    flash(target.sprite, attacker === 'player' ? COLORS.hitFlash : COLORS.hurt, ANIM_MS * 2);
  }

  /** Hahmo syöksähtää vastustajaa kohti ja palaa paikalleen (esim. varastaessa). */
  playLunge(side: Side): void {
    const sprite = this.display(side).sprite;
    const direction = side === 'player' ? 1 : -1;
    this.scene.tweens.add({
      targets: sprite,
      x: sprite.x + LUNGE_PX * direction,
      duration: ANIM_MS,
      yoyo: true,
    });
  }

  /** Voitettu vihollinen häviää näkyvistä. */
  playDefeat(side: Side): void {
    this.scene.tweens.add({ targets: this.display(side).sprite, alpha: 0, duration: ANIM_MS * 3 });
  }

  private display(side: Side): FighterDisplay {
    return side === 'player' ? this.player : this.enemy;
  }

  private addFighter(spriteKey: string, name: string, side: Side): FighterDisplay {
    const pos = side === 'player' ? PLAYER_POS : ENEMY_POS;
    this.scene.add.ellipse(pos.x, pos.y, PLATFORM.width, PLATFORM.height, COLORS.battlePlatform);
    const sprite = this.scene.add
      .sprite(pos.x, pos.y, spriteKey)
      .setOrigin(0.5, 0.9)
      .setScale(BATTLE_VIEW.spriteScale);
    const left = side === 'player';
    const x = left ? PANEL.x : GAME_WIDTH - PANEL.x;
    const originX = left ? 0 : 1;
    const style = { fontFamily: FONT.family, fontSize: FONT.medium, color: COLORS.text };
    this.scene.add.text(x, PANEL.y, name, style).setOrigin(originX, 0).setStroke('#000', 3);
    this.scene.add
      .rectangle(x, PANEL.barY, PANEL.barWidth, PANEL.barHeight, COLORS.hpBarBack)
      .setOrigin(originX, 0);
    const bar = this.scene.add
      .rectangle(x, PANEL.barY, PANEL.barWidth, PANEL.barHeight, COLORS.hpBar)
      .setOrigin(originX, 0);
    const hpText = this.scene.add
      .text(x, PANEL.barY + PANEL.barHeight + 2, '', { ...style, fontSize: FONT.small })
      .setOrigin(originX, 0)
      .setStroke('#000', 3);
    return { sprite, bar, hpText };
  }
}

function setHp(display: FighterDisplay, fighter: Fighter): void {
  display.bar.setScale(Math.max(0, fighter.hp / fighter.maxHp), 1);
  display.hpText.setText(TEXT.hud.hp(fighter.hp, fighter.maxHp));
}

function drawBackground(scene: Phaser.Scene): void {
  scene.add.rectangle(0, 0, GAME_WIDTH, HORIZON_Y, COLORS.battleSky).setOrigin(0);
  scene.add
    .rectangle(0, HORIZON_Y, GAME_WIDTH, GAME_HEIGHT - HORIZON_Y, COLORS.battleGround)
    .setOrigin(0);
}
