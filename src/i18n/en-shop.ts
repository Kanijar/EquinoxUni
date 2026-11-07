import type { FI_SHOP } from './fi-shop';

// Kulkevan kauppiaan kaupan tekstit englanniksi (TEXT.shop). Samat avaimet kuin
// i18n/fi-shop.ts:ssä.

export const EN_SHOP: typeof FI_SHOP = {
  button: 'SHOP',
  title: (merchant: string): string => `Merchant ${merchant}`,
  buyTab: 'BUY',
  sellTab: 'SELL',
  done: 'DONE',
  greetBuy: (merchant: string): string => `${merchant}: Welcome! Have a look.`,
  greetSell: (merchant: string): string => `${merchant}: What would you sell me?`,
  hintBuy: 'Tap an item to see its price.',
  hintSell: 'Tap an item in your bag to see its price.',
  equippedNotSold: 'Equipped gear cannot be sold.',
  nothingToSell: 'Your bag is empty.',
  tilePrice: (price: number): string => String(price),
  price: (price: number): string => `Price ${price} coins`,
  sellPrice: (price: number): string => `The merchant pays ${price} coins`,
  buyButton: (price: number): string => `BUY ${price}`,
  sellButton: (price: number): string => `SELL ${price}`,
  confirm: 'SURE?',
  noMoney: 'Not enough coins.',
  owned: 'You already have this.',
  notBought: (merchant: string): string => `${merchant} does not buy this.`,
  powerBonus: (points: number): string => `+${points} skill point now`,
  bought: (item: string): string => `You bought: ${item}!`,
  boughtPower: 'You got a skill point! Use it in a town.',
  sold: (item: string, coins: number): string => `You sold: ${item}. Got ${coins} coins!`,
  tooFar: (merchant: string): string => `Walk closer and ${merchant} will show you the goods.`,
};
