import GameConsts from '../GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'

const WORLD_WIDTH = 6000
const WORLD_HEIGHT = 2975
const SPAWN_POINTS = [
    { x: 2900, y: 2500 },
    { x: 2300, y: 2300 },
    { x: 1500, y: 2150 },
    { x: 2600, y: 1900 },
    { x: 2900, y: 1700 },
    { x: 3100, y: 1450 },
    { x: 2300, y: 1100 },
    { x: 1400, y: 1650 },
    { x: 1650, y: 1470 },
    { x: 4350, y: 1100 },
    { x: 1000, y: 1300 },
    { x: 5100, y: 800 },
    { x: 5500, y: 1400 },
    { x: 1990, y: 730 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/high-rule-jungle/background.jpg', true)
    this.load.image('bridge', '/images/maps/high-rule-jungle/bridge.png', true)
    this.load.image('tower-rail', '/images/maps/high-rule-jungle/tower-rail.png', true)
    this.load.tilemap('tilemap', '/maps/high-rule-jungle/high-rule-jungle.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24)
}

export function createOverlays() {
    this.bridge = this.add.sprite(1313, 1240, 'bridge')
    this.towerRail = this.add.sprite(4230, 1140, 'tower-rail')
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

    this.groundSprite = this.add.sprite(0, WORLD_HEIGHT - 10, 'ground')
    this.groundSprite.alpha = 0
    this.groundSprite.width = WORLD_WIDTH
    this.groundSprite.height = 10
    this.physics.arcade.enable(this.groundSprite)
    this.game.physics.enable(this.groundSprite, Phaser.Physics.ARCADE)
    this.groundSprite.enableBody = true
    this.groundSprite.physicsBodyType = Phaser.Physics.ARCADE
    this.groundSprite.body.immovable = true
    this.groundSprite.body.allowGravity = false

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

export function createLedges() {
}

export function update() {
    this.physics.arcade.overlap(this.player, this.groundSprite, () => {
        KillCurrentPlayer.call(this)
    })
}
