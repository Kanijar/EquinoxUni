import Phaser from 'phaser';
import { SCENES } from '../config/game-config';
import { HERO_VIEW } from '../config/hero-config';
import { HERO_LOOKS } from '../data/hero-looks';
import { PLAYER } from '../data/player';
import type { LookPart } from '../data/types';
import { TEXT } from '../i18n/text';
import type { GameState } from '../logic/game-state';
import { lookChoices, lookColor, randomLook, stepLook } from '../logic/hero-look';
import { cleanHeroName } from '../logic/hero-name';
import { heroTexture } from '../systems/hero-texture';
import { LookRow } from '../ui/look-row';
import { NameInput } from '../ui/name-input';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';
import type { WorldSceneData } from './world-scene';

// Hahmonluonti uuden pelin alussa (alkuruudun PELAA-napin jälkeen, ennen karttaa).
// Pelaaja kirjoittaa sankarille nimen ja valitsee ihon, hiukset ja vaatteiden värit.
// Iso sankari näyttää valinnat heti. ARVO arpoo ulkonäön, ALOITA vie kartalle ja
// TAKAISIN alkuruutuun. Valinnat tallentuvat pelin tilaan (GameState.name ja look).

/** Uuden pelin tila ja kartalle vietävät tiedot (esim. suden salaisuuden viesti). */
export interface HeroSceneData extends WorldSceneData {
  readonly state: GameState;
}

export class HeroScene extends Phaser.Scene {
  private setup!: HeroSceneData;
  private preview!: Phaser.GameObjects.Image;
  private rows: { readonly part: LookPart; readonly row: LookRow }[] = [];

  constructor() {
    super(SCENES.hero);
  }

  create(data: HeroSceneData): void {
    this.setup = data;
    addTitle(this, HERO_VIEW.titleY, TEXT.hero.title);
    this.addTopButtons();
    this.addNameInput();
    this.addPreview();
    this.rows = HERO_LOOKS.parts.map((part, index) => ({
      part,
      row: new LookRow(this, {
        y: HERO_VIEW.firstRowY + index * HERO_VIEW.rowGap,
        label: TEXT.hero.parts[part],
        onStep: (direction) => this.changeLook(stepLook(this.state.look, part, direction)),
      }),
    }));
    this.refresh();
  }

  private get state(): GameState {
    return this.setup.state;
  }

  private addTopButtons(): void {
    const { margin, topButtonWidth, topButtonHeight, titleY } = HERO_VIEW;
    const x = margin + topButtonWidth / 2;
    const button = (buttonX: number, label: string, onTap: () => void): TextButton =>
      new TextButton(this, {
        x: buttonX,
        y: titleY,
        width: topButtonWidth,
        height: topButtonHeight,
        label,
        onTap,
      });
    button(x, TEXT.hero.back, () => this.scene.start(SCENES.menu));
    const start = button(this.scale.width - x, TEXT.hero.start, () => this.start());
    start.setSelected(true);
  }

  private addNameInput(): void {
    const { nameLabelX, nameX, nameY, nameWidth, nameHeight, nameFontPx } = HERO_VIEW;
    addLabel(this, { x: nameLabelX, y: nameY, text: TEXT.hero.name });
    new NameInput(this, {
      x: nameX,
      y: nameY,
      width: nameWidth,
      height: nameHeight,
      fontPx: nameFontPx,
      maxLength: PLAYER.nameMaxLength,
      value: this.state.name,
      placeholder: TEXT.names.player,
      clean: (raw) => cleanHeroName(raw),
      onChange: (name) => {
        this.state.name = name;
      },
    });
  }

  private addPreview(): void {
    const { previewX, previewFeetY, previewScale, shadow, bobPx, bobMs } = HERO_VIEW;
    this.add
      .ellipse(previewX, previewFeetY, shadow.width, shadow.height, shadow.color)
      .setAlpha(shadow.alpha);
    this.preview = this.add
      .image(previewX, previewFeetY, heroTexture(this.textures, this.state))
      .setOrigin(0.5, 1)
      .setScale(previewScale);
    this.tweens.add({
      targets: this.preview,
      y: previewFeetY - bobPx,
      duration: bobMs,
      yoyo: true,
      repeat: -1,
    });
    new TextButton(this, {
      x: previewX,
      y: HERO_VIEW.randomY,
      width: HERO_VIEW.randomWidth,
      height: HERO_VIEW.randomHeight,
      label: TEXT.hero.random,
      onTap: () => this.changeLook(randomLook()),
    });
  }

  private changeLook(look: GameState['look']): void {
    this.state.look = look;
    this.refresh();
  }

  /** Päivittää ison sankarin ja rivien värit tai numerot. */
  private refresh(): void {
    const { look } = this.state;
    this.preview.setTexture(heroTexture(this.textures, this.state));
    for (const { part, row } of this.rows) {
      if (part === 'hairStyle') {
        row.showText(TEXT.hero.choice(look.hairStyle + 1, lookChoices(part)));
      } else {
        row.showColor(lookColor(look, part));
      }
    }
  }

  private start(): void {
    this.scene.start(SCENES.world, this.setup satisfies WorldSceneData);
  }
}
