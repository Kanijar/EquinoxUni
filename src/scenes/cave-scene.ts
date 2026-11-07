import Phaser from 'phaser';
import { CAVE_VIEW } from '../config/cave-config';
import { COLORS, FONT, GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/game-config';
import { CAVE } from '../data/cave';
import { TEXT } from '../i18n/text';
import { pullSword, swordStatus } from '../logic/cave';
import type { GameState } from '../logic/game-state';
import { createSeededRng } from '../logic/seeded-random';
import { playSound } from '../systems/sound-fx';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';
import type { ShopSceneData } from './shop-scene';

// Peikkokuninkaan luola (data/cave.ts). Avataan kartalta luolan suulta LUOLA-napista, kun
// Peikkokuningas on voitettu. Vasemmalla Excalibur on juuttunut kiveen: VEDÄ MIEKKA -nappi
// vetää sen irti ja laittaa käteen, kun taso riittää (logic/cave.ts). Oikealla seisoo Noita,
// jonka NOIDAN KAUPPA -napista avautuu kauppa (scenes/shop-scene.ts, loitsut ja voimat).
// Kartta nukkuu taustalla, kunnes luolasta poistutaan POISTU-napista.

export interface CaveSceneData {
  readonly state: GameState;
}

/** Tippukivien paikat arvotaan aina samalla siemenellä, joten luola näyttää aina samalta. */
const STALACTITE_SEED = 11;

export class CaveScene extends Phaser.Scene {
  private state!: GameState;
  private sword!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Arc;
  private swordText!: Phaser.GameObjects.Text;
  private pullButton!: TextButton;
  /** Viesti juuri vedetystä miekasta (näytetään miekan alla). */
  private news: string | null = null;

  constructor() {
    super(SCENES.cave);
  }

  create(data: CaveSceneData): void {
    this.state = data.state;
    this.news = null;
    this.drawCave();
    // Otsikko keskitetään POISTU-napin vasemmalle puolelle, ettei se jää napin alle.
    const { doneButtonWidth, margin } = CAVE_VIEW;
    const title = addTitle(this, CAVE_VIEW.titleY, TEXT.cave.title);
    title.setX((GAME_WIDTH - doneButtonWidth - margin * 2) / 2);
    this.addLeaveButton();
    this.addSword();
    this.addWitch();
    this.refresh();
  }

  /** Tumma luola: tippukivet katossa ja kivinen lattia. */
  private drawCave(): void {
    const { background, rock, stalactites, floorHeight } = CAVE_VIEW;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, background).setOrigin(0);
    this.add.rectangle(0, GAME_HEIGHT - floorHeight, GAME_WIDTH, floorHeight, rock).setOrigin(0);
    const random = createSeededRng(STALACTITE_SEED);
    const graphics = this.add.graphics().fillStyle(rock, 1);
    const step = GAME_WIDTH / stalactites.count;
    for (let index = 0; index < stalactites.count; index += 1) {
      const left = index * step + random() * (step - stalactites.width);
      const range = stalactites.maxLength - stalactites.minLength;
      const length = stalactites.minLength + random() * range;
      const middle = left + stalactites.width / 2;
      graphics.fillTriangle(left, 0, left + stalactites.width, 0, middle, length);
    }
  }

  private addLeaveButton(): void {
    const { margin, doneButtonWidth, buttonHeight } = CAVE_VIEW;
    new TextButton(this, {
      x: GAME_WIDTH - margin - doneButtonWidth / 2,
      y: margin + buttonHeight / 2,
      width: doneButtonWidth,
      height: buttonHeight,
      label: TEXT.cave.leave,
      onTap: () => this.leave(),
    });
  }

  /** Miekka kivessä, hehku sen takana, tieto miekasta ja VEDÄ MIEKKA -nappi. */
  private addSword(): void {
    const { swordX, figureY, figureScale, glow } = CAVE_VIEW;
    this.glow = this.add.circle(swordX, figureY, glow.radius, glow.color, glow.alpha);
    this.tweens.add({
      targets: this.glow,
      scale: 1.2,
      alpha: glow.alpha / 2,
      duration: glow.pulseMs,
      yoyo: true,
      repeat: -1,
    });
    this.sword = this.add.image(swordX, figureY, 'sword-stone').setScale(figureScale);
    this.swordText = this.addText(swordX, '');
    this.pullButton = this.addButton(swordX, TEXT.cave.pull, () => this.pull());
  }

  /** Noita, hänen tervehdyksensä ja NOIDAN KAUPPA -nappi. */
  private addWitch(): void {
    const { witchX, figureY, figureScale } = CAVE_VIEW;
    this.add.image(witchX, figureY, CAVE.witch.sprite).setScale(figureScale);
    this.addText(witchX, TEXT.cave.witchGreet(CAVE.witch.name));
    this.addButton(witchX, TEXT.cave.shop, () => this.openShop());
  }

  private addText(x: number, text: string): Phaser.GameObjects.Text {
    const label = addLabel(this, { x, y: CAVE_VIEW.textY, text, size: FONT.small, originX: 0.5 });
    return label.setWordWrapWidth(CAVE_VIEW.textWrap).setAlign('center');
  }

  private addButton(x: number, label: string, onTap: () => void): TextButton {
    const { buttonY, buttonWidth, buttonHeight } = CAVE_VIEW;
    return new TextButton(this, {
      x,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      label,
      onTap,
    });
  }

  /** Miekan tila: kivessä hehkuen, kivessä liian raskaana tai poissa. */
  private refresh(): void {
    const status = swordStatus(this.state);
    this.sword.setTexture(status === 'taken' ? 'stone-empty' : 'sword-stone');
    this.glow.setVisible(status === 'ready');
    this.pullButton.setVisible(status !== 'taken');
    this.pullButton.setEnabled(status === 'ready');
    const texts = {
      ready: TEXT.cave.swordReady,
      level: TEXT.cave.swordLevel(CAVE.swordMinLevel),
      taken: TEXT.cave.swordTaken,
    };
    this.swordText.setText(this.news ?? texts[status]);
    this.swordText.setColor(this.news ? COLORS.notice : COLORS.text);
  }

  private pull(): void {
    if (pullSword(this.state)) {
      playSound('level-up');
      this.cameras.main.flash(CAVE_VIEW.glow.pulseMs, 255, 240, 160);
      this.news = TEXT.cave.swordPulled;
      this.refresh();
    }
  }

  /** Noidan kauppa avautuu luolan päälle, ja luola herää, kun kauppa suljetaan. */
  private openShop(): void {
    const data: ShopSceneData = { state: this.state, keeper: CAVE.witch, returnTo: SCENES.cave };
    this.events.once(Phaser.Scenes.Events.WAKE, () => this.refresh());
    this.scene.sleep();
    this.scene.launch(SCENES.shop, data);
  }

  /** Luolasta poistutaan, ja kartta jatkuu siitä, mihin se jäi. */
  private leave(): void {
    this.scene.stop();
    this.scene.wake(SCENES.world);
  }
}
