import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getNpc } from '../data';
import { Player } from '../entities/player';
import { healItemCount } from '../logic/battle';
import { bossHudText } from '../logic/boss';
import {
  celebrateCompletion,
  createNewGame,
  enemiesToBeat,
  playerStats,
  unspentSkillPoints,
  type GameState,
} from '../logic/game-state';
import { recordQuestVisit } from '../logic/quest-log';
import { npcNearby, npcMarker } from '../logic/quests';
import { isSlowTerrain, speedFactorAt } from '../logic/terrain-speed';
import { visitTown } from '../logic/town-visits';
import { length } from '../logic/vector';
import { terrainAt } from '../logic/world-grid';
import { AmbushWatch } from '../systems/ambush-watch';
import type { BoatColliders } from '../systems/boat-control';
import { BoatDock } from '../systems/boat-dock';
import { CaveEntrance } from '../systems/cave-entrance';
import { heroTexture } from '../systems/hero-texture';
import { HouseDoor } from '../systems/house-door';
import { Controls } from '../systems/controls';
import { FishingControl } from '../systems/fishing-control';
import { MapEncounters } from '../systems/map-encounters';
import { MerchantWalker } from '../systems/merchant-walker';
import { NpcMarkers } from '../systems/npc-markers';
import { VehicleControl } from '../systems/vehicle-control';
import { placeTownMarkers, TownTracker } from '../systems/town-markers';
import { playSound } from '../systems/sound-fx';
import { buildWorldMap, getWorldGrid, showStairs, worldToTile } from '../systems/world-map';
import { heroStartPosition } from '../systems/start-position';
import { BOAT_SHOP } from '../data/boat-shop';
import { MERCHANT } from '../data/merchant';
import type { NpcDef, ShopKeeperDef, TownDef } from '../data/types';
import { TEXT } from '../i18n/text';
import { Hud } from '../ui/hud';
import { LeafRustle } from '../ui/leaf-rustle';
import { Minimap } from '../ui/minimap';
import { addBackpackButton } from '../ui/backpack-button';
import { coverScreen, revealScreen } from '../ui/screen-wipe';
import { addPlayerCountLabel } from '../ui/player-count-label';
import { BossPointer } from '../ui/boss-pointer';
import { SaveButton } from '../ui/save-button';
import { QuestTracker } from '../ui/quest-tracker';
import { SkillButton } from '../ui/skill-button';
import { TalkButton } from '../ui/talk-button';
import { Toast } from '../ui/toast';
import type { BackpackSceneData } from './backpack-scene';
import type { BattleSceneData } from './battle-scene';
import type { QuestSceneData } from './quest-scene';
import type { SavesSceneData } from './saves-scene';
import type { ShopSceneData } from './shop-scene';
import type { SkillsSceneData } from './skills-scene';
import type { VictorySceneData } from './victory-scene';

// Saaren kartta. Pelaaja kulkee virtuaalitikulla, lepää paikkakunnissa ja
// joutuu taisteluun, kun vihollinen saa hänet kiinni. Herännyt loppuboss odottaa
// tuntureilla, ja ruudun reunan nuoli näyttää suunnan. REPPU-napista (aina näkyvissä) avautuu
// reppu, jossa varusteita laitetaan käyttöön. Paikkakunnassa voi jakaa kykypisteet
// KYKYPISTEET-napista ja tallentaa pelin TALLENNA-napista. Jussi Ketola seisoo kotipaikkakuntansa
// vieressä: hänen kanssaan puhutaan puhenapista tai napauttamalla häntä (tehtävät). Hänen veljensä
// Ossi odottaa tulivuoren kraatterissa: lohikäärmeiden voitot nostavat rappuset laavasta.
// Kulkeva kauppias Kaapo kävelee teitä pitkin: hänen vieressään aukeaa kauppa KAUPPA-napista.
// Ongen kanssa rannalla voi kalastaa KALASTA-napista (systems/fishing-control.ts).
// Venesatamassa myydään venettä, jolla purjehditaan pienille saarille (systems/boat-dock.ts,
// systems/boat-control.ts). Merellä ei taistella. Peikkokuninkaan voiton jälkeen tuntureilla
// aukeaa luola (systems/cave-entrance.ts), jossa on Excalibur ja Noidan kauppa. Kotirannan
// laidalla on sankarin oma talo ja koko pelin 10 parhaan lista (systems/house-door.ts).
// Vasemmassa yläkulmassa on minikartta (ui/minimap.ts): napautus avaa ison kartan.
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

/** Näkymät, jotka avautuvat kartan päälle kartan nukkuessa. */
type OverlayData = { readonly state: GameState };

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
  private talkButton!: TalkButton;
  private npcs!: NpcMarkers;
  private questTracker!: QuestTracker;
  private minimap!: Minimap;
  private vehicle!: VehicleControl;
  private merchant!: MerchantWalker;
  private dock!: BoatDock;
  private cave!: CaveEntrance;
  private house!: HouseDoor;
  private fishing!: FishingControl;
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
    const built = buildWorldMap(this, showStairs(this.state.stairSteps));
    placeTownMarkers(this);
    this.npcs = new NpcMarkers(this, (npc) => this.talkTo(npc));
    const start = heroStartPosition(this.state);
    const speed = playerStats(this.state).speed;
    this.player = new Player(this, start, speed, heroTexture(this.textures, this.state));
    const walk = this.physics.add.collider(this.player.sprite, built.layer);
    const sail = this.physics.add.collider(this.player.sprite, built.seaLayer);
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
    this.talkButton = new TalkButton(this, (npc) => this.talkTo(npc));
    this.questTracker = new QuestTracker(this);
    this.minimap = new Minimap(this, this.state, () =>
      this.sleepUnder(SCENES.map, { state: this.state }),
    );
    addBackpackButton(this, () => this.openBackpack());
    this.toast = new Toast(this);
    this.addVehicles({ walk, sail });
    this.merchant = new MerchantWalker(this, this.state, {
      onOpen: () => this.openShop(),
      onTooFar: () => this.toast.show(TEXT.shop.tooFar(MERCHANT.name)),
    });
    this.addLandmarks();
    this.fishing = new FishingControl(this, this.state, {
      message: (text) => this.toast.show(text),
      onEnemy: (enemyId) => this.startBattle(enemyId, null),
    });
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
    const moving = this.walk();
    const position = this.player.position;
    this.state.position = position;
    const arrived = this.towns.update(position);
    if (arrived) {
      this.rest(arrived);
    }
    const driveShown = this.vehicle.buttonShown;
    this.merchant.update(position, delta, driveShown);
    this.dock.update(this.towns.town?.id, driveShown);
    this.cave.update(worldToTile(position));
    this.house.update(worldToTile(position));
    this.fishing.update(position, moving, delta, {
      driveShown,
      shopShown: this.merchant.shopShown || this.dock.shopShown,
    });
    this.updateHud();
    this.bossPointer?.update();
    if (celebrateCompletion(this.state)) {
      // Läpäisy: voittoruutu kerran, sitten peli jatkuu kartalla.
      const victory: VictorySceneData = { state: this.state, kind: 'complete' };
      this.scene.start(SCENES.victory, victory);
      return;
    }
    // Merellä veneessä viholliset eivät hyökkää.
    const active = time >= this.encountersFrom && !this.vehicle.sailing;
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
   * Sankari kävelee tikun suuntaan. Metsässä kulku hidastuu, ja jaloista lentää lehtiä.
   * Bugatti (E tai BUGATTI-nappi) nopeuttaa kulkua, myös metsässä. Palauttaa, liikkuuko sankari.
   */
  private walk(): boolean {
    const move = this.controls.read().move;
    const speedFactor = speedFactorAt(getWorldGrid(), worldToTile(this.player.position));
    this.player.move(move, speedFactor * this.vehicle.speedFactor);
    const moving = length(move) > 0;
    this.leaves.update(isSlowTerrain(speedFactor) && moving);
    return moving;
  }

  /** Peikkokuninkaan luolan suu ja sankarin talo: kumpikin avautuu kartan päälle. */
  private addLandmarks(): void {
    this.cave = new CaveEntrance(this, this.state, {
      onOpen: () => this.sleepUnder(SCENES.cave, { state: this.state }),
      message: (text) => this.toast.show(text),
    });
    this.house = new HouseDoor(this, () => this.sleepUnder(SCENES.house, { state: this.state }));
  }

  /** Bugatti ja vene (systems/vehicle-control.ts) sekä Venesataman venekauppa. */
  private addVehicles(colliders: BoatColliders): void {
    this.vehicle = new VehicleControl(this, this.state, this.player, {
      colliders,
      events: {
        message: (text) => this.toast.show(text),
        landed: () => (this.encountersFrom = this.time.now + WORLD_VIEW.graceMs.afterBattle),
      },
    });
    this.dock = new BoatDock(this, this.state, {
      onOpen: () => this.openShop(BOAT_SHOP),
      onTooFar: () => this.toast.show(TEXT.shop.tooFar(BOAT_SHOP.name)),
    });
  }

  /**
   * Paikkakuntaan saapuessa elämä palautuu ja paikkakunta muistetaan (siellä herätään
   * kaatumisen jälkeen). Käyttämättömistä kykypisteistä muistutetaan.
   */
  private rest(town: TownDef): void {
    visitTown(this.state, town.id);
    const points = unspentSkillPoints(this.state);
    const reminder = points > 0 ? `\n${TEXT.world.skillPointsWaiting(points)}` : '';
    const quests = recordQuestVisit(this.state.quests, town.id).map(
      (quest) => `\n${TEXT.quests.readyReturn(TEXT.names.quest(quest).title, getNpc(quest.giver))}`,
    );
    this.toast.show(TEXT.world.rest(town) + quests.join('') + reminder);
  }

  /**
   * Tehtävänäkymä avautuu kartan päälle (kuten reppu), kun pelaaja on tehtävänantajan
   * paikkakunnassa. Kauempaa napautettuna kerrotaan, että pitää kävellä lähemmäs.
   */
  private talkTo(npc: NpcDef): void {
    if (this.leaving) {
      return;
    }
    if (this.nearbyNpc()?.id !== npc.id) {
      this.toast.show(TEXT.quests.tooFar(npc));
      return;
    }
    const data: QuestSceneData = { state: this.state, npc: npc.id };
    this.sleepUnder(SCENES.quests, data);
  }

  /** Tehtävänantaja, jonka kanssa voi nyt puhua: paikkakunnassa tai vieressä. */
  private nearbyNpc(): NpcDef | null {
    return npcNearby(this.towns.town?.id, worldToTile(this.player.position));
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
    const data: BackpackSceneData = { state: this.state };
    this.sleepUnder(SCENES.backpack, data);
  }

  /**
   * Kauppa avautuu kartan päälle (kuten reppu), kun sankari on kauppiaan vieressä tai
   * Venesatamassa (keeper = venekauppa).
   */
  private openShop(keeper: ShopKeeperDef = MERCHANT): void {
    if (!this.leaving) {
      const data: ShopSceneData = { state: this.state, keeper };
      this.sleepUnder(SCENES.shop, data);
    }
  }

  /** Kartta nukkuu toisen näkymän alla ja herää samaan kohtaan (varusteet ehkä vaihtuneet). */
  private sleepUnder(key: string, data: OverlayData): void {
    this.events.once(Phaser.Scenes.Events.WAKE, () => {
      this.encountersFrom = this.time.now + WORLD_VIEW.graceMs.afterBattle;
      this.vehicle.refreshLook();
    });
    this.scene.sleep();
    this.scene.launch(key, data);
  }

  private openSaves(): void {
    const town = this.towns.town;
    const place = town ? TEXT.names.town(town) : '';
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
      coins: this.state.coins,
      enemiesLeft: enemiesToBeat(this.state),
      townName: this.towns.town ? TEXT.names.town(this.towns.town) : '',
      bossText: bossHudText(this.state),
    });
    const inTown = this.towns.town !== undefined;
    this.skillButton.update(inTown, unspentSkillPoints(this.state));
    this.saveButton.update(inTown);
    const npc = this.nearbyNpc();
    this.talkButton.update(npc, npc ? npcMarker(this.state, npc.id) : null);
    this.npcs.update(this.state);
    this.questTracker.update(this.state);
    this.minimap.update();
    this.vehicle.update();
  }
}
