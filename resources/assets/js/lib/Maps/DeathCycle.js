import sample from 'lodash/sample'

import GameConsts from '../GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 110 * 32
const WORLD_HEIGHT = 80 * 32

const SPAWN_POINTS = [
    { x: 600, y: 710 },
    { x: 2450, y: 1100 },
    { x: 3350, y: 1290 },
    { x: 960, y: 690 },

    { x: 2400, y: 620 },
    { x: 1380, y: 1130 },
    { x: 2670, y: 1540 },
    { x: 650, y: 1950 },
    { x: 360, y: 1480 },
    { x: 1450, y: 2230 },
    { x: 2300, y: 1920 },
    { x: 2730, y: 1900 },
    { x: 2090, y: 1580 },
    { x: 870, y: 1350 },
    { x: 1700, y: 1820 },
    { x: 2030, y: 1050 },
    { x: 230, y: 810 },
    { x: 2730, y: 710 },
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
