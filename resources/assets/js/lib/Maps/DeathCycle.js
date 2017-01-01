import sample from 'lodash/sample'

import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 110 * 32
const WORLD_HEIGHT = 80 * 32

const SPAWN_POINTS = [
    { x: 797, y: 2253 },
    { x: 1595, y: 1641 },
    { x: 872, y: 1580 },
    { x: 2261, y: 2350 },
    { x: 2016, y: 2003 },
    { x: 2696, y: 1550 },
    { x: 2333, y: 1107 },
    { x: 1853, y: 1071 },
    { x: 998, y: 1167 },
    { x: 1078, y: 585 },
    { x: 501, y: 1555 },
    { x: 1730, y: 251 },
    { x: 2342, y: 616 },
    { x: 3019, y: 1461 },
    { x: 2957, y: 2359 },
]

export function getRandomSpawnPoint() {
    return sample(SPAWN_POINTS)
}

export function getSpawnPoints() {
    return SPAWN_POINTS
}

export function preload() {
    this.game.load.image('background', '/maps/death-cycle/background.png')
    this.game.load.tilemap('tilemap', '/maps/death-cycle/death-cycle.json', null, Phaser.Tilemap.TILED_JSON)
    this.game.load.spritesheet('tiles', '/maps/death-cycle/tiles.png', 24, 24)
    this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 24, 24)
}

export function createOverlays() {}

export function create() {
    this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.background = this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "background")

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.game.add.tilemap('tilemap')
    this.map.addTilesetImage('tiles', 'tiles')
    this.map.addTilesetImage('collision', 'ninja-tiles32')

    // Create a TilemapLayer object from the collision layer of the map
    RS.tiles = this.map.createLayer('tiles')
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

export function update() {}
