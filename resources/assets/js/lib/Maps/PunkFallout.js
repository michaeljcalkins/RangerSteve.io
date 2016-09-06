import GameConsts from '../GameConsts'

const WORLD_WIDTH = 3600
const WORLD_HEIGHT = 2808

const SPAWN_POINTS = [
    { x: 900, y: 1500 },
    { x: 1200, y: 1150 },
    { x: 600, y: 1150 },
    { x: 600, y: 850 },
    { x: 1150, y: 870 },
    { x: 2350, y: 1300 },
    { x: 3170, y: 1300 },
    { x: 2900, y: 2450 },
    { x: 3350, y: 2050 },
    { x: 1900, y: 2050 },
    { x: 800, y: 450 },
    { x: 1270, y: 1700 },
    { x: 1750, y: 560 },
    { x: 2150, y: 300 },
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/punk-fallout/background.png', true)
    this.load.tilemap('tilemap', '/maps/punk-fallout/punk-fallout.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24);
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.add.tilemap('tilemap')
    this.map.addTilesetImage('collision', 'ninja-tiles24')

    // Create a TilemapLayer object from the collision layer of the map
    this.ground = this.map.createLayer('collision')
    if (! GameConsts.DEBUG) this.ground.alpha = 0

    // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
    // preparing slope data for each of tile in the layer
    this.game.slopes.convertTilemapLayer(this.ground, GameConsts.SLOPE_TILES)

    // Enable collision between tile indexes 2 and 34
    this.map.setCollisionBetween(2, 34, true, 'collision')
}

export function update() {
}
