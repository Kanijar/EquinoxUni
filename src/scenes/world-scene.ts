import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { WORLD } from '../data';
import { Player } from '../entities/player';
import { healItemCount } from '../logic/battle';
import { bossHudText } from '../logic/boss';
import {
  celebrateCompletion,
  createNewGame,
  enemiesToBeat,
  playerSprite,
  playerStats,
  unspentSkillPoints,
  type GameState,
} from '../logic/game-state';
import { isSlowTerrain, speedFactorAt } from '../logic/terrain-speed';
import { lastVisitedTown, visitTown } from '../logic/town-visits';
import { length } from '../logic/vector';
import { terrainAt, townTile } from '../logic/world-grid';
import { AmbushWatch } from '../systems/ambush-watch';
import { Controls } from '../systems/controls';
import { MapEncounters } from '../systems/map-encounters';
import { placeTownMarkers, TownTracker } from '../systems/town-markers';
import { playSound } from '../systems/sound-fx';
import { buildWorldMap, getWorldGrid, tileToWorld, worldToTile } from '../systems/world-map';
import { TEXT } from '../i18n/fi';
import { Hud } from '../ui/hud';
import { LeafRustle } from '../ui/leaf-rustle';
import { addBackpackButton } from '../ui/backpack-button';
import { coverScreen, revealScreen } from '../ui/screen-wipe';
import { addPlayerCountLabel } from '../ui/player-count-label';
import { BossPointer } from '../ui/boss-pointer';
import { SaveButton } from '../ui/save-button';
import { SkillButton } from '../ui/skill-button';
import { Toast } from '../ui/toast';
import type { BackpackSceneData } from './backpack-scene';
import type { BattleSceneData } from './battle-scene';
import type { SavesSceneData } from './saves-scene';
import type { SkillsSceneData } from './skills-scene';
import type { VictorySceneData } from './victory-scene';

// Suomen kartta. Pelaaja kulkee virtuaalitikulla, lepää paikkakunnissa ja
// joutuu taisteluun, kun vihollinen saa hänet kiinni. Herännyt loppuboss odottaa
// Lapissa, ja ruudun reunan nuoli näyttää suunnan. REPPU-napista (aina näkyvissä) avautuu
// reppu, jossa varusteita laitetaan käyttöön. Paikkakunnassa voi jakaa kykypisteet
// KYKYPISTEET-napista ja tallentaa pelin TALLENNA-napista.
// Tämä scene vain kokoaa osat.

export interface WorldSceneData {
  readonly state?: GameState;
  /** Kuinka kauan viholliset odottavat ennen kuin voivat aloittaa taistelun. */
  readonly graceMs?: number;
  /** Ilmoitus, joka näytetään kartalle palatessa (esim. kaatumisen tai latauksen jälkeen). */
  readonly message?: string;
  /** true = tultiin taistelusta: kartta paljastuu pikseliruutujen alta. */
  readonly fromBattle?: boolean;
  /** true = loppuboss heräsi juuri: maa tärisee ja boss karjaisee. */
  readonly bossAwakened?: boolean;
}

export class WorldScene extends Phaser.Scene {
  private state!: GameState;
  private player!: Player;
  private leaves!: LeafRustle;
  private controls!: Controls;
  private encounters!: MapEncounters;
  private ambushes!: AmbushWatch;
  private towns!: TownTracker;
  private hud!: Hud;
  private skillButton!: SkillButton;
  private saveButton!: SaveButton;
  private toast!: Toast;
  private bossPointer: BossPointer | null = null;
  private encountersFrom = 0;
  /** Taistelu on alkamassa: kartta pysähtyy siirtymäefektin ajaksi. */
  private leaving = false;

  constructor() {
    super(SCENES.world);
  }

  create(data: WorldSceneData): void {
    this.state = data.state ?? createNewGame();
    this.leaving = false;
    // Taisteluun lähtiessä fysiikka pysäytettiin; se jatkuu, kun kartta avautuu uudelleen.
    this.physics.resume();
    const isNewGame = this.state.position === null && data.message === undefined;
    const built = buildWorldMap(this, getWorldGrid());
    placeTownMarkers(this);
    const start = this.state.position ?? tileToWorld(townTile(WORLD, lastVisitedTown(this.state)));
    const speed = playerStats(this.state).speed;
    this.player = new Player(this, start, speed, playerSprite(this.state));
    this.physics.add.collider(this.player.sprite, built.layer);
    this.leaves = new LeafRustle(this, this.player.sprite);
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
    addBackpackButton(this, () => this.openBackpack());
    this.toast = new Toast(this);
    const boss = this.encounters.boss;
    this.bossPointer = boss ? new BossPointer(this, boss.sprite) : null;
    if (data.bossAwakened) {
      const { ms, intensity } = WORLD_VIEW.bossAwakenShake;
      this.cameras.main.shake(ms, intensity);
      playSound('roar');
    }
    this.encountersFrom = this.time.now + (data.graceMs ?? WORLD_VIEW.graceMs.start);
    const message = isNewGame ? TEXT.world.intro : data.message;
    if (message) {
      this.toast.show(message);
    }
    if (data.fromBattle) {
      revealScreen(this);
    }
  }

  override update(time: number, delta: number): void {
    if (this.leaving) {
      return;
    }
    this.walk();
    const position = this.player.position;
    this.state.position = position;
    const arrived = this.towns.update(position);
    if (arrived) {
      this.rest(arrived.id, arrived.nameAt);
    }
    this.updateHud();
    this.bossPointer?.update();
    if (celebrateCompletion(this.state)) {
      // Läpäisy: voittoruutu kerran, sitten peli jatkuu kartalla.
      const victory: VictorySceneData = { state: this.state, kind: 'complete' };
      this.scene.start(SCENES.victory, victory);
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

  /** Sankari kävelee tikun suuntaan. Metsässä kulku hidastuu, ja jaloista lentää lehtiä. */
  private walk(): void {
    const move = this.controls.read().move;
    const speedFactor = speedFactorAt(getWorldGrid(), worldToTile(this.player.position));
    this.player.move(move, speedFactor);
    this.leaves.update(isSlowTerrain(speedFactor) && length(move) > 0);
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

  /**
   * Reppu avautuu kartan päälle. Kartta nukkuu sillä aikaa (viholliset ja ajastimet odottavat)
   * ja herää samaan kohtaan. Herätessä viholliset odottavat hetken ennen kuin voivat hyökätä.
   */
  private openBackpack(): void {
    this.events.once(Phaser.Scenes.Events.WAKE, () => {
      this.encountersFrom = this.time.now + WORLD_VIEW.graceMs.afterBattle;
    });
    const data: BackpackSceneData = { state: this.state };
    this.scene.sleep();
    this.scene.launch(SCENES.backpack, data);
  }

  private openSaves(): void {
    const place = this.towns.town?.name ?? '';
    const data: SavesSceneData = { game: { state: this.state, place } };
    this.scene.start(SCENES.saves, data);
  }

  /** Kartta pysähtyy ja hajoaa pikseleiksi, sitten taistelu alkaa. */
  private startBattle(enemyId: string, mapEnemyIndex: number | null): void {
    const position = this.player.position;
    const terrain = terrainAt(getWorldGrid(), worldToTile(position));
    const data: BattleSceneData = { state: this.state, enemyId, mapEnemyIndex, terrain };
    this.leaving = true;
    this.physics.pause();
    playSound('battle-start');
    coverScreen(this, () => this.scene.start(SCENES.battle, data));
  }

  private updateHud(): void {
    this.hud.update({
      hp: this.state.hp,
      maxHp: playerStats(this.state).maxHp,
      xp: this.state.xp,
      potions: healItemCount(this.state.inventory),
      enemiesLeft: enemiesToBeat(this.state),
      townName: this.towns.town?.name ?? '',
      bossText: bossHudText(this.state),
    });
    const inTown = this.towns.town !== undefined;
    this.skillButton.update(inTown, unspentSkillPoints(this.state));
    this.saveButton.update(inTown);
  }
}
