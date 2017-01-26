import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3600
const WORLD_HEIGHT = 2280

export function preload () {
  this.game.load.image('background', '/maps/punk-fallout/background.png', true)
  this.game.load.tilemap('tilemap', '/maps/punk-fallout/punk-fallout.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  // Add the demo tilemap and attach a tilesheet for its collision layer
  this.map = this.game.add.tilemap('tilemap')
  this.map.addTilesetImage('collision', 'ninja-tiles24')

  // Create a TilemapLayer object from the collision layer of the map
  this.ground = this.map.createLayer('collision')
  this.ground.renderSettings.enableScrollDelta = false
  if (!GameConsts.DEBUG) this.ground.alpha = 0

  // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
  // preparing slope data for each of tile in the layer
  this.game.slopes.convertTilemapLayer(this.ground, GameConsts.SLOPE_TILES)

  // Enable collision between tile indexes 2 and 34
  this.map.setCollisionBetween(2, 34, true, 'collision')

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.PunkFallout)
}
