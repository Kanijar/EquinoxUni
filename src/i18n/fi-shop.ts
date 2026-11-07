// Kulkevan kauppiaan kaupan tekstit suomeksi (TEXT.shop). Kauppiaan nimi (Kaapo) on
// data/merchant.ts:ssä, ja se on sama molemmilla kielillä. Sama englanniksi: i18n/en-shop.ts.

export const FI_SHOP = {
  /** Kartan nappi, kun sankari on kauppiaan vieressä. */
  button: 'KAUPPA',
  /** Kauppanäkymän otsikko kauppiaan nimellä. */
  title: (merchant: string): string => `Kauppias ${merchant}`,
  buyTab: 'OSTA',
  sellTab: 'MYY',
  done: 'VALMIS',
  /** Kauppiaan puhe näkymän vasemmassa reunassa. */
  greetBuy: (merchant: string): string => `${merchant}: Tervetuloa! Katso tavarani.`,
  greetSell: (merchant: string): string => `${merchant}: Mitä myisit minulle?`,
  hintBuy: 'Napauta tavaraa nähdäksesi hinnan.',
  hintSell: 'Napauta repun tavaraa nähdäksesi hinnan.',
  /** Myyntisivulla: varusteet, jotka ovat käytössä, eivät näy. */
  equippedNotSold: 'Käytössä olevia varusteita ei voi myydä.',
  nothingToSell: 'Repussa ei ole mitään.',
  /** Hinta esineen ruudussa. */
  tilePrice: (price: number): string => String(price),
  price: (price: number): string => `Hinta ${price} kolikkoa`,
  sellPrice: (price: number): string => `Kauppias maksaa ${price} kolikkoa`,
  buyButton: (price: number): string => `OSTA ${price}`,
  sellButton: (price: number): string => `MYY ${price}`,
  /** Varusteen myynti kysyy varmistuksen, ettei hyvää asetta myy vahingossa. */
  confirm: 'VARMA?',
  noMoney: 'Kolikot eivät riitä.',
  owned: 'Sinulla on jo tämä.',
  notBought: (merchant: string): string => `${merchant} ei osta tätä.`,
  powerBonus: (points: number): string => `+${points} kykypiste heti`,
  /** Monen kappaleen erä (esim. madot). */
  pack: (count: number): string => `${count} kpl yhdellä ostolla`,
  boughtMany: (item: string, count: number): string => `Ostit: ${item} ×${count}!`,
  bought: (item: string): string => `Ostit: ${item}!`,
  boughtPower: 'Sait kykypisteen! Käytä se paikkakunnassa.',
  sold: (item: string, coins: number): string => `Myit: ${item}. Sait ${coins} kolikkoa!`,
  /** Kartalla, kun kauppiasta napautetaan kaukaa. */
  tooFar: (merchant: string): string => `Kävele lähemmäs, niin ${merchant} näyttää tavaransa.`,
};
