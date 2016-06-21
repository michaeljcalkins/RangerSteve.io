import GameConsts from '../GameConsts'

const WORLD_WIDTH = 3500
const WORLD_HEIGHT = 1500
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT

const SPAWN_POINTS = [
    { x: 3000, y: 460 },
    // { x: 200, y: 600 },
    // { x: 1500, y: 550 },
    // { x: 2300, y: 555 },
    // { x: 1150, y: 730 },
    // { x: 1680, y: 385 },
    // { x: 3450, y: 750 },
    // { x: 55, y: 314 },
    // { x: 3950, y: 340 },
    // { x: 430, y: 800 },
    // { x: 3455, y: 800 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/dark-forest/background.jpg', true)
    this.load.tilemap('tilemap', '/maps/dark-forest/dark-forest.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32);
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.background = this.add.sprite(0, 0, 'background')
    this.background.width = BG_WIDTH
    this.background.height = BG_HEIGHT

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.add.tilemap('tilemap');
    this.map.addTilesetImage('collision', 'ninja-tiles32');

    // Create a TilemapLayer object from the collision layer of the map
    this.ground = this.map.createLayer('collision')
    if (! GameConsts.DEBUG) this.ground.alpha = 0

    // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
    // preparing slope data for each of tile in the layer
    this.game.slopes.convertTilemapLayer(this.ground, {
        2:  'FULL',
        3:  'HALF_BOTTOM_LEFT',
        4:  'HALF_BOTTOM_RIGHT',
        6:  'HALF_TOP_LEFT',
        5:  'HALF_TOP_RIGHT',
        15: 'QUARTER_BOTTOM_LEFT_LOW',
        16: 'QUARTER_BOTTOM_RIGHT_LOW',
        17: 'QUARTER_TOP_RIGHT_LOW',
        18: 'QUARTER_TOP_LEFT_LOW',
        19: 'QUARTER_BOTTOM_LEFT_HIGH',
        20: 'QUARTER_BOTTOM_RIGHT_HIGH',
        21: 'QUARTER_TOP_RIGHT_HIGH',
        22: 'QUARTER_TOP_LEFT_HIGH',
        23: 'QUARTER_LEFT_BOTTOM_HIGH',
        24: 'QUARTER_RIGHT_BOTTOM_HIGH',
        25: 'QUARTER_RIGHT_TOP_LOW',
        26: 'QUARTER_LEFT_TOP_LOW',
        27: 'QUARTER_LEFT_BOTTOM_LOW',
        28: 'QUARTER_RIGHT_BOTTOM_LOW',
        29: 'QUARTER_RIGHT_TOP_HIGH',
        30: 'QUARTER_LEFT_TOP_HIGH',
        31: 'HALF_BOTTOM',
        32: 'HALF_RIGHT',
        33: 'HALF_TOP',
        34: 'HALF_LEFT'
    });

    // Enable collision between tile indexes 2 and 34
    this.map.setCollisionBetween(2, 34, true, 'collision');
}

export function update() {
}
