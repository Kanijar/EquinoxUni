import { DurableObject } from 'cloudflare:workers';
import { LEADERBOARD } from '../../../src/config/leaderboard';
import {
  readSubmission,
  type LeaderboardEntry,
  type LeaderboardReply,
  type ScoreSubmission,
} from '../../../src/logic/leaderboard';
import { leaderboardName } from '../../../src/logic/leaderboard-name';
import { json, parseJson } from './json';

// Koko pelin 10 parhaan lista (ks. docs/PELAAJALASKURI.md). Yksi yhteinen huone, joka
// muistaa sankarit SQLite-taulussa: satunnainen tunniste, nimimerkki ja KP. Tunnistetta ei
// koskaan lähetetä muille. Paremmuus: eniten KP:tä, tasatilanteessa se, joka ehti ensin.
// Ei IP-osoitteita, evästeitä eikä muuta tietoa pelaajista.

interface ScoreRow extends Record<string, SqlStorageValue> {
  name: string;
  xp: number;
}

export class LeaderboardRoom extends DurableObject<unknown> {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    // reached = milloin nykyiset KP:t saavutettiin (ratkaisee tasatilanteet).
    ctx.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS scores (id TEXT PRIMARY KEY, name TEXT NOT NULL, xp INTEGER NOT NULL, reached INTEGER NOT NULL)',
    );
  }

  override async fetch(request: Request): Promise<Response> {
    if (request.method === 'GET') {
      return json(this.reply(null));
    }
    if (request.method === 'DELETE') {
      return json({ removed: this.remove(new URL(request.url).searchParams.get('name') ?? '') });
    }
    const body = await request.text();
    if (body.length > LEADERBOARD.maxBodyBytes) {
      return new Response('Liian pitkä', { status: 413 });
    }
    const score = readSubmission(parseJson(body));
    if (!score) {
      return new Response('Viallinen tulos', { status: 400 });
    }
    this.save(score);
    return json(this.reply(score.id));
  }

  /** Tallentaa sankarin tuloksen. KP:t eivät laske (esim. vanhan tallennuksen lataus). */
  private save(score: ScoreSubmission): void {
    const sql = this.ctx.storage.sql;
    sql.exec(
      `INSERT INTO scores (id, name, xp, reached) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         reached = CASE WHEN excluded.xp > scores.xp THEN excluded.reached ELSE scores.reached END,
         xp = MAX(scores.xp, excluded.xp)`,
      score.id,
      score.name,
      score.xp,
      Date.now(),
    );
    // Ilmaiskiintiön suojaksi muistetaan vain parhaat maxEntries sankaria.
    sql.exec(
      'DELETE FROM scores WHERE id IN (SELECT id FROM scores ORDER BY xp DESC, reached ASC LIMIT -1 OFFSET ?)',
      LEADERBOARD.maxEntries,
    );
  }

  private reply(id: string | null): LeaderboardReply {
    const sql = this.ctx.storage.sql;
    const top: LeaderboardEntry[] = sql
      .exec<ScoreRow>(
        'SELECT name, xp FROM scores ORDER BY xp DESC, reached ASC LIMIT ?',
        LEADERBOARD.topCount,
      )
      .toArray()
      .map((row) => ({ name: row.name, xp: row.xp }));
    return { top, rank: id ? this.rankOf(id) : null };
  }

  /** Sankarin sija: 1 + niiden määrä, joilla on enemmän KP:tä tai sama määrä aiemmin. */
  private rankOf(id: string): number | null {
    const sql = this.ctx.storage.sql;
    const me = sql
      .exec<{ xp: number; reached: number }>('SELECT xp, reached FROM scores WHERE id = ?', id)
      .toArray()[0];
    if (!me) {
      return null;
    }
    const counted = sql
      .exec<{ above: number }>(
        'SELECT COUNT(*) AS above FROM scores WHERE xp > ? OR (xp = ? AND reached < ?)',
        me.xp,
        me.xp,
        me.reached,
      )
      .one();
    return counted.above + 1;
  }

  /** Ylläpito: poistaa sopimattoman nimimerkin listalta (kaikki sen nimiset sankarit). */
  private remove(rawName: string): number {
    const name = leaderboardName(rawName);
    if (name === '') {
      return 0;
    }
    return this.ctx.storage.sql.exec('DELETE FROM scores WHERE name = ?', name).rowsWritten;
  }
}
