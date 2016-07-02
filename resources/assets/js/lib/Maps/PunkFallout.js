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
    { x: 3750, y: 1770 },
    { x: 3570, y: 3270 }
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
    this.map = this.add.tilemap('tilemap')
    this.map.addTilesetImage('collision', 'ninja-tiles32')

    // Create a TilemapLayer object from the collision layer of the map
    this.ground = this.map.createLayer('collision')
    if (! GameConsts.DEBUG) this.ground.alpha = 0

    // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
    // preparing slope data for each of tile in the layer
    this.game.slopes.convertTilemapLayer(this.ground, GameConsts.SLOPE_FEATURES)

    // Enable collision between tile indexes 2 and 34
    this.map.setCollisionBetween(2, 34, true, 'collision')
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
