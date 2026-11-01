# Ohjeet Claudelle

Tämä on **Equinox Universe**, pixelart 2D -seikkailu- ja taistelupeli Android-puhelimen selaimeen.
Pelaajat ovat 12–15-vuotiaita suomalaisia poikia. **Pelin kieli on suomi.**
Ominaisuuspyynnöt tulevat usein pelin suunnittelijalta, joka on nuori: vastaa
selkeästi suomeksi, kerro lopuksi lyhyesti mitä muutit ja miten sitä voi kokeilla.

Arkkitehtuuri ja perustelut: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Lue se ennen isoja muutoksia.

## Komennot

```bash
npm run dev       # kehityspalvelin (näkyy myös puhelimeen samassa wifissä)
npm run check     # Prettier + ESLint + TypeScript + testit. Aja AINA ennen kuin olet valmis.
npm run lint:fix  # korjaa automaattisesti korjattavat lint-virheet
npm run format    # muotoilee koodin Prettierillä
npm run build     # tuotantoversio dist/-kansioon
```

## Teknologia

TypeScript (strict), Phaser 4, Vite, Vitest, ESLint, Prettier.

**Phaser 4 eroaa Phaser 3:sta.** Älä luota muistiin Phaser 3 -API:sta. Tarkista ohjeet
kansiosta `node_modules/phaser/skills/<aihe>/SKILL.md` (esim. `sprites-and-images`,
`physics-arcade`, `input-keyboard-mouse-touch`, `animations`, `tilemaps`, `v3-to-v4-migration`)
ja tyypit tiedostosta `node_modules/phaser/types/phaser.d.ts`.
Esimerkki: `setTintFill()` ei tee mitään Phaser 4:ssä, käytä `setTint(c).setTintMode(Phaser.TintModes.FILL)`.

## Mihin mikin muutos kuuluu

| Pyyntö                                | Tiedosto                                                                                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uusi vihollinen                       | `src/data/enemies.ts` (+ sprite `src/data/sprites-characters.ts`)                                                                                                                   |
| Loppuboss (herääminen, liikkeet)      | `src/data/boss.ts`, vihollinen `src/data/enemies.ts` (`moves`, `backdrop`), säännöt `src/logic/boss.ts` ja `src/logic/enemy-turn.ts` + testit                                       |
| Vihollinen kartalle                   | `src/data/map-enemies.ts` (sijainti oikeina koordinaatteina)                                                                                                                        |
| Uusi esine                            | `src/data/items.ts` + sprite `src/data/sprites-items.ts`. Varuste: `kind: 'gear'`, `slot`, `bonus`                                                                                  |
| Vihollisen pudotukset (drops)         | `drops` vihollisella `src/data/enemies.ts`, säännöt `src/logic/drops.ts` + testi                                                                                                    |
| Reppu ja varusteet                    | säännöt `src/logic/equipment.ts`, `src/logic/backpack.ts` + testi, näkymä `src/scenes/backpack-scene.ts`                                                                            |
| Uusi paikkakunta tai tie              | `src/data/towns.ts` (koordinaatit esim. Wikipediasta)                                                                                                                               |
| Kartan muoto, järvet, maasto          | `src/data/finland.ts` (+ ruutujen kuvat `src/data/sprites-tiles.ts`)                                                                                                                |
| Pelaajan arvot (elämä, nopeus, isku)  | `src/data/player.ts`                                                                                                                                                                |
| Kokemustasot, taistelun vaikeus       | `src/data/rules.ts`                                                                                                                                                                 |
| Kykypisteet (mitä piste antaa)        | `src/data/skills.ts`, säännöt `src/logic/skill-points.ts` + testi                                                                                                                   |
| Loitsut (tulipallo, palaminen)        | `src/data/spells.ts`, säännöt `src/logic/magic.ts` + testi `tests/magic.test.ts`                                                                                                    |
| Taistelun säännöt (vuorot, toiminnot) | `src/logic/battle.ts` + testi                                                                                                                                                       |
| Taistelukaavat                        | `src/logic/combat.ts` + testi                                                                                                                                                       |
| Vihollisten käyttäytyminen kartalla   | `src/logic/enemy-ai.ts` + testi                                                                                                                                                     |
| Vihollisten paluu (respawn)           | aika `src/data/rules.ts` (`RESPAWN_RULES`) tai `respawnMs` vihollisella, säännöt `src/logic/respawn.ts` + testi                                                                     |
| Taistelunäkymän ulkoasu ja napit      | `src/ui/battle-view.ts` (kokoaa osat `src/ui/battle/`), `src/ui/battle-menu.ts`, mitat ja ajat `src/config/battle-config.ts`                                                        |
| Taistelun taustat ja hiukkasefektit   | `src/data/battle-backdrops.ts` (tausta maaston mukaan), `src/data/battle-effects.ts`, säännöt `src/logic/battle-look.ts` + testi                                                    |
| Liikkumisen ohjaus                    | `src/systems/controls.ts` (+ `src/ui/`)                                                                                                                                             |
| Ruudulla näkyvät tiedot kartalla      | `src/ui/hud.ts`                                                                                                                                                                     |
| Pelin nimi (alkuruutu, otsikko, PWA)  | `src/data/game-info.ts` (ei muualle: muut paikat lukevat nimen sieltä)                                                                                                              |
| Pelin versio (alkuruudun alakulma)    | Numero tulee automaattisesti PR:stä (PR #25 → `0.25`), julkaisuaika buildista: `src/logic/release-*.ts` + testi. Vaihe (`'alfa'` → `'beta'`) ja alku (`0`): `src/data/game-info.ts` |
| Pelin kuvake ja asennus (PWA)         | kuvake `src/data/app-icon.ts`, manifesti `src/data/game-info.ts`, ASENNA-nappi `src/ui/install-button.ts` + testi `tests/pwa.test.ts`                                               |
| Tekstit pelaajalle                    | `src/i18n/fi.ts`                                                                                                                                                                    |
| Pelaajalaskuri (montako pelaa nyt)    | `src/net/` (rajapinta `presence.ts`), näkymä `src/ui/player-count-label.ts`, palvelin `worker/presence/`, ohje `docs/PELAAJALASKURI.md`                                             |
| Ääniefektit                           | `src/data/sounds.ts`, soitto `playSound('id')` (`src/systems/sound-fx.ts`)                                                                                                          |
| Asetukset (valo, äänet)               | `src/logic/settings.ts` + testi, näkymä `src/scenes/settings-scene.ts`, rajat `src/config/persistence.ts`                                                                           |
| Tallennus ja lataus                   | `src/logic/save-*.ts` + testi `tests/save.test.ts`. Uusi kenttä `GameState`en: katso `docs/ARCHITECTURE.md`                                                                         |
| Värit, koot, scenejen nimet           | `src/config/game-config.ts`                                                                                                                                                         |
| Uusi näkymä (esim. kauppa)            | uusi tiedosto `src/scenes/`, lisää `SCENES`-listaan ja `src/main.ts`:iin                                                                                                            |
| Uusi pelijärjestelmä                  | uusi tiedosto `src/systems/`, kutsutaan `world-scene.ts`:stä tai `battle-scene.ts`:stä                                                                                              |

## Säännöt (lintteri ja CI valvovat)

1. **Tiedosto max 300 riviä** (data/ 400), **funktio max 60 riviä**, complexity 12, max 4 parametria.
   Kun raja tulee vastaan, **jaa tiedosto** pienempiin osiin. Älä nosta rajoja, älä käytä
   `eslint-disable`-kommentteja.
2. **`src/logic/` ja `src/data/` eivät saa tuoda Phaseria.** Pelisäännöt ovat puhdasta
   TypeScriptiä, jotta ne voi testata.
3. **Sisältö on dataa.** Uusi vihollinen/esine/paikkakunta = uusi olio data-tiedostoon, ei uutta luokkaa.
4. **Kaikki pelaajalle näkyvä teksti `src/i18n/fi.ts`:ään**, hyvällä suomen kielellä.
5. **Ei maagisia numeroita**: vakiot `config/`- tai `data/`-kansioon.
6. **Uudelle logiikalle testi** `tests/`-kansioon. Sisältö tarkistetaan `tests/content.test.ts`:llä.
7. **Tiedostonimet kebab-case** (`enemy-ai.ts`), luokat PascalCase, yksi asia per tiedosto.
8. Kommentit ja testien nimet suomeksi. Koodin tunnisteet (muuttujat, funktiot) englanniksi.
9. Pidä riippuvuussuunta: `scenes → systems/ui → entities → logic`, ja kaikki saavat käyttää `data/`, `config/`, `i18n/`.

## Työskentelytapa uudelle ominaisuudelle

1. Selvitä yllä olevasta taulukosta, mihin muutos kuuluu. Jos pyyntö on epäselvä, tee
   todennäköisin tulkinta ja kerro se.
2. Jos tarvitaan uusi datakenttä, lisää se ensin `src/data/types.ts`:ään.
3. Toteuta pienin toimiva versio. Mieluummin monta pientä tiedostoa kuin yksi iso.
4. Lisää tai päivitä testit.
5. Aja `npm run check` ja korjaa kaikki virheet.
6. Kerro lopuksi suomeksi: mitä muuttui, miten sitä kokeillaan pelissä, ja yksi ehdotus jatkoon.

## Pelisuunnittelun raamit

- Ikäsuositus 12+: fantasiaväkivalta ilman verta, ei kiroilua.
- Ei mainoksia, rahan käyttöä, chattia tai henkilötietojen keruuta.
- Puhelin vaakatasossa, pelattava peukaloilla: napit vähintään ~40 px (pelin pikseleinä)
  ja ruudun reunoilla, tärkeä tieto ruudun yläosassa.
