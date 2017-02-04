import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3232
const WORLD_HEIGHT = 2400

export function preload () {
  this.game.load.image('background', '/maps/evil-underground/background.jpg', true)
  this.game.load.tilemap('tilemap', '/maps/evil-underground/tilemap.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  window.RS.groundSprite = this.game.add.sprite(0, WORLD_HEIGHT - 90, 'ground')
  window.RS.groundSprite.alpha = 0
  window.RS.groundSprite.width = WORLD_WIDTH
  window.RS.groundSprite.height = 90
  this.game.physics.arcade.enable(window.RS.groundSprite)
  this.game.physics.enable(window.RS.groundSprite, window.Phaser.Physics.ARCADE)
  window.RS.groundSprite.enableBody = true
  window.RS.groundSprite.physicsBodyType = window.Phaser.Physics.ARCADE
  window.RS.groundSprite.body.immovable = true
  window.RS.groundSprite.body.allowGravity = false

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

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.EvilUnderground)
}

export function update () {
  this.game.physics.arcade.overlap(window.RS.player, window.RS.groundSprite, () => {
    KillCurrentPlayer.call(this)
  })
}
