import sample from 'lodash/sample'

import GameConsts from '../GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3232
const WORLD_HEIGHT = 2400

const SPAWN_POINTS = [
    { x: 2900, y: 2500 },
    { x: 2300, y: 2260 },
    { x: 1500, y: 2140 },
    { x: 2600, y: 1850 },
    { x: 2900, y: 1700 },
    { x: 3100, y: 1420 },
    { x: 3730, y: 1420 },
    { x: 3330, y: 1120 },
    { x: 2300, y: 1150 },
    { x: 1420, y: 1640 },
    { x: 1650, y: 1460 },
    { x: 4350, y: 1090 },
    { x: 1000, y: 1270 },
    { x: 1500, y: 1220 },
    { x: 400, y: 1270 },
    { x: 5100, y: 800 },
    { x: 5100, y: 1110 },
    { x: 5500, y: 1400 },
    { x: 4900, y: 1420 },
    { x: 2290, y: 730 },
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
