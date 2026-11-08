// Ideaviestien vakiot (ks. docs/PELAAJALASKURI.md, luku "Ideaviestit").
// Palvelin (worker/presence) ja peli käyttävät samoja arvoja, joten ne ovat tässä yhdessä paikassa.

export const IDEAS = {
  /** Ideoiden osoite pelaajalaskurin palvelimella (https://...workers.dev/ideas). */
  path: '/ideas',
  /** Laitteen satunnaisen tunnisteen pituus (kirjaimia a–z ja numeroita). */
  deviceIdLength: 20,
  /** Idean ja kommentin enimmäispituus merkkeinä. */
  ideaMaxLength: 200,
  commentMaxLength: 150,
  /** Montako ideaa palvelin lähettää kerralla (uusimmat tai suosituimmat). */
  listCount: 60,
  /** Palvelin muistaa enintään näin monta ideaa; vanhimmat poistetaan (ilmaiskiintiö). */
  maxIdeas: 1_000,
  /** Yhteen ideaan mahtuu enintään näin monta kommenttia. */
  maxCommentsPerIdea: 40,
  /** Palvelin ei lue tätä pidempiä viestejä. */
  maxBodyBytes: 2_048,
  /** Jos palvelin ei vastaa tässä ajassa, näkymä kertoo, ettei ideoita saatu. */
  timeoutMs: 8_000,
  /** Laitteen nopeusraja ideoille ja kommenteille: väli ja enimmäismäärä tunnissa. */
  postRule: { gapMs: 30_000, perWindow: 8, windowMs: 3_600_000 },
  /** Saman verkon (IP) nopeusraja. Koulun wifissä moni pelaaja jakaa saman osoitteen. */
  networkPostRule: { gapMs: 0, perWindow: 60, windowMs: 3_600_000 },
  /** Laitteen tykkäysten nopeusraja (tykkäys ja sen peruminen lasketaan kumpikin). */
  likeRule: { gapMs: 0, perWindow: 30, windowMs: 60_000 },
  /** Tykkäysmiekka: parhaalla idealla pitää olla vähintään näin monta tykkäystä muilta. */
  rewardMinLikes: 5,
} as const;

/** Selaimen muistin avaimet (localStorage). Eivät kuulu tallennuksiin. */
export const IDEAS_STORAGE = {
  /** Laitteen salainen tunniste: yksi tykkäys per laite, nopeusraja ja oman idean tunnistus. */
  deviceKey: 'equinox-universe-ideat-laite',
  /** Tykkäysmiekan tila: odottaa (lunastettu) tai annettu (jo jossain pelissä). */
  rewardKey: 'equinox-universe-tykkaysmiekka',
} as const;
