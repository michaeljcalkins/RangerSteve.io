import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3488
const WORLD_HEIGHT = 1696

export function preload () {
  this.game.load.image('background', '/maps/dark-forest/background.jpg', true)
  this.game.load.tilemap('tilemap', '/maps/dark-forest/tilemap.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  // Add the demo tilemap and attach a tilesheet for its collision layer
  window.RS.map = this.game.add.tilemap('tilemap')
  window.RS.map.addTilesetImage('collision', 'ninja-tiles32')

  // Create a TilemapLayer object from the collision layer of the map
  window.RS.ground = window.RS.map.createLayer('collision')
  window.RS.ground.renderSettings.enableScrollDelta = false
  if (!GameConsts.DEBUG) window.RS.ground.alpha = 0

  // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
  // preparing slope data for each of tile in the layer
  this.game.slopes.convertTilemapLayer(window.RS.ground, GameConsts.SLOPE_TILES)

  // Enable collision between tile indexes 2 and 34
  window.RS.map.setCollisionBetween(2, 34, true, 'collision')

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.DarkForest)
}
