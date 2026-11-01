// Tehtävien näkymien mitat: tehtävänantaja kartalla, puhenappi, HUD:n tehtävärivit ja
// tehtävänäkymä (scenes/quest-scene.ts). Kaikki luvut pelin pikseleinä (480 × 270).

/** Tehtävänantaja kartalla paikkakunnan talon vieressä ja merkki (! tai ?) hänen päällään. */
export const NPC_MAP_VIEW = {
  /** Hahmon paikka suhteessa paikkakunnan taloon. */
  offsetX: 14,
  offsetY: -2,
  depth: 6,
  /** Merkki pomppii hahmon pään yläpuolella. */
  markerOffsetY: -14,
  markerBobPx: 3,
  markerBobMs: 450,
  markerColor: '#ffe066',
  markerStroke: 3,
} as const;

/** Puhenappi oikean alakulman pinossa (paikka 3, TALLENNA-napin yllä). */
export const TALK_BUTTON = {
  stackIndex: 3,
  width: 150,
} as const;

/** Kartan HUD:n tehtävärivit vasemmassa yläkulmassa elämän alla. */
export const QUEST_HUD = {
  x: 8,
  firstY: 30,
  lineGap: 12,
  maxLines: 2,
} as const;

/** Tehtävänäkymä: hahmo vasemmalla, tehtävät oikealla, puhe ja nappi alhaalla. */
export const QUEST_VIEW = {
  titleY: 18,
  margin: 6,
  backButtonWidth: 120,
  buttonHeight: 40,
  npcX: 50,
  npcY: 104,
  npcScale: 4,
  /** Tehtävärivit. */
  rowLeft: 100,
  rowWidth: 372,
  rowHeight: 36,
  rowFirstY: 70,
  rowGap: 40,
  maxRows: 3,
  rowTextInset: 8,
  /** Puhe ja tehtävän tiedot alareunassa. */
  textX: 12,
  nameY: 178,
  speechY: 194,
  wrapWidth: 306,
  goalY: 228,
  rewardY: 244,
  actionButtonWidth: 140,
  actionButtonY: 236,
  /** Palkinnon saamisen välähdys. */
  rewardFlashMs: 250,
} as const;
