import Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH, SCENES } from '../config/game-config';
import { IDEAS_VIEW } from '../config/ideas-view';
import { TEXT } from '../i18n/text';
import { IdeaDetailView } from '../ui/ideas/idea-detail-view';
import { IdeaListView } from '../ui/ideas/idea-list-view';
import { IdeaWriterView } from '../ui/ideas/idea-writer-view';
import type { IdeasNav, IdeasSceneData } from '../ui/ideas/ideas-nav';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';
import { Toast } from '../ui/toast';

// Ideaviestit, avataan alkuruudun IDEAT-napista. Pelaajat kirjoittavat nimettömästi ideoita
// pelin kehittämiseksi, kommentoivat ja tykkäävät (logic/ideas.ts, palvelin worker/presence).
// Kolme näkymää: lista (ui/ideas/idea-list-view.ts), avattu idea kommentteineen
// (idea-detail-view.ts) ja kirjoitus (idea-writer-view.ts). Näkymä vaihtuu käynnistämällä
// scene uudelleen. Muistutus henkilötiedoista näkyy listassa ja kirjoittaessa aina.

export type { IdeasSceneData } from '../ui/ideas/ideas-nav';

export class IdeasScene extends Phaser.Scene {
  private toast!: Toast;
  /** Kasvaa joka näkymällä, jotta vanhan haun vastaus ei sotke uutta näkymää. */
  private visit = 0;

  constructor() {
    super(SCENES.ideas);
  }

  create(data: IdeasSceneData): void {
    this.visit += 1;
    const visit = this.visit;
    const nav: IdeasNav = {
      alive: () => visit === this.visit && this.scene.isActive(),
      go: (next) => this.scene.restart(next),
      toast: (text) => this.toast.show(text),
      sort: data.sort ?? 'new',
      page: data.page ?? 0,
    };
    const view = data.view ?? 'list';
    if (view === 'write') {
      new IdeaWriterView(this, nav, data.idea ?? null);
    } else {
      this.addTopBar(nav, data);
      if (view === 'idea' && data.idea) {
        new IdeaDetailView(this, nav, data.idea);
      } else {
        new IdeaListView(this, nav);
      }
    }
    this.toast = new Toast(this, { y: IDEAS_VIEW.toastY, background: COLORS.background });
    if (data.message) this.toast.show(data.message);
  }

  /** Otsikko, TAKAISIN ja muistutus henkilötiedoista. */
  private addTopBar(nav: IdeasNav, data: IdeasSceneData): void {
    const { margin, buttonHeight, backWidth, topY } = IDEAS_VIEW;
    const inIdea = data.view === 'idea' && data.idea !== undefined;
    const title = inIdea && data.idea ? TEXT.ideas.ideaTitle(data.idea.id) : TEXT.ideas.title;
    addTitle(this, topY, title)
      .setOrigin(0, 0.5)
      .setX(margin * 2);
    new TextButton(this, {
      x: GAME_WIDTH - margin - backWidth / 2,
      y: topY,
      width: backWidth,
      height: buttonHeight,
      label: TEXT.ideas.back,
      onTap: () => this.back(nav, inIdea),
    });
    if (!inIdea) {
      addLabel(this, {
        x: GAME_WIDTH / 2,
        y: IDEAS_VIEW.reminderY,
        text: TEXT.ideas.reminder,
        size: FONT.small,
        originX: 0.5,
      }).setColor(COLORS.notice);
    }
  }

  private back(nav: IdeasNav, inIdea: boolean): void {
    this.visit += 1;
    if (inIdea) {
      this.scene.restart({ view: 'list', sort: nav.sort, page: nav.page } satisfies IdeasSceneData);
    } else {
      this.scene.start(SCENES.menu);
    }
  }
}
