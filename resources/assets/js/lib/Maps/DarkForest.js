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
    this.load.image('parallax1', '/images/maps/dark-forest/parallax1.png', true)
    this.load.image('parallax2', '/images/maps/dark-forest/parallax2.png', true)
    this.load.image('parallax3', '/images/maps/dark-forest/parallax3.png', true)
    this.load.tilemap('tilemap', '/maps/dark-forest/dark-forest.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 32, 32)
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.parallax3 = this.add.sprite(0, 0, 'parallax3')
    this.parallax3.width = 3698
    this.parallax3.height = 1836

    this.parallax2 = this.add.sprite(0, 0, 'parallax2')
    this.parallax2.width = 3698
    this.parallax2.height = 1836

    this.parallax1 = this.add.sprite(0, 0, 'parallax1')
    this.parallax1.width = 3698
    this.parallax1.height = 1836

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
    this.parallax1.x = this.game.camera.x * 0.3
    this.parallax1.y = this.game.camera.y * 0.3 - 500

    this.parallax2.x = this.game.camera.x * 0.2
    this.parallax2.y = this.game.camera.y * 0.2 - 200

    this.parallax3.x = this.game.camera.x * 0.1
    this.parallax3.y = this.game.camera.y * 0.1
}
