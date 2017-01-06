import sample from 'lodash/sample'

import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3232
const WORLD_HEIGHT = 2400

const SPAWN_POINTS = [
    { x: 1140, y: 2190 },
    { x: 1615, y: 1735 },
    { x: 2070, y: 2185 },
    { x: 770, y: 1515 },
    { x: 1697, y: 1263 },
    { x: 1535, y: 1260 },
    { x: 460, y: 1610 },
    { x: 140, y: 1320 },
    { x: 795, y: 1325 },
    { x: 440, y: 330 },
    { x: 65, y: 620 },
    { x: 2440, y: 1520 },
    { x: 2420, y: 1325 },
    { x: 2765, y: 1615 },
    { x: 3085, y: 1315 },
    { x: 2760, y: 335 },
    { x: 3040, y: 900 },
    { x: 1590, y: 490 },
    { x: 3155, y: 620 },
    { x: 1624, y: 913 },
    { x: 154, y: 908 },
    { x: 2562, y: 715 },
    { x: 666, y: 716 },
]

export function getRandomSpawnPoint() {
  return sample(SPAWN_POINTS)
}

export function getSpawnPoints() {
  return SPAWN_POINTS
}

export function preload() {
  this.game.load.image('background', '/maps/evil-underground/background.jpg', true)
  this.game.load.tilemap('tilemap', '/maps/evil-underground/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
}

export function createOverlays() {}

export function create() {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  this.groundSprite = this.game.add.sprite(0, WORLD_HEIGHT - 90, 'ground')
  this.groundSprite.alpha = 0
  this.groundSprite.width = WORLD_WIDTH
  this.groundSprite.height = 90
  this.game.physics.arcade.enable(this.groundSprite)
  this.game.physics.enable(this.groundSprite, Phaser.Physics.ARCADE)
  this.groundSprite.enableBody = true
  this.groundSprite.physicsBodyType = Phaser.Physics.ARCADE
  this.groundSprite.body.immovable = true
  this.groundSprite.body.allowGravity = false

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

export function createLedges() {
}

export function update() {
  const store = this.game.store

  if (store.getState().player.health <= 0) return

  this.game.physics.arcade.overlap(RS.player, this.groundSprite, () => {
    KillCurrentPlayer.call(this)
  })
}
