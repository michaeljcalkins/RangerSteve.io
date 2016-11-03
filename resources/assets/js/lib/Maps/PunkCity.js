import sample from 'lodash/sample'

import GameConsts from '../GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 4800
const WORLD_HEIGHT = 1680

const SPAWN_POINTS = [
    { x: 650, y: 420 },
    { x: 1440, y: 480 },
    { x: 470, y: 650 },
    { x: 470, y: 870 },
    { x: 880, y: 650 },
    { x: 880, y: 870 },

    { x: 4090, y: 420 },
    { x: 3430, y: 480 },
    { x: 4290, y: 650 },
    { x: 4290, y: 870 },
    { x: 3940, y: 650 },
    { x: 3940, y: 870 },

    { x: 3200, y: 940 },
    { x: 830, y: 1080 },
    { x: 1940, y: 370 },
    { x: 3960, y: 1080 },
    { x: 2400, y: 320 },
    { x: 2880, y: 370 },
    { x: 220, y: 1080 },
    { x: 1590, y: 940 },
]

export function getRandomSpawnPoint() {
    return sample(SPAWN_POINTS)
}

export function getSpawnPoints() {
    return SPAWN_POINTS
}

export function preload() {
    this.game.load.image('background', '/maps/punk-city/concrete_wall.png')
    this.game.load.tilemap('tilemap', '/maps/punk-city/punk-city.json', null, Phaser.Tilemap.TILED_JSON)
    this.game.load.spritesheet('tiles', '/maps/punk-city/tiles.png', 24, 24)
    this.game.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
}

export function createOverlays() {
}

export function create() {
    this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.background = this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "background")

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.game.add.tilemap('tilemap')
    this.map.addTilesetImage('tiles', 'tiles')
    this.map.addTilesetImage('collision', 'ninja-tiles24')

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

export function update() {
}
