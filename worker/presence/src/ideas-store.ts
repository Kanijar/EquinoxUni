import { IDEAS } from '../../../src/config/ideas';
import type { IdeaComment, IdeaSort, IdeaSummary } from '../../../src/logic/ideas';

// Ideaviestien SQLite-taulut (IdeasRoom, ideas-room.ts). Kirjoittajan ja tykkääjän laite on
// satunnainen tunniste, jota ei koskaan lähetetä muille. Ei nimiä, IP-osoitteita eikä evästeitä.
// - ideas: idea, sen kirjoittajan laite ja laskurit (tykkäykset, kommentit)
// - comments: kommentit ja niiden kirjoittajan laite (nopeusraja)
// - likes: kuka laite tykkäsi mistäkin ideasta (yksi tykkäys per laite)
// - rewards: laitteet, jotka ovat jo lunastaneet Tykkäysmiekan

interface IdeaRow extends Record<string, SqlStorageValue> {
  id: number;
  text: string;
  likes: number;
  comments: number;
  mine: number;
  liked: number;
}

/** Idean tiedot palvelimen omaan käyttöön (kirjoittajaa ei näytetä kenellekään). */
export interface IdeaInfo {
  readonly id: number;
  readonly author: string;
  readonly comments: number;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL,
     author TEXT NOT NULL, likes INTEGER NOT NULL DEFAULT 0, comments INTEGER NOT NULL DEFAULT 0,
     created INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT,
     idea INTEGER NOT NULL, text TEXT NOT NULL, author TEXT NOT NULL, created INTEGER NOT NULL)`,
  'CREATE INDEX IF NOT EXISTS comments_by_idea ON comments (idea)',
  'CREATE INDEX IF NOT EXISTS comments_by_author ON comments (author, created)',
  'CREATE INDEX IF NOT EXISTS ideas_by_author ON ideas (author, created)',
  `CREATE TABLE IF NOT EXISTS likes (idea INTEGER NOT NULL, device TEXT NOT NULL,
     PRIMARY KEY (idea, device))`,
  `CREATE TABLE IF NOT EXISTS rewards (device TEXT PRIMARY KEY, idea INTEGER NOT NULL,
     claimed INTEGER NOT NULL)`,
];

const ORDER: Readonly<Record<IdeaSort, string>> = {
  new: 'id DESC',
  top: 'likes DESC, id ASC',
};

export class IdeasStore {
  constructor(private readonly sql: SqlStorage) {
    for (const statement of SCHEMA) sql.exec(statement);
  }

  /** Ideat listaksi. device = kysyjän laite (omat tykkäykset ja oma idea), muuten ''. */
  list(sort: IdeaSort, device: string): IdeaSummary[] {
    return this.sql
      .exec<IdeaRow>(
        `SELECT id, text, likes, comments, (author = ?) AS mine,
           EXISTS (SELECT 1 FROM likes WHERE likes.idea = ideas.id AND likes.device = ?) AS liked
         FROM ideas ORDER BY ${ORDER[sort]} LIMIT ?`,
        device,
        device,
        IDEAS.listCount,
      )
      .toArray()
      .map((row) => ({
        id: row.id,
        text: row.text,
        likes: row.likes,
        comments: row.comments,
        mine: row.mine === 1,
        liked: row.liked === 1,
      }));
  }

  /** Paras idea: eniten tykkäyksiä (vähintään raja), tasatilanteessa ensin kirjoitettu. */
  best(): IdeaInfo | null {
    return this.infoWhere('likes >= ? ORDER BY likes DESC, id ASC LIMIT 1', IDEAS.rewardMinLikes);
  }

  idea(id: number): IdeaInfo | null {
    return this.infoWhere('id = ?', id);
  }

  private infoWhere(condition: string, value: number): IdeaInfo | null {
    const row = this.sql
      .exec<{ id: number; author: string; comments: number }>(
        `SELECT id, author, comments FROM ideas WHERE ${condition}`,
        value,
      )
      .toArray()[0];
    return row ? { id: row.id, author: row.author, comments: row.comments } : null;
  }

  comments(idea: number): IdeaComment[] {
    return this.sql
      .exec<{ id: number; text: string }>(
        'SELECT id, text FROM comments WHERE idea = ? ORDER BY id ASC LIMIT ?',
        idea,
        IDEAS.maxCommentsPerIdea,
      )
      .toArray()
      .map((row) => ({ id: row.id, text: row.text }));
  }

  /** Laitteen ideoiden ja kommenttien ajat hetken since jälkeen (nopeusraja). */
  postTimes(device: string, since: number): number[] {
    return this.sql
      .exec<{ created: number }>(
        `SELECT created FROM ideas WHERE author = ? AND created > ?
         UNION ALL SELECT created FROM comments WHERE author = ? AND created > ?`,
        device,
        since,
        device,
        since,
      )
      .toArray()
      .map((row) => row.created);
  }

  addIdea(text: string, author: string, now: number): void {
    this.sql.exec('INSERT INTO ideas (text, author, created) VALUES (?, ?, ?)', text, author, now);
    // Ilmaiskiintiön suojaksi muistetaan vain uusimmat maxIdeas ideaa.
    const old = this.sql
      .exec<{ id: number }>(
        'SELECT id FROM ideas ORDER BY id DESC LIMIT -1 OFFSET ?',
        IDEAS.maxIdeas,
      )
      .toArray();
    for (const { id } of old) this.removeIdea(id);
  }

  addComment(idea: number, text: string, author: string, now: number): void {
    this.sql.exec(
      'INSERT INTO comments (idea, text, author, created) VALUES (?, ?, ?, ?)',
      idea,
      text,
      author,
      now,
    );
    this.sql.exec('UPDATE ideas SET comments = comments + 1 WHERE id = ?', idea);
  }

  /** Tykkää tai peruu tykkäyksen. */
  toggleLike(idea: number, device: string): void {
    const removed = this.sql.exec(
      'DELETE FROM likes WHERE idea = ? AND device = ?',
      idea,
      device,
    ).rowsWritten;
    if (removed > 0) {
      this.sql.exec('UPDATE ideas SET likes = MAX(0, likes - 1) WHERE id = ?', idea);
      return;
    }
    this.sql.exec('INSERT INTO likes (idea, device) VALUES (?, ?)', idea, device);
    this.sql.exec('UPDATE ideas SET likes = likes + 1 WHERE id = ?', idea);
  }

  hasClaimed(device: string): boolean {
    return this.sql.exec('SELECT 1 FROM rewards WHERE device = ?', device).toArray().length > 0;
  }

  claim(device: string, idea: number, now: number): void {
    this.sql.exec(
      'INSERT INTO rewards (device, idea, claimed) VALUES (?, ?, ?)',
      device,
      idea,
      now,
    );
  }

  /** Ylläpito: poistaa idean kommentteineen ja tykkäyksineen. Palauttaa 1 tai 0. */
  removeIdea(id: number): number {
    this.sql.exec('DELETE FROM comments WHERE idea = ?', id);
    this.sql.exec('DELETE FROM likes WHERE idea = ?', id);
    return this.sql.exec('DELETE FROM ideas WHERE id = ?', id).rowsWritten > 0 ? 1 : 0;
  }

  /** Ylläpito: poistaa yhden kommentin. Palauttaa 1 tai 0. */
  removeComment(id: number): number {
    const row = this.sql
      .exec<{ idea: number }>('SELECT idea FROM comments WHERE id = ?', id)
      .toArray()[0];
    if (!row) {
      return 0;
    }
    this.sql.exec('DELETE FROM comments WHERE id = ?', id);
    this.sql.exec('UPDATE ideas SET comments = MAX(0, comments - 1) WHERE id = ?', row.idea);
    return 1;
  }
}
