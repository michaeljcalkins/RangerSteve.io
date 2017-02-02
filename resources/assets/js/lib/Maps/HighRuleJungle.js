import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 6000
const WORLD_HEIGHT = 2975

export function preload () {
  this.game.load.image('background', '/maps/high-rule-jungle/background.jpg', true)
  this.game.load.image('bridge', '/maps/high-rule-jungle/bridge.png', true)
  this.game.load.image('tower-rail', '/maps/high-rule-jungle/tower-rail.png', true)
  this.game.load.tilemap('tilemap', '/maps/high-rule-jungle/high-rule-jungle.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
}

export function createOverlays () {
  this.bridge = this.game.add.sprite(1313, 1240, 'bridge')
  this.towerRail = this.game.add.sprite(4230, 1140, 'tower-rail')
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  let background = this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')
    // FireFox allows a max width of 4000px for this image
  background.scale.y = 1.5
  background.scale.x = 1.5

  this.groundSprite = this.game.add.sprite(0, WORLD_HEIGHT - 10, 'ground')
  this.groundSprite.alpha = 0
  this.groundSprite.width = WORLD_WIDTH
  this.groundSprite.height = 10
  this.game.physics.arcade.enable(this.groundSprite)
  this.game.physics.enable(this.groundSprite, window.Phaser.Physics.ARCADE)
  this.groundSprite.enableBody = true
  this.groundSprite.physicsBodyType = window.Phaser.Physics.ARCADE
  this.groundSprite.body.immovable = true
  this.groundSprite.body.allowGravity = false

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

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.HighRuleJungle)
}

export function update () {
  this.game.physics.arcade.overlap(window.RS.player, this.groundSprite, () => {
    KillCurrentPlayer.call(this)
  })
}
