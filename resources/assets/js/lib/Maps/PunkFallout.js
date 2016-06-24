import GameConsts from '../GameConsts'

const WORLD_WIDTH = 4800
const WORLD_HEIGHT = 3744
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT

const SPAWN_POINTS = [
    { x: 1000, y: 460 },
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
    this.load.image('background', '/images/maps/punk-fallout/background.png', true)
    this.load.image('parallax1', '/images/maps/punk-fallout/loopable/Background-Night.png', true)
    this.load.image('parallax2', '/images/maps/punk-fallout/loopable/City-Block.png', true)
    this.load.image('parallax3', '/images/maps/punk-fallout/loopable/Moon-Night.png', true)
    this.load.tilemap('tilemap', '/maps/punk-fallout/punk-fallout.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32);
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.game.stage.backgroundColor = '#03080B'

    this.parallax1 = this.add.tileSprite(0, 0, WORLD_WIDTH, 1350, 'parallax1')
    this.parallax3 = this.add.sprite(3600, 300, 'parallax3')
    this.parallax3.width = 500
    this.parallax3.height = 500
    this.parallax2 = this.add.tileSprite(0, 0, WORLD_WIDTH, 630, 'parallax2')

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
    this.parallax3.x = this.game.camera.x * 0.1 + 2700
    this.parallax3.y = this.game.camera.y * 0.1 + 1000
    this.parallax2.x = this.game.camera.x * 0.2
    this.parallax2.y = this.game.camera.y * 0.2 + 1200
    this.parallax1.x = this.game.camera.x * 0.3
    this.parallax1.y = this.game.camera.y * 0.3 + 440
    // move it down a few pixels to account for the missing pixels when moving with camera
}
