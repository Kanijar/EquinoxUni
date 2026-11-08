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
  /** Rivin korkeus. Oletus: repun sivunuolten paikka (ideanäkymä käyttää omaansa). */
  readonly y?: number;
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
    const pagerY = options.y ?? BACKPACK_VIEW.pagerY;
    const half = BACKPACK_VIEW.pagerButtonWidth / 2;
    this.arrows = [
      addArrow(scene, { x: options.left + half, y: pagerY }, 'icon-arrow-left', () =>
        options.onTurn(-1),
      ),
      addArrow(scene, { x: options.right - half, y: pagerY }, 'icon-arrow-right', () =>
        options.onTurn(1),
      ),
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

function addArrow(
  scene: Phaser.Scene,
  at: { readonly x: number; readonly y: number },
  sprite: string,
  onTap: () => void,
): Arrow {
  const { pagerButtonWidth, tileSize, pagerIconScale } = BACKPACK_VIEW;
  const { x, y } = at;
  const button = new TextButton(scene, {
    x,
    y,
    width: pagerButtonWidth,
    height: tileSize,
    label: '',
    onTap,
  });
  const icon = scene.add.image(x, y, sprite).setScale(pagerIconScale).setDepth(ICON_DEPTH);
  return { button, icon };
}
