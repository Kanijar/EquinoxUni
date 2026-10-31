import Phaser from 'phaser';

// Pienet visuaaliset efektit, joita useampi hahmo käyttää.
// Huom: Phaser 4:ssä sävyn väri ja tila asetetaan erikseen (setTint + setTintMode).

/** Välähdyttää spriten yhdellä värillä hetken ajan (osuma, vahinko). */
export function flash(sprite: Phaser.GameObjects.Sprite, color: number, durationMs: number): void {
  sprite.setTint(color).setTintMode(Phaser.TintModes.FILL);
  sprite.scene.time.delayedCall(durationMs, () => {
    sprite.clearTint().setTintMode(Phaser.TintModes.MULTIPLY);
  });
}
