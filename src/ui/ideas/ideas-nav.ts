import type { IdeaSort, IdeaSummary } from '../../logic/ideas';

// Ideanäkymän osien (lista, avattu idea, kirjoitus) yhteinen rajapinta sceneen
// (scenes/ideas-scene.ts). Näkymä vaihtuu käynnistämällä scene uudelleen uusilla tiedoilla.

export type IdeasView = 'list' | 'idea' | 'write';

export interface IdeasSceneData {
  readonly view?: IdeasView;
  readonly sort?: IdeaSort;
  /** Listan sivu (alkaa nollasta). Säilyy, kun idea avataan ja suljetaan. */
  readonly page?: number;
  /** Avattu idea, tai kirjoitusnäkymässä idea, jota kommentoidaan (puuttuu = uusi idea). */
  readonly idea?: IdeaSummary;
  /** Ilmoitus, joka näytetään heti (esim. "Kiitos! Viesti lähetetty."). */
  readonly message?: string;
}

export interface IdeasNav {
  /** Onko tämä näkymä yhä ruudulla (vanhan haun vastaus ei saa sotkea uutta näkymää). */
  readonly alive: () => boolean;
  readonly go: (data: IdeasSceneData) => void;
  readonly toast: (text: string) => void;
  readonly sort: IdeaSort;
  readonly page: number;
}

/** Tykkäys tai sen peruminen paikallisesti, kun palvelin hyväksyi sen. */
export function toggledLike(idea: IdeaSummary): IdeaSummary {
  return { ...idea, liked: !idea.liked, likes: Math.max(0, idea.likes + (idea.liked ? -1 : 1)) };
}
