import Phaser from 'phaser';
import { COLORS, FONT, GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/game-config';
import { TEXT } from '../i18n/fi';

export interface GameOverData {
  readonly won: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.gameOver);
  }

  create(data: GameOverData): void {
    const texts = data.won ? TEXT.victory : TEXT.gameOver;
    const button = data.won ? TEXT.victory.next : TEXT.gameOver.retry;
    const style = { fontFamily: FONT.family, color: COLORS.text };
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.4, texts.title, { ...style, fontSize: FONT.large })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.65, button, { ...style, fontSize: FONT.medium })
      .setOrigin(0.5);
    this.input.once(Phaser.Input.Events.POINTER_UP, () => this.scene.start(SCENES.game));
  }
}
