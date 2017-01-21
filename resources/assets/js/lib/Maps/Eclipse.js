import sample from 'lodash/sample'

import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3200
const WORLD_HEIGHT = 1920

const SPAWN_POINTS = [
  { x: 346, y: 1400 },
  { x: 768, y: 1271 },
  { x: 575, y: 1216 },
  { x: 976, y: 1207 },
  { x: 1047, y: 1446 },
  { x: 572, y: 1786 },
  { x: 123, y: 1463 },
  { x: 368, y: 841 },
  { x: 642, y: 790 },
  { x: 2517, y: 342 },
  { x: 2698, y: 362 },
  { x: 2915, y: 432 },
  { x: 3014, y: 89 },
  { x: 2868, y: 783 },
  { x: 2685, y: 890 },
  { x: 713, y: 1813 },
  { x: 1972, y: 1429 },
  { x: 2395, y: 1454 },
  { x: 2145, y: 1204 },
  { x: 2385, y: 1150 },
  { x: 1888, y: 1532 },
  { x: 2038, y: 1802 },
  { x: 2460, y: 571 },
  { x: 642, y: 139 },
  { x: 337, y: 1820 },
]

export function getRandomSpawnPoint () {
  return sample(SPAWN_POINTS)
}

export function getSpawnPoints () {
  return SPAWN_POINTS
}

export function preload () {
  this.game.load.image('background', '/maps/eclipse/background.jpg', true)
  this.game.load.tilemap('tilemap', '/maps/eclipse/tilemap.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
}

export function createOverlays () {}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  // Add the demo tilemap and attach a tilesheet for its collision layer
  this.map = this.game.add.tilemap('tilemap')
  this.map.addTilesetImage('collision', 'ninja-tiles32')

  // Create a TilemapLayer object from the collision layer of the map
  this.ground = this.map.createLayer('collision')
  this.ground.renderSettings.enableScrollDelta = false
  if (!GameConsts.DEBUG) this.ground.alpha = 0

  // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
  // preparing slope data for each of tile in the layer
  this.game.slopes.convertTilemapLayer(this.ground, GameConsts.SLOPE_TILES)

  // Enable collision between tile indexes 2 and 34
  this.map.setCollisionBetween(2, 34, true, 'collision')

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, SPAWN_POINTS)
}

export function update () {
}
