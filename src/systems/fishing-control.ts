import type Phaser from 'phaser';
import { FISHING_VIEW } from '../config/fishing-config';
import { FONT } from '../config/game-config';
import { getEnemy, getItem } from '../data';
import { MERCHANT } from '../data/merchant';
import { TEXT } from '../i18n/text';
import {
  castPhase,
  finishCast,
  fishingBlock,
  fishingSpot,
  hasRod,
  reel,
  startCast,
  type Cast,
  type FishingCatch,
  type ReelResult,
} from '../logic/fishing';
import type { GameState } from '../logic/game-state';
import { canFishHere } from '../logic/sailing';
import type { Vec2 } from '../logic/vector';
import { FishButton, type BottomRow } from '../ui/fish-button';
import { playSound } from './sound-fx';
import { getWorldGrid, tileToWorld, worldToTile } from './world-map';

// Kalastus kartalla (säännöt logic/fishing.ts). Kun sankarilla on onki ja hän seisoo veden
// vieressä, alariviin tulee KALASTA-nappi (tietokoneella F). Napautus heittää kohon lähimpään
// vesiruutuun, ja nappi muuttuu NYKÄISE-napiksi. Kun kala nappaa, koho sukeltaa, sen päälle
// tulee huutomerkki ja kuuluu ääni: nyt pitää nykäistä. Liikkuminen lopettaa kalastuksen.
// Käytössä on paras onki ja repussa valittu syötti (logic/fishing-gear.ts).
// Saalis menee reppuun, ja hain tai jättimustekalan kanssa alkaa taistelu (onEnemy).

export interface FishingCallbacks {
  /** Ilmoitus kartan yläosaan. */
  readonly message: (text: string) => void;
  /** Vihollinen (hai) tarttui onkeen: taistelu alkaa. */
  readonly onEnemy: (enemyId: string) => void;
}

/** Kohon paikka ja heitto, kun kalastus on käynnissä. */
interface ActiveCast {
  readonly cast: Cast;
  readonly bobberAt: Vec2;
  elapsedMs: number;
  bitten: boolean;
}

export class FishingControl {
  private readonly button: FishButton;
  private readonly bobber: Phaser.GameObjects.Image;
  private readonly mark: Phaser.GameObjects.Text;
  private readonly line: Phaser.GameObjects.Graphics;
  private active: ActiveCast | null = null;
  private spot: Vec2 | null = null;
  private hand: Vec2 = { x: 0, y: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState,
    private readonly callbacks: FishingCallbacks,
  ) {
    const { depth, markColor } = FISHING_VIEW;
    this.button = new FishButton(scene, () => this.tap());
    this.bobber = scene.add.image(0, 0, 'bobber').setDepth(depth).setVisible(false);
    this.line = scene.add.graphics().setDepth(depth);
    this.mark = scene.add
      .text(0, 0, TEXT.fishing.mark, { fontFamily: FONT.family, fontSize: FONT.medium })
      .setColor(markColor)
      .setStroke('#000000', 3)
      .setOrigin(0.5)
      .setDepth(depth)
      .setVisible(false);
    scene.input.keyboard?.on('keydown-F', () => this.tap());
  }

  /**
   * Joka ruudunpäivitys: etsii vettä sankarin vierestä ja vie heittoa eteenpäin.
   * moving = sankari liikkuu (lopettaa kalastuksen).
   */
  update(position: Vec2, moving: boolean, deltaMs: number, row: BottomRow): void {
    const { handOffset } = FISHING_VIEW;
    this.hand = { x: position.x + handOffset.x, y: position.y + handOffset.y };
    if (this.active && moving) {
      this.stop();
      this.callbacks.message(TEXT.fishing.cancelled);
    }
    // Veneestä voi kalastaa vain, jos vene sallii sen (Luksusvene, logic/sailing.ts).
    const canFish = hasRod(this.state) && canFishHere(this.state);
    this.spot = canFish ? fishingSpot(getWorldGrid(), worldToTile(position)) : null;
    if (this.active) {
      this.advance(this.active, deltaMs);
    }
    const mode = this.active ? (this.active.bitten ? 'bite' : 'reel') : this.spot ? 'fish' : null;
    this.button.update(mode, row);
    this.drawLine();
  }

  /** KALASTA heittää, NYKÄISE nykäisee. */
  private tap(): void {
    if (this.active) {
      this.finish(reel(this.active.cast, this.active.elapsedMs));
    } else if (this.spot) {
      this.cast(this.spot);
    }
  }

  private cast(spot: Vec2): void {
    const cast = startCast(this.state, Math.random);
    if (fishingBlock(this.state) !== null || cast === null) {
      this.callbacks.message(TEXT.fishing.noBait(MERCHANT.name));
      return;
    }
    const bobberAt = tileToWorld(spot);
    this.active = { cast, bobberAt, elapsedMs: 0, bitten: false };
    this.bobber.setPosition(bobberAt.x, bobberAt.y).setVisible(true);
    this.scene.tweens.add({
      targets: this.bobber,
      y: bobberAt.y + FISHING_VIEW.bobPx,
      duration: FISHING_VIEW.bobMs,
      yoyo: true,
      repeat: -1,
    });
    playSound('splash');
    this.callbacks.message(TEXT.fishing.cast(TEXT.names.item(getItem(cast.bait.item))));
  }

  /** Aika kuluu: kala nappaa tai karkaa syötin kanssa. */
  private advance(active: ActiveCast, deltaMs: number): void {
    active.elapsedMs += deltaMs;
    const phase = castPhase(active.cast, active.elapsedMs);
    if (phase === 'bite' && !active.bitten) {
      active.bitten = true;
      this.showBite(active.bobberAt);
    } else if (phase === 'escaped') {
      this.finish('escaped');
    }
  }

  /** Koho sukeltaa ja huutomerkki ilmestyy. */
  private showBite(at: Vec2): void {
    const { dipPx, dipMs, markOffsetY } = FISHING_VIEW;
    this.scene.tweens.killTweensOf(this.bobber);
    this.bobber.setY(at.y);
    this.scene.tweens.add({
      targets: this.bobber,
      y: at.y + dipPx,
      duration: dipMs,
      yoyo: true,
      repeat: -1,
    });
    this.mark.setPosition(at.x, at.y + markOffsetY).setVisible(true);
    playSound('bite');
  }

  private finish(result: ReelResult): void {
    const active = this.active;
    this.stop();
    if (!active) {
      return;
    }
    const caught = finishCast(this.state, active.cast, result, Math.random);
    if (caught?.kind === 'enemy') {
      this.callbacks.message(TEXT.fishing.enemy(TEXT.names.enemy(getEnemy(caught.enemy))));
      this.callbacks.onEnemy(caught.enemy);
      return;
    }
    this.callbacks.message(this.resultText(result, caught, active.cast.bait.item));
    playSound(caught ? 'loot' : 'hurt');
  }

  private resultText(result: ReelResult, caught: FishingCatch | null, bait: string): string {
    const baitName = TEXT.names.item(getItem(bait));
    const left = TEXT.fishing.baitLeft(baitName, this.state.inventory[bait] ?? 0);
    if (caught?.kind === 'item') {
      const item = getItem(caught.item);
      const name = TEXT.names.item(item);
      return item.kind === 'gear'
        ? TEXT.fishing.caughtGear(name)
        : `${TEXT.fishing.caught(name)}\n${left}`;
    }
    return result === 'early' ? TEXT.fishing.early : `${TEXT.fishing.escaped}\n${left}`;
  }

  /** Koho ja siima pois. */
  private stop(): void {
    this.active = null;
    this.scene.tweens.killTweensOf(this.bobber);
    this.bobber.setVisible(false);
    this.mark.setVisible(false);
  }

  private drawLine(): void {
    this.line.clear();
    if (!this.active) {
      return;
    }
    this.line.lineStyle(1, FISHING_VIEW.lineColor, FISHING_VIEW.lineAlpha);
    this.line.lineBetween(this.hand.x, this.hand.y, this.bobber.x, this.bobber.y);
  }
}
