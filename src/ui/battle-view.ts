import type Phaser from 'phaser';
import { BATTLE_CAMERA, BATTLE_STAGE, DAMAGE_NUMBERS } from '../config/battle-config';
import { BATTLE_VIEW, COLORS } from '../config/game-config';
import type { BattleBackdropDef } from '../data/types';
import { TEXT } from '../i18n/fi';
import type { Battle, Side } from '../logic/battle';
import { playSound } from '../systems/sound-fx';
import { drawBattleBackdrop } from './battle/backdrop';
import { BattleParticles, type FlameStream } from './battle/battle-particles';
import { critImpact, shakeHit, showBanner, showShield, throwItem } from './battle/battle-fx';
import { showDamageNumber } from './battle/damage-number';
import { FighterSprite } from './battle/fighter-sprite';
import { showFireball } from './battle/fireball';
import { MessageBox } from './battle/message-box';
import { hitColor, numberSpot, paletteColors } from './battle/view-helpers';
import { StatusPanel } from './battle/status-panel';
import { showCritPopup } from './crit-popup';

// Taistelunäkymän grafiikka yhdessä paikassa: tausta maaston mukaan, taistelijat,
// nimikyltit elämäpalkkeineen, viestilaatikko ja kaikki efektit. Osat ovat
// ui/battle/-kansiossa pieninä tiedostoina; tämä luokka vain ohjaa niitä.
//
// Elämäpalkit muuttuvat vasta, kun isku osuu (ei heti vuoron alussa): näkymä pitää
// kirjaa näytetystä elämästä, ja vuoron lopuksi se tarkistetaan oikeaksi (syncHp).

export interface BattleViewInfo {
  readonly playerName: string;
  /** Pelaajan kokemuspisteet taistelun alussa. */
  readonly playerXp: number;
  readonly playerSprite: string;
  readonly enemyName: string;
  readonly enemySprite: string;
  readonly backdrop: BattleBackdropDef;
}

/** Lyönnin tiedot näkymää varten (logic/battle.ts:n 'hit'-tapahtuma). */
export interface HitInfo {
  readonly attacker: Side;
  readonly damage: number;
  readonly crit: boolean;
  readonly defended: boolean;
}

/** Lumimyrskyn tiedot näkymää varten (logic/battle.ts:n 'special'-tapahtuma). */
export interface StormInfo {
  readonly damage: number;
  readonly defended: boolean;
  readonly extinguished: boolean;
}

interface ShownHp {
  hp: number;
  maxHp: number;
}

export class BattleView {
  private readonly fighters: Readonly<Record<Side, FighterSprite>>;
  private readonly panels: Readonly<Record<Side, StatusPanel>>;
  private readonly shown: Record<Side, ShownHp> = {
    player: { hp: 0, maxHp: 1 },
    enemy: { hp: 0, maxHp: 1 },
  };
  private readonly message: MessageBox;
  private readonly particles: BattleParticles;
  private readonly enemyColors: readonly number[];
  private flames: FlameStream | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    info: BattleViewInfo,
  ) {
    drawBattleBackdrop(scene, info.backdrop);
    this.particles = new BattleParticles(scene);
    this.fighters = {
      player: new FighterSprite(scene, info.playerSprite, 'player'),
      enemy: new FighterSprite(scene, info.enemySprite, 'enemy'),
    };
    this.panels = {
      player: new StatusPanel(scene, 'player', info.playerName),
      enemy: new StatusPanel(scene, 'enemy', info.enemyName),
    };
    this.panels.player.xpBar?.set(info.playerXp);
    this.message = new MessageBox(scene);
    this.enemyColors = paletteColors(info.enemySprite);
  }

  /** Taistelun alku: hahmot liukuvat paikalleen. */
  intro(): void {
    this.fighters.player.enter();
    this.fighters.enemy.enter();
  }

  say(text: string): void {
    this.message.say(text);
  }

  /** Asettaa elämäpalkit taistelun todellisiin arvoihin. */
  syncHp(battle: Battle, animate = true): void {
    for (const side of ['player', 'enemy'] as const) {
      const fighter = battle[side];
      this.shown[side] = { hp: fighter.hp, maxHp: fighter.maxHp };
      this.panels[side].setHp(fighter.hp, fighter.maxHp, animate);
    }
  }

  /** KP-palkki täyttyy uusiin kokemuspisteisiin (voiton jälkeen). */
  updateXp(xp: number): void {
    this.panels.player.xpBar?.set(xp, BATTLE_VIEW.xpFillMs);
  }

  /** Hyökkääjä hyppää kohti, ja osuman hetkellä kohde horjahtaa ja numero lentää. */
  playHit(hit: HitInfo): void {
    const attacker = this.fighters[hit.attacker];
    const targetSide: Side = hit.attacker === 'player' ? 'enemy' : 'player';
    const target = this.fighters[targetSide];
    playSound('swing');
    attacker.lunge(() => {
      const at = target.center;
      playSound(hit.crit ? 'crit' : hit.attacker === 'player' ? 'hit' : 'hurt');
      target.hurt(hit.crit ? COLORS.critFlash : hitColor(hit.attacker));
      this.changeHp(targetSide, -hit.damage);
      const kind = hit.crit ? 'crit' : hit.defended ? 'blocked' : 'damage';
      showDamageNumber(this.scene, numberSpot(at), TEXT.battle.damagePopup(hit.damage), kind);
      this.particles.burst(hit.crit ? 'crit' : hit.defended ? 'block' : 'hit', at.x, at.y);
      if (hit.crit) {
        critImpact(this.scene);
        showCritPopup(this.scene, target.sprite.x, target.sprite.y);
      } else {
        shakeHit(this.scene);
      }
    });
  }

  /** Tulipallo lentää viholliseen, räjähtää ja sytyttää sen palamaan. */
  playSpell(damage: number, crit: boolean): void {
    const player = this.fighters.player.center;
    const target = this.fighters.enemy;
    this.fighters.player.lunge();
    const path = { from: { x: player.x + 20, y: player.y }, to: target.center };
    showFireball(this.scene, this.particles, path, () => {
      playSound(crit ? 'crit' : 'boom');
      target.hurt(crit ? COLORS.critFlash : COLORS.spellFlash);
      this.changeHp('enemy', -damage);
      showDamageNumber(
        this.scene,
        numberSpot(target.center),
        TEXT.battle.damagePopup(damage),
        crit ? 'crit' : 'burn',
      );
      this.setBurning(true);
      if (crit) {
        critImpact(this.scene);
        showCritPopup(this.scene, target.sprite.x, target.sprite.y);
      } else {
        shakeHit(this.scene);
      }
    });
  }

  /** Palava vihollinen välähtää liekin värisenä ja menettää elämää. */
  playBurn(damage: number): void {
    const target = this.fighters.enemy;
    target.glow(COLORS.spellFlash, BATTLE_STAGE.hurt.flashMs);
    this.changeHp('enemy', -damage);
    showDamageNumber(this.scene, numberSpot(target.center), TEXT.battle.burnPopup(damage), 'burn');
  }

  /** Liekit vihollisen yllä ja liekki-ikoni nimikyltissä. */
  setBurning(burning: boolean): void {
    this.panels.enemy.setBurning(burning);
    if (burning && !this.flames) {
      this.flames = this.particles.flame(
        this.fighters.enemy.sprite,
        -this.fighters.enemy.sprite.displayHeight / 3,
      );
    } else if (!burning && this.flames) {
      this.flames.stop();
      this.flames = null;
    }
  }

  /** Loppuboss valmistelee voimaiskua: punainen hehku, kipinät, karjaisu ja varoitus. */
  playCharge(): void {
    const enemy = this.fighters.enemy;
    playSound('roar');
    enemy.glow(COLORS.hurt, BATTLE_STAGE.hurt.flashMs * 2);
    this.particles.burst('charge', enemy.center.x, enemy.center.y);
    showDamageNumber(this.scene, numberSpot(enemy.center), TEXT.battle.chargePopup, 'crit');
    shakeHit(this.scene);
  }

  /** Lumimyrsky: hiutaleet pyyhkäisevät pelaajan yli, elämä laskee ja liekit voivat sammua. */
  playStorm(storm: StormInfo): void {
    const player = this.fighters.player;
    const enemy = this.fighters.enemy;
    playSound('storm');
    this.particles.burst('storm', (player.center.x + enemy.center.x) / 2, player.center.y);
    player.hurt(COLORS.stormFlash);
    this.changeHp('player', -storm.damage);
    const kind = storm.defended ? 'blocked' : 'damage';
    showDamageNumber(
      this.scene,
      numberSpot(player.center),
      TEXT.battle.damagePopup(storm.damage),
      kind,
    );
    if (storm.extinguished) {
      this.setBurning(false);
    }
    shakeHit(this.scene);
  }

  playDefend(): void {
    playSound('shield');
    showShield(this.scene, this.fighters.player.center);
  }

  playHeal(amount: number): void {
    const player = this.fighters.player;
    playSound('heal');
    player.glow(DAMAGE_NUMBERS.healTint, BATTLE_STAGE.hurt.flashMs);
    this.changeHp('player', amount);
    this.particles.burst('heal', player.center.x, player.center.y);
    showDamageNumber(this.scene, numberSpot(player.center), TEXT.battle.healPopup(amount), 'heal');
  }

  /** Vihollinen syöksähtää ja nappaa esineen pelaajalta. */
  playSteal(itemSprite: string): void {
    this.fighters.enemy.lunge(() => {
      throwItem(this.scene, itemSprite, {
        from: this.fighters.player.center,
        to: this.fighters.enemy.center,
      });
    });
  }

  playFlee(success: boolean): void {
    const player = this.fighters.player;
    playSound('flee');
    player.flee(success);
    this.particles.burst('dust', player.sprite.x, player.sprite.y);
  }

  /** Voitettu vihollinen hajoaa omanvärisekseen pölyksi, kaatunut sankari kaatuu kyljelleen. */
  playDefeat(side: Side): void {
    this.setBurning(false);
    if (side === 'player') {
      this.fighters.player.fall();
      return;
    }
    const enemy = this.fighters.enemy;
    enemy.vanish(() => {
      playSound('enemy-down');
      this.particles.burst('defeat', enemy.center.x, enemy.center.y, this.enemyColors);
    });
  }

  /** Voittoteksti ja sankarin hyppy, kun vihollinen on ensin ehtinyt hajota pölyksi. */
  playVictory(): void {
    const player = this.fighters.player;
    this.scene.time.delayedCall(BATTLE_CAMERA.victoryDelayMs, () => {
      player.cheer();
      showBanner(this.scene, TEXT.battle.victoryBanner, COLORS.critText);
      this.particles.burst('victory', player.center.x, player.center.y);
    });
  }

  playLevelUp(): void {
    const player = this.fighters.player;
    player.glow(COLORS.critFlash, BATTLE_STAGE.hurt.flashMs * 2);
    this.particles.burst('victory', player.center.x, player.center.y);
    showDamageNumber(this.scene, numberSpot(player.center), TEXT.battle.levelUpPopup, 'crit');
  }

  private changeHp(side: Side, delta: number): void {
    const shown = this.shown[side];
    shown.hp = Math.max(0, Math.min(shown.maxHp, shown.hp + delta));
    this.panels[side].setHp(shown.hp, shown.maxHp);
  }
}
