import Phaser from 'phaser';
import { FONT, GAME_HEIGHT, GAME_WIDTH, SCENES, COLORS } from '../config/game-config';
import { HOUSE_VIEW } from '../config/house-config';
import { TEXT } from '../i18n/text';
import type { GameState } from '../logic/game-state';
import { submissionFor, type LeaderboardReply } from '../logic/leaderboard';
import { heroTexture } from '../systems/hero-texture';
import { leaderboardService } from '../systems/leaderboard-service';
import { LeaderboardList } from '../ui/leaderboard-list';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';

// Sankarin talo (data/house.ts). Avataan kartalta talon ovelta TALO-napista. Vasemmalla
// seisoo sankari pokaalin alla, oikealla seinällä on koko pelin 10 parhaan lista.
// Kun talo avautuu, lista haetaan palvelimelta (net/leaderboard.ts). Oma tulos (nimimerkki ja
// KP) lähtee listalle vasta LISÄÄ TULOKSENI -napista, jonka yllä kerrotaan, että nimimerkki
// näkyy kaikille. Kartta nukkuu taustalla, kunnes talosta poistutaan.

export interface HouseSceneData {
  readonly state: GameState;
}

export class HouseScene extends Phaser.Scene {
  private state!: GameState;
  private list!: LeaderboardList;
  private rankText!: Phaser.GameObjects.Text;
  private submitButton!: TextButton;
  /** Kasvaa joka avauksella, jotta vanhan haun vastaus ei sotke uutta näkymää. */
  private visit = 0;

  constructor() {
    super(SCENES.house);
  }

  create(data: HouseSceneData): void {
    this.state = data.state;
    this.drawRoom();
    const { doneButtonWidth, margin, panel } = HOUSE_VIEW;
    addTitle(this, HOUSE_VIEW.titleY, TEXT.house.title).setX(panel.x / 2);
    new TextButton(this, {
      x: GAME_WIDTH - margin - doneButtonWidth / 2,
      y: margin + HOUSE_VIEW.buttonHeight / 2,
      width: doneButtonWidth,
      height: HOUSE_VIEW.buttonHeight,
      label: TEXT.house.leave,
      onTap: () => this.leave(),
    });
    this.addHero(data.state);
    this.submitButton = new TextButton(this, {
      x: HOUSE_VIEW.heroX,
      y: HOUSE_VIEW.submitY,
      width: HOUSE_VIEW.submitWidth,
      height: HOUSE_VIEW.buttonHeight,
      label: TEXT.house.submit,
      onTap: () => this.fetchList(true),
    });
    this.list = new LeaderboardList(this);
    this.fetchList(false);
  }

  /** Hirsiseinä ja lankkulattia. */
  private drawRoom(): void {
    const { wall, log, logHeight, floor, floorHeight } = HOUSE_VIEW;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, wall).setOrigin(0);
    for (let y = logHeight; y < GAME_HEIGHT - floorHeight; y += logHeight * 2) {
      this.add.rectangle(0, y, GAME_WIDTH, logHeight, log).setOrigin(0);
    }
    this.add.rectangle(0, GAME_HEIGHT - floorHeight, GAME_WIDTH, floorHeight, floor).setOrigin(0);
  }

  /** Sankari pokaalin alla, oma sija ja kertomus siitä, mitä listalle lähetetään. */
  private addHero(state: GameState): void {
    const { heroX, heroY, heroScale, trophyY, trophyScale } = HOUSE_VIEW;
    this.add.image(heroX, trophyY, 'trophy').setScale(trophyScale);
    this.add.image(heroX, heroY, heroTexture(this.textures, state)).setScale(heroScale);
    this.rankText = addLabel(this, {
      x: heroX,
      y: HOUSE_VIEW.rankY,
      text: '',
      originX: 0.5,
    }).setColor(COLORS.notice);
    addLabel(this, {
      x: heroX,
      y: HOUSE_VIEW.privacyY,
      text: TEXT.house.privacy,
      size: FONT.small,
      originX: 0.5,
    })
      .setOrigin(0.5, 0)
      .setWordWrapWidth(HOUSE_VIEW.privacyWrap)
      .setAlign('center')
      .setShadow(1, 1, COLORS.textShadow);
  }

  /** Hakee listan (submit = lähettää ensin oman tuloksen) ja näyttää sen, kun palvelin vastaa. */
  private fetchList(submit: boolean): void {
    const service = leaderboardService();
    this.submitButton.setEnabled(service.enabled);
    if (!service.enabled) {
      this.list.showMessage(TEXT.house.disabled);
      return;
    }
    this.list.showMessage(TEXT.house.loading);
    this.submitButton.setEnabled(false);
    this.visit += 1;
    const visit = this.visit;
    const request = submit ? service.submit(submissionFor(this.state)) : service.top();
    void request.then((reply) => {
      if (visit === this.visit && this.scene.isActive()) {
        this.submitButton.setEnabled(true);
        this.show(reply);
      }
    });
  }

  private show(reply: LeaderboardReply | null): void {
    if (!reply) {
      this.list.showMessage(TEXT.house.offline);
      return;
    }
    this.list.showEntries(reply.top, reply.rank);
    const rank = reply.rank;
    this.rankText.setText(
      rank === null ? '' : rank === 1 ? TEXT.house.best : TEXT.house.yourRank(rank),
    );
  }

  /** Talosta poistutaan, ja kartta jatkuu siitä, mihin se jäi. */
  private leave(): void {
    this.visit += 1;
    this.scene.stop();
    this.scene.wake(SCENES.world);
  }
}
