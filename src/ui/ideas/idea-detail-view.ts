import type Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH } from '../../config/game-config';
import { IDEAS } from '../../config/ideas';
import { IDEAS_VIEW } from '../../config/ideas-view';
import { TEXT } from '../../i18n/text';
import { pageCount } from '../../logic/bag-pages';
import type { IdeaComment, IdeaSummary } from '../../logic/ideas';
import { ideasDevice, ideasService } from '../../systems/ideas-service';
import { BagPager } from '../bag-pager';
import { TextButton } from '../text-button';
import { IconButton } from './icon-button';
import { toggledLike, type IdeasNav } from './ideas-nav';

// Avattu idea: koko teksti ja tykkäysnappi ylhäällä, kommentit alla neljä sivulla
// (numero, jotta ylläpitäjä voi poistaa sopimattoman kommentin), alhaalla sivunuolet ja KOMMENTOI.

export class IdeaDetailView {
  private readonly like: IconButton;
  private readonly rows: Phaser.GameObjects.Text[] = [];
  private readonly message: Phaser.GameObjects.Text;
  private readonly pager: BagPager;
  private readonly commentButton: TextButton;
  private comments: IdeaComment[] = [];
  private page = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly nav: IdeasNav,
    private idea: IdeaSummary,
  ) {
    const { margin, buttonHeight, iconButtonWidth } = IDEAS_VIEW;
    text(scene, margin * 2, IDEAS_VIEW.detailTextY, idea.text)
      .setOrigin(0, 0)
      .setWordWrapWidth(IDEAS_VIEW.detailTextWrap)
      .setLineSpacing(IDEAS_VIEW.lineSpacing);
    const likeX = GAME_WIDTH - margin - iconButtonWidth / 2;
    this.like = new IconButton(
      scene,
      { x: likeX, y: IDEAS_VIEW.detailLikeY, sprite: 'icon-heart' },
      () => this.toggleLike(),
    );
    this.like.setEnabled(!idea.mine);
    text(scene, margin * 2, IDEAS_VIEW.commentsTitleY, TEXT.ideas.commentsTitle(idea.comments))
      .setOrigin(0, 0.5)
      .setColor(COLORS.notice);
    for (let index = 0; index < IDEAS_VIEW.commentsPerPage; index += 1) {
      const y = IDEAS_VIEW.firstCommentY + index * IDEAS_VIEW.commentGap;
      this.rows.push(
        text(scene, margin * 2, y, '')
          .setOrigin(0, 0)
          .setWordWrapWidth(IDEAS_VIEW.commentWrap)
          .setMaxLines(2),
      );
    }
    const middleY = IDEAS_VIEW.firstCommentY + IDEAS_VIEW.commentGap * 2;
    this.message = text(scene, GAME_WIDTH / 2, middleY, '')
      .setOrigin(0.5)
      .setAlign('center');
    const bottomY = scene.scale.height - margin - buttonHeight / 2;
    this.pager = new BagPager(scene, {
      left: IDEAS_VIEW.pagerLeft,
      right: IDEAS_VIEW.pagerRight,
      y: bottomY,
      onTurn: (step) => this.turn(step),
    });
    this.commentButton = new TextButton(scene, {
      x: GAME_WIDTH - margin - IDEAS_VIEW.newWidth / 2,
      y: bottomY,
      width: IDEAS_VIEW.newWidth,
      height: buttonHeight,
      label: TEXT.ideas.comment,
      onTap: () => nav.go({ view: 'write', idea: this.idea, sort: nav.sort, page: nav.page }),
    });
    this.commentButton.setEnabled(idea.comments < IDEAS.maxCommentsPerIdea);
    this.render();
    this.load();
  }

  private load(): void {
    this.message.setText(TEXT.ideas.loading);
    void ideasService()
      .comments(this.idea.id)
      .then((comments) => {
        if (!this.nav.alive()) return;
        this.comments = comments ?? [];
        this.message.setText(comments ? '' : TEXT.ideas.offline);
        this.render();
      });
  }

  private render(): void {
    this.like.show(this.idea.likes, this.idea.liked);
    const count = pageCount(this.comments.length, IDEAS_VIEW.commentsPerPage);
    this.page = Math.min(this.page, count - 1);
    const first = this.page * IDEAS_VIEW.commentsPerPage;
    this.rows.forEach((row, index) => {
      const comment = this.comments[first + index];
      row.setText(comment ? TEXT.ideas.commentRow(comment.id, comment.text) : '');
    });
    this.pager.update(this.page, count);
    if (this.message.text === '' && this.comments.length === 0) {
      this.message.setText(TEXT.ideas.noComments);
    }
  }

  private turn(step: number): void {
    const count = pageCount(this.comments.length, IDEAS_VIEW.commentsPerPage);
    this.page = (this.page + step + count) % count;
    this.render();
  }

  private toggleLike(): void {
    void ideasService()
      .act({ type: 'like', device: ideasDevice(), idea: this.idea.id })
      .then((result) => {
        if (!this.nav.alive()) return;
        if (result === 'ok') {
          this.idea = toggledLike(this.idea);
          this.render();
        } else {
          this.nav.toast(TEXT.ideas.results[result]);
        }
      });
  }
}

function text(scene: Phaser.Scene, x: number, y: number, value: string): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    fontFamily: FONT.family,
    fontSize: FONT.small,
    color: COLORS.text,
  });
}
