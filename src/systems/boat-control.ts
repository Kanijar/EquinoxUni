import type Phaser from 'phaser';
import { WORLD } from '../data';
import type { Player } from '../entities/player';
import { TEXT } from '../i18n/text';
import type { GameState } from '../logic/game-state';
import {
  boatSpeedFactor,
  isSailing,
  ownedBoat,
  recordLanding,
  sailAction,
  toggleSailing,
  type SailAction,
} from '../logic/sailing';
import { playSound } from './sound-fx';
import { getWorldGrid, tileToWorld, worldToTile } from './world-map';

// Vene kartalla (säännöt logic/sailing.ts). Rannalla VENEESEEN siirtää sankarin veneeseen
// viereiseen meriruutuun, ja merellä MAIHIN viereiseen kävelyruutuun. Merellä sankari
// törmää kaikkeen muuhun kuin mereen: kävellessä käytetään kartan törmäyksiä, veneessä
// näkymätöntä merikerrosta (systems/world-map.ts). Nappi on systems/vehicle-control.ts:ssä.

/** Sankarin törmäykset: kävellessä kartta, veneessä merikerros. */
export interface BoatColliders {
  readonly walk: Phaser.Physics.Arcade.Collider;
  readonly sail: Phaser.Physics.Arcade.Collider;
}

export interface BoatEvents {
  /** Ilmoitus kartan yläosaan. */
  readonly message: (text: string) => void;
  /** Sankari nousi maihin: viholliset odottavat hetken ennen kuin voivat hyökätä. */
  readonly landed: () => void;
}

export class BoatControl {
  constructor(
    private readonly state: GameState,
    private readonly player: Player,
    private readonly colliders: BoatColliders,
    private readonly events: BoatEvents,
  ) {
    this.applyColliders();
  }

  /** Onko sankari veneessä. */
  get sailing(): boolean {
    return isSailing(this.state);
  }

  /** Nopeuskerroin merellä (kerrotaan maaston kertoimella, merellä 1). */
  get speedFactor(): number {
    return boatSpeedFactor(this.state);
  }

  /** Veneen kuva kartalla, tai null, jos sankari ei ole veneessä. */
  get mapSprite(): string | null {
    return this.sailing ? (ownedBoat(this.state)?.mapSprite ?? null) : null;
  }

  /** Mitä nappi tekisi nyt: VENEESEEN, MAIHIN tai ei mitään. */
  action(): SailAction | null {
    return sailAction(this.state, getWorldGrid(), worldToTile(this.player.position));
  }

  /** Nousee veneeseen tai maihin. Palauttaa false, jos kumpikaan ei onnistu tässä. */
  toggle(): boolean {
    const tile = toggleSailing(this.state, getWorldGrid(), worldToTile(this.player.position));
    if (!tile) {
      return false;
    }
    const pos = tileToWorld(tile);
    this.player.sprite.setPosition(pos.x, pos.y);
    this.player.move({ x: 0, y: 0 });
    this.applyColliders();
    playSound('splash');
    if (this.state.sailing) {
      this.announceBoarding();
    } else {
      this.announceLanding(tile);
      this.events.landed();
    }
    return true;
  }

  private announceBoarding(): void {
    const boat = ownedBoat(this.state);
    const name = boat ? TEXT.names.item(boat) : '';
    const fish = boat?.canFish ? `\n${TEXT.boat.fishAtSea}` : '';
    this.events.message(`${TEXT.boat.boarded(name)}${fish}`);
  }

  private announceLanding(tile: { x: number; y: number }): void {
    const landing = recordLanding(this.state, WORLD, tile);
    if (!landing) {
      this.events.message(TEXT.boat.landed);
      return;
    }
    const { isle, first, found, total } = landing;
    this.events.message(
      first ? TEXT.boat.isleFound(isle, found, total) : TEXT.boat.isleLanding(isle),
    );
  }

  /** Kävellessä kartan törmäykset, veneessä merikerros. */
  private applyColliders(): void {
    const sailing = this.sailing;
    this.colliders.walk.active = !sailing;
    this.colliders.sail.active = sailing;
  }
}
