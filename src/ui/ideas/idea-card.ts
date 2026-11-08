import Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH } from '../../config/game-config';
import { IDEAS_VIEW } from '../../config/ideas-view';
import { TEXT } from '../../i18n/text';
import type { IdeaSummary } from '../../logic/ideas';
import { IconButton } from './icon-button';

// Yksi idea listalla (scenes/ideas-scene.ts): vasemmalla numero (#12), parhaan idean tähti
// ja "SINUN", jos idea on omalta laitteelta (vain sinä näet sen). Keskellä enintään kolme
// riviä tekstiä, oikealla tykkäys- ja kommenttinapit. Kortin napautus avaa idean.

export interface IdeaCardActions {
  readonly onOpen: (idea: IdeaSummary) => void;
  readonly onLike: (idea: IdeaSummary) => void;
}

export class IdeaCard {
  private readonly box: Phaser.GameObjects.Rectangle;
  private readonly number: Phaser.GameObjects.Text;
  private readonly text: Phaser.GameObjects.Text;
  private readonly like: IconButton;
  private readonly comments: IconButton;
  private idea: IdeaSummary | null = null;

  constructor(scene: Phaser.Scene, top: number, actions: IdeaCardActions) {
    const { margin, cardHeight, card, numberX, textX, iconButtonWidth, iconButtonGap } = IDEAS_VIEW;
    const middle = top + cardHeight / 2;
    this.box = scene.add
      .rectangle(margin, top, GAME_WIDTH - margin * 2, cardHeight, card.color)
      .setOrigin(0)
      .setStrokeStyle(2, card.border)
      .setInteractive();
    this.box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.open(actions));
    this.number = smallText(scene, numberX, middle).setColor(IDEAS_VIEW.dimColor);
    this.text = smallText(scene, textX, middle)
      .setWordWrapWidth(IDEAS_VIEW.textWrap)
      .setMaxLines(IDEAS_VIEW.textMaxLines)
      .setLineSpacing(IDEAS_VIEW.lineSpacing);
    const commentsX = GAME_WIDTH - margin - iconButtonGap - iconButtonWidth / 2;
    const likeX = commentsX - iconButtonWidth - iconButtonGap;
    this.like = new IconButton(scene, { x: likeX, y: middle, sprite: 'icon-heart' }, () => {
      if (this.idea) actions.onLike(this.idea);
    });
    this.comments = new IconButton(scene, { x: commentsX, y: middle, sprite: 'icon-bubble' }, () =>
      this.open(actions),
    );
  }

  /** Näyttää idean. null = tyhjä paikka (sivulla vähemmän kuin kolme ideaa). */
  show(idea: IdeaSummary | null, best: number | null): void {
    this.idea = idea;
    const visible = idea !== null;
    for (const part of [this.box, this.number, this.text]) part.setVisible(visible);
    this.like.setVisible(visible);
    this.comments.setVisible(visible);
    if (!idea) {
      return;
    }
    const isBest = idea.id === best;
    const { card } = IDEAS_VIEW;
    const border = isBest ? card.bestBorder : idea.mine ? card.mineBorder : card.border;
    this.box.setStrokeStyle(2, border);
    const tags = [TEXT.ideas.number(idea.id)];
    if (isBest) tags.push(TEXT.ideas.best);
    if (idea.mine) tags.push(TEXT.ideas.mine);
    this.number.setText(tags.join('\n'));
    this.text.setText(shorten(idea.text));
    this.like.show(idea.likes, idea.liked);
    this.like.setEnabled(!idea.mine);
    this.comments.show(idea.comments, false);
  }

  private open(actions: IdeaCardActions): void {
    if (this.idea) actions.onOpen(this.idea);
  }
}

/** Kortissa näkyy vain alku; koko teksti näkyy, kun idean avaa. */
function shorten(text: string): string {
  const max = IDEAS_VIEW.textMaxChars;
  return text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
}

function smallText(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, '', { fontFamily: FONT.family, fontSize: FONT.small, color: COLORS.text })
    .setOrigin(0, 0.5);
}
