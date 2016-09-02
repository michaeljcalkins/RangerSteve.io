import GameConsts from '../GameConsts'

const WORLD_WIDTH = 3500
const WORLD_HEIGHT = 1500
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT

const SPAWN_POINTS = [
    { x: 3000, y: 460 },
    { x: 2800, y: 460 },
    { x: 2580, y: 930 },
    { x: 2500, y: 1200 },
    { x: 2860, y: 880 },
    { x: 2180, y: 1050 },
    { x: 990, y: 1200 },
    { x: 650, y: 1150 },
    { x: 900, y: 930 },
    { x: 540, y: 900 },
    { x: 375, y: 710 },
    { x: 550, y: 890 },
    { x: 680, y: 350 },
    { x: 440, y: 390 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/dark-forest/background.png', true)
    this.load.tilemap('tilemap', '/maps/dark-forest/dark-forest.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
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
