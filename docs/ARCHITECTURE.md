# Arkkitehtuuri- ja teknologiasuunnitelma

Tämä dokumentti kuvaa, miten peli on rakennettu ja miksi. Se on kirjoitettu sekä ihmisille
että Claudelle: kun peliin lisätään uusi ominaisuus, tämän dokumentin säännöt pitävät
koodin siistinä, vaikka sitä kirjoittaisi pääosin tekoäly.

## 1. Tavoite

- **Peli:** pixelart-tyylinen 2D-seikkailu- ja taistelupeli.
- **Pelaajat:** 12–15-vuotiaat suomalaiset pojat. Pelin kieli on suomi.
- **Alusta:** Android-puhelimen verkkoselain (Chrome), vaakasuunta, kosketusohjaus.
  Asennus ei ole pakollista, mutta peli voidaan lisätä aloitusnäytölle (PWA).
- **Kehitystapa:** pelin suunnittelija (Väinö) kertoo Claudelle uusista ominaisuuksista
  tavallisella kielellä, ja Claude toteuttaa ne. Rakenne on suunniteltu niin, että
  tekoäly löytää oikean paikan muutokselle nopeasti eikä riko muuta peliä.

## 2. Teknologiavalinnat

| Osa             | Valinta                           | Perustelu                                                                                                                                                                                                                                                     |
| --------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kieli           | **TypeScript** (strict)           | Tyypit kertovat tekoälylle ja ihmiselle, millaista dataa funktiot odottavat. Kääntäjä löytää virheet ennen kuin peli käynnistetään.                                                                                                                           |
| Pelimoottori    | **Phaser 4**                      | Kypsä 2D-selainpelimoottori: spritet, animaatiot, fysiikka (Arcade), kamerat, tilemapit, kosketusohjaus ja äänet valmiina. `pixelArt: true` pitää pikselit terävinä. Phaser 4 toimittaa mukana tekoälylle tarkoitetut ohjeet (`node_modules/phaser/skills/`). |
| Rakennustyökalu | **Vite**                          | Nopea kehityspalvelin, joka päivittää pelin heti tallennettaessa. `npm run dev -- --host` näkyy samassa wifissä olevaan puhelimeen.                                                                                                                           |
| Testit          | **Vitest**                        | Sama asetus kuin Vitellä. Testaa pelilogiikan ja sisältödatan ilman selainta.                                                                                                                                                                                 |
| Linteri         | **ESLint 10 + typescript-eslint** | Valvoo tiedosto- ja funktiokokoja sekä kerrosrajoja (ks. luku 5).                                                                                                                                                                                             |
| Muotoilu        | **Prettier**                      | Yksi yhtenäinen tyyli, ei keskusteluja välilyönneistä.                                                                                                                                                                                                        |
| CI              | **GitHub Actions**                | Jokainen PR ajaa muotoilun, lintterin, tyyppitarkistuksen, testit ja buildin.                                                                                                                                                                                 |
| Julkaisu        | **GitHub Pages**                  | Ilmainen. `main`-haaran peli päivittyy osoitteeseen `https://kanijar.github.io/EquinoxUni/`, josta sitä voi pelata puhelimella.                                                                                                                               |

Hylätyt vaihtoehdot lyhyesti: pelkkä Canvas ilman moottoria (liikaa itse tehtävää:
törmäykset, kamerat, animaatiot), Unity/Godot web-vienti (raskas lataus puhelimella,
tekoälyn on vaikeampi muokata editoritiedostoja), React (ei sovi pelisilmukkaan).

## 3. Kansiorakenne

```
index.html              Sivu, jolle peli piirretään (mobiiliasetukset)
public/                 Staattiset tiedostot sellaisenaan (manifest, myöhemmin kuvat ja äänet)
src/
  main.ts               Käynnistää Phaserin ja listaa scenet
  config/               Vakiot: resoluutio, ruutukoko, värit, fontit, scenejen nimet
  i18n/fi.ts            KAIKKI pelaajalle näkyvät tekstit
  data/                 Pelisisältö datana: viholliset, esineet, Suomen kartta, spritet
    types.ts            Sisällön tyypit (muokkaa ensin tätä, kun lisäät uuden kentän)
    index.ts            getEnemy(), getItem(), getTown() ... hakufunktiot
    finland.ts          Suomen rajat, järvet ja maastovyöhykkeet oikeina koordinaatteina
    towns.ts            Paikkakunnat ja tiet
    map-enemies.ts      Viholliset kartalla
    rules.ts            Taistelun ja kokemustasojen säännöt
  logic/                Puhdas pelilogiikka (vuoropohjainen taistelu, kartta, tasot). EI Phaseria.
  entities/             Kartan hahmot: Phaser-sprite (Player, Enemy)
  systems/              Pelin järjestelmät: ohjaus, kartan piirto, kohtaamiset, taistelun kulku
  ui/                   Käyttöliittymäpalat: virtuaalitikku, napit, HUD, taistelunäkymä
  scenes/               Phaserin näkymät: Boot, Menu, World, Battle, GameOver
tests/                  Vitest-testit (logiikka + sisällön eheys)
docs/                   Tämä dokumentti ja muut suunnitelmat
```

### Riippuvuussuunta

```
scenes  →  systems / ui  →  entities  →  logic
   ↘           ↘               ↘          ↗
                       data  (+ i18n, config)
```

- `logic/` ei tuo mitään Phaserista eikä pelin muista kerroksista. Se on testattavaa,
  tavallista TypeScriptiä. **ESLint estää Phaser-importin** `logic/`- ja `data/`-kansioissa.
- `data/` sisältää vain dataa ja tyyppejä. Se ei saa tuoda scenejä, entiteettejä tai järjestelmiä.
- `scenes/` vain kokoaa osat yhteen. Jos scene kasvaa, siirrä toiminnallisuus `systems/`-kansioon.

## 4. Pelin rakenne

- **Resoluutio** 480 × 270 (16:9), skaalataan puhelimen näytölle `Scale.FIT`-tilassa.
  Ruutukoko 16 px, hahmot 16 × 16 px.
- **Scenet:** `BootScene` (luo/lataa grafiikat) → `MenuScene` (koko näyttö + vaakasuunta
  ensimmäisestä kosketuksesta) → `WorldScene` (Suomen kartta) ⇄ `BattleScene` (vuoropohjainen
  taistelu) → `GameOverScene`. Paikkakunnassa `WorldScene` ⇄ `SkillsScene` (kykypisteiden jako).
  Pelin tila (`logic/game-state.ts`: elämä, KP, kykypisteet, esineet, sijainti, voitetut viholliset) annetaan scenejen välillä `scene.start(key, data)` -datana.
- **Suomen kartta:** `logic/world-grid.ts` rakentaa ruudukon `data/finland.ts`:n rajoista
  (oikeat koordinaatit, 1 ruutu = 8 km), järvistä ja maastovyöhykkeistä sekä vetää tiet
  paikkakuntien välille. `systems/world-map.ts` piirtää ruudukon Phaserin tilemapiksi, jossa meri
  ja järvet ovat esteitä. Seikkailu alkaa Valkeakoskelta, ja paikkakunnassa elämä palautuu.
- **Taistelu:** kun kartan vihollinen saa pelaajan kiinni, alkaa vuoropohjainen taistelu.
  Pelaaja valitsee HYÖKKÄÄ, PUOLUSTA, JUOMA tai PAKENE, sitten vihollinen vastaa.
  Säännöt ovat `logic/battle.ts`:ssä (palauttaa tapahtumalistan), näyttäminen
  `systems/battle-director.ts`:ssä ja `ui/battle-*.ts`:ssä.
- **Kykypisteet:** jokaisesta uudesta tasosta saa `PROGRESSION.skillPointsPerLevel` (3) pistettä.
  Ne jaetaan paikkakunnassa KYKYPISTEET-napista hyökkäykseen, puolustukseen tai elinvoimaan
  (maksimielämä). Pisteen arvo on `data/skills.ts`:ssä, säännöt `logic/skill-points.ts`:ssä.
  Pelaajan tilaan tallennetaan vain käytetyt pisteet; käyttämättömät lasketaan tasosta.
- **Ohjaus:** kartalla kelluva virtuaalitikku (missä tahansa kohtaa ruutua), taistelussa neljä
  nappia ruudun alareunassa. Tietokoneella nuolet/WASD. Kartan liike luetaan
  `Controls.read()`-metodista.
- **Fysiikka:** Phaser Arcade (suorakaidetörmäykset riittävät ylhäältä kuvattuun peliin).
- **Grafiikka:** aluksi spritet piirretään koodista merkkiruudukoina (`data/sprites.ts`),
  jolloin tekoäly voi tehdä uuden hahmon heti. Myöhemmin oikeat PNG-kuvat (esim. Aseprite tai
  Piskel) laitetaan `public/assets/`-kansioon ja ladataan BootScenessä **samalla avaimella**,
  jolloin muuta koodia ei tarvitse muuttaa.
- **Tallennus:** pelin eteneminen tallennetaan selaimen `localStorage`en (tuleva
  `systems/save.ts`), ei palvelinta. Ei kirjautumista, ei henkilötietoja.

## 5. Tekoälykehityksen säännöt (valvotaan automaattisesti)

Säännöt ovat `eslint.config.js`-tiedostossa, ja CI hylkää muutoksen, joka rikkoo niitä.

| Sääntö                                       | Raja                              | Miksi                                                                      |
| -------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `max-lines`                                  | 300 riviä / tiedosto (data/: 400) | Pieni tiedosto mahtuu kokonaan tekoälyn näkökenttään ja on helppo korvata. |
| `max-lines-per-function`                     | 60 riviä                          | Pitkät funktiot jaetaan nimettyihin apufunktioihin.                        |
| `complexity`                                 | 12                                | Monimutkainen haarautuminen jaetaan osiin.                                 |
| `max-depth`                                  | 3                                 | Syvä sisäkkäisyys on vaikeaa lukea.                                        |
| `max-params`                                 | 4                                 | Useammat parametrit annetaan oliona.                                       |
| `no-restricted-imports`                      | logic/ ja data/ ilman Phaseria    | Pitää logiikan testattavana.                                               |
| `no-explicit-any`, `consistent-type-imports` | –                                 | Tyypit pysyvät rehellisinä.                                                |

Lisäksi periaatteet:

1. **Sisältö on dataa.** Uusi vihollinen, esine tai paikkakunta on uusi olio `data/`-kansiossa,
   ei uutta koodia. Koodia kirjoitetaan vain uudelle _käyttäytymiselle_.
2. **Tekstit `i18n/fi.ts`:ään.** Ei kovakoodattuja suomenkielisiä tekstejä muualle.
3. **Luvut `config/`- tai `data/`-kansioon.** Ei "maagisia numeroita" keskelle koodia.
4. **Yksi asia per tiedosto.** Tiedoston nimi kertoo sisällön (`kebab-case.ts`).
5. **Logiikka testataan.** Uusi kaava tai sääntö `logic/`-kansioon + testi `tests/`-kansioon.
6. **Sisältötesti suojaa dataa.** `tests/content.test.ts` tarkistaa, että tunnisteet ovat
   uniikkeja ja spritet olemassa. `tests/world.test.ts` tarkistaa, että paikkakunnat ja
   viholliset ovat maalla ja että kaikkialle pääsee kävellen Valkeakoskelta.
7. **Kun raja tulee vastaan, jaa tiedosto.** Rajoja ei nosteta eikä `eslint-disable`a käytetä.

## 6. Laatuportit

`npm run check` ajaa saman kuin CI: Prettier → ESLint → TypeScript → Vitest. Lisäksi CI ajaa
`npm run build`. Muutos on valmis vasta, kun kaikki menevät läpi.

Manuaalinen testaus: `npm run dev`, avaa näkyvä osoite puhelimen Chromessa samassa wifissä,
tai pelaa GitHub Pagesista mainiin yhdistämisen jälkeen.

## 7. Tiekartta

**Vaihe 0 – Runko.** Vite + TS + Phaser 4, lintteri, testit, CI, julkaisu. ✓

**Suomen kartta ja vuoropohjainen taistelu.** ✓ Kartta oikeista koordinaateista, 24 paikkakuntaa
tieverkolla, 17 vihollista (lima, metsähiisi, harmaasusi, tunturipeikko), vuoropohjainen taistelu,
kokemustasot, parannusjuomat ja lepo paikkakunnissa.

**Vaihe 1 – Pelituntuma.**

- Hahmojen kävelyanimaatiot ja suunta (4 suuntaa)
- Vahinkonumerot, ruudun tärähdys, äänitehosteet (`systems/audio.ts`)
- Pienkartta ja tarkempi Suomen rantaviiva (lisää pisteitä `data/finland.ts`:ään)

**Vaihe 2 – Seikkailu.**

- Paikkakuntien sisänäkymät (kauppa, majatalo) omina sceneinä
- Inventaario ja aseet (`ItemKind: 'weapon'`), vihollisten erikoisiskut
- NPC-hahmot ja dialogit (`data/dialogues.ts`)
- Tallennus `localStorage`en

**Vaihe 3 – Sisältö ja viimeistely.**

- Pomotaistelut (uusi tekoälytyyppi `logic/`-kansioon)
- Oikeat pikselikuvat ja musiikki
- PWA-offline-tila (`vite-plugin-pwa`), asetukset (äänenvoimakkuus)

## 8. Turvallisuus ja kohderyhmä

- Ei mainoksia, ostoja, chattia, kirjautumista eikä henkilötietojen keruuta.
- Väkivalta on piirrettyä ja fantasiaa (limat, hirviöt): ei verta.
- Peli on staattinen sivusto; palvelinta ei ole.
