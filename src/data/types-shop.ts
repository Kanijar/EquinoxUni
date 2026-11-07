// Kulkevan kauppiaan ja kolikoiden tyypit. Kauppias: data/merchant.ts, säännöt:
// logic/shop.ts (ostaminen ja myyminen), logic/merchant-route.ts (kulku kartalla)
// ja logic/coins.ts (kolikot voitoista).

/** Kauppias, jolta voi ostaa ja jolle voi myydä (scenes/shop-scene.ts). */
export interface ShopKeeperDef {
  readonly id: string;
  /** Nimi pelaajalle. Henkilön nimi on sama molemmilla kielillä. */
  readonly name: string;
  readonly sprite: string;
  /** Mitä kauppias myy (esineiden tunnisteet, data/items.ts). Hinta on esineen price. */
  readonly stock: readonly string[];
}

/**
 * Kauppa, joka pysyy paikallaan paikkakunnassa (esim. Venesataman venekauppa). Kauppa aukeaa
 * KAUPPA-napista, kun sankari on paikkakunnassa.
 */
export interface TownShopDef extends ShopKeeperDef {
  /** Paikkakunta (data/towns.ts), jonka vieressä kauppias seisoo. */
  readonly town: string;
}

/** Kauppias, joka kulkee kartalla paikkakunnasta toiseen teitä pitkin. */
export interface MerchantDef extends ShopKeeperDef {
  /**
   * Paikkakunnat (data/towns.ts), joiden kautta kauppias kulkee järjestyksessä. Viimeisestä
   * hän palaa ensimmäiseen. Peräkkäisten paikkakuntien välillä pitää olla tie (ROADS).
   */
  readonly route: readonly string[];
  /** Kävelynopeus pikseleinä sekunnissa (sankari kulkee 75 px/s). */
  readonly speed: number;
  /** Kuinka kauan (ms) kauppias pysähtyy jokaisessa paikkakunnassa. */
  readonly stopMs: number;
  /** Etäisyys pikseleinä, jolta kauppiaan kanssa voi puhua. Silloin hän odottaa paikallaan. */
  readonly talkRangePx: number;
}

export interface ShopRules {
  /** Kauppias ostaa esineen tällä osuudella hinnasta, esim. 0.5 = puoleen hintaan. */
  readonly sellFactor: number;
}

/** Kolikot voitoista: määrä lasketaan vihollisen kokemuspisteistä. */
export interface CoinRules {
  /** Kolikoita jokaista vihollisen kokemuspistettä kohti, esim. 0.5 = puolet KP:stä. */
  readonly perXp: number;
  /** Satunnaisvaihtelu, esim. 0.25 = ±25 %. Vähintään yksi kolikko tulee aina. */
  readonly variance: number;
}
