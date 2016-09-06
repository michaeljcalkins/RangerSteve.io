import GameConsts from '../GameConsts'

const WORLD_WIDTH = 2625
const WORLD_HEIGHT = 1125

const SPAWN_POINTS = [
    { x: 1900, y: 900 },
    { x: 1650, y: 770 },
    { x: 1750, y: 550 },
    { x: 2150, y: 650 },
    { x: 1250, y: 380 },
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/dark-forest/background.png', true)
    this.load.tilemap('tilemap', '/maps/dark-forest/dark-forest.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
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
