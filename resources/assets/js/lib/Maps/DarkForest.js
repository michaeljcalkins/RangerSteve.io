import GameConsts from '../GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 2625
const WORLD_HEIGHT = 1125

const SPAWN_POINTS = [
    { x: 1900, y: 890 },
    { x: 1650, y: 770 },
    { x: 1750, y: 550 },
    { x: 2150, y: 650 },
    { x: 1250, y: 370 },
    { x: 1500, y: 390 },
    { x: 280, y: 530 },
    { x: 540, y: 630 },
    { x: 700, y: 900 },
    { x: 850, y: 570 },
    { x: 350, y: 280 },
    { x: 2160, y: 310 },
    { x: 1130, y: 730 },
    { x: 375, y: 840 },
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/dark-forest/background.jpg', true)
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

    if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, SPAWN_POINTS)
}

export function update() {
}
