# Arkkitehtuuri- ja teknologiasuunnitelma

Tämä dokumentti kuvaa, miten peli on rakennettu ja miksi. Se on kirjoitettu sekä ihmisille
että Claudelle: kun peliin lisätään uusi ominaisuus, tämän dokumentin säännöt pitävät
koodin siistinä, vaikka sitä kirjoittaisi pääosin tekoäly.

## 1. Tavoite

- **Peli:** pixelart-tyylinen 2D-seikkailu- ja taistelupeli nimeltä **Equinox Universe**.
  Nimi on määritelty vain tiedostossa `src/data/game-info.ts` (ks. luku 3).
- **Pelaajat:** 12–15-vuotiaat suomalaiset pojat. Pelin kieli on suomi, ja asetuksista voi
  vaihtaa englantiin (luku 4, Kielet).
- **Alusta:** Android-puhelimen verkkoselain (Chrome), vaakasuunta, kosketusohjaus.
  Asennus ei ole pakollista, mutta pelin voi asentaa Chromella aloitusnäytölle (PWA, luku 4).
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
index.html              Sivu, jolle peli piirretään (mobiiliasetukset, otsikko %GAME_NAME%)
vite.config.ts          Build-asetukset; kirjoittaa pelin nimen sivun otsikkoon, PWA-manifestin ja kuvakkeet
public/                 Staattiset tiedostot sellaisenaan (myöhemmin kuvat ja äänet)
src/
  main.ts               Käynnistää Phaserin ja listaa scenet
  config/               Vakiot: resoluutio, ruutukoko, värit, fontit, scenejen nimet
  i18n/                 KAIKKI pelaajalle näkyvät tekstit
    fi.ts               suomeksi (oletus)
    en.ts               englanniksi, samat avaimet kuin fi.ts:ssä
    en-content.ts       vihollisten ja esineiden nimet englanniksi
    text.ts             TEXT: tekstit valitulla kielellä
  data/                 Pelisisältö datana: viholliset, esineet, saaren kartta, spritet
    types.ts            Sisällön tyypit (muokkaa ensin tätä, kun lisäät uuden kentän)
    game-info.ts        Pelin nimi, kehitysvaihe ja PWA-manifestin sisältö (niiden ainoa määrittelypaikka)
    app-icon.ts         Pelin kuvake (pikselikuva) puhelimen aloitusnäytölle, PNG:t tehdään buildissa
    index.ts            getEnemy(), getItem(), getTown() ... hakufunktiot
    island.ts           Saaren rantaviiva, järvet ja alueet (pellot, suo, tunturit, tulivuori) ruutuina
    towns.ts            Paikkakunnat ja tiet
    map-enemies.ts      Viholliset kartalla
    rules.ts            Taistelun ja kokemustasojen säännöt
    npcs.ts, quests.ts  Tehtävänantajat (Jussi ja Ossi Ketola) ja heidän tehtävänsä
  logic/                Puhdas pelilogiikka (vuoropohjainen taistelu, kartta, tasot). EI Phaseria.
  entities/             Kartan hahmot: Phaser-sprite (Player, Enemy)
  systems/              Pelin järjestelmät: ohjaus, kartan piirto, kohtaamiset, taistelun kulku
  ui/                   Käyttöliittymäpalat: virtuaalitikku, napit, HUD, taistelunäkymä
    battle/             Taistelunäkymän osat: tausta, hahmot, nimikyltit, napit, efektit
  net/                  Verkkoyhteydet rajapinnan takana (pelaajalaskuri, docs/PELAAJALASKURI.md)
  scenes/               Phaserin näkymät: Boot, Menu, World, Battle, GameOver
tests/                  Vitest-testit (logiikka + sisällön eheys)
worker/presence/        Pelaajalaskurin pieni palvelin (Cloudflare Worker), julkaistaan erikseen
docs/                   Tämä dokumentti ja muut suunnitelmat
```

### Riippuvuussuunta

```
scenes  →  systems / ui  →  entities  →  logic
              ↓
             net  (verkkoyhteydet, ei Phaseria)
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
- **Scenet:** `BootScene` (luo/lataa grafiikat, ottaa asetukset käyttöön) → `MenuScene`
  (alkuruutu: PELAA, LATAA, ASETUKSET, LÄHDE) → `HeroScene` (hahmonluonti, vain uusi peli) → `WorldScene` (saaren kartta) ⇄ `BattleScene`
  (vuoropohjainen taistelu) → `VictoryScene` (voittoruutu: loppuboss voitettu tai jokainen
  karttavihollinen voitettu ainakin kerran) → takaisin kartalle. Peli ei lopu voittoon.
  Paikkakunnassa `WorldScene` ⇄ `SkillsScene` (kykypisteiden jako) ja `WorldScene` ⇄
  `SavesScene` (tallennus), ja Jussi Ketolan paikkakunnassa (tai Ossi Ketolan vieressä) `WorldScene` ⇄ `QuestScene` (tehtävät).
  Kulkevan kauppiaan vieressä `WorldScene` ⇄ `ShopScene` (kauppa). Alkuruudusta `SettingsScene` (valo ja äänet), `SavesScene` (lataus)
  ja `ExitScene` (LÄHDE).
  Pelin tila (`logic/game-state.ts`: elämä, KP, kykypisteet, esineet, sijainti, viimeisin paikkakunta, voitetut viholliset ja niiden palautusajat) annetaan scenejen välillä `scene.start(key, data)` -datana.
- **Hahmonluonti:** alkuruudun PELAA-nappi avaa ensin `HeroScene`n (`scenes/hero-scene.ts`),
  jossa pelaaja kirjoittaa sankarille nimen ja valitsee ihon, hiustyylin, hiusten värin, paidan
  ja housujen värin nuolinapeilla (ARVO arpoo ulkonäön, ALOITA vie kartalle). Vaihtoehdot ovat
  dataa (`data/hero-looks.ts`): värit listoina ja hiustyylit riveinä, jotka korvaavat sankarin
  spriten ylimmät rivit. Valinta tallennetaan järjestysnumeroina (`GameState.look`), ja sprite
  kootaan niistä (`logic/hero-look.ts` `heroSprite`, tekstuuri `systems/hero-texture.ts`).
  Sama sankari näkyy kartalla, taistelussa ja voittoruudulla, ja Bugattin kuskilla on sankarin
  hiukset ja iho. Nimi kirjoitetaan HTML-tekstikenttään pelin päällä (`ui/name-input.ts`), jotta
  puhelin avaa oman näppäimistönsä; kenttä on ruudun yläosassa, ettei näppäimistö peitä sitä.
  Nimi siistitään (`logic/hero-name.ts`: kirjaimet, numerot, välilyönnit ja yhdysmerkit,
  enintään `PLAYER.nameMaxLength` = 12 merkkiä). Tyhjä nimi (`GameState.name` = '') näytetään
  oletusnimenä valitulla kielellä (Sankari / Hero). Nimi näkyy taistelun nimikyltissä ja
  tallennuksissa. Vanhassa tallennuksessa ei ole nimeä eikä ulkonäköä, joten se latautuu
  oletuksilla (`save-validate.ts`), eikä `SAVE_VERSION`ia tarvinnut nostaa. Alkuruudun sankari
  on aina oletusnäköinen.
- **Versio ja julkaisuaika:** alkuruudun oikeassa alakulmassa lukee esim. "Versio: 0.25 (alfa)"
  ja sen alla "Julkaistu 1.11.2026 klo 10.05". Numero on uusimman PR:n numero: `vite.config.ts`
  lukee buildissa commitien otsikot gitistä (`logic/release-number.ts`), ja buildin aika on
  julkaisuaika (GitHub julkaisee heti buildin perään). Aika näytetään Suomen aikaa
  (`logic/release-info.ts`). Arvot kulkevat peliin `import.meta.env.VITE_RELEASE_*`-muuttujina.
  `npm run dev` näyttää "Kehitysversio". `vite.config.ts` tarkistetaan Noden tyypeillä
  (`tsconfig.node.json`), peli ilman niitä.
- **Asennus puhelimeen (PWA):** julkaistun pelin voi asentaa Androidin Chromella aloitusnäytölle.
  Asennettu peli aukeaa koko näytölle ja vaakatasoon ilman osoiteriviä. Chrome vaatii HTTPS:n,
  manifestin (`data/game-info.ts` `webManifest`) ja kuvakkeet 192 ja 512 px. Kuvakkeet piirretään
  buildissa pikselikuvasta `data/app-icon.ts` (`logic/pixel-icon.ts`, `logic/png-encode.ts`),
  joten kuvatiedostoja ei tarvitse piirtää käsin. Alkuruudun oikeaan yläkulmaan tulee ASENNA-nappi,
  kun Chrome tarjoaa asennusta (`systems/install-prompt.ts`, `logic/install-offer.ts`,
  `ui/install-button.ts`). Offline-tukea (service worker) ei ole: peli ladataan aina verkosta,
  joten uusi versio näkyy heti. Tallennukset ovat samassa `localStorage`ssa kuin selaimessa.
  Tiedostot, jotka `vite.config.ts` lukee suoraan (`app-icon.ts`, `pixel-icon.ts`,
  `png-encode.ts`, `game-info.ts`, `release-number.ts`), eivät tuo muita tiedostoja.
- **Kaatuminen:** taistelussa kaatunut sankari herää viimeisimmässä paikkakunnassa, jossa hän
  kävi (`GameState.lastTown`, aluksi aloituspaikkakunta), täysin elämin. KP, kykypisteet, esineet
  ja voitetut viholliset säilyvät. Säännöt `logic/town-visits.ts`.
- **Vihollisten paluu:** voitettu karttavihollinen katoaa kartalta ja palaa alkuperäiselle
  paikalleen palautusajan jälkeen (`RESPAWN_RULES.delayMs`, 60 s, `data/rules.ts`; oma aika
  `EnemyDef.respawnMs`, peikolla 2 min). Aika kuluu vain kartalla. Jos pelaaja on lähempänä kuin
  `RESPAWN_RULES.minPlayerDistancePx`, vihollinen odottaa, ettei se ilmesty pelaajan viereen.
  Ajastimet ovat `GameState.respawning`issa (tallentuvat), säännöt `logic/respawn.ts` (kello
  annetaan ulkoa), kartalle palautus `systems/map-encounters.ts`. `GameState.defeated` kertoo,
  ketkä on voitettu ainakin kerran; HUD näyttää vielä voittamattomien määrän.
- **Loppuboss:** Peikkokuningas (`data/boss.ts`, vihollisena `data/enemies.ts`) herää, kun
  pelaaja on voittanut viisi tunturipeikkoa (sama peikko voi olla mukana monta kertaa, koska
  peikot palaavat). Laskuri on `GameState.bossProgress`, ja HUD näyttää "Peikot 3/5". Herännyt
  boss odottaa saaren luoteisilla tuntureilla isona 24 px spritenä punaisen hehkun keskellä, ja ruudun
  reunan nuoli (`ui/boss-pointer.ts`) näyttää suunnan. Boss ei ole `MAP_ENEMIES`-listassa,
  joten se ei vaikuta "Voittamatta"-laskuriin eikä palaa respawnina: voiton jälkeen
  `GameState.bossDefeated` on true. Bossin erikoisliikkeet ovat datana (`EnemyDef.moves`):
  voimaisku valmistellaan vuoroa ennen (PUOLUSTA puolittaa sen) ja lumimyrsky ohittaa
  puolustuksen ja sammuttaa tulipallon liekit. Säännöt `logic/boss.ts` ja `logic/enemy-turn.ts`.
  Voitosta saa 800 KP, harvinaisen varusteen Kuninkaan viitta ja juoman. Voiton jälkeen
  näytetään voittoruutu, ja peli jatkuu kartalla.
- **Peikkokuninkaan luola, Excalibur ja Noita:** Peikkokuninkaan paikan pohjoispuolella
  tunturin rinteellä on luolan suu (`data/cave.ts`, ruutu 30, 37). Ennen bossin voittoa suun
  tukkii iso kivi, ja suulle tultaessa kerrotaan, että Peikkokuningas vartioi sitä. Voiton jälkeen
  (`GameState.bossDefeated`) kivi on poissa, ja suulla oikean alakulman pinoon tulee LUOLA-nappi
  (`systems/cave-entrance.ts`). Luola (`scenes/cave-scene.ts`) avautuu kartan päälle kuten reppu:
  vasemmalla Excalibur kivessä, oikealla Noita Nokkonen. VEDÄ MIEKKA vetää Excaliburin kivestä
  ja laittaa sen käteen, kun taso on vähintään `CAVE.swordMinLevel` (50). Miekan saa vain kerran
  (`GameState.swordTaken`, puuttuva = false, joten `SAVE_VERSION`ia ei tarvinnut nostaa), ja jos
  Excalibur on jo saatu salaisesta burgerista (vanha tallennus), kivi on tyhjä. Säännöt `logic/cave.ts`.
  Excalibur (`data/cave-items.ts`) on paras ase, jonka voi löytää pelistä. Vain dev-varusteet ovat
  parempia.
- **Dev-varusteet:** pelin voimakkaimmat varusteet (`data/dev-items.ts`): Dev-miekka, Dev-haarniska
  ja Dev-amuletti. Jokainen arvo on suurempi kuin millään muulla saman paikan varusteella. Niitä saa
  vain alkuruudun salaisesta burgerista: `logic/burger-secret.ts` antaa jokaiseen paikkaan
  pisteiltään parhaan varusteen, ja dev-varusteet ovat parhaat. Niillä ei ole hintaa (ei voi
  myydä) eikä tasovaatimusta, eikä niitä saa lisätä kauppoihin, pudotuksiin, kalastukseen tai
  tehtäviin (testi `tests/dev-gear.test.ts` tarkistaa). Burgeri ei anna omistettua esinettä
  toista kertaa. Ulkonäkö: omat muodot `greatsword`, `pauldrons` ja `star`
  (`data/gear-shapes.ts`) ja neonvärit (`data/gear-looks.ts`).
  NOIDAN KAUPPA on sama `ShopScene` kuin Kaapolla (`keeper: WITCH`, `returnTo`: kauppa palaa
  luolaan). Noita myy loitsukirjoja (`kind: 'spell'`) ja voimakristalleja. Loitsukirjaa ei
  osteta toista kertaa eikä sitä voi myydä.
- **Loitsut:** tulipallo osataan alusta asti, muut opitaan loitsukirjoista: kun kirja on repussa,
  loitsu näkyy taistelussa (`logic/spells.ts` `learnedSpells`). Loitsut ovat dataa
  (`data/spells.ts`, tyypit `data/types-magic.ts`), ja loitsun `effect` kertoo, mitä se tekee:
  `burn` (tulipallo, palaminen), `bolt` (Salama: iso osuma), `freeze` (Jäänuoli: osuma, ja
  vihollinen jäätyy eikä lyö tällä vuorolla) tai `heal` (Parannus: elämää). Kaikki kasvavat
  tulivoimasta (`powerPerMagic`), eikä puolustus auta niitä vastaan. Loitsulla voi olla odotus
  (`cooldownTurns`): käytön jälkeen sitä ei voi käyttää ennen kuin niin monta vuoroa on kulunut
  (`Battle.spellCooldowns`, lyhenee joka vuoron alussa). Taistelussa HYÖKKÄÄ-valikkoon tulee
  LOITSUT-nappi, joka avaa loitsuvalikon (enintään kolme loitsua ja TAKAISIN,
  `ui/battle-menu.ts`); odotettava loitsu näyttää "ODOTA 2". Efektit `ui/battle/spell-fx.ts`.
- **Läpäisy:** kun jokainen karttavihollinen on voitettu ainakin kerran ("Voittamatta 0"),
  voittoruutu näytetään kerran (`GameState.completed`), ja peli jatkuu kartalla. Ruutu kertoo,
  odottaako loppuboss vielä.
- **Saaren kartta:** pelimaailma on iso keksitty saari keskellä merta (250 × 160 ruutua, ks. myös Vene ja pienet saaret). Kaikki sijainnit
  ovat ruutuina (`MapPoint`: x itään, y etelään). `logic/world-grid.ts` rakentaa ruudukon
  `data/island.ts`:n tiedoista: rantaviivan (monikulmio, ulkopuolella merta), järvet ja
  laavajärven (ympyröitä), alueet (monikulmioita, joiden rajat kiemurtelevat
  `regionEdgeWobble`n verran) ja sisämaan maaston. Meren reunalle tulee hiekkaranta, ja
  lopuksi tiet vedetään paikkakuntien välille. Alueet: lounaassa pellot, keskellä metsät ja
  järvet, idässä suo, pohjoisessa tunturit ja koillisessa tulivuori. `systems/world-map.ts`
  piirtää ruudukon Phaserin tilemapiksi, jossa meri, järvet ja laava ovat esteitä.
  Seikkailu alkaa Kotirannasta, ja paikkakunnassa elämä palautuu. Uusi maasto: tunniste
  `data/types-world.ts`:ään, rivi `TERRAINS`-listan loppuun (`data/world.ts`), ruudun kuva
  `data/sprites-tiles.ts`:ään ja taistelun tausta `BACKDROP_BY_TERRAIN`-listaan.
- **Saaren hirviöt:** kaukaisemmat alueet ovat vaikeampia, koska viholliset eivät vahvistu
  pelaajan mukana. Rannoilla rantakrapu (taso 5–8), suolla liejuhirviö ja virvatuli (12–16),
  tuntureilla peikkojen lisäksi kalliojätti (22–26) ja tulivuorella tulilisko (30–34) ja
  lohikäärme (42–50, voimaisku kuten loppubossilla). Jokainen pudottaa oman varusteensa.
  Tasot on simuloitu (kykypisteet jaettu tasaisesti, varusteet päällä). Vanhan Suomen
  kartan tallennus (versio 5) siirtyy saarelle: sankari herää Kotirannassa, ja saaren
  viholliset ovat voittamatta, mutta taso, reppu ja varusteet säilyvät (`logic/save-format.ts`).
- **Maaston hidastus:** maastotyypillä voi olla nopeuskerroin (`TerrainDef.speedFactor`,
  `data/world.ts`). Metsässä sankari kulkee 60 % nopeudella, tiellä ja pellolla täysillä.
  Kerroin luetaan sankarin ruudusta joka ruudunpäivityksessä (`logic/terrain-speed.ts`), joten
  se toimii millä tahansa kartalla. Hidastavassa maastossa jaloista lentää lehtiä
  (`ui/leaf-rustle.ts`). Viholliset ja väijytysten todennäköisyys (per ruutu) eivät muutu.
- **Kivet metsässä:** metsään tulee harmaita lohkareita (maasto `rock`, `walkable: false`),
  joiden läpi sankari ja viholliset eivät pääse. Kiviä ei piirretä käsin: `logic/rocks.ts`
  arpoo ne kartan ruuduista siemenellä (`ROCKS` `data/world.ts`), joten ne ovat joka pelissä
  samoissa paikoissa ja toimivat millä tahansa kartalla. Kivi tulee vain ruutuun, jonka ympärillä
  on `clearRadius` (2) ruutua vapaata kävelymaata: ei vettä, toista kiveä, paikkakuntaa eikä
  vihollisen tai loppubossin paikkaa (`WorldDef.keepClear`). Siksi kiven voi aina kiertää.
  `tests/rocks.test.ts` varmistaa, että jokaiseen ruutuun, johon pääsi ilman kiviä, pääsee yhä.
  Jos vanhan tallennuksen paikalle on tullut kivi, sankari siirretään viereiseen ruutuun
  (`nearestWalkable`, `logic/world-grid.ts`).
- **Taistelu:** kun kartan vihollinen saa pelaajan kiinni, alkaa vuoropohjainen taistelu.
  Pelaaja valitsee HYÖKKÄÄ, PUOLUSTA, JUOMA tai PAKENE, sitten vihollinen vastaa.
  HYÖKKÄÄ avaa valinnan LYÖNTI tai TULIPALLO. Lyönti tekee hyökkäys − puolustus vahinkoa
  (ilman kykypisteitä 4). Tulipallo (`data/spells.ts`, `logic/magic.ts`) osuu 1 vahingolla
  puolustuksesta välittämättä ja sytyttää vihollisen: palaminen vie 1 elämän sekunnissa
  3 sekunnin ajan **oikeassa ajassa** (`MAGIC_RULES.burnTickMs`), myös kun pelaaja miettii.
  Uusi tulipallo aloittaa palamisen alusta. `BattleDirector` kutsuu `burnTick()`ia ajastimella.
  Säännöt ovat `logic/battle.ts`:ssä (palauttaa tapahtumalistan), näyttäminen
  `systems/battle-director.ts`:ssä ja `ui/battle-*.ts`:ssä.
- **Tasot:** tasoja on 1–100 (taso 100 on huipputaso). KP-rajoja ei kirjoiteta käsin, vaan ne
  lasketaan kaavasta `LEVEL_CURVE` (`data/rules.ts`, laskenta `data/level-curve.ts`):
  raja = cubic × n³ + quadratic × n² + linear × n, kun n = taso − 1. Tasot 1–10 eivät vaadi
  enempää kuin vanha käsin kirjoitettu taulukko, joten vanhojen tallennusten taso ei laske.
  Kun huipputaso nostettiin 50:stä 100:aan, kaava pysyi samana: tasot 1–50 ovat ennallaan
  (taso 50 = 32178 KP, taso 100 = 228858 KP). Viholliset eivät vahvistu pelaajan mukana.
  Tallennukseen menee vain KP; taso lasketaan siitä aina uudelleen (`logic/progression.ts`).
- **Taistelun ulkoasu:** taustakuva valitaan maaston mukaan, jossa taistelu alkaa
  (`data/battle-backdrops.ts`: pelto, kuusimetsä, lumiset tunturit, kylätie punaisine
  mökkeineen). Tausta maalataan koodilla canvasille kerran (`ui/battle/backdrop-painter.ts`),
  joten se ei maksa mitään ruudunpäivityksessä. Hahmot ovat viisinkertaisia, hengittävät,
  hyppäävät hyökätessä, horjahtavat osumasta ja hajoavat voitettuina pölyksi
  (`ui/battle/fighter-sprite.ts`). Elämäpalkit muuttuvat vasta iskun osuessa: `BattleView`
  pitää kirjaa näytetystä elämästä ja tarkistaa sen vuoron lopuksi (`syncHp`). Hiukkaset
  (`data/battle-effects.ts`) käyttävät Phaserin emittereitä, joilla on katto
  (`PARTICLE_LIMITS`), jotta keskitason puhelin pysyy 60 kuvassa sekunnissa. Kartalta
  taisteluun ja takaisin siirrytään pikselöidyllä pyyhkäisyllä (`ui/screen-wipe.ts`).
  Mitat ja ajat ovat `config/battle-config.ts`:ssä.
- **Kykypisteet:** jokaisesta uudesta tasosta saa `PROGRESSION.skillPointsPerLevel` (3) pistettä.
  Ne ovat tason nousun ainoa palkinto (lisäksi elämä täyttyy): taso ei itse nosta arvoja.
  Ne jaetaan paikkakunnassa KYKYPISTEET-napista hyökkäykseen, puolustukseen, elinvoimaan
  (maksimielämä), tarkkuuteen (kriittisen osuman mahdollisuus, +2 %-yksikköä, enintään 40 %)
  tai maagiaan (tulivoima: tulipallon osuma +1 ja palaminen +1 s). Kyvyllä voi olla yläraja
  (`SkillDef.max`). Pisteen arvo on `data/skills.ts`:ssä, säännöt `logic/skill-points.ts`:ssä.
  Pelaajan tilaan tallennetaan vain käytetyt pisteet; käyttämättömät lasketaan tasosta.
- **Ohjaus:** kartalla kelluva virtuaalitikku (missä tahansa kohtaa ruutua), taistelussa neljä
  nappia ruudun alareunassa. Tietokoneella nuolet/WASD. Kartan liike luetaan
  `Controls.read()`-metodista.
- **Fysiikka:** Phaser Arcade (suorakaidetörmäykset riittävät ylhäältä kuvattuun peliin).
- **Grafiikka:** aluksi spritet piirretään koodista merkkiruudukoina (`data/sprites.ts`),
  jolloin tekoäly voi tehdä uuden hahmon heti. Myöhemmin oikeat PNG-kuvat (esim. Aseprite tai
  Piskel) laitetaan `public/assets/`-kansioon ja ladataan BootScenessä **samalla avaimella**,
  jolloin muuta koodia ei tarvitse muuttaa.
- **Reppu ja varusteet:** kartan REPPU-napista (oikea alakulma, aina näkyvissä) avautuu
  `BackpackScene` kartan päälle; kartta nukkuu (`scene.sleep`) ja herää samaan kohtaan.
  Varustepaikat: käsi, vartalo ja koru (`GEAR_SLOTS`, `data/items.ts`), yksi varuste per paikka.
  Varuste on esine, jolla on `kind: 'gear'`, `slot` ja `bonus` (esim. `{ attack: 6 }`).
  Käytössä olevat varusteet ovat `GameState.equipped`issä, eivät repussa (`inventory`).
  Lisäykset lasketaan arvoihin vain `logic/equipment.ts`:n `applyGear()`issa, ja
  `playerStats()` = perusarvot + kykypisteet + varusteet. Kyvyn yläraja (tarkkuus 40 %) koskee
  vain kykypisteitä (`skillStats()`), varusteet tulevat päälle. Repusta voi myös juoda juoman.
  Ryöstäjä varastaa vain juomia, ei varusteita.
  Repun esineet näkyvät sivuittain (5 × 2 = 10 esinettä sivulla, `BACKPACK_VIEW`):
  nuolinapit ja "Sivu 1/3" esineiden alla (`ui/bag-pager.ts`), säännöt `logic/bag-pages.ts`.
  Viimeiseltä sivulta eteenpäin pääsee ensimmäiselle. Pelaajan arvot ovat vasemmassa yläkulmassa.
- **Tehtävät (Jussi Ketola):** tehtävänantaja Jussi Ketola (`data/npcs.ts`) seisoo
  aloituspaikkakunnan talon vieressä (paikkakunta luetaan `START_TOWN`ista, ei koordinaateista).
  Pään päällä pomppii ! (uusi tehtävä) tai ? (valmis tehtävä). Hänen paikkakunnassaan oikean
  alakulman pinoon tulee puhenappi "JUSSI KETOLA", josta (tai hahmoa napauttamalla) avautuu
  `QuestScene` kartan päälle samalla tavalla kuin reppu. Tehtävät ovat dataa (`data/quests.ts`):
  tavoite voita N vihollista, tuo N esinettä tai käy paikkakunnassa; palkintona KP:tä ja esineitä
  (uudet varusteet `data/items.ts`). `requires` tekee ketjuja ja `minLevel` porrastaa tehtävät
  tasoille 1–40; Liskovahti on toistettava (`repeatable`), joten huipputasolle riittää
  tekemistä. Viimeinen tehtävä (Lohikäärmeiden tuho, tasolta 40) vaatii kaksi lohikäärmettä, ja
  palkintona on Bugattin avaimet (ks. Kulkuneuvot). Tehtäväesine putoaa vain tehtävän aikana (`DropDef.quest`). Tila on
  `GameState.quests` (tehtäväkirja: kesken, edistyminen, palautuskerrat), säännöt
  `logic/quest-log.ts` ja `logic/quests.ts`. Vanhassa tallennuksessa tehtäväkirja on tyhjä
  (`logic/save-quests.ts`), joten `SAVE_VERSION`ia ei tarvinnut nostaa. Kartan vasemmassa
  yläkulmassa näkyvät keskeneräiset tehtävät ("Limat kuriin 2/3"), ja voittoruudulla kerrotaan
  tehtävän edistymisestä. Uusi tehtävä: olio `data/quests.ts`:ään ja englanninkieliset tekstit
  `i18n/en-content.ts`:n `QUEST_TEXTS_EN`iin.
- **Ossi Ketola ja tulivuoren rappuset:** Jussin veli Ossi Ketola (`data/npcs.ts`) seisoo
  tulivuoren kraatterin keskellä tuhkasaarella laavan ympäröimänä (`LakeDef.islands`,
  `data/island.ts`). Hahmolla on paikkakunnan sijaan oma ruutu (`NpcDef.tile`), ja hänen kanssaan
  voi puhua, kun sankari on enintään `NPC_TALK_TILES` ruudun päässä (`logic/quests.ts`
  `npcNearby`). Jokainen voitettu lohikäärme nostaa laavasta yhden kiviaskelman
  (`data/volcano-stairs.ts`: viisi askelmaa kraatterin länsireunalta saarelle, maasto `stairs`).
  Laskuri on `GameState.stairSteps` (puuttuva = 0, joten `SAVE_VERSION`ia ei tarvinnut nostaa),
  säännöt `logic/volcano-stairs.ts`. Kartta rakennetaan askelmien kanssa aina, kun kartta avataan
  (`systems/world-map.ts` `showStairs`): askelmia tulee lisää vain taistelussa, ja sen jälkeen
  kartta avataan uudelleen. Voittoruudulla kerrotaan uudesta askelmasta (1/5), ensimmäisen jälkeen
  kraatterista kuuluu Ossin huuto. Ossilla on kaksi tehtävää (tasolta 40): terveiset Jussille
  Kotirantaan ja kolme lohikäärmeen suomua (putoavat vain tehtävän aikana), palkintona
  Laavahaarniska, saaren paras vartalovaruste.
- **Kulkuneuvot (Bugattin avaimet):** esine `kind: 'vehicle'` (`data/items.ts`), jolla on
  `speedMultiplier` (1,8 = 80 % nopeammin) ja kartan kuva `mapSprite` (sankari autossa,
  `data/sprites-characters.ts`). Kun avaimet ovat repussa, kartalla näkyy BUGATTI-nappi REPPU-napin
  vasemmalla puolella (`ui/drive-button.ts`), ja E-näppäin tekee saman: auto päälle tai pois
  (`systems/vehicle-control.ts`). Säännöt `logic/vehicle.ts`: kerroin kerrotaan maaston kertoimella,
  joten metsä hidastaa autoakin. Taisteluun auto ei vaikuta. Tila on `GameState.driving`
  (puuttuva = pois, joten `SAVE_VERSION`ia ei tarvinnut nostaa).
- **Vene ja pienet saaret:** Venesatamassa (Kotirannan eteläpuolella rannalla) on
  venekauppias Veikko (`data/boat-shop.ts`, `TownShopDef`), joka myy neljää venettä
  (`kind: 'boat'`, `data/boat-items.ts`, kuvat `data/sprites-boats.ts`) ja juomia: Soutuvene
  (×0,8, 300 kolikkoa), Purjevene (×1,1, taso 30), Moottorivene (×2, taso 55) ja Luksusvene
  (×2,8, taso 70, `canFish`: merellä voi kalastaa). Jos veneitä on monta, käytössä on nopein
  (`ownedBoat`), eikä hitaampaa venettä kuin oma voi ostaa (`BuyBlock` `'slowerBoat'`).
  Laiturissa keinuu seuraava myytävä vene (`nextBoat`). Vanhojen tallennusten entinen Purjevene
  (`sailboat`, ×1,6) on nyt uusi Purjevene samalla tunnisteella, joten muunnosta ei tarvita. Kauppa on sama `ShopScene` kuin Kaapolla
  (`keeper`-parametri), ja kartalla laituri, Veikko ja kauppanappi piirretään
  `systems/boat-dock.ts`:ssä. Kun vene on repussa ja sankari seisoo meren vieressä, REPPU-napin
  vasemmalla oleva kulkuneuvonappi näyttää VENEESEEN (V-näppäin tekee saman): sankari siirtyy
  viereiseen meriruutuun ja kulkee veneen nopeuskertoimella (`speedMultiplier`). Merellä rannan vieressä nappi
  näyttää MAIHIN. Muualla nappi on BUGATTI, jos avaimet ovat repussa (`systems/vehicle-control.ts`,
  `systems/boat-control.ts`). Merellä ei taistella, kalastaa voi vain Luksusveneestä, ja Bugatti sammuu. Kartalla
  on toinen, näkymätön tilemap-kerros (`seaLayer`), jossa kaikki paitsi meri on estettä; veneessä
  käytetään sitä. Säännöt `logic/sailing.ts` + testi `tests/sailing.test.ts`.
  Pienet saaret ovat `data/isles.ts`:ssä (ympyröiden yhdiste, oma maasto ja suositustaso):
  Palmusaari (taso 50, viidakko), Sumusaari (62, hautausmaa), Pakkassaari (76, ikijää) ja
  Myrskysaari (90, basaltti). Jokaisella on oma paikkakunta, kaksi omaa vihollista
  (`data/isle-enemies.ts`, kartalla `data/map-enemies.ts`:n lopussa), varusteet
  (`data/isle-items.ts`) ja tehtävänantaja kahdella tehtävällä (`data/isle-quests.ts`, hahmot
  `data/npcs.ts`). Myrskysaaren Merikäärme on saarten vahvin vihollinen. Ensimmäinen
  rantautuminen saarelle näyttää viestin ja tallentuu (`GameState.isles`). Tila on
  `GameState.sailing` ja `isles` (puuttuva = ei veneessä, ei saaria, joten `SAVE_VERSION`ia ei
  tarvinnut nostaa). Läpäisyyn kuuluvat myös saarten viholliset.
- **Kulkeva kauppias ja kolikot:** kauppias Kaapo (`data/merchant.ts`) kävelee teitä pitkin
  paikkakunnasta toiseen (Kotiranta → Peltola → Myllykylä → Havula → Kuusela ja takaisin) ja
  pysähtyy jokaiseen 15 sekunniksi. Reitti lasketaan samasta ruutuviivasta kuin kartan tiet,
  joten hän pysyy tiellä (`logic/merchant-route.ts`, testi tarkistaa jokaisen ruudun). Paikka
  lasketaan kauppiaan kellosta (`GameState.merchantMs`), joka käy vain kartalla ja pysähtyy, kun
  sankari on hänen vieressään (`MERCHANT.talkRangePx`). Kartalla kauppias ja hänen päänsä päällä
  pomppiva kolikko piirretään `systems/merchant-walker.ts`:ssä. Vieressä alareunaan tulee
  KAUPPA-nappi (`ui/shop-button.ts`, REPPU- tai BUGATTI-napin vasemmalle), ja kauppiasta voi myös
  napauttaa. `ShopScene` (`scenes/shop-scene.ts`) avautuu kartan päälle kuten reppu: OSTA- ja
  MYY-napit, tavarat sivuittain samoilla mitoilla kuin repussa ja hinta ruudun kulmassa.
  Hinta on esineen `price` (`data/items.ts`), ja kauppias ostaa tavarat puoleen hintaan
  (`SHOP_RULES`). Esinettä ilman hintaa (tehtäväesine, Bugattin avaimet) ei voi myydä, eikä
  käytössä olevaa varustetta. Varustetta, joka pelaajalla jo on, ei osteta toista kertaa, ja
  varusteen myynti kysyy varmistuksen (VARMA?). Kauppiaan omat tavarat ovat
  `data/merchant-items.ts`:ssä: Iso parannusjuoma (40 elämää), kuusi varustetta ja
  Voimakristalli, uusi esinetyyppi `kind: 'power'`, joka antaa heti kykypisteen
  (`GameState.bonusSkillPoints`) ja jonka hinta nousee joka ostolla (`priceStep`).
  Kolikoita (`GameState.coins`, alussa `PLAYER.startCoins`) saa voitoista: puolet vihollisen
  KP:stä ±25 % (`COIN_RULES`, `logic/coins.ts`), ja voittoviesti kertoo ne. HUD näyttää kolikot.
  Taistelun JUOMA-nappi juo pienimmän juoman, joka riittää (`logic/heal-choice.ts`).
  Vanhassa tallennuksessa kolikoita ja ostettuja pisteitä on 0 ja kauppias on kierroksensa
  alussa, joten `SAVE_VERSION`ia ei tarvinnut nostaa. Säännöt `logic/shop.ts`.
- **Kalastus:** kauppias Kaapo myy onkia (`kind: 'tool'`, yksi kutakin) ja syöttejä
  (`kind: 'bait'`, erissä: `ItemDef.buyCount`, hinta on yhden kappaleen hinta). Paremmat onget ja
  syötit myydään vasta tietyltä tasolta (`ItemDef.minLevel`, kauppa näyttää "Myydään vasta
  tasolta N"). Kun sankarilla on onki ja hän seisoo meren tai järven vieressä
  (`FISHING.reachTiles`), alariviin tulee KALASTA-nappi (`ui/fish-button.ts`, muiden alarivin
  nappien vasemmalle; tietokoneella F). Napautus heittää kohon lähimpään vesiruutuun ja nappi
  muuttuu NYKÄISE-napiksi. Kala nappaa 1,5–4,5 sekunnin päästä: koho sukeltaa, sen päälle tulee
  huutomerkki ja nappi saa keltaisen reunuksen. Liian aikainen nykäisy säikäyttää kalan (syötti
  säilyy), liian myöhäinen vie syötin. Liikkuminen lopettaa kalastuksen.
  **Onget** (`FISHING.rods`, huonoimmasta parhaaseen: Onki, Hiilikuituvapa, Kultainen vapa,
  Merenkuninkaan vapa): sankari käyttää aina parasta onkeaan. Parempi onki antaa enemmän aikaa
  nykäistä (`biteWindowMs`), kala nappaa nopeammin (`biteDelayFactor`) ja harvinaisten saaliiden
  (`rare: true`) painot kerrotaan (`rareMultiplier`).
  **Syötit** (`FISHING.baits`: Mato, Kärpänen, Katkarapu, Kiiltävä uistin): jokaisella on oma
  saalistaulukkonsa (painot yhteensä 100). Syötti valitaan repun SYÖTIKSI-napista
  (`GameState.bait`, `logic/fishing-gear.ts`); jos valittu loppuu, käytetään ensimmäistä listan
  syöttiä, jota repussa on. Saaliit: kalat (Ahven, Hauki, Taimen, Lohi, Kultakala, `kind: 'food'`),
  harvinaiset varusteet (Kalan suomupanssari, Helmikoru, vain kerran) ja viholliset (hai,
  jättimustekala), joiden kanssa taistelu alkaa rantataustalla omalla aloitustekstillä
  (`EnemyDef.backdrop`, `logic/fishing.ts` `isFishedEnemy`). Ruoka syödään repusta SYÖ-napista;
  taistelun JUOMA-nappi käyttää vain juomia. Kalat voi myydä kauppiaalle.
  Säännöt `logic/fishing.ts` (heitto, nykäisy ja saaliin arvonta, aika annetaan ulkoa) ja
  `logic/fishing-gear.ts` (onki ja syötti), kartalla `systems/fishing-control.ts`, lisätieto
  repussa ja kaupassa `ui/fishing-detail.ts`. Vanhassa tallennuksessa syöttiä ei ole valittu
  (`bait: null`), joten `SAVE_VERSION`ia ei tarvinnut nostaa.
- **Pudotukset:** vihollisella on `drops: [{ item, chance }]` (`data/enemies.ts`). Jokainen
  arvotaan voitossa erikseen (`logic/drops.ts`); varustetta, joka pelaajalla jo on, ei pudoteta
  uudelleen. Voittoruudulla esineen kuva ponnahtaa ja teksti "Löysit: Peikon nuija!".
- **Tallennus:** kolme tallennuspaikkaa selaimen `localStorage`ssa, ei palvelinta, ei
  kirjautumista, ei henkilötietoja. Pelin aikana tallennetaan paikkakunnassa TALLENNA-napista,
  alkuruudun LATAA-napista ladataan. Tallennus on JSON: versio (`SAVE_VERSION`,
  `config/persistence.ts`), aika, paikkakunta ja `GameState`. Muoto ja versiomuunnokset
  `logic/save-format.ts`, tarkistus `logic/save-validate.ts` (rikkinäinen tai muokattu tallennus
  ei kaada peliä), paikat `logic/save-slots.ts`. Logiikka käyttää `KeyValueStore`-rajapintaa,
  joten testit ajetaan ilman selainta (`MemoryStore`). **Kun `GameState` muuttuu**, lisää uusi
  kenttä niin, että vanha tallennus latautuu (oletusarvo `save-validate.ts`:ssä), tai nosta
  `SAVE_VERSION` ja lisää muunnos `SAVE_MIGRATIONS`-listaan.
- **Asetukset:** valon määrä (CSS `brightness` pelin canvasiin) ja äänet (Phaserin
  äänenvoimakkuus ja mykistys) sekä kieli. Säännöt `logic/settings.ts`, käyttöönotto
  `systems/game-settings.ts`, rajat `config/persistence.ts`.
- **Kielet:** suomi (oletus) ja englanti. Asetuksissa on napit SUOMI ja ENGLISH, kumpikin
  omalla kielellään. Valinta on asetuksissa (`Settings.language`), ei tallennuksissa, joten
  kielen vaihto ei koske tallennettuja pelejä, ja vanhat asetukset ilman kieltä ovat suomeksi.
  Koodi käyttää aina `TEXT`iä (`i18n/text.ts`), joka hakee tekstin sillä hetkellä valitusta
  kielestä. Siksi tekstiä ei saa tallentaa tiedoston ylätasolle (`const X = TEXT.y`), vaan se
  haetaan vasta piirrettäessä. Asetusnäkymä piirretään kielen vaihtuessa alusta.
  Tekstit ovat `i18n/fi.ts`:ssä ja `i18n/en.ts`:ssä; TypeScript ja `tests/i18n.test.ts`
  varmistavat, että molemmissa on samat avaimet. Vihollisten, esineiden ja sankarin nimet
  haetaan `TEXT.names`in kautta: suomeksi data-tiedostosta, englanniksi `i18n/en-content.ts`:stä.
  Paikkakunnat ovat samannimisiä, mutta suomen sijamuoto ("Tampereella") tulee
  `TownDef.nameAt`ista. Päivämäärät kulkevat osina (`i18n/date-parts.ts`), ja kumpikin kieli
  kirjoittaa ne omalla tavallaan. PWA-manifestin kuvaus on vain suomeksi.
- **Pelaajalaskuri:** alkuruudun ja kartan vasemmassa alakulmassa "Pelaajia nyt: 3".
  Peli avaa yhden WebSocket-yhteyden palvelimeen (`worker/presence`, Cloudflare), joka laskee
  avoimet yhteydet. Ei tunnisteita, evästeitä eikä tallennettua tietoa. Toteutus on
  `net/presence.ts`-rajapinnan takana, joten palvelun voi vaihtaa. Ilman osoitetta
  (`VITE_PRESENCE_URL`) laskuri on piilossa. Pystytysohje: `docs/PELAAJALASKURI.md`.
- **Sankarin talo ja 10 parhaan lista:** Kotirannan laidalla (ruutu 83, 95, `data/house.ts`)
  on sankarin oma talo, sininen katto ja nimi "Talosi". Talon ovella oikean alakulman pinoon tulee
  TALO-nappi (`systems/house-door.ts`, paikka 1, koska KYKYPISTEET näkyy vain paikkakunnan
  ruudussa). Talo (`scenes/house-scene.ts`) avautuu kartan päälle kuten luola: vasemmalla
  sankari pokaalin alla ja oma sija, oikealla koko pelin 10 parhaan lista (`ui/leaderboard-list.ts`).
  Paremmuus ratkeaa KP:stä (taso lasketaan niistä), tasatilanteessa ensin perille ehtinyt.
  Talo hakee listan avautuessaan. LISÄÄ TULOKSENI -nappi (jonka yllä kerrotaan, että nimimerkki
  näkyy kaikille) lähettää palvelimelle sankarin satunnaisen tunnisteen
  (`GameState.heroId`, puuttuva = uusi tunniste, joten `SAVE_VERSION`ia ei tarvinnut nostaa),
  nimimerkin ja KP:t, ja saa takaisin listan ja oman sijan. Palvelin on sama Cloudflare Worker
  kuin pelaajalaskurilla (`worker/presence`, `LeaderboardRoom`, osoite `/leaderboard`), ja osoite
  johdetaan `VITE_PRESENCE_URL`ista, joten uutta asetusta ei tarvita. Nimimerkki siistitään kuten
  hahmonluonnissa, ja kirosanat (`data/blocked-names.ts`) korvataan oletusnimellä sekä
  palvelimella että pelissä. Säännöt `logic/leaderboard.ts` ja `logic/leaderboard-name.ts`,
  yhteys `net/leaderboard.ts`. Ilman palvelinta talossa lukee "Lista ei ole vielä käytössä".
  Pystytys ja rajoitukset: `docs/PELAAJALASKURI.md`.
- **Äänet:** ääniefektit tehdään koodilla Web Audiolla (`data/sounds.ts` + `systems/sound-fx.ts`),
  joten tiedostoja ei tarvita. Ne kulkevat Phaserin äänijärjestelmän läpi, jolloin asetusten
  voimakkuus koskee niitä. Nappien painallus, osumat, voitto, tason nousu ja tallennus soivat.

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
2. **Tekstit `i18n/fi.ts`:ään ja `i18n/en.ts`:ään.** Ei kovakoodattuja tekstejä muualle.
3. **Luvut `config/`- tai `data/`-kansioon.** Ei "maagisia numeroita" keskelle koodia.
4. **Yksi asia per tiedosto.** Tiedoston nimi kertoo sisällön (`kebab-case.ts`).
5. **Logiikka testataan.** Uusi kaava tai sääntö `logic/`-kansioon + testi `tests/`-kansioon.
6. **Sisältötesti suojaa dataa.** `tests/content.test.ts` tarkistaa, että tunnisteet ovat
   uniikkeja ja spritet olemassa. `tests/world.test.ts` tarkistaa, että paikkakunnat ja
   viholliset ovat maalla omalla alueellaan ja että kaikkialle pääsee kävellen Kotirannasta.
7. **Kun raja tulee vastaan, jaa tiedosto.** Rajoja ei nosteta eikä `eslint-disable`a käytetä.

## 6. Laatuportit

`npm run check` ajaa saman kuin CI: Prettier → ESLint → TypeScript → Vitest. Lisäksi CI ajaa
`npm run build`. Muutos on valmis vasta, kun kaikki menevät läpi.

Manuaalinen testaus: `npm run dev`, avaa näkyvä osoite puhelimen Chromessa samassa wifissä,
tai pelaa GitHub Pagesista mainiin yhdistämisen jälkeen.

## 7. Tiekartta

**Vaihe 0 – Runko.** Vite + TS + Phaser 4, lintteri, testit, CI, julkaisu. ✓

**Kartta ja vuoropohjainen taistelu.** ✓ Ensin Suomen kartta oikeista koordinaateista, nyt
iso saari: 14 paikkakuntaa tieverkolla, 37 vihollista kymmentä lajia, vuoropohjainen taistelu,
kokemustasot, parannusjuomat ja lepo paikkakunnissa.

**Vaihe 1 – Pelituntuma.**

- Hahmojen kävelyanimaatiot ja suunta (4 suuntaa)
- Vahinkonumerot, ruudun tärähdys ✓, äänitehosteet ✓ (`systems/sound-fx.ts`)
- Pienkartta saaresta

**Vaihe 2 – Seikkailu.**

- Kauppa ✓ (kulkeva kauppias Kaapo ja kolikot), kalastus ✓, paikkakuntien sisänäkymät (majatalo) omina sceneinä
- Inventaario ja aseet ✓ (reppu, varusteet ja pudotukset), vihollisten erikoisiskut
- NPC-hahmot ja tehtävät ✓ (Jussi ja Ossi Ketola, `data/npcs.ts`, `data/quests.ts`)
- Tallennus `localStorage`en ✓ (alkuruutu, asetukset ja kolme tallennuspaikkaa)

**Vaihe 3 – Sisältö ja viimeistely.**

- Pomotaistelut ✓ (loppuboss Peikkokuningas, erikoisliikkeet `EnemyDef.moves`)
- Oikeat pikselikuvat ja musiikki
- Asennus puhelimeen (PWA) ✓, offline-tila (`vite-plugin-pwa`) myöhemmin, musiikki (asetukset ✓)

## 8. Turvallisuus ja kohderyhmä

- Ei mainoksia, ostoja, chattia, kirjautumista eikä henkilötietojen keruuta.
- Väkivalta on piirrettyä ja fantasiaa (limat, hirviöt): ei verta.
- Peli on staattinen sivusto. Ainoa palvelin on valinnainen, anonyymi pelaajalaskuri, joka
  laskee vain avoimet yhteydet eikä tallenna mitään (`docs/PELAAJALASKURI.md`).
