import type Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH } from '../../config/game-config';
import { IDEAS_VIEW } from '../../config/ideas-view';
import { TEXT } from '../../i18n/text';
import { pageCount } from '../../logic/bag-pages';
import type { IdeaList, IdeaSummary } from '../../logic/ideas';
import { markRewardPending } from '../../logic/like-reward';
import { browserStore } from '../../systems/browser-storage';
import { ideasDevice, ideasService } from '../../systems/ideas-service';
import { BagPager } from '../bag-pager';
import { TextButton } from '../text-button';
import { IdeaCard } from './idea-card';
import { toggledLike, type IdeasNav } from './ideas-nav';

// Ideaviestien lista: järjestysnappi (UUSIMMAT / SUOSITUIMMAT), kolme ideakorttia sivulla,
// sivunuolet, UUSI IDEA ja LUNASTA MIEKKA, kun oma idea on paras (logic/like-reward.ts).

export class IdeaListView {
  private readonly cards: IdeaCard[] = [];
  private readonly pager: BagPager;
  private readonly message: Phaser.GameObjects.Text;
  private readonly claimButton: TextButton;
  private list: IdeaList | null = null;
  private page: number;

  constructor(
    scene: Phaser.Scene,
    private readonly nav: IdeasNav,
  ) {
    this.page = nav.page;
    const { margin, buttonHeight, sortX, sortWidth, topY } = IDEAS_VIEW;
    const nextSort = nav.sort === 'new' ? 'top' : 'new';
    new TextButton(scene, {
      x: sortX,
      y: topY,
      width: sortWidth,
      height: buttonHeight,
      label: nav.sort === 'new' ? TEXT.ideas.sortTop : TEXT.ideas.sortNew,
      onTap: () => nav.go({ view: 'list', sort: nextSort, page: 0 }),
    });
    for (let index = 0; index < IDEAS_VIEW.cardsPerPage; index += 1) {
      const top = IDEAS_VIEW.firstCardY + index * (IDEAS_VIEW.cardHeight + IDEAS_VIEW.cardGap);
      this.cards.push(
        new IdeaCard(scene, top, {
          onOpen: (idea) => nav.go({ view: 'idea', idea, sort: nav.sort, page: this.page }),
          onLike: (idea) => this.like(idea),
        }),
      );
    }
    const bottomY = scene.scale.height - margin - buttonHeight / 2;
    this.pager = new BagPager(scene, {
      left: IDEAS_VIEW.pagerLeft,
      right: IDEAS_VIEW.pagerRight,
      y: bottomY,
      onTurn: (step) => this.turn(step),
    });
    this.claimButton = new TextButton(scene, {
      x: IDEAS_VIEW.claimX,
      y: bottomY,
      width: IDEAS_VIEW.claimWidth,
      height: buttonHeight,
      label: TEXT.ideas.claim,
      onTap: () => this.claim(),
    });
    new TextButton(scene, {
      x: GAME_WIDTH - margin - IDEAS_VIEW.newWidth / 2,
      y: bottomY,
      width: IDEAS_VIEW.newWidth,
      height: buttonHeight,
      label: TEXT.ideas.newIdea,
      onTap: () => this.write(),
    });
    const listMiddle = IDEAS_VIEW.firstCardY + IDEAS_VIEW.cardHeight * 1.5;
    this.message = scene.add
      .text(GAME_WIDTH / 2, listMiddle, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
        align: 'center',
      })
      .setOrigin(0.5);
    this.load();
  }

  /** Hakee ideat palvelimelta. */
  private load(): void {
    const service = ideasService();
    this.claimButton.setVisible(false);
    this.render();
    if (!service.enabled) {
      this.message.setText(TEXT.ideas.disabled);
      return;
    }
    this.message.setText(TEXT.ideas.loading);
    void service.list(this.nav.sort, ideasDevice()).then((list) => {
      if (!this.nav.alive()) return;
      this.list = list;
      this.message.setText(list ? '' : TEXT.ideas.offline);
      this.render();
    });
  }

  private render(): void {
    const ideas = this.list?.ideas ?? [];
    const count = pageCount(ideas.length, IDEAS_VIEW.cardsPerPage);
    this.page = Math.min(Math.max(0, this.page), count - 1);
    const first = this.page * IDEAS_VIEW.cardsPerPage;
    this.cards.forEach((card, index) =>
      card.show(ideas[first + index] ?? null, this.list?.best ?? null),
    );
    this.pager.update(this.page, count);
    if (this.list && ideas.length === 0) this.message.setText(TEXT.ideas.empty);
    this.claimButton.setVisible(this.list?.reward === 'claimable');
  }

  /**
   * UUSI IDEA on aina painettava: jos palvelinta ei ole vielä pystytetty, nappi kertoo sen
   * (harmaa nappi ilman selitystä näyttäisi rikkinäiseltä).
   */
  private write(): void {
    if (!ideasService().enabled) {
      this.nav.toast(TEXT.ideas.disabled);
      return;
    }
    this.nav.go({ view: 'write', sort: this.nav.sort, page: this.page });
  }

  private turn(step: number): void {
    const count = pageCount(this.list?.ideas.length ?? 0, IDEAS_VIEW.cardsPerPage);
    this.page = (this.page + step + count) % count;
    this.render();
  }

  private like(idea: IdeaSummary): void {
    void ideasService()
      .act({ type: 'like', device: ideasDevice(), idea: idea.id })
      .then((result) => {
        if (!this.nav.alive() || !this.list) return;
        if (result !== 'ok') {
          this.nav.toast(TEXT.ideas.results[result]);
          return;
        }
        const ideas = this.list.ideas.map((item) =>
          item.id === idea.id ? toggledLike(item) : item,
        );
        this.list = { ...this.list, ideas };
        this.render();
      });
  }

  /** Tykkäysmiekka: palvelin tarkistaa, että oma idea on yhä paras ja miekkaa ei ole lunastettu. */
  private claim(): void {
    this.claimButton.setEnabled(false);
    void ideasService()
      .act({ type: 'claim', device: ideasDevice() })
      .then((result) => {
        if (!this.nav.alive()) return;
        this.claimButton.setEnabled(true);
        if (result === 'ok') markRewardPending(browserStore());
        this.nav.go({
          view: 'list',
          sort: this.nav.sort,
          page: this.page,
          message: result === 'ok' ? TEXT.ideas.claimedNow : TEXT.ideas.results[result],
        });
      });
  }
}
