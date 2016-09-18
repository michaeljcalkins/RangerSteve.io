import GameConsts from '../GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 400
const WORLD_HEIGHT = 400

const SPAWN_POINTS = [
    { x: 1, y: 1 },
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.tilemap('tilemap', '/maps/punk-city/punk-city.json', null, Phaser.Tilemap.TILED_JSON)
    this.load.spritesheet('tiles', '/maps/punk-city/tiles.png', 24, 24)
    this.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.add.tilemap('tilemap')
    this.map.addTilesetImage('tiles', 'tiles')
    this.map.addTilesetImage('collision', 'ninja-tiles24')

    // Create a TilemapLayer object from the collision layer of the map
    this.tiles = this.map.createLayer('tiles')
    this.ground = this.map.createLayer('collision')
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