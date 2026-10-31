import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getTown, WORLD } from '../data';
import { Player } from '../entities/player';
import { healItemCount } from '../logic/battle';
import {
  createNewGame,
  playerLevel,
  playerStats,
  restoreHp,
  type GameState,
} from '../logic/game-state';
import { townTile } from '../logic/world-grid';
import { Controls } from '../systems/controls';
import { MapEncounters } from '../systems/map-encounters';
import { placeTownMarkers, TownTracker } from '../systems/town-markers';
import { buildWorldMap, getWorldGrid, tileToWorld } from '../systems/world-map';
import { TEXT } from '../i18n/fi';
import { Hud } from '../ui/hud';
import { Toast } from '../ui/toast';
import type { BattleSceneData } from './battle-scene';

// Suomen kartta. Pelaaja kulkee virtuaalitikulla, lepää paikkakunnissa ja
// joutuu taisteluun, kun vihollinen saa hänet kiinni. Tämä scene vain kokoaa osat.

export interface WorldSceneData {
  readonly state?: GameState;
  /** Kuinka kauan viholliset odottavat ennen kuin voivat aloittaa taistelun. */
  readonly graceMs?: number;
}

export class WorldScene extends Phaser.Scene {
  private state!: GameState;
  private player!: Player;
  private controls!: Controls;
  private encounters!: MapEncounters;
  private towns!: TownTracker;
  private hud!: Hud;
  private toast!: Toast;
  private encountersFrom = 0;

  constructor() {
    super(SCENES.world);
  }

  create(data: WorldSceneData): void {
    this.state = data.state ?? createNewGame();
    const isNewGame = this.state.position === null;
    const built = buildWorldMap(this, getWorldGrid());
    placeTownMarkers(this);
    const start = this.state.position ?? tileToWorld(townTile(WORLD, getTown(WORLD.startTown)));
    this.player = new Player(this, start, playerStats(this.state).speed);
    this.physics.add.collider(this.player.sprite, built.layer);
    this.encounters = new MapEncounters(this, this.state, built.layer);
    this.towns = new TownTracker(start);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.startFollow(this.player.sprite, true);
    this.controls = new Controls(this);
    this.hud = new Hud(this);
    this.toast = new Toast(this);
    this.encountersFrom = this.time.now + (data.graceMs ?? WORLD_VIEW.graceMs.start);
    if (isNewGame) {
      this.toast.show(TEXT.world.intro);
    }
  }

  override update(time: number): void {
    this.player.move(this.controls.read().move);
    const position = this.player.position;
    this.state.position = position;
    const arrived = this.towns.update(position);
    if (arrived) {
      restoreHp(this.state);
      this.toast.show(TEXT.world.rest(arrived.nameAt));
    }
    this.updateHud();
    if (this.encounters.enemiesLeft === 0) {
      this.scene.start(SCENES.gameOver, { won: true });
      return;
    }
    const enemy = this.encounters.update(position, time >= this.encountersFrom);
    if (enemy) {
      const data: BattleSceneData = { state: this.state, mapEnemyIndex: enemy.mapIndex };
      this.scene.start(SCENES.battle, data);
    }
  }

  private updateHud(): void {
    this.hud.update({
      hp: this.state.hp,
      maxHp: playerStats(this.state).maxHp,
      level: playerLevel(this.state),
      xp: this.state.xp,
      potions: healItemCount(this.state.inventory),
      enemiesLeft: this.encounters.enemiesLeft,
      townName: this.towns.town?.name ?? '',
    });
  }
}
