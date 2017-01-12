import sample from 'lodash/sample'

import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3500
const WORLD_HEIGHT = 1500

const SPAWN_POINTS = [
  { x: 93, y: 176 },
  { x: 510, y: 456 },
  { x: 1031, y: 271 },
  { x: 1383, y: 282 },
  { x: 537, y: 1280 },
  { x: 712, y: 993 },
  { x: 1148, y: 760 },
  { x: 1676, y: 618 },
  { x: 1970, y: 235 },
  { x: 2473, y: 237 },
  { x: 1502, y: 1133 },
  { x: 2157, y: 948 },
  { x: 969, y: 1350 },
  { x: 1916, y: 631 },
  { x: 2591, y: 750 },
  { x: 3333, y: 998 },
  { x: 3105, y: 308 },
  { x: 2837, y: 1290 },
  { x: 2479, y: 1323 },
  { x: 1970, y: 1114 },
  { x: 2189, y: 220 },
]

export function getRandomSpawnPoint() {
  return sample(SPAWN_POINTS)
}

export function getSpawnPoints() {
  return SPAWN_POINTS
}

export function preload() {
  this.game.load.image('background', '/maps/dark-forest/background.jpg', true)
  this.game.load.tilemap('tilemap', '/maps/dark-forest/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
}

export function createOverlays() {
}

export function create() {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

    // Add the demo tilemap and attach a tilesheet for its collision layer
  this.map = this.game.add.tilemap('tilemap')
  this.map.addTilesetImage('collision', 'ninja-tiles32')

    // Create a TilemapLayer object from the collision layer of the map
  this.ground = this.map.createLayer('collision')
  this.ground.renderSettings.enableScrollDelta = false
  if (! GameConsts.DEBUG) this.ground.alpha = 0

  // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
  // preparing slope data for each of tile in the layer
  this.game.slopes.convertTilemapLayer(this.ground, GameConsts.SLOPE_TILES)

  // Enable collision between tile indexes 2 and 34
  this.map.setCollisionBetween(2, 34, true, 'collision')

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, SPAWN_POINTS)
}

export function update() {
}
