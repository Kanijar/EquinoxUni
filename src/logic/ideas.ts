import { IDEAS } from '../config/ideas';
import type { Rng } from './battle';
import { cleanIdeaText, type IdeaTextProblem } from './idea-text';
import { serverUrl } from './server-url';

// Ideaviestit (alkuruudun IDEAT-nappi, scenes/ideas-scene.ts). Pelaajat kirjoittavat
// nimettömästi ideoita pelin kehittämiseksi, kommentoivat niitä ja tykkäävät niistä.
// Kenenkään nimeä tai tunnistetta ei näytetä. Laitteella on salainen satunnainen tunniste,
// jonka vain palvelin näkee: sillä estetään tuplatykkäykset, valvotaan nopeusrajaa ja
// tunnistetaan oma idea (Tykkäysmiekka, logic/like-reward.ts).
// Palvelin: worker/presence/src/ideas-room.ts, yhteys: net/ideas.ts.

export type IdeaSort = 'new' | 'top';

/** Yksi idea listalla. liked ja mine koskevat vain kysyjän omaa laitetta. */
export interface IdeaSummary {
  readonly id: number;
  readonly text: string;
  readonly likes: number;
  readonly comments: number;
  readonly liked: boolean;
  readonly mine: boolean;
}

/** Tykkäysmiekka: ei mitään, lunastettavissa tai jo lunastettu tällä laitteella. */
export type RewardState = 'none' | 'claimable' | 'claimed';

/** Palvelimen vastaus listaan. best = paras idea (eniten tykkäyksiä, vähintään raja). */
export interface IdeaList {
  readonly ideas: readonly IdeaSummary[];
  readonly best: number | null;
  readonly reward: RewardState;
}

export interface IdeaComment {
  readonly id: number;
  readonly text: string;
}

/** Pelaajan toiminto. Laitteen tunniste kulkee mukana, mutta sitä ei näytetä kenellekään. */
export type IdeaAction =
  | { readonly type: 'idea'; readonly device: string; readonly text: string }
  | {
      readonly type: 'comment';
      readonly device: string;
      readonly idea: number;
      readonly text: string;
    }
  | { readonly type: 'like'; readonly device: string; readonly idea: number }
  | { readonly type: 'claim'; readonly device: string };

/**
 * Toiminnon tulos. tooFast = nopeusraja, gone = idea on poistettu, full = kommentteja on jo
 * liikaa, own = omasta ideasta ei voi tykätä, notBest = oma idea ei ole paras,
 * claimed = miekka on jo lunastettu, error = palvelin ei vastannut.
 */
export type IdeaResult =
  'ok' | IdeaTextProblem | 'tooFast' | 'gone' | 'full' | 'own' | 'notBest' | 'claimed' | 'error';

const RESULTS: readonly IdeaResult[] = [
  'ok',
  'empty',
  'tooLong',
  'blocked',
  'contact',
  'tooFast',
  'gone',
  'full',
  'own',
  'notBest',
  'claimed',
  'error',
];
const REWARDS: readonly RewardState[] = ['none', 'claimable', 'claimed'];
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const DEVICE_PATTERN = new RegExp(`^[a-z0-9]{${IDEAS.deviceIdLength}}$`);

type RawRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isId(value: unknown): value is number {
  return isCount(value) && value >= 1;
}

/** Uusi satunnainen laitetunniste (tallennetaan selaimeen, ei peliin). */
export function newDeviceId(random: Rng = Math.random): string {
  let id = '';
  for (let index = 0; index < IDEAS.deviceIdLength; index += 1) {
    id += ID_CHARS[Math.floor(random() * ID_CHARS.length)] ?? 'a';
  }
  return id;
}

export function isDeviceId(value: unknown): value is string {
  return typeof value === 'string' && DEVICE_PATTERN.test(value);
}

/** Tekstin enimmäispituus: idea vai kommentti. */
export function maxLengthFor(type: 'idea' | 'comment'): number {
  return type === 'idea' ? IDEAS.ideaMaxLength : IDEAS.commentMaxLength;
}

/** Ideoiden osoite pelaajalaskurin osoitteesta. null = palvelinta ei ole määritetty. */
export function ideasUrl(presenceUrl: string | undefined): string | null {
  return serverUrl(presenceUrl, IDEAS.path);
}

function readText(value: unknown): string {
  return typeof value === 'string' ? cleanIdeaText(value) : '';
}

/** Lukee pelaajan lähettämän toiminnon (palvelin). null = viesti ei kelpaa. */
export function readAction(value: unknown): IdeaAction | null {
  if (!isRecord(value) || !isDeviceId(value['device'])) {
    return null;
  }
  const device = value['device'];
  const idea = value['idea'];
  switch (value['type']) {
    case 'idea':
      return { type: 'idea', device, text: readText(value['text']) };
    case 'comment':
      return isId(idea) ? { type: 'comment', device, idea, text: readText(value['text']) } : null;
    case 'like':
      return isId(idea) ? { type: 'like', device, idea } : null;
    case 'claim':
      return { type: 'claim', device };
    default:
      return null;
  }
}

function readSummary(value: unknown): IdeaSummary | null {
  if (!isRecord(value) || !isId(value['id']) || typeof value['text'] !== 'string') {
    return null;
  }
  const { likes, comments } = value;
  if (!isCount(likes) || !isCount(comments)) {
    return null;
  }
  const text = readText(value['text']);
  const id = value['id'];
  return {
    id,
    text,
    likes,
    comments,
    liked: value['liked'] === true,
    mine: value['mine'] === true,
  };
}

/** Lukee palvelimen listan. null = vastaus on rikki. */
export function readIdeaList(value: unknown): IdeaList | null {
  if (!isRecord(value) || !Array.isArray(value['ideas'])) {
    return null;
  }
  const ideas: IdeaSummary[] = [];
  for (const raw of value['ideas'].slice(0, IDEAS.listCount)) {
    const idea = readSummary(raw);
    if (!idea) return null;
    ideas.push(idea);
  }
  const best = isId(value['best']) ? value['best'] : null;
  const reward = REWARDS.find((state) => state === value['reward']) ?? 'none';
  return { ideas, best, reward };
}

/** Lukee idean kommentit. null = vastaus on rikki. */
export function readComments(value: unknown): IdeaComment[] | null {
  if (!isRecord(value) || !Array.isArray(value['comments'])) {
    return null;
  }
  const comments: IdeaComment[] = [];
  for (const raw of value['comments'].slice(0, IDEAS.maxCommentsPerIdea)) {
    if (!isRecord(raw) || !isId(raw['id']) || typeof raw['text'] !== 'string') return null;
    comments.push({ id: raw['id'], text: readText(raw['text']) });
  }
  return comments;
}

/** Lukee toiminnon tuloksen. Tuntematon tulos = error. */
export function readResult(value: unknown): IdeaResult {
  const result = isRecord(value) ? value['result'] : null;
  return RESULTS.find((known) => known === result) ?? 'error';
}

/** Listan kysely osoitteen perään: ?sort=top&device=... */
export function listQuery(sort: IdeaSort, device: string): string {
  return `?sort=${sort}&device=${encodeURIComponent(device)}`;
}

/** Palvelin: listan kysely osoitteesta. Väärä laite = ei laitetta (ei omia tykkäyksiä). */
export function readListQuery(params: URLSearchParams): {
  readonly sort: IdeaSort;
  readonly device: string | null;
} {
  const device = params.get('device');
  return {
    sort: params.get('sort') === 'top' ? 'top' : 'new',
    device: isDeviceId(device) ? device : null,
  };
}

/** Palvelin: kommenttien kysely ?comments=12. null = ei kommenttikysely. */
export function readCommentsQuery(params: URLSearchParams): number | null {
  const id = Number(params.get('comments'));
  return isId(id) ? id : null;
}

/**
 * Palvelin: Tykkäysmiekan tila kysyjän laitteelle (logic/like-reward.ts). Paras idea = eniten
 * tykkäyksiä (vähintään raja), tasatilanteessa ensin kirjoitettu. bestAuthor = sen kirjoittajan laite.
 */
export function rewardStateFor(options: {
  readonly device: string | null;
  readonly bestAuthor: string | null;
  readonly claimed: boolean;
}): RewardState {
  if (options.device === null) return 'none';
  if (options.claimed) return 'claimed';
  return options.bestAuthor === options.device ? 'claimable' : 'none';
}
