import { DurableObject } from 'cloudflare:workers';
import { IDEAS } from '../../../src/config/ideas';
import { ideaTextProblem } from '../../../src/logic/idea-text';
import {
  maxLengthFor,
  readAction,
  readCommentsQuery,
  readListQuery,
  rewardStateFor,
  type IdeaAction,
  type IdeaList,
  type IdeaResult,
} from '../../../src/logic/ideas';
import { isAllowed, RateLimiter } from '../../../src/logic/rate-limit';
import { IdeasStore } from './ideas-store';
import { json, parseJson } from './json';

// Ideaviestit (ks. docs/PELAAJALASKURI.md, luku "Ideaviestit"). Yksi yhteinen huone, joka
// muistaa ideat, kommentit ja tykkäykset SQLite-tauluissa (ideas-store.ts).
// - GET ?sort=new|top&device=... → ideat, paras idea ja Tykkäysmiekan tila kysyjälle
// - GET ?comments=12 → idean 12 kommentit
// - POST {type, device, ...} → uusi idea, kommentti, tykkäys tai miekan lunastus
// - DELETE ?idea=12 tai ?comment=34 → ylläpidon poisto (avain tarkistetaan index.ts:ssä)
// Suojaukset: pituusrajat, kirosanat ja yhteystiedot (logic/idea-text.ts), nopeusraja
// laitteelle (tauluista) ja verkolle (vain muistissa, logic/rate-limit.ts).

/** Muistissa pidettävien laitteiden tai verkkojen enimmäismäärä (muistin suoja). */
const MAX_TRACKED = 10_000;
type Post = Extract<IdeaAction, { readonly type: 'idea' | 'comment' }>;

export class IdeasRoom extends DurableObject<unknown> {
  private readonly store: IdeasStore;
  private readonly networks = new RateLimiter(IDEAS.networkPostRule, MAX_TRACKED);
  private readonly likers = new RateLimiter(IDEAS.likeRule, MAX_TRACKED);

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    this.store = new IdeasStore(ctx.storage.sql);
  }

  override async fetch(request: Request): Promise<Response> {
    const params = new URL(request.url).searchParams;
    if (request.method === 'GET') {
      const idea = readCommentsQuery(params);
      return json(idea === null ? this.list(params) : { comments: this.store.comments(idea) });
    }
    if (request.method === 'DELETE') {
      return json({ removed: this.remove(params) });
    }
    const body = await request.text();
    if (body.length > IDEAS.maxBodyBytes) {
      return new Response('Liian pitkä', { status: 413 });
    }
    const action = readAction(parseJson(body));
    if (!action) {
      return new Response('Viallinen viesti', { status: 400 });
    }
    const network = request.headers.get('CF-Connecting-IP') ?? 'tuntematon';
    return json({ result: this.act(action, network, Date.now()) });
  }

  private list(params: URLSearchParams): IdeaList {
    const { sort, device } = readListQuery(params);
    const best = this.store.best();
    const reward = rewardStateFor({
      device,
      bestAuthor: best?.author ?? null,
      claimed: device !== null && this.store.hasClaimed(device),
    });
    return { ideas: this.store.list(sort, device ?? ''), best: best?.id ?? null, reward };
  }

  private act(action: IdeaAction, network: string, now: number): IdeaResult {
    switch (action.type) {
      case 'like':
        return this.like(action.device, action.idea, now);
      case 'claim':
        return this.claim(action.device, now);
      default:
        return this.post(action, network, now);
    }
  }

  private post(action: Post, network: string, now: number): IdeaResult {
    const problem = ideaTextProblem(action.text, maxLengthFor(action.type));
    if (problem) {
      return problem;
    }
    if (action.type === 'comment') {
      const idea = this.store.idea(action.idea);
      if (!idea) return 'gone';
      if (idea.comments >= IDEAS.maxCommentsPerIdea) return 'full';
    }
    const { postRule } = IDEAS;
    const times = this.store.postTimes(action.device, now - postRule.windowMs);
    if (!isAllowed(times, now, postRule) || !this.networks.take(network, now)) {
      return 'tooFast';
    }
    if (action.type === 'comment') {
      this.store.addComment(action.idea, action.text, action.device, now);
    } else {
      this.store.addIdea(action.text, action.device, now);
    }
    return 'ok';
  }

  /** Tykkäys tai sen peruminen. Omasta ideasta ei voi tykätä (ei voi voittaa yksin). */
  private like(device: string, ideaId: number, now: number): IdeaResult {
    const idea = this.store.idea(ideaId);
    if (!idea) return 'gone';
    if (idea.author === device) return 'own';
    if (!this.likers.take(device, now)) return 'tooFast';
    this.store.toggleLike(ideaId, device);
    return 'ok';
  }

  /** Tykkäysmiekka: vain parhaan idean kirjoittaja, kerran laitetta kohden. */
  private claim(device: string, now: number): IdeaResult {
    if (this.store.hasClaimed(device)) return 'claimed';
    const best = this.store.best();
    if (!best || best.author !== device) return 'notBest';
    this.store.claim(device, best.id, now);
    return 'ok';
  }

  /** Ylläpito: poistaa sopimattoman idean (kommentteineen) tai kommentin numerolla. */
  private remove(params: URLSearchParams): number {
    const idea = Number(params.get('idea'));
    const comment = Number(params.get('comment'));
    if (Number.isSafeInteger(idea) && idea > 0) return this.store.removeIdea(idea);
    if (Number.isSafeInteger(comment) && comment > 0) return this.store.removeComment(comment);
    return 0;
  }
}
