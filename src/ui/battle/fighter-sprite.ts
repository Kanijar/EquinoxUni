import type Phaser from 'phaser';
import { BATTLE_STAGE } from '../../config/battle-config';
import { flash } from '../../entities/effects';
import type { Side } from '../../logic/battle';

// Taistelija näyttämöllä: iso pikselisprite ja varjo. Hahmo hengittää paikallaan,
// hyppää hyökätessään vastustajaa kohti, horjahtaa osumasta ja kaatuu lopuksi.

const FIGHTER_DEPTH = 100;
const SHADOW_DEPTH = 90;

export class FighterSprite {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly home: { readonly x: number; readonly y: number };
  private idleTween: Phaser.Tweens.Tween | null = null;
  /** 1 = katsoo oikealle (pelaaja), -1 = vasemmalle (vihollinen). */
  private readonly facing: 1 | -1;

  constructor(
    private readonly scene: Phaser.Scene,
    spriteKey: string,
    side: Side,
  ) {
    this.home = side === 'player' ? BATTLE_STAGE.player : BATTLE_STAGE.enemy;
    this.facing = side === 'player' ? 1 : -1;
    const { width, height, color, alpha } = BATTLE_STAGE.shadow;
    this.shadow = scene.add
      .ellipse(this.home.x, this.home.y, width, height, color, alpha)
      .setDepth(SHADOW_DEPTH);
    this.sprite = scene.add
      .sprite(this.home.x, this.home.y, spriteKey)
      .setOrigin(0.5, 0.92)
      .setScale(BATTLE_STAGE.spriteScale)
      .setDepth(FIGHTER_DEPTH);
  }

  /** Hahmon keskikohta (efektit ja numerot). */
  get center(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y - this.sprite.displayHeight / 2 };
  }

  /** Hahmo liukuu ruudun reunalta paikalleen ja alkaa hengittää. */
  enter(): void {
    const { distancePx, ms, delayMs } = BATTLE_STAGE.enter;
    const fromX = this.home.x - distancePx * this.facing;
    this.sprite.setX(fromX);
    this.shadow.setX(fromX);
    this.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      x: this.home.x,
      delay: delayMs,
      duration: ms,
      ease: 'Back.easeOut',
      onComplete: () => this.startIdle(),
    });
  }

  /** Hengitys: hahmo venyy ja litistyy hitaasti (jalat pysyvät maassa). */
  startIdle(): void {
    this.idleTween?.stop();
    const { squash, ms } = BATTLE_STAGE.idle;
    const scale = BATTLE_STAGE.spriteScale;
    this.sprite.setScale(scale);
    this.idleTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleY: scale * (1 + squash),
      scaleX: scale * (1 - squash / 2),
      duration: ms,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Hyppy vastustajaa kohti ja takaisin. onImpact kutsutaan, kun hyppy on perillä. */
  lunge(onImpact?: () => void): void {
    const { distancePx, hopPx, ms } = BATTLE_STAGE.lunge;
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.home.x + distancePx * this.facing,
      duration: ms,
      ease: 'Quad.easeIn',
      yoyo: true,
      onYoyo: () => onImpact?.(),
      onComplete: () => this.sprite.setX(this.home.x),
    });
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.home.y - hopPx,
      duration: ms / 2,
      ease: 'Quad.easeOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => this.sprite.setY(this.home.y),
    });
  }

  /** Osuma: välähdys, horjahdus taaksepäin ja tärinä. */
  hurt(color: number): void {
    const { knockbackPx, shakePx, ms, flashMs } = BATTLE_STAGE.hurt;
    flash(this.sprite, color, flashMs);
    this.scene.tweens.add({
      targets: this.sprite,
      x: { from: this.home.x - knockbackPx * this.facing, to: this.home.x },
      duration: ms * 3,
      ease: 'Quad.easeOut',
    });
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.home.y - shakePx,
      duration: ms / 2,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.sprite.setY(this.home.y),
    });
  }

  /** Välähdys ilman horjahdusta (esim. paraneminen tai palaminen). */
  glow(color: number, durationMs: number): void {
    flash(this.sprite, color, durationMs);
  }

  /** Vihollinen vilkkuu, litistyy maahan ja katoaa. onGone kutsutaan, kun se on poissa. */
  vanish(onGone: () => void): void {
    this.idleTween?.stop();
    const { blinks, blinkMs, shrinkMs } = BATTLE_STAGE.defeat;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: blinkMs,
      yoyo: true,
      repeat: blinks - 1,
      onComplete: () => {
        onGone();
        this.scene.tweens.add({
          targets: [this.sprite, this.shadow],
          scaleY: 0,
          alpha: 0,
          duration: shrinkMs,
          ease: 'Back.easeIn',
        });
      },
    });
  }

  /** Sankari kaatuu kyljelleen ja harmaantuu. */
  fall(): void {
    this.idleTween?.stop();
    this.sprite.setTint(0x777788);
    this.scene.tweens.add({
      targets: this.sprite,
      angle: -90 * this.facing,
      alpha: 0.6,
      duration: BATTLE_STAGE.defeat.shrinkMs * 2,
      ease: 'Bounce.easeOut',
    });
  }

  /** Voittohyppy kahdesti. */
  cheer(): void {
    const { hopPx, ms } = BATTLE_STAGE.cheer;
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.home.y - hopPx,
      duration: ms,
      ease: 'Quad.easeOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => this.sprite.setY(this.home.y),
    });
  }

  /** Pako: onnistuessa hahmo kääntyy ja juoksee ulos ruudusta, muuten kompastuu ja palaa. */
  flee(success: boolean): void {
    const { distancePx, ms, failPx, tiltDeg } = BATTLE_STAGE.flee;
    this.sprite.setFlipX(true);
    if (success) {
      this.scene.tweens.add({
        targets: [this.sprite, this.shadow],
        x: this.home.x - distancePx * this.facing,
        duration: ms,
        ease: 'Quad.easeIn',
      });
      return;
    }
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.home.x - failPx * this.facing,
      angle: tiltDeg * this.facing,
      duration: ms / 2,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => this.sprite.setFlipX(false).setAngle(0).setX(this.home.x),
    });
  }
}
