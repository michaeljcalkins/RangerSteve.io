import sample from 'lodash/sample'

import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 100 * 32
const WORLD_HEIGHT = 75 * 32

const SPAWN_POINTS = [
    { x: 600, y: 380 },
    { x: 2760, y: 1030 },
    { x: 1850, y: 160 },
    { x: 1310, y: 160 },
    { x: 2440, y: 390 },
    { x: 1530, y: 585 },
    { x: 425, y: 110 },
    { x: 650, y: 2080 },
    { x: 1230, y: 2080 },
    { x: 1770, y: 2080 },
    { x: 2300, y: 2080 },
    { x: 2730, y: 2080 },
    { x: 2380, y: 1640 },
    { x: 1360, y: 1750 },
    { x: 1700, y: 1750 },
    { x: 1600, y: 1030 },
    { x: 660, y: 1640 },
    { x: 2730, y: 110 }
]

export function getRandomSpawnPoint () {
  return sample(SPAWN_POINTS)
}

export function getSpawnPoints () {
  return SPAWN_POINTS
}

export function preload () {
  this.game.load.image('background', '/maps/punk-loop/background.png')
  this.game.load.tilemap('tilemap', '/maps/punk-loop/punk-loop.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('tiles', '/maps/punk-loop/tiles.png', 24, 24)
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 24, 24)
}

export function createOverlays () {
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  this.background = this.game.add.sprite(0, 0, 'background')
  this.background.scale.setTo(3.4)

    // Add the demo tilemap and attach a tilesheet for its collision layer
  this.map = this.game.add.tilemap('tilemap')
  this.map.addTilesetImage('tiles', 'tiles')
  this.map.addTilesetImage('collision', 'ninja-tiles32')

    // Create a TilemapLayer object from the collision layer of the map
  window.RS.tiles = this.map.createLayer('tiles')
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
