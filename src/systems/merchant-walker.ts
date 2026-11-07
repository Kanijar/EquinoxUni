import Phaser from 'phaser';
import { TILE_SIZE } from '../config/game-config';
import { MERCHANT_MAP_VIEW } from '../config/shop-config';
import { MERCHANT } from '../data/merchant';
import type { GameState } from '../logic/game-state';
import { advanceMerchant, merchantPlan, merchantSpot } from '../logic/merchant-route';
import { distance, type Vec2 } from '../logic/vector';
import { ShopButton } from '../ui/shop-button';

// Kulkeva kauppias kartalla: kävelee teitä pitkin paikkakunnasta toiseen (logic/merchant-route.ts)
// ja pysähtyy jokaiseen hetkeksi. Pään päällä pomppii kolikko, jotta hänet huomaa kaukaa.
// Kun sankari on vieressä (MERCHANT.talkRangePx), kauppias odottaa paikallaan ja kartalle tulee
// KAUPPA-nappi. Napista tai kauppiasta napauttamalla avautuu kauppa (kauempaa napautettuna
// kerrotaan, että pitää kävellä lähemmäs).

export interface MerchantCallbacks {
  /** Avaa kaupan (sankari on kauppiaan vieressä). */
  readonly onOpen: () => void;
  /** Kauppiasta napautettiin liian kaukaa. */
  readonly onTooFar: () => void;
}

export class MerchantWalker {
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly coin: Phaser.GameObjects.Image;
  private readonly button: ShopButton;
  private near = false;

  constructor(
    scene: Phaser.Scene,
    private readonly state: GameState,
    callbacks: MerchantCallbacks,
  ) {
    const { depth, coinScale } = MERCHANT_MAP_VIEW;
    this.sprite = scene.add.image(0, 0, MERCHANT.sprite).setDepth(depth).setInteractive();
    this.sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
      this.near ? callbacks.onOpen() : callbacks.onTooFar(),
    );
    this.coin = scene.add.image(0, 0, 'coin').setScale(coinScale).setDepth(depth);
    this.button = new ShopButton(scene, callbacks.onOpen);
    this.place(scene.time.now, false);
  }

  /**
   * Kauppias kävelee eteenpäin, paitsi kun sankari on hänen vieressään.
   * driveShown = BUGATTI-nappi näkyy, jolloin KAUPPA-nappi siirtyy sen vasemmalle puolelle.
   */
  update(playerPosition: Vec2, deltaMs: number, driveShown: boolean): void {
    this.near = distance(playerPosition, this.position()) <= MERCHANT.talkRangePx;
    if (!this.near) {
      this.state.merchantMs = advanceMerchant(merchantPlan(), this.state.merchantMs, deltaMs);
    }
    this.place(this.sprite.scene.time.now, this.near);
    this.button.update(this.near, driveShown);
  }

  /** Kauppiaan paikka kartalla pikseleinä (tien ruudun keskipiste + siirtymä tien viereen). */
  private position(): Vec2 {
    const { tile } = merchantSpot(merchantPlan(), this.state.merchantMs);
    const { offsetX, offsetY } = MERCHANT_MAP_VIEW;
    return {
      x: (tile.x + 0.5) * TILE_SIZE + offsetX,
      y: (tile.y + 0.5) * TILE_SIZE + offsetY,
    };
  }

  private place(time: number, waiting: boolean): void {
    const spot = merchantSpot(merchantPlan(), this.state.merchantMs);
    const { x, y } = this.position();
    const { stepBobPx, stepBobMs, coinOffsetY, coinBobPx, coinBobMs } = MERCHANT_MAP_VIEW;
    const walking = spot.town === null && !waiting;
    const bob = walking && Math.floor(time / stepBobMs) % 2 === 0 ? -stepBobPx : 0;
    this.sprite.setPosition(x, y + bob).setFlipX(spot.facing < 0);
    // Kolikko pomppii pehmeästi ylös ja alas.
    const coinBob = Math.sin((time / coinBobMs) * Math.PI) * coinBobPx;
    this.coin.setPosition(x, y + coinOffsetY + coinBob);
  }
}
