import Phaser from 'phaser';
import { BATTLE_STAGE, PARTICLE_LIMITS } from '../../config/battle-config';
import { GAME_HEIGHT, GAME_WIDTH } from '../../config/game-config';
import type { BattleBackdropDef, BattleWeatherDef } from '../../data/types';
import { paintBackdrop } from './backdrop-painter';
import { ensurePixelTexture } from './battle-particles';

// Taistelun tausta näkymään: maalattu taustakuva (luodaan kerran ja muistetaan),
// hitaasti liikkuvat pilvet ja sää (lumisade, siitepöly tai tulikärpäset).

const BACKDROP_DEPTH = -10;
const CLOUD_DEPTH = -9;
/** Sää näkyy hahmojen edessä mutta nimikylttien, viestien ja nappien takana. */
const WEATHER_DEPTH = 400;
/** Leijuvat hiukkaset pysyvät näyttämöllä, eivät nimikylttien tai nappien päällä. */
const FLOAT_AREA = { top: 60, bottom: 190 };
const FALL_SPEED = { min: 18, max: 34 };
const FLOAT_LIFE_MS = { min: 2600, max: 4200 };

export function drawBattleBackdrop(scene: Phaser.Scene, def: BattleBackdropDef): void {
  const key = `battle-bg-${def.id}`;
  const scale = BATTLE_STAGE.backdropScale;
  if (!scene.textures.exists(key)) {
    const size = {
      width: GAME_WIDTH / scale,
      height: GAME_HEIGHT / scale,
      horizon: BATTLE_STAGE.horizonY / scale,
    };
    const canvas = scene.textures.createCanvas(key, size.width, size.height);
    if (canvas) {
      paintBackdrop(canvas.getContext(), def, size);
      canvas.refresh();
    }
  }
  scene.add.image(0, 0, key).setOrigin(0).setScale(scale).setDepth(BACKDROP_DEPTH);
  addClouds(scene);
  if (def.weather) {
    addWeather(scene, def.weather);
  }
}

function addClouds(scene: Phaser.Scene): void {
  const { sprite, scale, count, minY, maxY, minMs, maxMs, alpha } = BATTLE_STAGE.clouds;
  for (let i = 0; i < count; i++) {
    const cloud = scene.add
      .image(0, Phaser.Math.Between(minY, maxY), sprite)
      .setScale(scale)
      .setAlpha(alpha)
      .setDepth(CLOUD_DEPTH);
    const margin = cloud.displayWidth;
    const startX = ((i + Math.random() * 0.5) / count) * GAME_WIDTH;
    drift(scene, cloud, startX, { margin, msPerScreen: Phaser.Math.Between(minMs, maxMs) });
  }
}

/** Pilvi liukuu oikealle ja palaa vasemmasta reunasta uudelleen. */
function drift(
  scene: Phaser.Scene,
  cloud: Phaser.GameObjects.Image,
  fromX: number,
  speed: { readonly margin: number; readonly msPerScreen: number },
): void {
  const endX = GAME_WIDTH + speed.margin;
  cloud.setX(fromX);
  scene.tweens.add({
    targets: cloud,
    x: endX,
    duration: ((endX - fromX) / GAME_WIDTH) * speed.msPerScreen,
    onComplete: () => drift(scene, cloud, -speed.margin, speed),
  });
}

/** Lumisade tai leijuvat hiukkaset yhdellä emitterillä. Määrä on rajattu. */
function addWeather(scene: Phaser.Scene, weather: BattleWeatherDef): void {
  const count = Math.min(weather.count, PARTICLE_LIMITS.weather);
  const texture = ensurePixelTexture(scene);
  const tint = { onEmit: () => Phaser.Utils.Array.GetRandom([...weather.colors]) as number };
  if (weather.kind === 'fall') {
    const lifespan = (GAME_HEIGHT / FALL_SPEED.min) * 1000;
    scene.add
      .particles(0, -4, texture, {
        x: { min: 0, max: GAME_WIDTH },
        speedY: FALL_SPEED,
        speedX: { min: -8, max: 8 },
        lifespan,
        frequency: lifespan / count,
        maxAliveParticles: count,
        scale: { min: 0.5, max: 1 },
        tint,
        advance: lifespan,
      })
      .setDepth(WEATHER_DEPTH);
    return;
  }
  const lifespan = FLOAT_LIFE_MS.max;
  scene.add
    .particles(0, 0, texture, {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: FLOAT_AREA.top, max: FLOAT_AREA.bottom },
      speed: { min: 3, max: 10 },
      lifespan: FLOAT_LIFE_MS,
      frequency: lifespan / count,
      maxAliveParticles: count,
      scale: 0.5,
      alpha: { onEmit: () => 0, onUpdate: (_p, _k, t) => Math.sin(t * Math.PI) },
      tint,
      advance: lifespan,
    })
    .setDepth(WEATHER_DEPTH);
}
