import type Phaser from 'phaser';
import { TEXT } from '../i18n/text';
import type { Player } from '../entities/player';
import type { GameState } from '../logic/game-state';
import { isDriving, ownedVehicle, toggleDriving, vehicleSpeedFactor } from '../logic/vehicle';
import { DriveButton } from '../ui/drive-button';
import { driverTexture, heroTexture } from './hero-texture';
import { playSound } from './sound-fx';

// Bugattin avaimet kartalla: E-näppäin tai BUGATTI-nappi kytkee auton päälle ja pois.
// Päällä sankari näkyy autossa ja kulkee nopeammin (säännöt logic/vehicle.ts).
// Tila on GameStatessa (driving), joten auto pysyy päällä taistelun ja tallennuksen yli.

export class VehicleControl {
  private readonly button: DriveButton;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState,
    private readonly player: Player,
    private readonly onToggle: (message: string) => void,
  ) {
    this.button = new DriveButton(scene, () => this.toggle());
    scene.input.keyboard?.on('keydown-E', () => this.toggle());
    this.updateLook();
  }

  /** Nopeuskerroin autosta (kerrotaan maaston kertoimella). */
  get speedFactor(): number {
    return vehicleSpeedFactor(this.state);
  }

  /** Näkyykö BUGATTI-nappi: avaimet ovat repussa. */
  get buttonShown(): boolean {
    return ownedVehicle(this.state) !== null;
  }

  /** Nappi näkyy vain, kun avaimet ovat repussa. */
  update(): void {
    this.button.update(this.buttonShown, isDriving(this.state));
  }

  private toggle(): void {
    const driving = toggleDriving(this.state);
    if (driving === null) {
      return;
    }
    playSound(driving ? 'engine' : 'engine-off');
    this.updateLook();
    this.onToggle(driving ? TEXT.vehicle.on : TEXT.vehicle.off);
  }

  /** Sankari autossa tai jalan (kuskilla ja kävelijällä pelaajan valitsema ulkonäkö). */
  private updateLook(): void {
    const vehicle = ownedVehicle(this.state);
    const driving = vehicle !== null && isDriving(this.state);
    const { textures } = this.scene;
    this.player.setTexture(
      driving
        ? driverTexture(textures, vehicle.mapSprite, this.state.look)
        : heroTexture(textures, this.state),
    );
  }
}
