// Tasainen "satunnaisluku" 0..1 karttaruudulle. Sama ruutu ja siemen antavat aina saman
// luvun, joten kartta (maasto, kivet) on joka pelissä samanlainen.

/** seed = 0 on maaston oma arvonta. Muut luvut antavat toisistaan riippumattomat arvonnat. */
export function tileNoise(x: number, y: number, seed = 0): number {
  const hash =
    Math.imul(x, 73856093) ^
    Math.imul(y, 19349663) ^
    Math.imul(x + y, 83492791) ^
    Math.imul(seed, 2654435761);
  return ((hash >>> 0) % 1000) / 1000;
}
