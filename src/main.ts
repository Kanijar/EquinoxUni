import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from './config/game-config';
import { BackpackScene } from './scenes/backpack-scene';
import { BattleScene } from './scenes/battle-scene';
import { BootScene } from './scenes/boot-scene';
import { ExitScene } from './scenes/exit-scene';
import { MenuScene } from './scenes/menu-scene';
import { SavesScene } from './scenes/saves-scene';
import { SettingsScene } from './scenes/settings-scene';
import { SkillsScene } from './scenes/skills-scene';
import { VictoryScene } from './scenes/victory-scene';
import { WorldScene } from './scenes/world-scene';
import { requestPersistentStorage, watchInstallPrompt } from './systems/install-prompt';

// Pelin käynnistys. Uusi scene: luo tiedosto scenes/-kansioon ja lisää se listaan.

watchInstallPrompt();
requestPersistentStorage();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.background,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 3 },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [
    BootScene,
    MenuScene,
    WorldScene,
    BattleScene,
    VictoryScene,
    SkillsScene,
    SettingsScene,
    SavesScene,
    BackpackScene,
    ExitScene,
  ],
});
