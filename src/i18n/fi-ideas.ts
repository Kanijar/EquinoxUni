import type { IdeaResult } from '../logic/ideas';

// Ideaviestien tekstit suomeksi (scenes/ideas-scene.ts, ui/ideas/). Sama englanniksi:
// i18n/en-ideas.ts. Pelaajat ovat 12–15-vuotiaita: muistutetaan henkilötiedoista aina.

/** Toimintojen tulokset (logic/ideas.ts IdeaResult). */
const RESULTS: Readonly<Record<IdeaResult, string>> = {
  ok: 'Kiitos! Viesti lähetetty.',
  empty: 'Kirjoita ensin jotain.',
  tooLong: 'Viesti on liian pitkä.',
  blocked: 'Viestissä on sana, jota ei voi käyttää.\nKirjoita kivasti.',
  contact: 'Viestissä näyttää olevan yhteystieto.\nÄlä jaa numeroita, osoitteita tai tunnuksia.',
  tooFast: 'Odota hetki ennen seuraavaa viestiä.',
  gone: 'Idea on poistettu.',
  full: 'Tähän ideaan ei mahdu enempää kommentteja.',
  own: 'Omasta ideasta ei voi tykätä.',
  notBest: 'Ideasi ei ole enää paras.',
  claimed: 'Olet jo lunastanut Tykkäysmiekan.',
  error: 'Ei yhteyttä. Kokeile myöhemmin uudelleen.',
};

/** Ideaviestit (TEXT.ideas). */
export const FI_IDEAS = {
  /** Alkuruudun nappi. */
  menuButton: 'IDEAT',
  title: 'Ideat',
  back: 'TAKAISIN',
  sortNew: 'UUSIMMAT',
  sortTop: 'SUOSITUIMMAT',
  reminder: 'Kaikki on nimetöntä. Älä kirjoita nimeäsi tai muita henkilötietoja.',
  newIdea: 'UUSI IDEA',
  comment: 'KOMMENTOI',
  send: 'LÄHETÄ',
  cancel: 'PERUUTA',
  /** Avatun idean otsikko. */
  ideaTitle: (id: number): string => `Idea #${id}`,
  writeIdea: 'Uusi idea',
  writeComment: 'Kommentti',
  placeholderIdea: 'Mitä peliin voisi lisätä?',
  placeholderComment: 'Mitä mieltä olet ideasta?',
  /** Kirjoitusnäkymässä aina näkyvä muistutus. */
  writeReminder:
    'Viesti näkyy kaikille ilman nimeä. Älä kirjoita oikeaa nimeäsi, osoitettasi, ' +
    'puhelinnumeroasi, kouluasi tai muita henkilötietoja. Kirjoita kivasti.',
  /** Kerrotaan uuden idean kirjoittajalle. */
  rewardInfo: (min: number): string =>
    `Eniten tykätyn idean tekijä saa Tykkäysmiekan! (vähintään ${min} tykkäystä muilta)`,
  counter: (used: number, max: number): string => `${used}/${max}`,
  number: (id: number): string => `#${id}`,
  best: '★',
  mine: 'SINUN',
  /** Avatun idean kommenttien otsikko ja yksi kommentti. */
  commentsTitle: (count: number): string => `KOMMENTIT (${count})`,
  commentRow: (id: number, text: string): string => `#${id}  ${text}`,
  loading: 'Haetaan ideoita...',
  empty: 'Ei vielä ideoita.\nKirjoita ensimmäinen!',
  noComments: 'Ei vielä kommentteja.',
  offline: 'Ideoita ei saatu.\nKokeile myöhemmin uudelleen.',
  /** Palvelinta ei ole vielä pystytetty (docs/PELAAJALASKURI.md). */
  disabled: 'Ideat eivät ole vielä käytössä.\nPelin tekijä ottaa ne pian käyttöön!',
  sending: 'Lähetetään...',
  results: RESULTS,
  /** Tykkäysmiekan lunastus, kun oma idea on paras. */
  claim: 'LUNASTA MIEKKA',
  claimedNow: 'Tykkäysmiekka on sinun!\nSe ilmestyy reppuusi, kun aloitat tai lataat pelin.',
  /** Kartalla, kun miekka siirtyy reppuun. */
  delivered: 'Tykkäysmiekka ilmestyi reppuusi!',
};
