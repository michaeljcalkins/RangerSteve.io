import GameConsts from '../GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 100 * 24
const WORLD_HEIGHT = 75 * 24

const SPAWN_POINTS = [
    { x: 600, y: 340 },
    { x: 1110, y: 500 },
    { x: 1850, y: 340 },
    { x: 1310, y: 470 },
    { x: 2070, y: 900 },
    { x: 1200, y: 1130 },
    { x: 270, y: 800 },
    { x: 550, y: 1300 },
    { x: 1880, y: 1280 },
    { x: 1240, y: 1490 },
    { x: 1680, y: 1660 },
    { x: 660, y: 1660 },
    { x: 430, y: 1500 },
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.game.load.image('background', '/maps/punk-loop/background.png')
    this.game.load.tilemap('tilemap', '/maps/punk-loop/punk-loop.json', null, Phaser.Tilemap.TILED_JSON)
    this.game.load.spritesheet('tiles', '/maps/punk-loop/tiles2.png', 24, 24)
    this.game.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.background = this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "background")

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.add.tilemap('tilemap')
    this.map.addTilesetImage('tiles', 'tiles')
    this.map.addTilesetImage('collision', 'ninja-tiles24')

    // Create a TilemapLayer object from the collision layer of the map
    this.tiles = this.map.createLayer('tiles')
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
