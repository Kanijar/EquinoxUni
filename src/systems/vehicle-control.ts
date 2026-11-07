import type Phaser from 'phaser';
import { TEXT } from '../i18n/text';
import type { Player } from '../entities/player';
import type { GameState } from '../logic/game-state';
import { isDriving, ownedVehicle, toggleDriving, vehicleSpeedFactor } from '../logic/vehicle';
import { DriveButton } from '../ui/drive-button';
import { BoatControl, type BoatColliders, type BoatEvents } from './boat-control';
import { driverTexture, heroTexture } from './hero-texture';
import { playSound } from './sound-fx';

// Kulkuneuvot kartalla: Bugatti ja vene. E-näppäin kytkee Bugattin päälle ja pois (säännöt
// logic/vehicle.ts), ja V-näppäin nousee veneeseen tai maihin (systems/boat-control.ts,
// logic/sailing.ts). Alarivin nappi REPPU-napin vasemmalla on rannalla VENEESEEN, merellä
// rannan vieressä MAIHIN ja muuten BUGATTI (kun avaimet ovat repussa). Tilat ovat
// GameStatessa (driving, sailing), joten ne säilyvät taistelun ja tallennuksen yli.

export interface VehicleOptions {
  readonly colliders: BoatColliders;
  readonly events: BoatEvents;
}

export class VehicleControl {
  private readonly button: DriveButton;
  private readonly boat: BoatControl;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState,
    private readonly player: Player,
    private readonly options: VehicleOptions,
  ) {
    this.boat = new BoatControl(state, player, options.colliders, options.events);
    this.button = new DriveButton(scene, () => this.tap());
    scene.input.keyboard?.on('keydown-E', () => this.toggleCar());
    scene.input.keyboard?.on('keydown-V', () => this.toggleBoat());
    this.refreshLook();
  }

  /** Nopeuskerroin kulkuneuvosta (kerrotaan maaston kertoimella). */
  get speedFactor(): number {
    return this.boat.sailing ? this.boat.speedFactor : vehicleSpeedFactor(this.state);
  }

  /** Onko sankari veneessä merellä (silloin ei taistella). */
  get sailing(): boolean {
    return this.boat.sailing;
  }

  /** Näkyykö alarivin kulkuneuvonappi (KAUPPA ja KALASTA siirtyvät sen vasemmalle). */
  get buttonShown(): boolean {
    return this.label() !== null;
  }

  update(): void {
    this.button.update(this.label(), this.boat.sailing || isDriving(this.state));
  }

  /** Napin teksti: veneen toiminto rannalla, Bugatti muualla maalla, tai null (piilossa). */
  private label(): string | null {
    const action = this.boat.action();
    if (action) {
      return action === 'board' ? TEXT.boat.board : TEXT.boat.land;
    }
    const car = !this.boat.sailing && ownedVehicle(this.state) !== null;
    return car ? TEXT.vehicle.button : null;
  }

  private tap(): void {
    if (this.boat.action()) {
      this.toggleBoat();
    } else {
      this.toggleCar();
    }
  }

  private toggleBoat(): void {
    if (this.boat.toggle()) {
      this.refreshLook();
    }
  }

  private toggleCar(): void {
    if (this.boat.sailing) {
      return;
    }
    const driving = toggleDriving(this.state);
    if (driving === null) {
      return;
    }
    playSound(driving ? 'engine' : 'engine-off');
    this.refreshLook();
    this.options.events.message(driving ? TEXT.vehicle.on : TEXT.vehicle.off);
  }

  /**
   * Sankari veneessä, autossa tai jalan (kuskilla ja kävelijällä pelaajan ulkonäkö).
   * Kutsutaan myös, kun reppu suljetaan, koska varusteet näkyvät kävelijän päällä.
   */
  refreshLook(): void {
    const { textures } = this.scene;
    const boat = this.boat.mapSprite;
    const car = ownedVehicle(this.state);
    const vehicleSprite = boat ?? (car && isDriving(this.state) ? car.mapSprite : null);
    this.player.setTexture(
      vehicleSprite
        ? driverTexture(textures, vehicleSprite, this.state.look)
        : heroTexture(textures, this.state),
    );
  }
}
