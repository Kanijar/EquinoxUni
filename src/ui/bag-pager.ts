import type Phaser from 'phaser';
import { BACKPACK_VIEW, FONT } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { TextButton } from './text-button';
import { addLabel } from './title-text';

// Repun sivunvaihto esineiden alla: vasen nuoli, sivunumero (Sivu 1/3) ja oikea nuoli.
// Nuolet ovat isoja kosketusnappeja peukalolle. Kun kaikki esineet mahtuvat yhdelle
// sivulle, nuolet ovat himmeinä. Säännöt: logic/bag-pages.ts.

export interface BagPagerOptions {
  /** Repun ruudukon vasen ja oikea reuna: nuolet tulevat reunoille. */
  readonly left: number;
  readonly right: number;
  /** step on -1 (edellinen sivu) tai 1 (seuraava sivu). */
  readonly onTurn: (step: number) => void;
}

/** Ikonit ovat napin päällä (TextButton on syvyydellä 1000–1001). */
const ICON_DEPTH = 1002;
const DISABLED_ALPHA = 0.4;

interface Arrow {
  readonly button: TextButton;
  readonly icon: Phaser.GameObjects.Image;
}

export class BagPager {
  private readonly arrows: readonly Arrow[];
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: BagPagerOptions) {
    const { pagerButtonWidth, pagerY } = BACKPACK_VIEW;
    const half = pagerButtonWidth / 2;
    this.arrows = [
      addArrow(scene, options.left + half, 'icon-arrow-left', () => options.onTurn(-1)),
      addArrow(scene, options.right - half, 'icon-arrow-right', () => options.onTurn(1)),
    ];
    this.label = addLabel(scene, {
      x: (options.left + options.right) / 2,
      y: pagerY,
      text: '',
      size: FONT.medium,
      originX: 0.5,
    });
  }

  /** Näyttää sivunumeron. page alkaa nollasta, count on sivujen määrä. */
  update(page: number, count: number): void {
    this.label.setText(TEXT.backpack.page(page + 1, count));
    const enabled = count > 1;
    for (const { button, icon } of this.arrows) {
      button.setEnabled(enabled);
      icon.setAlpha(enabled ? 1 : DISABLED_ALPHA);
    }
  }
}

function addArrow(scene: Phaser.Scene, x: number, sprite: string, onTap: () => void): Arrow {
  const { pagerButtonWidth, pagerY, tileSize, pagerIconScale } = BACKPACK_VIEW;
  const button = new TextButton(scene, {
    x,
    y: pagerY,
    width: pagerButtonWidth,
    height: tileSize,
    label: '',
    onTap,
  });
  const icon = scene.add.image(x, pagerY, sprite).setScale(pagerIconScale).setDepth(ICON_DEPTH);
  return { button, icon };
}
