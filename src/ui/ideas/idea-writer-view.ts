import type Phaser from 'phaser';
import { BUTTON, COLORS, FONT, GAME_WIDTH } from '../../config/game-config';
import { IDEAS } from '../../config/ideas';
import { IDEAS_VIEW } from '../../config/ideas-view';
import { TEXT } from '../../i18n/text';
import { cleanIdeaText, ideaTextProblem } from '../../logic/idea-text';
import { maxLengthFor, type IdeaAction, type IdeaSummary } from '../../logic/ideas';
import { ideasDevice, ideasService } from '../../systems/ideas-service';
import { MessageInput } from '../message-input';
import { TextButton } from '../text-button';
import { addTitle } from '../title-text';
import type { IdeasNav } from './ideas-nav';

// Uuden idean tai kommentin kirjoitus. Napit ja tekstikenttä ovat ruudun yläosassa, jotta
// puhelimen näppäimistö ei peitä niitä. Muistutus henkilötiedoista näkyy aina kentän alla.
// Teksti tarkistetaan ensin pelissä (kirosanat, yhteystiedot) ja sitten palvelimella.

export class IdeaWriterView {
  private readonly input: MessageInput;
  private readonly counter: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  private readonly sendButton: TextButton;
  private readonly maxLength: number;

  constructor(
    scene: Phaser.Scene,
    private readonly nav: IdeasNav,
    private readonly target: IdeaSummary | null,
  ) {
    const type = target ? 'comment' : 'idea';
    this.maxLength = maxLengthFor(type);
    const { margin, buttonHeight, writerButtonWidth: width, topY } = IDEAS_VIEW;
    addTitle(
      scene,
      IDEAS_VIEW.writerTitleY,
      target ? TEXT.ideas.writeComment : TEXT.ideas.writeIdea,
    );
    new TextButton(scene, {
      x: margin + width / 2,
      y: topY,
      width,
      height: buttonHeight,
      label: TEXT.ideas.cancel,
      onTap: () => this.leave(),
    });
    this.sendButton = new TextButton(scene, {
      x: GAME_WIDTH - margin - width / 2,
      y: topY,
      width,
      height: buttonHeight,
      label: TEXT.ideas.send,
      onTap: () => this.send(),
    });
    this.input = new MessageInput(scene, {
      x: margin * 2,
      y: IDEAS_VIEW.inputY,
      width: GAME_WIDTH - margin * 4,
      height: IDEAS_VIEW.inputHeight,
      fontPx: IDEAS_VIEW.inputFontPx,
      maxLength: this.maxLength,
      placeholder: target ? TEXT.ideas.placeholderComment : TEXT.ideas.placeholderIdea,
      onChange: (value) => this.updateCounter(value),
    });
    this.counter = small(scene, GAME_WIDTH - margin * 2, IDEAS_VIEW.counterY).setOrigin(1, 0.5);
    this.status = this.addInfo(scene, type);
    this.updateCounter('');
    this.input.focus();
  }

  /** Muistutus henkilötiedoista, palkinto (uusi idea) ja lähetyksen tila. */
  private addInfo(scene: Phaser.Scene, type: 'idea' | 'comment'): Phaser.GameObjects.Text {
    const { margin, writerTextY, writerTextWrap } = IDEAS_VIEW;
    const lines = [TEXT.ideas.writeReminder];
    if (type === 'idea') lines.push(TEXT.ideas.rewardInfo(IDEAS.rewardMinLikes));
    small(scene, margin * 2, writerTextY)
      .setText(lines.join('\n\n'))
      .setOrigin(0, 0)
      .setWordWrapWidth(writerTextWrap)
      .setColor(COLORS.notice);
    return scene.add
      .text(GAME_WIDTH / 2, scene.scale.height - BUTTON.margin * 4, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
        align: 'center',
      })
      .setOrigin(0.5, 1);
  }

  private updateCounter(value: string): void {
    this.counter.setText(TEXT.ideas.counter([...value].length, this.maxLength));
  }

  private send(): void {
    const text = cleanIdeaText(this.input.value);
    const problem = ideaTextProblem(text, this.maxLength);
    if (problem) {
      this.status.setText(TEXT.ideas.results[problem]);
      return;
    }
    const device = ideasDevice();
    const action: IdeaAction = this.target
      ? { type: 'comment', device, idea: this.target.id, text }
      : { type: 'idea', device, text };
    this.setBusy(true);
    this.status.setText(TEXT.ideas.sending);
    void ideasService()
      .act(action)
      .then((result) => {
        if (!this.nav.alive()) return;
        this.setBusy(false);
        if (result === 'ok') {
          this.done(TEXT.ideas.results.ok);
        } else {
          this.status.setText(TEXT.ideas.results[result]);
        }
      });
  }

  private setBusy(busy: boolean): void {
    this.sendButton.setEnabled(!busy);
    this.input.setEnabled(!busy);
  }

  /** Lähetetty: uusi idea näkyy uusimpien kärjessä, kommentti avatussa ideassa. */
  private done(message: string): void {
    if (this.target) {
      const idea = { ...this.target, comments: this.target.comments + 1 };
      this.nav.go({ view: 'idea', idea, sort: this.nav.sort, page: this.nav.page, message });
    } else {
      this.nav.go({ view: 'list', sort: 'new', page: 0, message });
    }
  }

  private leave(): void {
    if (this.target) {
      this.nav.go({ view: 'idea', idea: this.target, sort: this.nav.sort, page: this.nav.page });
    } else {
      this.nav.go({ view: 'list', sort: this.nav.sort, page: this.nav.page });
    }
  }
}

function small(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, '', { fontFamily: FONT.family, fontSize: FONT.small, color: COLORS.text })
    .setOrigin(0, 0.5);
}
