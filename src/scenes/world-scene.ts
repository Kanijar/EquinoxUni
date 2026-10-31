import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { WORLD } from '../data';
import { Player } from '../entities/player';
import { healItemCount } from '../logic/battle';
import {
  createNewGame,
  enemiesToBeat,
  playerStats,
  unspentSkillPoints,
  type GameState,
} from '../logic/game-state';
import { lastVisitedTown, visitTown } from '../logic/town-visits';
import { townTile } from '../logic/world-grid';
import { AmbushWatch } from '../systems/ambush-watch';
import { Controls } from '../systems/controls';
import { MapEncounters } from '../systems/map-encounters';
import { placeTownMarkers, TownTracker } from '../systems/town-markers';
import { buildWorldMap, getWorldGrid, tileToWorld } from '../systems/world-map';
import { TEXT } from '../i18n/fi';
import { Hud } from '../ui/hud';
import { addPlayerCountLabel } from '../ui/player-count-label';
import { SaveButton } from '../ui/save-button';
import { SkillButton } from '../ui/skill-button';
import { Toast } from '../ui/toast';
import type { BattleSceneData } from './battle-scene';
import type { SavesSceneData } from './saves-scene';
import type { SkillsSceneData } from './skills-scene';

// Suomen kartta. Pelaaja kulkee virtuaalitikulla, lepää paikkakunnissa ja
// joutuu taisteluun, kun vihollinen saa hänet kiinni. Paikkakunnassa voi jakaa
// kykypisteet KYKYPISTEET-napista ja tallentaa pelin TALLENNA-napista.
// Tämä scene vain kokoaa osat.

export interface WorldSceneData {
  readonly state?: GameState;
  /** Kuinka kauan viholliset odottavat ennen kuin voivat aloittaa taistelun. */
  readonly graceMs?: number;
  /** Ilmoitus, joka näytetään kartalle palatessa (esim. kaatumisen tai latauksen jälkeen). */
  readonly message?: string;
}

export class WorldScene extends Phaser.Scene {
  private state!: GameState;
  private player!: Player;
  private controls!: Controls;
  private encounters!: MapEncounters;
  private ambushes!: AmbushWatch;
  private towns!: TownTracker;
  private hud!: Hud;
  private skillButton!: SkillButton;
  private saveButton!: SaveButton;
  private toast!: Toast;
  private encountersFrom = 0;

  constructor() {
    super(SCENES.world);
  }

  create(data: WorldSceneData): void {
    this.state = data.state ?? createNewGame();
    const isNewGame = this.state.position === null && data.message === undefined;
    const built = buildWorldMap(this, getWorldGrid());
    placeTownMarkers(this);
    const start = this.state.position ?? tileToWorld(townTile(WORLD, lastVisitedTown(this.state)));
    this.player = new Player(this, start, playerStats(this.state).speed);
    this.physics.add.collider(this.player.sprite, built.layer);
    this.encounters = new MapEncounters(this, this.state, built.layer);
    this.ambushes = new AmbushWatch(getWorldGrid());
    this.towns = new TownTracker(start);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.startFollow(this.player.sprite, true);
    this.controls = new Controls(this);
    this.hud = new Hud(this);
    addPlayerCountLabel(this);
    this.skillButton = new SkillButton(this, () => this.openSkills());
    this.saveButton = new SaveButton(this, () => this.openSaves());
    this.toast = new Toast(this);
    this.encountersFrom = this.time.now + (data.graceMs ?? WORLD_VIEW.graceMs.start);
    const message = isNewGame ? TEXT.world.intro : data.message;
    if (message) {
      this.toast.show(message);
    }
  }

  override update(time: number, delta: number): void {
    this.player.move(this.controls.read().move);
    const position = this.player.position;
    this.state.position = position;
    const arrived = this.towns.update(position);
    if (arrived) {
      this.rest(arrived.id, arrived.nameAt);
    }
    this.updateHud();
    if (enemiesToBeat(this.state) === 0) {
      this.scene.start(SCENES.gameOver, { won: true });
      return;
    }
    const active = time >= this.encountersFrom;
    const enemy = this.encounters.update(position, active, delta);
    if (enemy) {
      this.startBattle(enemy.def.id, enemy.mapIndex);
      return;
    }
    const ambusher = active ? this.ambushes.update(position) : null;
    if (ambusher) {
      this.startBattle(ambusher, null);
    }
  }

  /**
   * Paikkakuntaan saapuessa elämä palautuu ja paikkakunta muistetaan (siellä herätään
   * kaatumisen jälkeen). Käyttämättömistä kykypisteistä muistutetaan.
   */
  private rest(townId: string, townAt: string): void {
    visitTown(this.state, townId);
    const points = unspentSkillPoints(this.state);
    const reminder = points > 0 ? `\n${TEXT.world.skillPointsWaiting(points)}` : '';
    this.toast.show(TEXT.world.rest(townAt) + reminder);
  }

  private openSkills(): void {
    const data: SkillsSceneData = { state: this.state };
    this.scene.start(SCENES.skills, data);
  }

  private openSaves(): void {
    const place = this.towns.town?.name ?? '';
    const data: SavesSceneData = { game: { state: this.state, place } };
    this.scene.start(SCENES.saves, data);
  }

  private startBattle(enemyId: string, mapEnemyIndex: number | null): void {
    const data: BattleSceneData = { state: this.state, enemyId, mapEnemyIndex };
    this.scene.start(SCENES.battle, data);
  }

  private updateHud(): void {
    this.hud.update({
      hp: this.state.hp,
      maxHp: playerStats(this.state).maxHp,
      xp: this.state.xp,
      potions: healItemCount(this.state.inventory),
      enemiesLeft: enemiesToBeat(this.state),
      townName: this.towns.town?.name ?? '',
    });
    const inTown = this.towns.town !== undefined;
    this.skillButton.update(inTown, unspentSkillPoints(this.state));
    this.saveButton.update(inTown);
  }
}
