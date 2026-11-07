import Phaser from 'phaser';
import { BOAT_DOCK_VIEW } from '../config/shop-config';
import { getTown } from '../data';
import { BOAT_SHOP } from '../data/boat-shop';
import type { GameState } from '../logic/game-state';
import { isSailable, ownedBoat } from '../logic/sailing';
import { nearestWhere, townTile } from '../logic/world-grid';
import { ShopButton } from '../ui/shop-button';
import { getWorldGrid, tileToWorld } from './world-map';

// Venesataman venekauppa kartalla (data/boat-shop.ts). Veneveistäjä Veikko seisoo
// Venesataman talon vieressä, ja lähimmässä meriruudussa keinuu myytävä purjevene (kunnes
// sankari ostaa sen). Kun sankari on
// Venesatamassa, alariviin tulee KAUPPA-nappi (kuten kulkevalla kauppiaalla), ja Veikkoa
// voi myös napauttaa. Kauppa on sama näkymä kuin kauppiaalla (scenes/shop-scene.ts).

export interface BoatDockCallbacks {
  /** Kauppa aukeaa (sankari on Venesatamassa). */
  readonly onOpen: () => void;
  /** Veikkoa napautettiin kaukaa. */
  readonly onTooFar: () => void;
}

export class BoatDock {
  private readonly button: ShopButton;
  private readonly boat: Phaser.GameObjects.Image | null;
  private near = false;

  constructor(
    scene: Phaser.Scene,
    private readonly state: GameState,
    callbacks: BoatDockCallbacks,
  ) {
    const tile = townTile(getTown(BOAT_SHOP.town));
    const pos = tileToWorld(tile);
    const { offsetX, offsetY, depth } = BOAT_DOCK_VIEW;
    const keeper = scene.add.image(pos.x + offsetX, pos.y + offsetY, BOAT_SHOP.sprite);
    keeper.setDepth(depth).setInteractive();
    keeper.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
      this.near ? callbacks.onOpen() : callbacks.onTooFar(),
    );
    this.boat = this.addMooredBoat(scene, tile);
    this.button = new ShopButton(scene, callbacks.onOpen);
  }

  /** Näkyykö KAUPPA-nappi (KALASTA siirtyy sen vasemmalle). */
  get shopShown(): boolean {
    return this.near;
  }

  /** townId = paikkakunta, jossa sankari on. driveShown = kulkuneuvonappi näkyy. */
  update(townId: string | undefined, driveShown: boolean): void {
    this.near = townId === BOAT_SHOP.town;
    this.button.update(this.near, driveShown);
    this.boat?.setVisible(ownedBoat(this.state) === null);
  }

  /** Purjevene keinuu Venesatamaa lähimmässä meriruudussa. */
  private addMooredBoat(
    scene: Phaser.Scene,
    town: { x: number; y: number },
  ): Phaser.GameObjects.Image | null {
    const grid = getWorldGrid();
    const sea = nearestWhere(grid, town, (t) => isSailable(grid, t));
    if (!sea) {
      return null;
    }
    const pos = tileToWorld(sea);
    const { depth, boatBobPx, boatBobMs } = BOAT_DOCK_VIEW;
    const boat = scene.add.image(pos.x, pos.y, 'boat').setDepth(depth);
    scene.tweens.add({
      targets: boat,
      y: pos.y + boatBobPx,
      duration: boatBobMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return boat;
  }
}
