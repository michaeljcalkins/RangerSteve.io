import GameConsts from '../GameConsts'

const WORLD_WIDTH = 4800
const WORLD_HEIGHT = 3744
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT

const SPAWN_POINTS = [
    { x: 890, y: 1180 },
    { x: 1500, y: 1180 },
    { x: 1550, y: 1500 },
    { x: 860, y: 1500 },
    { x: 1200, y: 2000 },
    { x: 1600, y: 2360 },
    { x: 1050, y: 3000 },
    { x: 2400, y: 2015 },
    { x: 3150, y: 1760 },
    { x: 4450, y: 2700 },
    { x: 2530, y: 2750 },
    { x: 4250, y: 1770 },
    { x: 3570, y: 3270 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/punk-fallout/background1.png', true)
    this.load.tilemap('tilemap', '/maps/punk-fallout/punk-fallout.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32);
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.game.add.tileSprite(0, 0, BG_WIDTH, BG_HEIGHT, 'background')

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.add.tilemap('tilemap')
    this.map.addTilesetImage('collision', 'ninja-tiles32')

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
