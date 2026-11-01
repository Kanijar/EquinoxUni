# Equinox Universe

Pixelart 2D -seikkailu- ja taistelupeli, jota pelataan Android-puhelimen selaimella.

## Pelaaminen

- Valmis versio: https://kanijar.github.io/EquinoxUni/ (kun GitHub Pages on otettu käyttöön)
- Käännä puhelin vaakatasoon. Seikkailu alkaa Kotirannasta: liiku saaren kartalla vetämällä
  sormea ruudulla. Kun vihollinen saa sinut kiinni, alkaa vuoropohjainen taistelu, jossa valitset
  **HYÖKKÄÄ**, **PUOLUSTA**, **JUOMA** tai **PAKENE**. Paikkakunnissa elämä palautuu.
- Tietokoneella: nuolet tai WASD liikkuu, taistelussa napautetaan nappeja hiirellä.

## Kehittäminen

Tarvitset [Node.js](https://nodejs.org/) 22 -version.

```bash
npm install
npm run dev     # avaa näkyvän osoitteen selaimessa tai puhelimessa samassa wifissä
npm run check   # tarkistukset ennen kuin muutos on valmis
```

- Ohjeet tekoälylle (ja ihmisille): [CLAUDE.md](CLAUDE.md)
- Arkkitehtuuri ja suunnitelma: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Pelaajalaskurin pystytys: [docs/PELAAJALASKURI.md](docs/PELAAJALASKURI.md)
