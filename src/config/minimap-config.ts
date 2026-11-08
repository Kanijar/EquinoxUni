// Minikartan ja ison kartan mitat pelin pikseleinä (480 × 270). Värit: data/minimap.ts.

/**
 * Pieni minikartta kartan vasemmassa yläkulmassa tehtävärivien alla (ui/minimap.ts).
 * Koko kartta on 250 × 160 ruutua, joten 100 × 64 pikseliä = 0,4 pikseliä ruudulle.
 * Napautus avaa ison kartan.
 */
export const MINIMAP_VIEW = {
  x: 8,
  y: 58,
  width: 100,
  height: 64,
  /** Reunus ja himmennys. */
  border: 1,
  borderColor: 0xffffff,
  alpha: 0.9,
  depth: 902,
  /** Merkin koko: värillinen sisus ja musta reunus ympärillä (pikseleinä). */
  marker: 2,
  heroMarker: 3,
  outline: 1,
} as const;

/** Iso kartta omassa näkymässään (scenes/map-scene.ts). 350 × 224 = 1,4 pikseliä ruudulle. */
export const MAP_VIEW = {
  titleY: 16,
  x: 8,
  y: 36,
  width: 350,
  height: 224,
  border: 2,
  marker: 4,
  heroMarker: 6,
  outline: 1,
  /** Selite kartan oikealla puolella TAKAISIN-napin alla: väriruutu ja teksti allekkain. */
  legendX: 368,
  legendFirstY: 62,
  legendGap: 16,
  legendSwatch: 6,
  legendTextX: 10,
  /** Vihje löytämättömistä saarista selitteen alla. */
  hintGap: 8,
  hintWrap: 106,
  margin: 6,
  backButtonWidth: 104,
  backButtonHeight: 40,
} as const;

/** Sankarin merkki vilkkuu, jotta sen löytää heti. Loppubossin merkki sykkii samaan tahtiin. */
export const MINIMAP_BLINK_MS = 350;
